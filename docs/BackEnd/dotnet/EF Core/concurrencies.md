Concurrency control prevents **lost updates** when two requests read and modify the same database row at about the same time. In EF Core, the standard solution is **optimistic concurrency** using a concurrency token; **pessimistic concurrency** instead locks data before changes, but EF Core does not provide built-in LINQ-level support for it.[1][2][3]

## The lost-update problem

Suppose an order has `Quantity = 5`.

1. Request A reads quantity 5.
2. Request B reads quantity 5.
3. A changes it to 4 and saves.
4. B changes it to 3 and saves.

Without concurrency control, B may overwrite A’s change. The database ends at 3, even though the intended combined result might have been 2.

```text
Initial quantity: 5

Request A reads 5 → saves 4
Request B reads 5 → saves 3

Final quantity: 3  ← A's change was lost
```

## Optimistic concurrency

Optimistic concurrency assumes collisions are uncommon. It does **not** hold a database lock while the application is reading and editing data. Instead, EF Core verifies at save time that the row has not changed since it was originally loaded.[1][3]

If the row changed, EF Core makes the update affect zero rows and throws `DbUpdateConcurrencyException`. Your application then decides whether to retry, merge, show a conflict, or reject the request.[1][2]

### Row-version example

For SQL Server, the standard approach is a `rowversion` column represented by a `byte[]` property.

```csharp
public sealed class Order
{
    public int Id { get; set; }
    public int Quantity { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
}
```

Equivalent Fluent API:

```csharp
modelBuilder.Entity<Order>()
    .Property(x => x.RowVersion)
    .IsRowVersion();
```

`[Timestamp]` / `IsRowVersion()` makes the property a concurrency token. SQL Server changes its row-version value when the row is updated.[1][3]

When EF Core saves a tracked entity, it generates SQL conceptually like:

```sql
UPDATE Orders
SET Quantity = @newQuantity
WHERE Id = @id
  AND RowVersion = @originalRowVersion;
```

If someone else already updated the row, `RowVersion` no longer matches. The `WHERE` condition matches zero rows, and EF Core throws `DbUpdateConcurrencyException`.[1][4]

### Application-managed concurrency token

For providers without a native row-version feature, or when you only want certain changes to trigger conflicts, manage a version value yourself.

```csharp
public sealed class Product
{
    public Guid Id { get; set; }
    public decimal Price { get; set; }

    [ConcurrencyCheck]
    public Guid Version { get; set; }
}
```

```csharp
modelBuilder.Entity<Product>()
    .Property(x => x.Version)
    .IsConcurrencyToken();
```

Before saving a meaningful update, assign a new version:

```csharp
product.Price = newPrice;
product.Version = Guid.NewGuid();

await db.SaveChangesAsync(ct);
```

EF uses the original loaded `Version` in the update condition, then writes the new value if the update succeeds.[1][3]

## Handling an optimistic conflict

At minimum, catch the exception and return a conflict result:

```csharp
try
{
    await db.SaveChangesAsync(ct);
}
catch (DbUpdateConcurrencyException)
{
    return Results.Conflict(new
    {
        error = "This order was changed by another user. Reload and try again."
    });
}
```

For a user-editing workflow, return the current data/version so the UI can show a conflict and let the user decide. For server-to-server workflows, you may reload data, reapply a deterministic operation, and retry with a bounded retry count. EF Core’s documented workflow is to catch `DbUpdateConcurrencyException`, obtain affected entries, refresh original values from the database, resolve changes, and retry.[1]

Example: **store wins**—discard the local edit and reload current database values.

```csharp
catch (DbUpdateConcurrencyException ex)
{
    foreach (var entry in ex.Entries)
    {
        await entry.ReloadAsync(ct);
    }

    return Results.Conflict(new
    {
        error = "The record changed. Current values have been reloaded."
    });
}
```

Example: **client wins** is possible but should be used carefully; it can overwrite another user’s legitimate change. A better approach is often property-level merge rules, such as accepting a changed display name while rejecting an incompatible inventory or financial-state change.

## Passing row version through APIs

For disconnected web APIs, the client must send the version it originally read:

```json
{
  "quantity": 4,
  "rowVersion": "AAAAAAAAB9E="
}
```

On update, set the token’s **original value** before saving:

```csharp
var order = new Order
{
    Id = id,
    Quantity = request.Quantity
};

db.Attach(order);

db.Entry(order).Property(x => x.Quantity).IsModified = true;
db.Entry(order).Property(x => x.RowVersion).OriginalValue =
    Convert.FromBase64String(request.RowVersion);

await db.SaveChangesAsync(ct);
```

Do not trust a row version as authorization. It detects whether data changed; it does not prove the caller has permission to update it.

## Pessimistic concurrency

Pessimistic concurrency assumes collisions are likely or unacceptable. It acquires a lock before reading or changing a row, causing other transactions to wait, fail, or be blocked until the lock is released.[1][2][3]

Conceptually:

```text
Transaction A:
  Lock order row for update
  Read and modify it
  Commit and release lock

Transaction B:
  Attempts to read/update locked row
  Waits, times out, or gets a lock-related failure
```

This avoids the “two people edit, one save fails” behavior, but reduces throughput and introduces risks of lock contention, timeouts, and deadlocks.[2][3][5]

### EF Core limitation

EF Core has no built-in, provider-independent pessimistic-locking API in LINQ. Its native concurrency mechanism is optimistic concurrency. Pessimistic locking generally requires database-specific raw SQL, table hints, or transaction-isolation configuration.[2][3][4]

A SQL Server-specific example:

```csharp
await using var transaction =
    await db.Database.BeginTransactionAsync(ct);

var order = await db.Orders
    .FromSqlInterpolated($"""
        SELECT * FROM Orders WITH (UPDLOCK, ROWLOCK)
        WHERE Id = {orderId}
        """)
    .SingleAsync(ct);

order.Quantity -= 1;

await db.SaveChangesAsync(ct);
await transaction.CommitAsync(ct);
```

`UPDLOCK` and `ROWLOCK` are SQL Server-specific. Do not assume this syntax, lock behavior, or isolation semantics work with PostgreSQL, MySQL, or SQLite. Keep the transaction **short**: never hold a database lock while calling an external payment API, waiting for user input, or doing slow network I/O.[4][5][6]

## Comparison

| Concern                  | Optimistic                             | Pessimistic                                |
| ------------------------ | -------------------------------------- | ------------------------------------------ |
| Assumption               | Conflicts are rare                     | Conflicts are likely or must be prevented  |
| Locks held while editing | No                                     | Yes                                        |
| Conflict behavior        | Detect at `SaveChanges`; resolve/retry | Block, timeout, or fail competing work     |
| Throughput               | Usually higher                         | Lower under contention                     |
| User experience          | May require reload/merge/retry         | May wait or receive lock timeout           |
| EF Core support          | Built in via concurrency tokens        | Provider-specific implementation needed    |
| Best fit                 | Most web/API CRUD workflows            | Short, high-contention, critical workflows |

## Choosing the strategy

Use **optimistic concurrency** when:

- Users or services rarely edit the same row simultaneously.
- The application is read-heavy.
- A retry or conflict response is acceptable.
- You need scalability and do not want long-lived locks.[1][3][6]

Use **pessimistic concurrency** only when:

- Conflict frequency is high.
- The business operation requires serialization of access.
- The transaction can remain very short.
- You understand your database provider’s locking behavior and have timeout/deadlock handling.[2][5][6]

For inventory, payments, and reservations, a database atomic conditional update is often better than holding a lock:

```csharp
var affected = await db.InventoryItems
    .Where(x => x.ProductId == productId && x.AvailableQuantity >= requested)
    .ExecuteUpdateAsync(s => s
        .SetProperty(x => x.AvailableQuantity,
            x => x.AvailableQuantity - requested),
        ct);

if (affected == 0)
{
    return Results.Conflict("Insufficient inventory or concurrent update.");
}
```

This uses one atomic SQL `UPDATE` with a predicate. It avoids a read-then-write race and usually scales better than keeping a pessimistic lock open.

## Interview answer

> Optimistic concurrency is EF Core’s built-in model. I configure a concurrency token—typically a SQL Server `rowversion`—and EF includes the original token in the `UPDATE` or `DELETE` `WHERE` clause. If another writer changed the row first, zero rows are affected and EF throws `DbUpdateConcurrencyException`; the application then reloads, merges, retries, or returns HTTP 409. Pessimistic concurrency locks rows before modification to prevent conflicts, but it blocks competitors and risks contention and deadlocks. EF Core does not expose a provider-independent pessimistic-locking API, so it requires database-specific SQL or transaction isolation. For most APIs I use optimistic concurrency; for inventory-like operations I often prefer a single atomic conditional update.[1][2][3][5]

## Sources

[1] Handling Concurrency Conflicts - EF Core https://learn.microsoft.com/en-us/ef/core/saving/concurrency
[2] Tutorial: Handle concurrency - ASP.NET MVC with EF Core https://learn.microsoft.com/en-us/aspnet/core/data/ef-mvc/concurrency?view=aspnetcore-10.0
[3] Solving Race Conditions With EF Core Optimistic Locking https://milanjovanovic.tech/blog/solving-race-conditions-with-ef-core-optimistic-locking
[4] Optimistic vs. Pessimistic Concurrency in EF Core (with ... https://dev.to/stevsharp/optimistic-vs-pessimistic-concurrency-in-ef-core-with-table-hints-37jk
[5] Optimistic vs. Pessimistic Concurrency In .NET: Complete ... https://mehdihadeli.com/blog/optimistic-vs-pessimistic-concurrency
[6] Managing Concurrency in EF Core: Optimistic vs Pessimistic ... https://noumanbaloch.substack.com/p/managing-concurrency-in-ef-core-optimistic
[7] entity framework 6 and pessimistic concurrency https://stackoverflow.com/questions/43912368/entity-framework-6-and-pessimistic-concurrency
