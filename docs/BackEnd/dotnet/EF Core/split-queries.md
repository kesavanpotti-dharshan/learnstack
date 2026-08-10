In EF Core, **single-query mode** loads a requested entity graph using one SQL statement with `JOIN`s, while **split-query mode** uses multiple SQL statements—typically one for the root entity and one for each included collection. Split queries can prevent **cartesian explosion**, where sibling collection joins multiply rows and transfer far more data than intended.[1][2]

## The core problem: Cartesian explosion

Consider this query:

```csharp
var blogs = await db.Blogs
    .Include(b => b.Posts)
    .Include(b => b.Contributors)
    .ToListAsync();
```

`Posts` and `Contributors` are both **collection navigations directly under `Blog`**—they are sibling collections.

For one blog with:

- 10 posts
- 10 contributors

a single SQL query must join both collections. The result contains:

rows for that one blog—not 20 rows. Every post is repeated for each contributor, and every contributor is repeated for each post. EF Core reconstructs the correct object graph, but the database still generates, transmits, and EF still processes all duplicated rows.[1]

```text
Blog
 ├─ Posts:        10 rows
 └─ Contributors: 10 rows

Single JOIN result:
10 posts × 10 contributors = 100 rows
```

With three sibling collections, multiplication becomes worse:

This is why the issue is called a **cartesian explosion** or cross-product explosion.[1][3]

## Single-query mode

EF Core uses **single-query mode by default** when no query-splitting configuration is specified.[1]

```csharp
var blogs = await db.Blogs
    .Include(b => b.Posts)
    .Include(b => b.Contributors)
    .AsSingleQuery()
    .ToListAsync();
```

Conceptually, EF generates one SQL statement:

```sql
SELECT ...
FROM Blogs AS b
LEFT JOIN Posts AS p
    ON b.Id = p.BlogId
LEFT JOIN Contributors AS c
    ON b.Id = c.BlogId;
```

### Benefits

- One database round trip.
- Results come from one SQL statement, so there is no cross-query consistency window.
- Often efficient for a small graph or when including only reference navigations / one collection.[1][4][5]

### Costs

- Multiple sibling collection `Include`s can multiply rows.
- Parent columns repeat once per child combination.
- Large root columns—such as `nvarchar(max)`, JSON, binary data, or large text—may be duplicated in every result row.
- High network transfer, database work, memory consumption, and client-side materialization cost can result.[1][3][6]

## Split-query mode

Use `AsSplitQuery()` to tell EF Core to issue multiple SQL statements:

```csharp
var blogs = await db.Blogs
    .Include(b => b.Posts)
    .Include(b => b.Contributors)
    .AsSplitQuery()
    .ToListAsync();
```

Conceptually, EF executes:

```sql
-- Root query
SELECT ... FROM Blogs;

-- Collection query 1
SELECT ...
FROM Blogs
JOIN Posts ON Blogs.Id = Posts.BlogId;

-- Collection query 2
SELECT ...
FROM Blogs
JOIN Contributors ON Blogs.Id = Contributors.BlogId;
```

Instead of 100 rows for one blog with 10 posts and 10 contributors, the database returns roughly:

The number of rows grows **additively**, not multiplicatively. EF Core combines the result sets into the correct entity graph.[1][2]

## Comparison

| Concern                  | Single query                                   | Split query                                          |
| ------------------------ | ---------------------------------------------- | ---------------------------------------------------- |
| SQL commands             | One                                            | Root query plus one per included collection          |
| Database round trips     | One                                            | Multiple                                             |
| Sibling collection joins | Can create cross-product rows                  | Avoids cross-product multiplication                  |
| Repeated root/child data | Potentially very high                          | Much lower                                           |
| Consistency during read  | One SQL statement                              | Data can change between statements                   |
| Best for                 | Small graphs, limited collections, low latency | Multiple large sibling collections or wide root rows |

EF Core’s trade-off is straightforward: **single queries reduce round trips; split queries reduce duplicated data and join complexity.**[1][4][5]

## When there is no cartesian explosion

A nested collection does not produce the same sibling cross product:

```csharp
var blogs = await db.Blogs
    .Include(b => b.Posts)
        .ThenInclude(p => p.Comments)
    .ToListAsync();
```

Here the relationship is hierarchical:

```text
Blog → Posts → Comments
```

Rows repeat as needed to represent each post/comment relationship, but EF Core does not cross-join independent sibling collections such as `Posts × Contributors`.[1]

Still, a large nested graph can be expensive. “No cartesian explosion” does not mean “automatically cheap.”

## Choosing `AsSplitQuery`

Use split queries when:

- You include **two or more sibling collections**.
- Collections can be large or unbounded.
- The root or related tables contain wide/large columns that would be repeatedly duplicated.
- SQL logs or profiling show huge result sets, long materialization time, or excess network transfer.[1][3][4][5]

Example:

```csharp
var order = await db.Orders
    .Include(o => o.Items)
    .Include(o => o.Payments)
    .Include(o => o.AuditEntries)
    .AsSplitQuery()
    .SingleAsync(o => o.Id == orderId);
```

Use single-query mode when:

- The graph is small.
- You include only references or one modest collection.
- Extra database round trips are more expensive than duplicated rows.
- You need the most consistent snapshot possible from one SQL statement.[1][4][5]

## Consistency caveat

Because a split query executes multiple statements, another transaction could change related data between the root query and collection queries. This can lead to an inconsistent point-in-time graph in highly concurrent systems.[1][7]

If a consistent snapshot is essential, consider a transaction with an appropriate database isolation level—but recognize that stronger isolation can add locking, blocking, or version-store overhead. Do not add it merely to “fix” all split queries; base the decision on real consistency requirements.

## Configuration

### Per query

Prefer making the choice explicitly on performance-sensitive queries:

```csharp
var result = await db.Orders
    .Include(o => o.Items)
    .Include(o => o.Payments)
    .AsSplitQuery()
    .AsNoTracking()
    .ToListAsync();
```

You can override split behavior:

```csharp
var result = await db.Orders
    .Include(o => o.Items)
    .AsSingleQuery()
    .ToListAsync();
```

### Global default

You can configure split queries globally:

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sql =>
        sql.UseQuerySplittingBehavior(
            QuerySplittingBehavior.SplitQuery)));
```

Use a global default carefully. It may help an application that frequently loads complex graphs, but it introduces multiple round trips across all affected queries. In many systems, explicit per-query use is easier to reason about.[4][7]

## Best practice: project when possible

For read APIs, the best solution is often neither a giant `Include` graph nor split entity loading. Project directly into a DTO:

```csharp
var orders = await db.Orders
    .AsNoTracking()
    .Where(o => o.Id == orderId)
    .Select(o => new OrderDetailsDto(
        o.Id,
        o.Customer.Name,
        o.Items.Select(i => new OrderItemDto(
            i.Product.Name,
            i.Quantity,
            i.UnitPrice)).ToList(),
        o.Payments.Select(p => new PaymentDto(
            p.Id,
            p.Amount,
            p.Status)).ToList()))
    .SingleAsync();
```

Projection makes the response shape explicit and avoids loading columns or entity state the endpoint does not need. Use `Include` primarily when you need a tracked entity graph for a command workflow.[8][9]

## Interview answer

> EF Core defaults to single-query mode, which uses joins to load an included graph in one SQL statement. This is efficient for small graphs, but including multiple sibling collections can cause cartesian explosion: a parent with 10 posts and 10 contributors produces 100 joined rows because the collections are cross-multiplied. `AsSplitQuery()` issues separate SQL for the root and each included collection, avoiding that multiplication and reducing duplicated data, but it adds round trips and can observe changes between statements. I use split queries for large sibling collections after reviewing the SQL and data size; for read APIs, I usually prefer projection to DTOs.[1][3][4]

## Sources

[1] Single vs. Split Queries - EF Core | Microsoft Learn https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries
[2] Use single SQL query instead of split queries · Issue #12098 - GitHub https://github.com/dotnet/efcore/issues/12098
[3] Entity Framework Core 7 Performance: Cartesian Explosion https://www.thinktecture.com/en/entity-framework-core/ef-core-7-performance-cartesian-explosion/
[4] Split Queries: Stop the Data Traffic Jam in EF Core https://www.woodruff.dev/split-queries-stop-the-data-traffic-jam-in-ef-core/
[5] When To Use Single or Split Queries in Entity Framework https://structdevelopment.com/kb/single-or-split-queries-in-ef.html
[6] Entity Framework and Cartesian Explosion - Code & Sundry https://blog.jonstodle.com/entity-framework-and-cartesian-explosion/
[7] Entity Framework Core 5 - Query Splitting - Cartesian Explosion ... https://www.reddit.com/r/dotnet/comments/kvqygf/entity_framework_core_5_query_splitting_cartesian/
[8] Efficient Querying - EF Core https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying
[9] Cartesian Explosion: How to Avoid It in EF Core - LinkedIn https://www.linkedin.com/posts/elliotone_cartesian-explosion-query-splitting-by-activity-7365412616430624769-whid
[10] EF Core Single vs. Split Queries - Stack Overflow https://stackoverflow.com/questions/75255056/ef-core-single-vs-split-queries
[11] Understanding cartesian explosion - sql - Stack Overflow https://stackoverflow.com/questions/71826296/understanding-cartesian-explosion
[12] How to Avoid Cartesian Explosion while using EF Core - Reddit https://www.reddit.com/r/csharp/comments/u42zj6/how_to_avoid_cartesian_explosion_while_using_ef/
[13] EF Core Split Queries vs Single Queries – Stop Killing ... - YouTube https://www.youtube.com/watch?v=qSZ-TKC_hLQ
[14] EF Core Performance: N+1, Cartesian Explosion and How to Fix Both https://www.youtube.com/watch?v=iaZxzDmfTHU&vl=en
[15] Split Queries with EF Core in .NET - NikolaTech https://nikolatech.net/blogs/ef-core-single-split-query-dotnet
[16] Slaying the EF Core Cartesian Explosion with AsSplitQuery() https://gordonbeeming.com/blog/2025-07-10/slaying-the-ef-core-cartesian-explosion-with-assplitquery
