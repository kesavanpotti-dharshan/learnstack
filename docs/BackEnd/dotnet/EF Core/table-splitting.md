EF Core supports several advanced mapping strategies for cases where your object model and relational schema do not map one-to-one. **Table splitting** maps multiple entity types to one database row; **entity splitting** maps one entity type across several tables; and **TPH/TPT/TPC** map a C# inheritance hierarchy to relational tables.[1][2][3]

## Quick distinction

| Feature          | Object model          | Database mapping                             |
| ---------------- | --------------------- | -------------------------------------------- |
| Table splitting  | Multiple entities     | One shared table row                         |
| Entity splitting | One entity            | Multiple related table rows                  |
| TPH              | Inheritance hierarchy | One table for entire hierarchy               |
| TPT              | Inheritance hierarchy | One base table plus a table per derived type |
| TPC              | Inheritance hierarchy | One independent table per concrete type      |

## Table splitting

**Table splitting** lets two or more entity types share the **same physical table and the same row**. Their primary keys map to the same database key column, and EF Core models a one-to-one relationship between them.[1]

Example: a wide `Orders` table holds both core order fields and billing fields. You want a smaller `Order` entity plus a separate `OrderBilling` entity.

```csharp
public sealed class Order
{
    public int Id { get; set; }
    public string Number { get; set; } = null!;
    public OrderBilling Billing { get; set; } = null!;
}

public sealed class OrderBilling
{
    public int Id { get; set; }
    public string BillingEmail { get; set; } = null!;
    public string BillingAddress { get; set; } = null!;
}
```

```csharp
modelBuilder.Entity<Order>(builder =>
{
    builder.ToTable("Orders");
    builder.HasKey(x => x.Id);

    builder.HasOne(x => x.Billing)
        .WithOne()
        .HasForeignKey<OrderBilling>(x => x.Id);
});

modelBuilder.Entity<OrderBilling>(builder =>
{
    builder.ToTable("Orders");
    builder.HasKey(x => x.Id);
});
```

```text
Orders table
+----+----------+---------------------+------------------+
| Id | Number   | BillingEmail        | BillingAddress   |
+----+----------+---------------------+------------------+
| 42 | ORD-1001 | user@example.com    | 123 Main Street  |
+----+----------+---------------------+------------------+

Order(Id, Number) + OrderBilling(Id, BillingEmail, BillingAddress)
                  share the same row
```

### When to use it

- You have a legacy or very wide table.
- You want better encapsulation in the object model.
- A feature only needs a subset of the table’s columns.

### Key constraints

- The entities map to the same table.
- They share the same primary-key column(s).
- EF requires a relationship between them, usually one-to-one.
- It is more constrained when combined with inheritance strategies. For example, a dependent entity in a table-splitting relationship cannot use TPC.[1]

## Entity splitting

**Entity splitting** is the inverse: one entity’s properties are stored across **two or more tables**, usually with the same primary key value.[1]

Example: keep high-traffic account fields in `Accounts`, but place larger profile details in `AccountProfiles`.

```csharp
public sealed class Account
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string Bio { get; set; } = null!;
}
```

```csharp
modelBuilder.Entity<Account>(builder =>
{
    builder.HasKey(x => x.Id);

    builder.SplitToTable("Accounts", table =>
    {
        table.Property(x => x.Id);
        table.Property(x => x.Email);
    });

    builder.SplitToTable("AccountProfiles", table =>
    {
        table.Property(x => x.Id);
        table.Property(x => x.DisplayName);
        table.Property(x => x.Bio);
    });
});
```

```text
Account entity
 ├─ Id, Email          → Accounts table
 └─ Id, DisplayName,
    Bio                → AccountProfiles table
```

EF Core uses the tables together to materialize one `Account`. Entity splitting is useful when a single domain entity naturally spans multiple storage tables, but you do not want to expose that split to application code.[1]

### Key constraints

- Every split fragment is required: a row in the main table requires a corresponding row in each split table.
- Entity splitting cannot be used for an entity type in an inheritance hierarchy.[1]

## Inheritance mapping

Assume this model:

```csharp
public abstract class PaymentMethod
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}

public sealed class CreditCard : PaymentMethod
{
    public string Last4 { get; set; } = null!;
}

public sealed class BankTransfer : PaymentMethod
{
    public string BankAccountNumber { get; set; } = null!;
}
```

EF Core offers three main strategies.

## TPH: Table Per Hierarchy

**TPH** stores every type in the hierarchy in **one table** and uses a discriminator column to indicate the concrete type. It is EF Core’s default inheritance mapping strategy.[2][4]

```csharp
modelBuilder.Entity<PaymentMethod>()
    .UseTphMappingStrategy()
    .HasDiscriminator<string>("PaymentType")
    .HasValue<CreditCard>("Card")
    .HasValue<BankTransfer>("BankTransfer");
```

```text
PaymentMethods
+----+-------------+--------------+-------+-------------------+
| Id | Name        | PaymentType  | Last4 | BankAccountNumber |
+----+-------------+--------------+-------+-------------------+
| 1  | Personal CC | Card         | 4242  | NULL              |
| 2  | ACH         | BankTransfer | NULL  | 123456789         |
+----+-------------+--------------+-------+-------------------+
```

**Advantages**

- Simple schema and usually efficient polymorphic queries: one table, no inheritance joins.
- Works well when derived types have relatively few unique properties.

**Trade-offs**

- Many nullable columns if derived types differ substantially.
- Table can become wide and sparse.
- Requires a discriminator column.[2][4]

## TPT: Table Per Type

**TPT** stores base properties in one table and each derived type’s unique properties in its own table. Derived tables share the base key through a foreign key relationship.[2][3]

```csharp
modelBuilder.Entity<PaymentMethod>()
    .UseTptMappingStrategy();

modelBuilder.Entity<PaymentMethod>()
    .ToTable("PaymentMethods");

modelBuilder.Entity<CreditCard>()
    .ToTable("CreditCards");

modelBuilder.Entity<BankTransfer>()
    .ToTable("BankTransfers");
```

```text
PaymentMethods
+----+-------------+
| Id | Name        |
+----+-------------+

CreditCards
+----+-------+
| Id | Last4 |
+----+-------+

BankTransfers
+----+-------------------+
| Id | BankAccountNumber |
+----+-------------------+
```

**Advantages**

- More normalized schema.
- No unrelated nullable columns in a single hierarchy table.
- Can fit database designs that require strict table separation.

**Trade-offs**

- EF must use `JOIN`s to load a derived entity.
- Queries become more expensive and complex as the hierarchy deepens, especially polymorphic base-type queries.[3]

## TPC: Table Per Concrete Type

**TPC** uses one table per **concrete** type. Each concrete table contains both inherited properties and properties specific to that type. No base table is created for an abstract base class. TPC was added in EF Core 7.[1][2][4]

```csharp
modelBuilder.Entity<PaymentMethod>()
    .UseTpcMappingStrategy();

modelBuilder.Entity<CreditCard>()
    .ToTable("CreditCards");

modelBuilder.Entity<BankTransfer>()
    .ToTable("BankTransfers");
```

```text
CreditCards
+----+-------------+-------+
| Id | Name        | Last4 |
+----+-------------+-------+

BankTransfers
+----+-------------+-------------------+
| Id | Name        | BankAccountNumber |
+----+-------------+-------------------+
```

**Advantages**

- Each concrete table is self-contained.
- No discriminator and no nullable columns for sibling types.
- Querying a specific leaf type can be efficient.

**Trade-offs**

- Base properties are duplicated across concrete tables.
- A query over the base type may require a `UNION ALL` across all concrete tables.
- Global key generation and relationships spanning the hierarchy can be more complicated.[2][4]

## Choosing a strategy

| Situation                                                                         | Usually choose   |
| --------------------------------------------------------------------------------- | ---------------- |
| Default case; frequent polymorphic queries; derived types not radically different | TPH              |
| Existing normalized schema requires a table per type; hierarchy is small          | TPT              |
| Mostly query concrete leaf types; types have many distinct fields                 | TPC              |
| One wide/legacy row should appear as separate entities                            | Table splitting  |
| One conceptual entity must be stored across multiple tables                       | Entity splitting |

EF Core guidance generally favors **TPH** for many cases because it avoids joins and makes querying the hierarchy straightforward. Choose TPT when normalization or an existing schema requires it, and consider TPC when concrete types are queried independently and their fields differ substantially.[2][3]

## Interview answer

> Table splitting maps multiple entity types to the same table row, typically through a shared primary key and a one-to-one relationship. Entity splitting does the reverse: it maps one entity’s properties across multiple tables, with each row fragment required. For inheritance, TPH uses one table plus a discriminator and is EF Core’s default; TPT uses a base table plus a table per derived type, which is normalized but join-heavy; and TPC uses a self-contained table per concrete type, avoiding joins for leaf queries but duplicating base fields and requiring unions for base-type queries.[1][2][3][4]

## Sources

[1] Advanced table mapping - EF Core https://learn.microsoft.com/en-us/ef/core/modeling/table-splitting
[2] Inheritance Strategies in Entity Framework Core 7 https://abp.io/community/articles/inheritance-strategies-in-entity-framework-core-7-hg82tp4h
[3] EF Core Table Per Type (TPT) — Inheritance Mapping ... https://www.learnentityframeworkcore.com/modeling/inheritance-table-per-type
[4] How and When to Use TPC Inheritance Mapping in EF Core https://code-maze.com/efcore-how-and-when-to-use-tpc-inheritance-mapping/
[5] EF inheritance with table splitting https://stackoverflow.com/questions/46206943/ef-inheritance-with-table-splitting
[6] Support complex properties (JSON, table splitting) with TPT ... https://github.com/dotnet/efcore/issues/28443
[7] EF Core: Which is better – a single universal table or ... https://www.reddit.com/r/dotnet/comments/1jzvjac/ef_core_which_is_better_a_single_universal_table/
