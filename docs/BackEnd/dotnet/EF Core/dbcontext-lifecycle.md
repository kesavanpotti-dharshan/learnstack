In EF Core, `DbContext` is a short-lived **unit-of-work and change-tracking session** with the database. `DbSet<TEntity>` is the context’s typed entry point for querying and changing one entity type, such as `Orders` or `Customers`.[1][2]

## Mental model

```text
HTTP request / message handling
          |
          v
      DbContext
   ┌──────┼─────────┐
   v      v         v
DbSet<Order>  DbSet<Customer>  DbSet<Product>
   |              |                 |
LINQ queries, tracking, Add/Remove, SaveChanges
          |
          v
       Database
```

A useful analogy:

- `DbContext` = a short-lived **work session** that knows the EF model, tracks changes, translates LINQ to SQL, and coordinates `SaveChanges`.
- `DbSet<Order>` = the typed “collection/query gateway” for `Order` entities inside that session.

A `DbSet` is not a permanently loaded in-memory table. A LINQ query against it is usually translated to SQL and executed only when materialized, such as by `ToListAsync()`, `FirstAsync()`, or `SingleAsync()`.[1][2]

## DbContext lifecycle

EF Core’s intended lifecycle is one `DbContext` per **single unit of work**:

1. Create or obtain a context from dependency injection.
2. Query entities; query results are normally tracked by default.
3. Add, attach, modify, or remove entities.
4. Call `SaveChanges()` or `SaveChangesAsync()`.
5. Dispose the context.[1]

`SaveChanges` detects state changes in tracked entities and translates them into database commands such as `INSERT`, `UPDATE`, and `DELETE`. Disposal releases resources and ends the context’s usable lifetime.[1][2]

```csharp
await using var db = new AppDbContext(options);

var order = await db.Orders
    .SingleAsync(o => o.Id == orderId);

order.Status = OrderStatus.Paid;

await db.SaveChangesAsync();
```

After loading `order`, EF tracks it. Changing `Status` updates only the in-memory tracked entity until `SaveChangesAsync()` persists the change.

## Typical ASP.NET Core lifecycle

In an ASP.NET Core web application, this registration is conventional:

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
```

`AddDbContext` registers the context as **scoped** by default. Therefore, one `AppDbContext` is created for an HTTP request scope, shared by services resolving that context in the same request, and disposed automatically when the request scope ends.[1][3]

```text
Request begins
  └─ DI creates AppDbContext
       └─ Controller, application service, and repository use it
            └─ SaveChangesAsync()
Request ends
  └─ DI disposes AppDbContext
```

This aligns naturally with one request being one unit of work, though a request should not automatically imply that every operation is one database transaction—define transactional boundaries deliberately.

## What DbSet does

You expose sets as properties on a derived context:

```csharp
public sealed class AppDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Customer> Customers => Set<Customer>();
}
```

`DbSet<TEntity>` supports:

| Operation | Example                                     | Effect before `SaveChanges`         |
| --------- | ------------------------------------------- | ----------------------------------- |
| Query     | `db.Orders.Where(o => o.Status == Pending)` | Builds a database query             |
| Add       | `db.Orders.Add(order)`                      | Marks entity as `Added`             |
| Attach    | `db.Orders.Attach(order)`                   | Starts tracking as `Unchanged`      |
| Update    | `db.Orders.Update(order)`                   | Marks entity/properties as modified |
| Remove    | `db.Orders.Remove(order)`                   | Marks entity as `Deleted`           |

Nothing is permanently written to the database until `SaveChanges` runs.[1][2]

## Entity states and tracking

The context’s **change tracker** records entity state:

| State       | Meaning                            | `SaveChanges` outcome |
| ----------- | ---------------------------------- | --------------------- |
| `Detached`  | Context is not tracking the entity | No change is saved    |
| `Unchanged` | Loaded/attached and unmodified     | No command            |
| `Added`     | New entity                         | `INSERT`              |
| `Modified`  | Tracked entity changed             | `UPDATE`              |
| `Deleted`   | Marked for removal                 | `DELETE`              |

By default, normal entity queries are tracked. For read-only queries, use `AsNoTracking()` to avoid tracking overhead:

```csharp
var products = await db.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListAsync();
```

For a command operation, query the entity using the same context, modify it, and save. This is safer than receiving a detached object from an earlier context and blindly calling `Update`, which can mark every property as changed.

## DbSet and DbContext lifetimes

`DbSet` does **not** have an independent useful lifetime. It belongs to and depends on its owning `DbContext`.

```csharp
var orders = db.Orders; // Valid only while db is alive.

// After db is disposed, do not query or use orders.
```

Do not cache a `DbSet`, tracked entity graph, or `DbContext` for use after the request or scope ends. A long-lived context accumulates tracked entities, can return stale tracked instances, consumes memory, and mixes unrelated operations into one stateful session. EF Core explicitly designs `DbContext` for short-lived, single-unit-of-work usage.[1][4]

## Thread safety and background work

`DbContext` is **not thread-safe**. Never share one instance across parallel tasks, concurrent requests, or long-running background services. Await EF Core async calls before doing more work on the same context.[1][5]

For a hosted service, worker, or message consumer, use `IDbContextFactory<TContext>` to create a fresh context per message or unit of work:

```csharp
public sealed class OrderWorker(
    IDbContextFactory<AppDbContext> dbFactory)
{
    public async Task HandleAsync(Guid orderId, CancellationToken ct)
    {
        await using var db = await dbFactory.CreateDbContextAsync(ct);

        var order = await db.Orders.SingleAsync(x => x.Id == orderId, ct);
        order.Status = OrderStatus.Processed;

        await db.SaveChangesAsync(ct);
    }
}
```

Register it with:

```csharp
builder.Services.AddDbContextFactory<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
```

A factory is particularly useful where a request-scoped context does not match the work lifecycle—background jobs, message processing, Blazor scenarios, or several sequential units of work in one process.[1][5]

## Pooling is different

`AddDbContextPool` can reuse context instances internally to reduce setup overhead:

```csharp
builder.Services.AddDbContextPool<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
```

Your application should still treat every injected context as short-lived. When it is disposed, EF Core resets it and returns it to the pool; it does **not** make contexts safe to retain or share between threads.[5]

## Practical rules

- Register `DbContext` as scoped for ordinary ASP.NET Core request processing.[1][3]
- Use one context for one coherent unit of work; dispose it promptly.[1]
- Use `AsNoTracking()` for read-only queries.
- Do not share one context across threads or concurrent operations.[1]
- Use `IDbContextFactory<TContext>` in background workers and other non-request lifecycles.[5]
- Let a `DbSet` live only as long as its owning context.
- Avoid treating `DbSet` as a generic repository abstraction; EF Core already provides repository- and unit-of-work-like capabilities through `DbSet` and `DbContext`.

## Interview answer

> `DbContext` is EF Core’s short-lived unit-of-work. It manages database interaction, LINQ-to-SQL query execution, identity resolution, and change tracking. `DbSet<TEntity>` is the typed gateway for one entity type, used to query and mark entities as added, changed, or deleted. In ASP.NET Core, `AddDbContext` is scoped by default, so a context commonly lives for one request and is disposed afterward. After `SaveChangesAsync`, EF Core persists tracked changes. A context is stateful and not thread-safe, so I never cache or share it; for background tasks or message consumers, I create a fresh context per work item via `IDbContextFactory`.[1][5]

## Sources

[1] DbContext Lifetime, Configuration, and Initialization https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/
[2] EF Core DbSet https://www.learnentityframeworkcore.com/dbset
[3] How should I manage DbContext Lifetime in MVC Core? https://stackoverflow.com/questions/46412734/how-should-i-manage-dbcontext-lifetime-in-mvc-core
[4] Deciphering the DbContext Lifecycle in EF Core https://dev.to/dotsharpfx/the-art-of-state-management-deciphering-the-dbcontext-lifecycle-in-ef-core-35am
[5] How To Manage EF Core DbContext Lifetime https://antondevtips.com/blog/how-to-manage-ef-core-dbcontext-lifetime
[6] DbContext Configuration and Lifetime - EF Core Architecture ... https://www.youtube.com/watch?v=NPgFlqXPbK8
[7] Having problems understanding DbContext and how it works https://www.reddit.com/r/dotnet/comments/1cs1ii9/having_problems_understanding_dbcontext_and_how/
