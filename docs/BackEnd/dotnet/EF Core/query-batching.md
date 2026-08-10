In EF Core, **batching** reduces database round trips by grouping work together, while **bulk operations** perform set-based changes directly in the database without loading and tracking every entity. The best strategy depends on whether you need normal EF Core behavior—domain logic, change tracking, interceptors, auditing—or simply need to change many rows efficiently.[1][2][3][4]

## Three different concepts

| Technique                        | What it does                                                                    | Loads entities? | Uses change tracker? |
| -------------------------------- | ------------------------------------------------------------------------------- | --------------: | -------------------: |
| Query batching                   | Fetches many related records in one/few bounded queries                         |     Usually yes |             Optional |
| `SaveChanges` batching           | Groups tracked inserts/updates/deletes into fewer database commands/round trips |             Yes |                  Yes |
| Set-based bulk update/delete     | Runs one SQL `UPDATE` or `DELETE` over a filtered query                         |              No |                   No |
| Bulk-insert library/provider API | Uses database-specific high-throughput insert mechanisms                        |      Usually no |           Usually no |

Do not confuse EF Core’s normal `SaveChanges` batching with a true bulk operation. Normal batching still tracks entities and generally executes per-entity DML statements; it simply groups commands to reduce round trips.[3][4]

## Query batching: avoid repeated reads

The read-side version of batching avoids N+1 queries. Instead of querying related data inside a loop, collect IDs, load all needed rows in one query, then create a lookup.

### Bad: query inside a loop

```csharp
var invoices = await db.Invoices
    .AsNoTracking()
    .ToListAsync(ct);

foreach (var invoice in invoices)
{
    invoice.LineItems = await db.LineItems
        .Where(x => x.InvoiceId == invoice.Id)
        .ToListAsync(ct);
}
```

For \(N\) invoices, this may produce \(1 + N\) SQL commands.

### Better: batch the lookup

```csharp
var invoices = await db.Invoices
    .AsNoTracking()
    .ToListAsync(ct);

var invoiceIds = invoices.Select(x => x.Id).ToList();

var lineItemsByInvoiceId = await db.LineItems
    .AsNoTracking()
    .Where(x => invoiceIds.Contains(x.InvoiceId))
    .GroupBy(x => x.InvoiceId)
    .ToDictionaryAsync(x => x.Key, x => x.ToList(), ct);
```

Now you have a bounded two-query pattern: one query for invoices and one for all their line items. Batching related reads reduces round trips and is a standard mitigation for N+1 behavior.[1]

For API read models, a single `Select` projection is often even cleaner than manual batching; use batching when the data is best retrieved in separate query shapes or must be joined in memory.

## Normal EF Core insert/update/delete batching

For ordinary application writes, add or modify multiple tracked entities and call `SaveChangesAsync()` **once per intended unit of work**.

```csharp
var orders = incomingOrders.Select(x => new Order
{
    CustomerId = x.CustomerId,
    Total = x.Total,
    CreatedAt = DateTimeOffset.UtcNow
});

db.Orders.AddRange(orders);

await db.SaveChangesAsync(ct);
```

Avoid this:

```csharp
foreach (var order in orders)
{
    db.Orders.Add(order);
    await db.SaveChangesAsync(ct); // Avoid: repeated work and round trips
}
```

EF Core batches commands when saving changes, subject to provider-specific limits. This preserves normal EF behavior: validation patterns in your application, entity state tracking, interceptors, relationship fix-up, generated keys, and normal concurrency handling.[3][4]

### Use this when

- The batch is moderate in size.
- You need entity events/interceptors, auditing, or domain behavior.
- You need generated IDs reflected in entities.
- You want EF Core to manage relationships and state changes.

### Chunk very large tracked workloads

For imports with many thousands of entities, process chunks and clear tracking after each successful save to prevent the change tracker from growing indefinitely.

```csharp
const int batchSize = 1_000;

foreach (var batch in incomingOrders.Chunk(batchSize))
{
    db.Orders.AddRange(batch);

    await db.SaveChangesAsync(ct);
    db.ChangeTracker.Clear();
}
```

Use a batch size chosen through measurement. Very large transactions can increase lock duration, transaction-log pressure, memory usage, and retry cost if the entire operation fails.[3][5]

## Set-based update: `ExecuteUpdateAsync`

EF Core 7 introduced `ExecuteUpdate` and `ExecuteUpdateAsync`, which translate a filtered LINQ query directly into SQL `UPDATE`. No entities are materialized, and no change tracking is involved.[2][4]

```csharp
var affected = await db.Orders
    .Where(o => o.Status == OrderStatus.Pending &&
                o.CreatedAt < cutoff)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(o => o.Status, OrderStatus.Expired)
        .SetProperty(o => o.UpdatedAt, DateTimeOffset.UtcNow),
        ct);
```

Conceptually, that becomes one command:

```sql
UPDATE Orders
SET Status = 'Expired',
    UpdatedAt = @now
WHERE Status = 'Pending'
  AND CreatedAt < @cutoff;
```

This is dramatically better than loading every pending order, changing a property in C#, and calling `SaveChanges` for thousands of rows.

### Good uses

- Mark old notifications as expired.
- Apply a percentage price adjustment.
- Update status for a filtered set.
- Archive or deactivate records.

```csharp
await db.Products
    .Where(p => p.CategoryId == categoryId)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(p => p.Price, p => p.Price * 0.90m),
        ct);
```

## Set-based delete: `ExecuteDeleteAsync`

`ExecuteDelete` and `ExecuteDeleteAsync` generate a direct SQL `DELETE` for a query.[2][4][6]

```csharp
var deleted = await db.RefreshTokens
    .Where(t => t.ExpiresAt < DateTimeOffset.UtcNow)
    .ExecuteDeleteAsync(ct);
```

This is typically one command and avoids loading token entities into memory.

### Important behavior

Set-based operations bypass the EF Core change tracker. Therefore:

- Already tracked entities are **not updated** to reflect the database change.
- `SaveChanges` interceptors and entity-level lifecycle logic are not invoked in the normal tracked-entity way.
- Database triggers and constraints still apply because the database executes the SQL.
- You must implement business rules, auditing, and optimistic concurrency conditions explicitly if required.[2][4]

For example, enforce a concurrency token manually:

```csharp
var affected = await db.Orders
    .Where(o => o.Id == id && o.RowVersion == expectedRowVersion)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(o => o.Status, OrderStatus.Cancelled),
        ct);

if (affected == 0)
{
    throw new DbUpdateConcurrencyException();
}
```

Also, `ExecuteUpdateAsync` executes immediately; it does not wait for a later `SaveChangesAsync`.

## Bulk inserts

EF Core has native set-based methods for **updates and deletes**, but large-scale insert workloads often need a different strategy. For huge imports, common choices include:

1. **Normal `AddRange` + `SaveChanges` in chunks**  
   Best when normal EF behavior matters.

2. **Provider-specific APIs**  
   For example, SQL Server `SqlBulkCopy`, PostgreSQL `COPY`, table-valued parameters, or staging tables.

3. **Bulk libraries**  
   Libraries such as EFCore.BulkExtensions and Entity Framework Extensions provide APIs such as `BulkInsert`, `BulkUpdate`, `BulkDelete`, `BulkMerge`, and upsert/synchronization operations. Their implementations use provider-specific mechanisms, such as SQL Server bulk copy or PostgreSQL copy/upsert support.[7][8][9][10]

Example using a third-party library:

```csharp
await db.BulkInsertAsync(products, cancellationToken: ct);
```

Example upsert-style intent:

```csharp
await db.BulkInsertOrUpdateAsync(products, cancellationToken: ct);
```

Treat this as infrastructure-specific code and test it carefully: semantics for keys, generated values, owned types, graph inserts, concurrency, triggers, transactions, and provider support vary by library and database.[8][9]

## Strategy guide

| Situation                                             | Best starting choice                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Read many parents plus related data                   | Projection, `Include`, or ID batching—avoid query-per-row                                           |
| Insert tens/hundreds of entities and need EF behavior | `AddRange` + one `SaveChangesAsync()`                                                               |
| Import many thousands/millions of rows                | Chunked writes, `SqlBulkCopy`/provider feature, or vetted bulk library                              |
| Update many rows with the same rule                   | `ExecuteUpdateAsync`                                                                                |
| Delete many rows matching a predicate                 | `ExecuteDeleteAsync`                                                                                |
| Upsert/synchronize an external data feed              | Database-native `MERGE`/upsert pattern or bulk library                                              |
| Per-row business logic and different values           | Load only necessary data, process in chunks, then save; consider staging tables for very large jobs |

## Transactions and error handling

`SaveChanges` operations are transactional by default for the commands it sends. However, when combining several calls—such as a bulk insert, `ExecuteUpdate`, and an outbox write—use an explicit transaction if they must succeed or fail together.

```csharp
await using var tx = await db.Database.BeginTransactionAsync(ct);

await db.Orders
    .Where(o => o.Id == orderId)
    .ExecuteUpdateAsync(s => s
        .SetProperty(o => o.Status, OrderStatus.Paid), ct);

db.OutboxMessages.Add(new OutboxMessage(/* ... */));
await db.SaveChangesAsync(ct);

await tx.CommitAsync(ct);
```

For long-running imports, consider smaller transactions per chunk rather than one giant transaction. That reduces lock duration and makes failures/retries more manageable, though it means the entire import is not all-or-nothing.

## Interview answer

> In EF Core, I distinguish normal `SaveChanges` batching from true bulk operations. For normal application writes, I use `AddRange` or tracked changes and call `SaveChangesAsync` once, which lets EF batch commands while preserving change tracking, interceptors, relationships, and concurrency behavior. For set-based changes over many rows, I use EF Core 7+ `ExecuteUpdateAsync` or `ExecuteDeleteAsync`, which produce direct SQL without loading entities or using the change tracker. For massive inserts or upserts, I use chunking, provider-native bulk tools such as `SqlBulkCopy`, or a vetted bulk library. On reads, I batch IDs or project data to avoid N+1 queries. The choice depends on data volume, transaction boundaries, and whether normal EF entity behavior is required.[1][2][3][4]

## Sources

[1] How I Made My EF Core Query 3.42x Faster With Batching https://milanjovanovic.tech/blog/how-i-made-my-efcore-query-faster-with-batching
[2] What You Need To Know About EF Core Bulk Updates https://milanjovanovic.tech/blog/what-you-need-to-know-about-ef-core-bulk-updates
[3] Batching Updates and Inserts: Making EF Core Work Smarter, Not ... https://woodruff.dev/batching-updates-and-inserts-making-ef-core-work-smarter-not-harder/
[4] Bulk Operations in EF Core 10 - Benchmarking Insert, ... https://codewithmukesh.com/blog/bulk-operations-efcore/
[5] Best Practices for Batch-Processing Application to Avoid Out-of ... https://www.reddit.com/r/dotnet/comments/1gwgxrd/best_practices_for_batchprocessing_application_to/
[6] Efficient bulk inserts using ef core 8 without libraries ... https://www.reddit.com/r/dotnet/comments/1lb8urf/efficient_bulk_inserts_using_ef_core_8_without/
[7] Tools & Extensions - EF Core https://learn.microsoft.com/en-us/ef/core/extensions/
[8] borisdj/EFCore.BulkExtensions https://github.com/borisdj/efcore.bulkextensions
[9] Bulk Extensions for EF Core | Bulk Insert, Update, Delete, ... https://entityframework-extensions.net/bulk-extensions
[10] EF Core Bulk Methods with EF Extensions in Entity ... https://entityframework-plus.net/ef-core-bulk-methods
[11] Entity Framework batching requests that rely on the results of ... https://stackoverflow.com/questions/70440567/entity-framework-batching-requests-that-rely-on-the-results-of-queries-in-the-ba
[12] Batch split queries · Issue #10878 · dotnet/efcore - GitHub https://github.com/dotnet/efcore/issues/10878
[13] Batch Queries / Futures - Wolverine https://wolverinefx.io/guide/durability/efcore/batch-queries.html
[14] Batching Updates & Inserts in EF Core — Make Your .NET Apps ... https://www.youtube.com/watch?v=AtO88JuXPms
