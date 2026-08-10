---
title: Repository Design Pattern
sidebar_label: Repository
sidebar_position: 1
---

The Repository pattern is a data-access abstraction that gives application or domain code a collection-like interface for retrieving and persisting domain objects, without exposing SQL, ORM, or storage details. In .NET with EF Core, use it selectively: `DbContext` already behaves like a unit of work and `DbSet<TEntity>` already behaves much like a repository.[1][2]

## Core idea

Instead of a service directly knowing how to query SQL or EF Core, it depends on a domain-focused contract:

```csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(OrderId id, CancellationToken ct);
    Task AddAsync(Order order, CancellationToken ct);
}
```

An infrastructure implementation uses EF Core:

```csharp
public sealed class EfOrderRepository(AppDbContext db)
    : IOrderRepository
{
    public Task<Order?> GetByIdAsync(OrderId id, CancellationToken ct) =>
        db.Orders
            .Include(x => x.Items)
            .SingleOrDefaultAsync(x => x.Id == id, ct);

    public Task AddAsync(Order order, CancellationToken ct)
    {
        db.Orders.Add(order);
        return Task.CompletedTask;
    }
}
```

The application service depends on `IOrderRepository`, not on EF Core:

```csharp
public sealed class PlaceOrderHandler(
    IOrderRepository orders,
    IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(Order order, CancellationToken ct)
    {
        await orders.AddAsync(order, ct);
        await unitOfWork.SaveChangesAsync(ct);
    }
}
```

This separates business behavior from persistence mechanics.[1][3][4][5]

## Repository vs Unit of Work

These patterns are often used together:

| Pattern      | Responsibility                                               |
| ------------ | ------------------------------------------------------------ |
| Repository   | Retrieves/persists a specific aggregate or domain concept    |
| Unit of Work | Tracks a coherent set of changes and commits them atomically |

With EF Core:

- `DbSet<Order>` is the collection-like interface for `Order`.
- `DbContext` tracks changes across sets and commits them through `SaveChanges` / `SaveChangesAsync`.
- Therefore, `DbContext` already provides repository- and unit-of-work-like behavior.[1][2]

```text
Application service
    |
    +--> IOrderRepository → DbSet<Order>
    |
    +--> IUnitOfWork      → DbContext.SaveChangesAsync()
```

Do not call `SaveChangesAsync()` inside every repository method if one business operation changes multiple aggregates and must be atomic. Let the application/use-case layer define the transaction boundary.

## Generic repository: common but often weak

A common design is:

```csharp
public interface IRepository<TEntity>
    where TEntity : class
{
    Task<TEntity?> GetByIdAsync(object id, CancellationToken ct);
    Task<List<TEntity>> GetAllAsync(CancellationToken ct);
    Task AddAsync(TEntity entity, CancellationToken ct);
    void Update(TEntity entity);
    void Remove(TEntity entity);
}
```

This looks reusable, but it often adds little value over `DbSet<TEntity>`:

- `GetAllAsync()` encourages unbounded table reads.
- It hides query shape, filtering, projection, paging, and includes behind a weak CRUD API.
- It leads to repository methods such as `FindByX`, `FindByY`, and `FindByZ`, which become an unstructured query dump.
- Adding `IQueryable<TEntity>` to “fix” flexibility leaks EF Core query semantics through the abstraction anyway.

In typical CRUD-oriented ASP.NET Core applications, injecting `DbContext` into application services and writing explicit LINQ queries is usually simpler and clearer.[2][6]

## When a custom repository is useful

A custom repository is valuable when it represents a **real domain boundary**, not merely a wrapper around every table.

Use one when:

- You follow DDD and want one repository per **aggregate root**, such as `IOrderRepository`, not repositories for `OrderItem` and every table.
- Your domain/application layer must not reference `Microsoft.EntityFrameworkCore`.
- A persistence operation spans multiple stores, such as SQL + Redis, a read model, or a legacy API.
- You need a carefully designed persistence contract for a complex aggregate.
- You need to encapsulate specialized query, locking, or mapping behavior that should not spread across handlers.[2][6]

Example of a meaningful domain-specific contract:

```csharp
public interface IInventoryRepository
{
    Task<InventoryItem?> FindForReservationAsync(
        ProductId productId,
        CancellationToken ct);

    Task<bool> TryReserveAsync(
        ProductId productId,
        int quantity,
        CancellationToken ct);
}
```

This expresses business intent rather than generic `Get`, `Update`, and `Delete`.

## When not to use it

Avoid a custom repository when:

- It is only a thin wrapper around `DbSet`.
- It duplicates EF Core methods without adding a domain policy or useful boundary.
- It forces all query needs into generic CRUD methods.
- It makes projections, filtering, pagination, or performance tuning harder.
- Its sole purpose is “so we can swap EF Core later.” Replacing a mature ORM generally affects query behavior, transactions, migrations, mappings, and infrastructure—not just one repository implementation.

For a simple app, this is often enough:

```csharp
public sealed class OrderService(AppDbContext db)
{
    public Task<OrderSummaryDto[]> GetRecentAsync(CancellationToken ct) =>
        db.Orders
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(50)
            .Select(x => new OrderSummaryDto(
                x.Id,
                x.OrderNumber,
                x.Status,
                x.Total))
            .ToArrayAsync(ct);
}
```

This preserves query clarity and avoids a needless abstraction layer.

## Practical EF Core design

A balanced approach is:

- **Commands/domain behavior:** use aggregate-specific repositories where a real boundary exists.
- **Reads:** use direct EF Core projections into DTOs or dedicated query services.
- **Transactions:** use the `DbContext` scope / `SaveChangesAsync` as the unit of work.
- **Infrastructure:** put EF Core repository implementations in the Infrastructure project; expose interfaces from the domain or application layer if you need dependency inversion.

```text
Domain/Application
  └─ IOrderRepository

Infrastructure
  └─ EfOrderRepository → AppDbContext → SQL Server

API
  └─ Use-case handler → IOrderRepository
```

This fits Clean, Hexagonal, and Onion architecture: the core defines the port it needs, and infrastructure implements it.[1][2][6]

## Registration

```csharp
builder.Services.AddScoped<IOrderRepository, EfOrderRepository>();
```

Because `DbContext` is normally scoped, repositories that depend on it should also normally be scoped.

## Trade-offs

| Benefits                                        | Costs                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| Separates domain code from persistence details  | Can duplicate EF Core’s existing abstractions                                    |
| Supports aggregate-oriented persistence APIs    | Generic CRUD designs often become leaky or restrictive                           |
| Can simplify test boundaries when designed well | Mocking repositories may create tests that do not reflect actual SQL/EF behavior |
| Encapsulates complex storage logic              | More interfaces, classes, and DI registrations                                   |

For tests, do not assume mocking a repository is automatically better. Integration tests against a real relational database or a representative database container often catch query translation, constraints, transactions, and concurrency problems that mocks miss.

## Interview answer

> The Repository pattern mediates between domain/application logic and persistence, exposing collection-like operations so callers do not depend directly on SQL or an ORM. In EF Core, `DbSet<TEntity>` already acts like a repository and `DbContext` already acts like a unit of work, so I do not automatically add a generic repository over every entity. I add a custom repository when it represents a meaningful aggregate boundary, hides complex persistence or multiple stores, or keeps EF Core out of the domain/application layer. I prefer domain-specific methods such as `FindForReservationAsync` over generic `GetAll`, `Update`, and `Delete` wrappers, and I keep `SaveChangesAsync` at the use-case transaction boundary.[1][2][6]

## Sources

[1] Implementing the Repository and Unit of Work Patterns in an ASP ... https://learn.microsoft.com/en-us/aspnet/mvc/overview/older-versions/getting-started-with-ef-5-using-mvc-4/implementing-the-repository-and-unit-of-work-patterns-in-an-asp-net-mvc-application
[2] Repository Pattern in .NET 10 - Do You Really Need It? https://codewithmukesh.com/blog/repository-pattern-do-you-really-need-it/
[3] ASP.NET Core Web API - Repository Pattern - Code Maze https://code-maze.com/net-core-web-development-part4/
[4] Repository Pattern In ASP.NET Core - C# Corner https://www.c-sharpcorner.com/article/repository-pattern-in-asp-net-core/
[5] Repository Design Pattern - GeeksforGeeks https://www.geeksforgeeks.org/system-design/repository-design-pattern/
[6] Can anyone please explain repository pattern and how to implement ... https://www.reddit.com/r/dotnet/comments/15vm6ro/can_anyone_please_explain_repository_pattern_and/
[7] Repository Pattern in ASP.NET Core - GitHub https://github.com/iammukeshm/RepositoryPattern.WebApi
[8] EP 21 : Repository Design Pattern in C# https://mwaseemzakir.substack.com/p/ep-21-repository-design-pattern-in
[9] Repository pattern in asp net core - YouTube https://www.youtube.com/watch?v=qJmEI2LtXIY
