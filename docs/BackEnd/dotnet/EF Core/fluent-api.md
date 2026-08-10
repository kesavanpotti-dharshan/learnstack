Fluent API in EF Core is a code-based way to configure how your C# entity model maps to the database. You use chained `ModelBuilder` calls—usually in `OnModelCreating` or separate configuration classes—to define tables, columns, keys, relationships, indexes, constraints, and database behavior without putting EF-specific attributes on your entity classes.[1][2][3]

## Why it exists

EF Core builds a model using three configuration sources, in this order of precedence:

1. **Conventions** — EF Core makes assumptions from property names/types.
2. **Data annotations** — attributes such as `[Required]` or `[MaxLength]`.
3. **Fluent API** — explicit C# configuration; this has the highest precedence.[1][2]

For example, EF convention may map an entity named `Order` to an `Orders` table. Fluent API lets you explicitly override that behavior:

```csharp
modelBuilder.Entity<Order>()
    .ToTable("sales_orders", schema: "sales");
```

If Fluent API conflicts with a convention or data annotation, Fluent API wins. If Fluent API calls conflict with each other, the later configuration generally wins.[1]

## Where to write it

### Option 1: `OnModelCreating`

For smaller applications, configure entities directly in your `DbContext`:

```csharp
public sealed class AppDbContext(
    DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.CustomerEmail)
                .HasColumnName("customer_email")
                .HasMaxLength(320)
                .IsRequired();

            entity.Property(x => x.Total)
                .HasPrecision(18, 2);
        });
    }
}
```

`OnModelCreating` receives a `ModelBuilder`, which EF Core uses to build the model and its mappings.[1][2][3]

### Option 2: One configuration class per entity

For larger projects, keep the `DbContext` small by creating an `IEntityTypeConfiguration<TEntity>` class per entity.[4][5]

```csharp
public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CustomerEmail)
            .HasColumnName("customer_email")
            .HasMaxLength(320)
            .IsRequired();

        builder.Property(x => x.Total)
            .HasPrecision(18, 2);

        builder.HasIndex(x => new { x.CustomerEmail, x.CreatedAt });
    }
}
```

Register configurations:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(
        typeof(AppDbContext).Assembly);
}
```

This discovers and applies `IEntityTypeConfiguration<T>` implementations in the assembly.[4][5]

## What you configure

### Tables, schemas, and keys

```csharp
builder.ToTable("orders", schema: "sales");
builder.HasKey(x => x.Id);

builder.HasAlternateKey(x => x.OrderNumber);

builder.HasIndex(x => x.OrderNumber)
    .IsUnique();
```

Use these to control table names, primary keys, alternate keys, schemas, and indexes.[2]

### Columns and validation-like schema rules

```csharp
builder.Property(x => x.OrderNumber)
    .HasColumnName("order_no")
    .HasMaxLength(30)
    .IsRequired();

builder.Property(x => x.Total)
    .HasPrecision(18, 2);

builder.Property(x => x.CreatedAt)
    .HasDefaultValueSql("SYSUTCDATETIME()");
```

Common property methods include:

- `HasColumnName`
- `HasColumnType`
- `HasMaxLength`
- `HasPrecision`
- `IsRequired`
- `HasDefaultValue` / `HasDefaultValueSql`
- `HasComputedColumnSql`
- `ValueGeneratedOnAdd`[2]

Important: EF mapping constraints are not a replacement for API/domain validation. `IsRequired()` ensures the EF/database model treats a field as non-nullable; it does not alone provide complete user-input validation.

### Relationships

Fluent API gives full control over cardinality, foreign keys, and delete behavior:

```csharp
builder.HasOne(x => x.Customer)
    .WithMany(x => x.Orders)
    .HasForeignKey(x => x.CustomerId)
    .OnDelete(DeleteBehavior.Restrict);
```

This means:

- Each `Order` has one `Customer`.
- A `Customer` has many `Orders`.
- `Order.CustomerId` is the foreign key.
- Deleting a customer is restricted if orders reference it.

Relationship methods include `HasOne`, `WithMany`, `HasMany`, `WithOne`, `HasForeignKey`, and `OnDelete`.[2][5]

### Composite keys and indexes

These scenarios are common reasons to use Fluent API:

```csharp
builder.HasKey(x => new { x.OrderId, x.ProductId });

builder.HasIndex(x => new { x.TenantId, x.Status, x.CreatedAt });
```

Composite keys, sophisticated indexes, and many non-trivial relationships are better expressed through Fluent API than attributes.[2][5]

### Concurrency control

A row-version column allows EF Core to detect conflicting updates:

```csharp
builder.Property(x => x.RowVersion)
    .IsRowVersion();
```

EF includes the original row version in an update condition. If another process changed the row first, no rows are updated and EF Core can throw a concurrency exception. Fluent API supports concurrency tokens and row-version configuration.[2]

### Value objects and owned types

For a DDD-style value object, you can map its properties as columns in the owner’s table:

```csharp
builder.OwnsOne(x => x.ShippingAddress, address =>
{
    address.Property(x => x.Street)
        .HasColumnName("shipping_street")
        .HasMaxLength(200);

    address.Property(x => x.City)
        .HasColumnName("shipping_city")
        .HasMaxLength(100);
});
```

Owned types are another capability typically configured through Fluent API.[2][5]

## Fluent API vs data annotations

| Concern                                 | Data annotations                        | Fluent API                             |
| --------------------------------------- | --------------------------------------- | -------------------------------------- |
| Location                                | Directly on entity properties/classes   | `DbContext` or separate config classes |
| Keeps domain model persistence-agnostic | Less so                                 | Yes                                    |
| Simple rules                            | Concise for `[Required]`, `[MaxLength]` | Also works, but more verbose           |
| Complex mappings                        | Limited                                 | Full EF Core configuration surface     |
| Precedence                              | Lower                                   | Highest                                |

Data annotations are fine for small, obvious rules. Fluent API is normally preferred for complex mappings and architectures that keep persistence concerns out of domain entities.[1][2][5][6]

## Example: complete entity mapping

```csharp
public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders", "sales");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderNumber)
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.OrderNumber)
            .IsUnique();

        builder.Property(x => x.Total)
            .HasPrecision(18, 2);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        builder.Property(x => x.RowVersion)
            .IsRowVersion();

        builder.HasOne(x => x.Customer)
            .WithMany(x => x.Orders)
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

When you run `Add-Migration`, EF Core compares this model with the prior migration snapshot and produces schema changes—for example, columns, foreign keys, indexes, and constraints.

## Interview answer

> Fluent API is EF Core’s most powerful model-configuration mechanism. I use `ModelBuilder` in `OnModelCreating`, usually through one `IEntityTypeConfiguration<T>` class per entity, to define tables, columns, keys, indexes, relationships, delete behavior, precision, defaults, owned types, and concurrency tokens. It overrides conventions and data annotations, and it keeps persistence mappings out of domain entities. I generally use annotations only for simple metadata and Fluent API for all non-trivial mappings.[1][2][4][5]

## Sources

[1] Creating and Configuring a Model - EF Core https://learn.microsoft.com/en-us/ef/core/modeling/
[2] Fluent API in Entity Framework Core https://www.entityframeworktutorial.net/efcore/fluent-api-in-entity-framework-core.aspx
[3] Fluent API Configuration https://www.learnentityframeworkcore.com/configuration/fluent-api
[4] EF Core Mapping EntityTypeConfiguration https://stackoverflow.com/questions/26957519/ef-core-mapping-entitytypeconfiguration
[5] Configuring Entities with Fluent API in EF Core 10 https://codewithmukesh.com/blog/fluent-api-entity-configuration-efcore/
[6] Data Annotation vs Fluent API : r/dotnet - Reddit https://www.reddit.com/r/dotnet/comments/1ioe0dh/data_annotation_vs_fluent_api/
[7] What is Entity Framework fluent api? - Stack Overflow https://stackoverflow.com/questions/6332340/what-is-entity-framework-fluent-api
[8] Fluent API - Configuring and Mapping Properties and Types https://learn.microsoft.com/en-us/ef/ef6/modeling/code-first/fluent/types-and-properties
[9] The Fluent API - Entity Framework Core Part 9 - YouTube https://www.youtube.com/watch?v=7M501P-23Jg
[10] Fluent API with Entity Framework Core with Example https://www.youtube.com/watch?v=OWN9e2FjO4k
