EF Core offers three main ways to load **related data** through navigation properties: **eager loading** loads it with the original query, **lazy loading** fetches it automatically only when accessed, and **explicit loading** fetches it later only when your code asks for it.[1][2]

## At a glance

| Strategy | When related data loads       | Typical API                              | Main benefit                                        | Main risk                   |
| -------- | ----------------------------- | ---------------------------------------- | --------------------------------------------------- | --------------------------- |
| Eager    | With the initial query        | `Include`, `ThenInclude`                 | Predictable query behavior; avoids many round trips | Over-fetching / large joins |
| Lazy     | When a navigation is accessed | Lazy-loading proxies or `ILazyLoader`    | Very convenient                                     | Hidden queries and N+1      |
| Explicit | When code requests it later   | `Entry(...).Collection(...).LoadAsync()` | Precise control                                     | Extra code and possible N+1 |

## Eager loading

**Eager loading** retrieves the parent and requested navigations as part of the initial query. In EF Core, use `Include` for a navigation and `ThenInclude` for nested data.[1][2]

```csharp
var order = await db.Orders
    .Include(o => o.Customer)
    .Include(o => o.Items)
        .ThenInclude(i => i.Product)
    .SingleAsync(o => o.Id == orderId);
```

After this query, `order.Customer`, `order.Items`, and each item’s `Product` are already available.

### When to use it

Use eager loading when you **know up front** that the API or use case needs the related data—for example, loading an order detail page that always shows its customer, line items, and product names. It avoids a separate database round trip for each navigation access.[1][2]

### Trade-offs

- **Good:** Explicit and predictable; normally avoids N+1 query behavior.
- **Risk:** Including multiple collection navigations can create a large result set due to SQL joins and repeated parent data.
- **Risk:** You can load far more columns and entity graphs than the caller needs.[2][3]

For read-only endpoints, prefer projection to a DTO over loading a large tracked graph:

```csharp
var order = await db.Orders
    .Where(o => o.Id == orderId)
    .Select(o => new OrderDetailsDto(
        o.Id,
        o.Customer.Name,
        o.Items.Select(i => new OrderItemDto(
            i.Product.Name,
            i.Quantity,
            i.UnitPrice))
        .ToList()))
    .SingleAsync();
```

Projection fetches only the data the response needs and is often a better default for query endpoints.[3][4]

### Useful eager-loading tools

```csharp
var orders = await db.Orders
    .Include(o => o.Items.Where(i => !i.IsCancelled)) // filtered include
    .AsSplitQuery()                                   // avoid one large join
    .AsNoTracking()
    .ToListAsync();
```

- **Filtered `Include`** limits a collection navigation.
- **`AsSplitQuery()`** may issue separate SQL queries for included collections, avoiding one enormous joined result, at the cost of additional round trips.
- **`AsNoTracking()`** reduces tracking overhead for read-only work.

## Lazy loading

**Lazy loading** delays loading a navigation until code first accesses it. EF Core transparently issues a query at that moment.[1][2]

```csharp
var order = await db.Orders.SingleAsync(o => o.Id == orderId);

// If lazy loading is enabled, this may execute another SQL query:
var customerName = order.Customer.Name;
```

Lazy loading is not enabled by default merely because navigations are present. Common options are:

- Install/use `Microsoft.EntityFrameworkCore.Proxies`, enable `UseLazyLoadingProxies()`, and make navigations `virtual`.
- Inject `ILazyLoader` into entity classes.[2]

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)
           .UseLazyLoadingProxies());

public class Order
{
    public int Id { get; set; }

    public virtual Customer Customer { get; set; } = null!;
    public virtual ICollection<OrderItem> Items { get; set; }
        = new List<OrderItem>();
}
```

### The N+1 problem

Lazy loading becomes costly when iterating over many parents:

```csharp
var orders = await db.Orders.ToListAsync(); // 1 query

foreach (var order in orders)
{
    Console.WriteLine(order.Customer.Name);  // potentially 1 query per order
}
```

For 100 orders, this can mean **101 database queries**: one for orders plus one for every customer navigation access. This is the N+1 query problem.[2][5]

### Trade-offs

- **Good:** Loads data only when truly used; simple code for small, conditional object navigation.
- **Bad:** Database queries are hidden in property access, making performance harder to reason about.
- **Bad:** Frequently fails after the `DbContext` is disposed—such as serializing an entity after a web request scope ends.
- **Bad:** Easy to accidentally create N+1 behavior in APIs and loops.[1][2][4]

For most backend APIs, it is safer to leave lazy loading off by default and choose eager loading or projection deliberately.

## Explicit loading

**Explicit loading** means the entity is loaded first, then your code deliberately asks EF Core to load a selected navigation later.[1][2][6]

```csharp
var order = await db.Orders
    .SingleAsync(o => o.Id == orderId);

await db.Entry(order)
    .Reference(o => o.Customer)
    .LoadAsync();

await db.Entry(order)
    .Collection(o => o.Items)
    .Query()
    .Where(i => !i.IsCancelled)
    .LoadAsync();
```

Use:

- `Reference(...).LoadAsync()` for a reference navigation such as `Order.Customer`.
- `Collection(...).LoadAsync()` for a collection navigation such as `Order.Items`.
- `Collection(...).Query()` when you need to filter, aggregate, or otherwise shape the related query before loading it.[2][6]

### When to use it

Explicit loading is useful when you have already loaded one tracked entity, and a later decision determines whether related data is needed—for example, an administrator expands “payment attempts” only after opening an order.[1][2]

### Trade-offs

- **Good:** Database access is visible and intentional; no proxies required.
- **Good:** Avoids loading rarely-used relations.
- **Bad:** More verbose than eager loading.
- **Bad:** Loading a navigation inside a loop can still create N+1 queries.[1][2]

## Choosing the right approach

| Situation                                                                | Recommended approach                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| API response always needs related data                                   | Projection to DTO, or eager loading for a small entity graph   |
| One parent entity; related data needed only after a conditional decision | Explicit loading                                               |
| Several parent entities plus related data                                | Eager loading or projection; never per-row lazy/explicit loads |
| Read-only list/dashboard                                                 | `Select` projection + `AsNoTracking()`                         |
| Complex domain workflow modifying a known aggregate                      | Eagerly load only the navigations required for the command     |
| Small local application where query count is carefully understood        | Lazy loading can be acceptable                                 |

## Practical rules

- Do not return EF entities directly from APIs; project to DTOs so navigation loading is intentional.
- Do not access lazy or explicitly loaded navigations inside a loop over many entities unless you have measured and intentionally batched the data.
- Enable SQL logging or monitoring so N+1 issues are visible.
- Prefer `AsNoTracking()` for read-only queries.
- Use eager loading for small, known graphs; use projection when you only need selected fields.[2][3][4]

## Interview answer

> Eager loading uses `Include` and loads related data with the original query, so it is predictable and avoids N+1 when I know the required graph. Lazy loading automatically queries when a navigation property is accessed; it is convenient but risky because it hides database calls and can cause N+1 queries. Explicit loading is a deliberate later query using `DbContext.Entry`, useful when a relationship is conditionally needed after the main entity is loaded. For most read APIs, I prefer projection to DTOs and `AsNoTracking`, then use `Include` only when I need a small, known entity graph.[1][2][3]

## Sources

[1] Loading Related Data - EF Core - Microsoft Learn https://learn.microsoft.com/en-us/ef/core/querying/related-data/
[2] Eager, Lazy and Explicit Loading with Entity Framework Core https://blog.jetbrains.com/dotnet/2023/09/21/eager-lazy-and-explicit-loading-with-entity-framework-core/
[3] Eager Loading vs Lazy Loading: Performance Trade-Offs https://dotnetz2h.com/chapter_12_advanced_data_access_and_database_engineering/series_01_ef_core_performance_and_optimization/eager_lazy_loading
[4] Lazy vs Eager Loading — What's Silently Killing Performance? https://learnixo.io/blog/dotnet-efcore-loading-strategies
[5] EF Core Loading Strategies: N+1 to Performance | .NET From ... https://dotnetz2h.com/chapter_12_advanced_data_access_and_database_engineering/series_02_advanced_ef_core_modeling/loading_strategies_ef_core
[6] Eager , Lazy and explicit loading in EF6 - Stack Overflow https://stackoverflow.com/questions/34627865/eager-lazy-and-explicit-loading-in-ef6
[7] How to Choose the Right Loading Strategy in EF Core? - C# Corner https://www.c-sharpcorner.com/article/how-to-choose-the-right-loading-strategy-in-ef-core/
[8] Eager vs. Lazy vs. Explicit Loading in Entity Framework Core ... https://www.linkedin.com/pulse/eager-vs-lazy-explicit-loading-entity-framework-core-right-elgammal-vvhwe
[9] EF Core: When to use explicit loading over eager loading? - Reddit https://www.reddit.com/r/dotnet/comments/axdb2h/ef_core_when_to_use_explicit_loading_over_eager/
[10] How to Choose the Right Loading Strategy in EF Core? https://blog.stackademic.com/how-to-choose-the-right-loading-strategy-in-ef-core-6896d477ca9b
[11] Eager, Explicit & Lazy Loading in EF Core - YouTube https://www.youtube.com/watch?v=LSL3Bgf_nno&vl=en
[12] Understanding Lazy Loading, Eager Loading, and Explicit Loading ... https://corree.hashnode.dev/understanding-lazy-loading-eager-loading-and-explicit-loading-in-entity-framework-core
[13] EF Core Loading Strategies: Enterprise Decision Guide https://codingdroplets.com/ef-core-loading-strategies-aspnet-core-enterprise-decision-guide
[14] Eager Loading, Lazy Loading And Explicit Loading In Entity ... https://www.c-sharpcorner.com/article/eager-loading-lazy-loading-and-explicit-loading-in-entity-framework/
[15] EF Core - Lazy Loading, Eager Loading, and Explicit Loading https://www.youtube.com/shorts/UAWKFv4IxgQ
