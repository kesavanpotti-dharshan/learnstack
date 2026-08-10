In EF Core, **Code-First** means C# classes and EF configuration define the database schema; **Database-First** means an existing database schema defines the generated EF Core model. The key question is: **which is the source of truth—application code or the database?**[1][2]

## Comparison

| Concern          | Code-First                                                      | Database-First                                          |
| ---------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| Source of truth  | C# entity classes + Fluent API/data annotations                 | Existing database schema                                |
| Starting point   | Application/domain model                                        | Tables, columns, constraints, views, etc.               |
| Schema changes   | EF Core migrations                                              | SQL/database changes, then re-scaffold model            |
| EF Core workflow | `Add-Migration` → `Update-Database`                             | `Scaffold-DbContext`                                    |
| Best fit         | New applications where the app team controls schema             | Legacy, shared, DBA-owned, or vendor-managed databases  |
| Primary risk     | Migrations may not capture all DB-specific needs without review | Generated model can be overwritten or drift from schema |

## Code-First

With Code-First, you create entity classes and configure mappings in C#. EF Core builds a model from that code, and migrations generate versioned database schema changes.[1][2][3]

```csharp
public sealed class Order
{
    public Guid Id { get; set; }
    public required string CustomerEmail { get; set; }
    public decimal Total { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
```

```csharp
public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("Orders");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.CustomerEmail)
                .HasMaxLength(320)
                .IsRequired();

            entity.Property(x => x.Total)
                .HasPrecision(18, 2);
        });
    }
}
```

You then create and apply a migration:

```bash
dotnet ef migrations add CreateOrders
dotnet ef database update
```

Conceptually:

```text
C# entities + mapping
        ↓
EF Core model
        ↓
Migration files in source control
        ↓
Database schema
```

### Strengths

- Schema evolution is reviewed and versioned alongside application code.
- Works naturally with DDD, clean architecture, and fast-moving product teams.
- You control entity names, relationships, mappings, and migration history.
- Easy to create matching databases for local development, CI, and tests.[1][2][4]

### Limitations

- You still need to understand the database: indexes, constraints, query plans, concurrency, and production-safe migration practices matter.
- Hand-editing a production database outside migrations can cause model/schema drift.
- Complex database features—existing stored procedures, triggers, advanced views, vendor-specific features—may require manual SQL migrations and extra mapping.
- Automated production migration execution needs care; large migrations should be reviewed and sometimes run separately.[1][4][5]

## Database-First

With Database-First, you start with an already designed database and **reverse-engineer** it into a `DbContext` and entity classes. EF Core calls this _scaffolding_.[1][2]

Example for SQL Server:

```bash
dotnet ef dbcontext scaffold \
  "Server=.;Database=SalesDb;Trusted_Connection=True;TrustServerCertificate=True" \
  Microsoft.EntityFrameworkCore.SqlServer \
  --context SalesDbContext \
  --output-dir Data/Models \
  --context-dir Data \
  --no-onconfiguring
```

Conceptually:

```text
Existing database schema
        ↓
EF Core scaffolding
        ↓
DbContext + generated entity classes
        ↓
Application code
```

The resulting `DbSet` properties and mappings reflect the schema EF Core discovered—tables, primary keys, foreign keys, column types, nullability, and similar metadata.

### Strengths

- Fast way to integrate with an established database.
- Best when a DBA team, a vendor, or another system owns schema changes.
- Avoids manually recreating a very large or complex existing schema in C#.
- Fits legacy databases where changing table names, conventions, or relationships is not realistic.[1][2][4][5]

### Limitations

- Generated code should not be treated as hand-owned code: re-scaffolding can overwrite changes.
- Schema changes happen database-first, then the model must be regenerated.
- Database naming and design decisions can leak directly into application models.
- You generally should not use EF migrations to manage a database that another team owns.[1][4][5]

## Safe Database-First customization

Keep generated entities and context separate from your custom code. EF Core scaffolds partial classes, so extensions can live in separate files:

```csharp
// Generated: Data/Models/Customer.cs
public partial class Customer
{
    public int CustomerId { get; set; }
    public string FullName { get; set; } = null!;
}

// Hand-written: DomainExtensions/Customer.Extensions.cs
public partial class Customer
{
    public string DisplayName => FullName.Trim();
}
```

For more substantial domain behavior, avoid placing it in scaffolded persistence entities. Instead, map generated data models to separate domain models or DTOs.

## Choosing the approach

Choose **Code-First** when:

- You are building a new application.
- The application team owns schema design and deployments.
- The domain model and schema will evolve frequently.
- You want migration history versioned with code.[1][2]

Choose **Database-First** when:

- You must integrate with a legacy or already-existing database.
- A DBA, vendor, or another team owns the schema.
- The schema is complex and mostly stable.
- The database is shared by multiple applications, so one app should not unilaterally evolve it.[1][2][5]

A **hybrid** approach is also common: use Database-First for legacy/shared tables, but Code-First migrations for a new service’s database or new isolated module.[2]

## Important clarification

Code-First does **not** require a brand-new database. You can map C# classes to an existing schema, then start managing future changes with migrations—but only if your team formally takes ownership of that database’s schema.[3]

Likewise, Database-First does not mean EF Core is only read-only; you can query and update data normally. It means the database schema, rather than EF migrations, drives the model.

## Interview answer

> Code-First and Database-First differ by the source of truth. In Code-First, I model entities and mappings in C#, then use EF Core migrations to create and evolve the schema. I choose it for new systems where the application team owns the database and wants schema changes versioned with code. In Database-First, I begin with an existing schema and use `Scaffold-DbContext` to generate the context and entity mappings. I choose it for legacy, shared, DBA-managed, or vendor databases. In either case, I avoid schema drift: one clearly defined owner must control schema changes.[1][2][5]

## Sources

[1] Code First Approach vs. Database First in Entity Framework - Built In https://builtin.com/articles/code-first-vs-database-first-approach
[2] Code First vs Database First in Entity Framework: Real-World Example https://www.linkedin.com/posts/utkranti-patil_code-first-vs-database-first-in-entity-activity-7373612164114386944-EZDg
[3] Code First to an Existing Database - EF6 - Microsoft Learn https://learn.microsoft.com/en-us/ef/ef6/modeling/code-first/workflows/existing-database
[4] Entity Framework Code First v/s Database First Approach - C# Corner https://www.c-sharpcorner.com/blogs/entity-framework-code-first-vs-database-first-approach
[5] Code-first vs Model/Database-first - entity framework - Stack Overflow https://stackoverflow.com/questions/5446316/code-first-vs-model-database-first
[6] Code First vs. Database First in Entity Framework Core - YouTube https://www.youtube.com/watch?v=M2ab1UjLJOs
[7] What approach do you use for creating database? Code first or DB ... https://www.reddit.com/r/dotnet/comments/1oevheq/what_approach_do_you_use_for_creating_database/
[8] Code First vs. DB First in Entity Framework — A Beginner's Story https://blog.stackademic.com/code-first-vs-db-first-in-entity-framework-a-beginners-story-70a5cc09cb82
