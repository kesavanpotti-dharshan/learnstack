The **N+1 query problem** occurs when EF Core executes one query to load a list of entities, then executes one additional query per entity to retrieve related data or perform a lookup. With \(N\) rows, that creates \(1 + N\) database round trips instead of a bounded number of queries.[1][2][3]

It is especially common with lazy loading, explicit loading inside loops, and repository/service calls made per item.[3][4][5]

## The problem

Suppose an endpoint needs 100 orders and each order’s customer name.

```csharp
var orders = await db.Orders.ToListAsync(); // 1 query

foreach (var order in orders)
{
    Console.WriteLine(order.Customer.Name); // up to 100 more queries
}
```

If lazy loading is enabled, accessing `order.Customer` may execute a query for every order:

```text
1 query:    SELECT ... FROM Orders
100 queries: SELECT ... FROM Customers WHERE Id = @customerId

Total: 101 queries
```

The problem is not merely “more SQL.” Repeated database round trips add latency, consume connection-pool capacity, increase database CPU, and often degrade quickly as page size or traffic rises.[2][3][5]

## Common causes

### Lazy-loaded navigation in a loop

```csharp
var orders = await db.Orders.ToListAsync();

foreach (var order in orders)
{
    var city = order.Customer.Address.City;
}
```

This is the classic EF Core N+1 pattern: navigation-property access silently triggers database queries.[3][4][5]

### Explicit loading in a loop

Explicit loading is deliberate, but it still causes N+1 when repeated per entity:

```csharp
var orders = await db.Orders.ToListAsync();

foreach (var order in orders)
{
    await db.Entry(order)
        .Collection(o => o.Items)
        .LoadAsync();
}
```

### Per-item lookup or repository call

```csharp
var products = await db.Products.ToListAsync();

foreach (var product in products)
{
    product.Category = await db.Categories
        .SingleAsync(c => c.Id == product.CategoryId);
}
```

Any direct or indirect database call inside an iteration can cause N+1—even if lazy loading is disabled. Hidden loops in helper methods, recursion, or serialization can cause the same issue.[3][5]

### API serialization of entities

Returning tracked EF entities from an API while lazy loading is enabled can cause the JSON serializer to access navigations after the action returns. That can trigger a burst of unplanned SQL queries.[5]

### Write-side N+1

N+1 can also happen on writes:

```csharp
foreach (var item in items)
{
    db.Orders.Add(item);
    await db.SaveChangesAsync(); // one transaction/round trip per item
}
```

Usually, add all items and call `SaveChangesAsync()` once per intended unit of work instead.[5]

## How to detect it

### 1. Enable EF Core SQL logging

In development, log database commands and look for the same `SELECT` repeated with only parameter values changing.[2][5]

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)
           .LogTo(Console.WriteLine, LogLevel.Information)
           .EnableSensitiveDataLogging()); // Development only
```

Do **not** enable sensitive-data logging in production, because parameter values can expose personal or confidential data.

N+1 warning sign:

```text
SELECT ... FROM Orders

SELECT ... FROM Customers WHERE Id = @p0
SELECT ... FROM Customers WHERE Id = @p0
SELECT ... FROM Customers WHERE Id = @p0
...
```

### 2. Inspect generated SQL

Use `ToQueryString()` before executing an `IQueryable`:

```csharp
var query = db.Orders
    .Include(o => o.Customer);

Console.WriteLine(query.ToQueryString());
```

This is useful for checking a known query, though it does not expose queries that lazy loading fires later.

### 3. Monitor query count and duration

Use database profiling/monitoring tools or APM telemetry to inspect:

- SQL command count per HTTP request or message.
- Repeated query patterns.
- Endpoint p95/p99 latency.
- Database connection wait time.
- High-frequency SQL differing only by parameter.[2][5]

### 4. Add query-count integration tests

A strong prevention technique is a `DbCommandInterceptor` that counts executed commands, then a test budget for important endpoints. EF Core supports command interception, and query counting helps detect regressions before production.[3][5]

Conceptual test:

```csharp
[Fact]
public async Task GetOrders_uses_a_bounded_query_count()
{
    await client.GetAsync("/api/orders");

    queryCounter.Count.Should().BeLessThanOrEqualTo(3);
}
```

The correct budget depends on the endpoint. The goal is not always one query; it is a **bounded number of queries that does not grow with result count**.

### 5. Fail on unexpected lazy loading

If your API forbids lazy loading, configure EF Core warnings to throw during development/tests:

```csharp
options.ConfigureWarnings(warnings =>
    warnings.Throw(CoreEventId.NavigationLazyLoading));
```

This makes accidental lazy-load access fail visibly rather than becoming a silent production performance issue.[5]

## Mitigation strategies

## 1. Use eager loading for a known entity graph

Use `Include` and `ThenInclude` when the use case genuinely needs full related entities.[2][3][6]

```csharp
var orders = await db.Orders
    .Include(o => o.Customer)
    .Include(o => o.Items)
        .ThenInclude(i => i.Product)
    .ToListAsync();
```

Now EF loads the specified relationships up front, rather than once per order.

### Avoid join explosion

Including multiple collection navigations can produce large joined result sets with duplicate data. Consider split queries:

```csharp
var orders = await db.Orders
    .Include(o => o.Items)
    .Include(o => o.Payments)
    .AsSplitQuery()
    .ToListAsync();
```

`AsSplitQuery()` uses a small, bounded set of SQL queries rather than one potentially huge Cartesian-result query. It is not N+1; the number of queries depends on included collections, not on the number of orders.[5]

## 2. Project directly to DTOs

For read endpoints, projection is often the best approach because it asks SQL for only the fields required by the response.[2][3]

```csharp
var orders = await db.Orders
    .AsNoTracking()
    .Select(o => new OrderSummaryDto(
        o.Id,
        o.Number,
        o.Customer.Name,
        o.Items.Count,
        o.Total))
    .ToListAsync();
```

Benefits:

- No lazy-loading surprise.
- Usually fewer columns transferred.
- No tracking overhead for read-only data.
- Clear API response shape.
- EF Core can translate navigation access into appropriate SQL joins/subqueries.

## 3. Batch related data and use a lookup

When separate queries are preferable, load all required keys in one batch, then join in memory.

```csharp
var orders = await db.Orders
    .AsNoTracking()
    .ToListAsync();

var customerIds = orders
    .Select(o => o.CustomerId)
    .Distinct()
    .ToList();

var customersById = await db.Customers
    .Where(c => customerIds.Contains(c.Id))
    .ToDictionaryAsync(c => c.Id);

var result = orders.Select(o => new OrderSummaryDto(
    o.Id,
    o.Number,
    customersById[o.CustomerId].Name,
    0,
    o.Total));
```

This replaces up to \(N\) customer lookups with one bounded batch query.[3][7]

## 4. Use explicit loading only for one/few entities

Explicit loading is appropriate when a later branch decides whether a relationship is needed:

```csharp
var order = await db.Orders.SingleAsync(o => o.Id == orderId);

if (includeAuditTrail)
{
    await db.Entry(order)
        .Collection(o => o.AuditEntries)
        .LoadAsync();
}
```

Do not call `LoadAsync()` inside a large loop.[2][4][8]

## 5. Disable lazy loading in API-heavy code

Lazy loading is convenient, but it hides I/O behind property access. Many production ASP.NET Core APIs leave it disabled and use projections or deliberate eager loading instead.[4][5][9]

Practical steps:

- Do not call `UseLazyLoadingProxies()`.
- Avoid returning EF entities directly.
- Map query results into DTOs.
- Treat unexpected navigation access as a design signal to define the query shape.

## 6. Batch writes

Move `SaveChangesAsync()` outside loops when records belong to the same unit of work:

```csharp
db.Orders.AddRange(orders);
await db.SaveChangesAsync();
```

For very large workloads, consider provider-specific bulk operations or a dedicated ingestion strategy after measuring the bottleneck.[5]

## Eager loading vs projection

| Need                                                | Better default                                          |
| --------------------------------------------------- | ------------------------------------------------------- |
| Modify a known aggregate and its required relations | `Include` / `ThenInclude`                               |
| Return an API response or dashboard                 | DTO projection                                          |
| Load multiple collections with a large graph        | Projection or `Include` + `AsSplitQuery()`              |
| Conditionally load relation for one entity          | Explicit loading                                        |
| Iterate many entities and access related data       | Batch query or projection—never lazy load per iteration |

## Practical checklist

- Search for database calls and navigation access inside `foreach`, `Select`, recursion, and serializers.
- Keep query count bounded as result size grows.
- Use SQL logging during development and APM/profiling in production.
- Use `Include` for small, known graphs.
- Prefer `Select` into DTOs for read APIs.
- Use `AsNoTracking()` on read-only queries.
- Avoid lazy loading unless you deliberately monitor it.
- Batch reads and writes.
- Add query-count tests for high-traffic endpoints.[2][3][5]

## Interview answer

> N+1 happens when an application loads \(N\) parent entities with one query and then issues one more query per parent, commonly because lazy-loaded navigations or repository calls execute inside a loop. I detect it through EF SQL logs, database/APM traces, and query-count integration tests; the key signal is that query count grows with page size. I mitigate it by projecting directly to DTOs, using `Include` for a small known graph, batching IDs into one query, using split queries for multiple collections, and avoiding lazy loading or explicit loading inside loops. The goal is a bounded query count, not necessarily exactly one query.[2][3][5]

## Sources

[1] Select N+1 in next Entity Framework https://stackoverflow.com/questions/5070013/select-n1-in-next-entity-framework
[2] How to Fix the EF Core N+1 Query Problem https://www.c-sharpcorner.com/article/how-to-fix-the-ef-core-n1-query-problem/
[3] Entity Framework Core 7: N+1 Queries Problem https://www.thinktecture.com/en/entity-framework-core/entity-framework-core7-n1-queries-problem/
[4] Eager, Lazy and Explicit Loading with Entity Framework Core https://blog.jetbrains.com/dotnet/2023/09/21/eager-lazy-and-explicit-loading-with-entity-framework-core/
[5] The N+1 Query Problem in EF Core: Detection, Diagnosis ... https://www.woodruff.dev/the-n1-query-problem-in-ef-core/
[6] Loading Related Data - EF Core - Microsoft Learn https://learn.microsoft.com/en-us/ef/core/querying/related-data/
[7] How to fix N+1 queries in EF Core and boost performance https://www.linkedin.com/posts/milan-jovanovic_your-foreach-loop-might-be-killing-your-ef-activity-7362166186458947584-cEOe
[8] Eager , Lazy and explicit loading in EF6 - Stack Overflow https://stackoverflow.com/questions/34627865/eager-lazy-and-explicit-loading-in-ef6
[9] Lazy vs Eager Loading — What's Silently Killing Performance? https://learnixo.io/blog/dotnet-efcore-loading-strategies
[10] N+1 query problem : what it is, why it hurts performance ... https://www.reddit.com/r/programming/comments/1mggpu5/n1_query_problem_what_it_is_why_it_hurts/
