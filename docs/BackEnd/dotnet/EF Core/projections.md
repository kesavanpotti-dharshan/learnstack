In EF Core, a **full entity load** materializes mapped entity objects such as `Order` or `Customer`; a **projection** uses `Select` to return only the fields and shape the use case needs—often a DTO, anonymous type, or scalar value. For most read-only API endpoints, lists, and reports, projections are usually the better default.[1][2][3]

## Core difference

```csharp
// Full entity load
var orders = await db.Orders.ToListAsync();
```

This loads all mapped `Order` columns and, by default, tracks the entities.

```csharp
// Projection
var orders = await db.Orders
    .Select(o => new OrderSummaryDto(
        o.Id,
        o.OrderNumber,
        o.Total,
        o.CreatedAt))
    .ToListAsync();
```

This asks EF Core to generate SQL that retrieves only the selected columns needed to create `OrderSummaryDto`. EF Core specifically recommends projecting only properties you need to avoid unnecessarily retrieving full entity data.[1]

## Comparison

| Concern         | Projection with `Select`                       | Full entity load                                          |
| --------------- | ---------------------------------------------- | --------------------------------------------------------- |
| Returned shape  | DTO, anonymous type, scalar, custom read model | Tracked or untracked EF entity                            |
| SQL columns     | Only selected columns                          | All mapped columns for the entity                         |
| Change tracking | DTO/anonymous projections are not tracked      | Tracked by default                                        |
| Best for        | GET APIs, lists, dashboards, search, reports   | Commands, domain behavior, edits                          |
| Serialization   | Controlled response contract                   | May expose unwanted fields/navigation loops               |
| Main risk       | Cannot directly edit and call `SaveChanges`    | Over-fetching, tracking overhead, accidental lazy loading |

## Why projections are efficient

Suppose `Orders` has 30 columns, including a large shipping address, internal notes, audit fields, and a row version. Your order-list page only needs four fields.

```csharp
var result = await db.Orders
    .Select(o => new OrderListItemDto(
        o.Id,
        o.OrderNumber,
        o.Status,
        o.Total))
    .ToListAsync();
```

EF Core can fetch only those four fields instead of all 30. That reduces database work, network transfer, object allocation, and JSON serialization work. A smaller selected column set can also enable more efficient index usage when the database can satisfy the query from an appropriate index.[1][2][4]

## Projections across relationships

You do not need `Include` merely to read a related value in a projection. EF Core can translate navigation-property access inside `Select` into the appropriate SQL joins or subqueries.

```csharp
var orders = await db.Orders
    .AsNoTracking()
    .Where(o => o.Status == OrderStatus.Pending)
    .Select(o => new OrderSummaryDto(
        o.Id,
        o.OrderNumber,
        o.Customer.Name,
        o.Items.Count,
        o.Total))
    .ToListAsync();
```

This is typically preferable to loading `Order`, `Customer`, `Items`, and all their mapped columns when the response only needs a customer name and item count. It also avoids navigation access later triggering lazy-loading queries.[1][2][5]

For nested API output:

```csharp
var order = await db.Orders
    .Where(o => o.Id == orderId)
    .Select(o => new OrderDetailsDto(
        o.Id,
        o.OrderNumber,
        o.Customer.Name,
        o.Items
            .OrderBy(i => i.Position)
            .Select(i => new OrderItemDto(
                i.Product.Name,
                i.Quantity,
                i.UnitPrice))
            .ToList()))
    .SingleAsync();
```

The query describes the exact response shape. This is a natural fit for CQRS-style read models: query data in the form consumers need, rather than loading a domain object graph and reshaping it afterward.[2][6][7]

## Full entity loads

Load full entities when you need EF Core to track and persist changes, or when you need domain behavior from the entity.

```csharp
var order = await db.Orders
    .Include(o => o.Items)
    .SingleAsync(o => o.Id == orderId, ct);

order.AddItem(productId, quantity);

await db.SaveChangesAsync(ct);
```

Here, a tracked `Order` and its required `Items` are appropriate because the command changes an aggregate and `SaveChangesAsync` must detect and persist those modifications.

A full entity load can also be right when:

- You genuinely need most mapped fields.
- You need a complete graph to enforce business invariants.
- A non-read-only workflow will modify entity state.
- You are working with a small object graph where the added data is justified.

## Tracking and `AsNoTracking`

A full entity query is tracked by default:

```csharp
var order = await db.Orders
    .SingleAsync(o => o.Id == orderId);

order.Status = OrderStatus.Paid;
await db.SaveChangesAsync();
```

For read-only full entity loads, use `AsNoTracking()` to avoid change-tracking overhead:

```csharp
var orders = await db.Orders
    .AsNoTracking()
    .ToListAsync();
```

However, `AsNoTracking()` does **not** prevent over-fetching. It still selects all mapped entity columns. Use a projection when you want both a smaller result shape and no entity tracking.[1][2]

## `Include` vs `Select`

`Include` and `Select` solve different problems:

```csharp
// Use Include: load tracked entity graph for a command.
var order = await db.Orders
    .Include(o => o.Items)
    .SingleAsync(o => o.Id == id);
```

```csharp
// Use Select: shape a read response.
var order = await db.Orders
    .Where(o => o.Id == id)
    .Select(o => new OrderDetailsDto(
        o.Id,
        o.OrderNumber,
        o.Items.Select(i => new OrderItemDto(
            i.Product.Name,
            i.Quantity,
            i.UnitPrice)).ToList()))
    .SingleAsync();
```

An `Include` tells EF Core to materialize related **entity instances**. A projection tells EF Core exactly what **output data** to return. For response-oriented reads, use `Select`; for tracked updates where the entity graph is required, use entities and `Include` selectively.[1][2][5]

## Practical guidance

- Use projections for list pages, search, reporting, dashboards, and most GET endpoints.
- Return DTOs rather than EF entities from public API endpoints.
- Load entities for commands that change state or require domain methods/invariants.
- Use `AsNoTracking()` on read-only entity queries that cannot reasonably use a projection.
- Do not add `Include` before a projection unless you have verified it is needed; EF Core generally derives the required relationship joins from the navigation usage in `Select`.
- Profile important queries: projection is a strong default, but actual query plans, indexes, predicates, row counts, and database provider behavior determine final performance.[1][2][4]

## Interview answer

> A full entity load materializes an EF Core entity with all of its mapped columns and tracks it by default, which is appropriate when I intend to modify it or need its domain behavior. A projection uses `Select` to map only the fields required into a DTO, anonymous object, or scalar. I use projections for read-only APIs, lists, and reports because they reduce transferred data, memory use, serializer work, and tracking overhead while making the response contract explicit. `AsNoTracking` removes tracking but still loads every mapped entity column, so it is not a substitute for a projection when I only need a subset of data.[1][2][3]

## Sources

[1] Efficient Querying - EF Core https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying
[2] 5 EF Core Query Techniques I Use in Every .NET 10 Project https://thecodeman.net/posts/preoptimized-ef-query-techniques-5-steps-to-success
[3] EF Core projections vs loading full entities - Aporeon https://aporeon.com/drills/ef-core-projections-vs-loading-full-entities
[4] EF core best practices : r/csharp https://www.reddit.com/r/csharp/comments/se1i9r/ef_core_best_practices/
[5] Avoid Include() Hell in EF Core – Use Select Projections ... https://www.linkedin.com/posts/islam-raafat_efcore-dotnetdeveloper-cleancode-activity-7348663635981778944-xl4v
[6] In Entity Framework is it more efficient / preferred to create ... https://stackoverflow.com/questions/32875683/in-entity-framework-is-it-more-efficient-preferred-to-create-projections-rathe
[7] Building Read Models with EF Core Projections https://blog.elmah.io/building-read-models-with-ef-core-projections/
