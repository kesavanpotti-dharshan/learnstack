Data Annotations in EF Core are **attributes placed on entity classes and properties** to provide mapping metadata and some validation metadata. They let you override EF Core’s default conventions without writing Fluent API configuration.[1][2][3][4]

```csharp
public sealed class Product
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(120)]
    public string Name { get; set; } = null!;

    [Precision(18, 2)]
    public decimal Price { get; set; }

    [NotMapped]
    public decimal PriceWithTax => Price * 1.0825m;
}
```

In this example, the attributes tell EF Core how `Product` maps to a relational database schema.

## How EF Core uses annotations

EF Core builds its model from three configuration sources:

1. **Conventions** — EF Core infers mapping from C# types and names.
2. **Data Annotations** — attributes override conventions.
3. **Fluent API** — calls in `OnModelCreating` override both conventions and annotations.[1][3][5]

So if you write both:

```csharp
[MaxLength(120)]
public string Name { get; set; } = null!;
```

and:

```csharp
builder.Property(x => x.Name).HasMaxLength(200);
```

the Fluent API setting of 200 takes precedence.

## Common annotations

### Primary keys

EF Core conventionally treats `Id` or `<EntityName>Id` as the primary key. Use `[Key]` when the key name does not follow that convention.[3][4][6]

```csharp
public sealed class Customer
{
    [Key]
    public Guid CustomerCode { get; set; }
}
```

For composite keys, prefer Fluent API:

```csharp
builder.HasKey(x => new { x.OrderId, x.ProductId });
```

Data annotations are not a practical choice for most complex keys and mappings.

### Required and length constraints

```csharp
public sealed class User
{
    [Required]
    [MaxLength(100)]
    public string DisplayName { get; set; } = null!;

    [StringLength(320)]
    public string Email { get; set; } = null!;
}
```

- `[Required]` indicates a non-null value; for a foreign-key property, it makes the relationship required.
- `[MaxLength]` gives EF Core maximum-length metadata for strings or byte arrays.
- `[StringLength]` specifies maximum length and is also commonly used by validation frameworks.[1][2][3][4]

Important: these are **not a full security or API-validation strategy**. For example, `[Required]` and `[StringLength]` may participate in ASP.NET Core model validation, while EF Core uses them for model/schema configuration; validate incoming requests explicitly with DTO validation as appropriate. Because annotations are shared across frameworks, their semantics can differ by consumer.[1]

### Table and column mappings

Use `System.ComponentModel.DataAnnotations.Schema` attributes to map names and schemas that differ from EF conventions:

```csharp
[Table("sales_orders", Schema = "sales")]
public sealed class Order
{
    [Key]
    [Column("order_id")]
    public Guid Id { get; set; }

    [Column("total_amount", TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }
}
```

- `[Table]` maps an entity to a table and optional schema.
- `[Column]` changes a column name and can specify a database column type.[2][3][4]

Usually prefer Fluent API’s `HasPrecision(18, 2)` over provider-specific `TypeName = "decimal(18,2)"` when you simply need decimal precision.

### Excluding properties or types

```csharp
public sealed class Order
{
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }

    [NotMapped]
    public decimal Total => Subtotal + Tax;
}
```

`[NotMapped]` tells EF Core not to create a mapped column for a property or map a type as an entity. It is useful for computed convenience properties, transient values, and domain-only members.[2][3][4][6]

### Database-generated values

```csharp
public sealed class Invoice
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTimeOffset LastUpdatedAt { get; set; }
}
```

`[DatabaseGenerated]` tells EF Core whether a value is database-generated—for example, an identity value or a computed value.[3][4]

Be careful: this attribute declares EF Core’s expectation; it does not magically create a SQL expression for a computed column. For database-specific defaults or computed SQL, Fluent API plus a migration is often clearer.

### Relationships

Relationship annotations can clarify ambiguous mappings:

```csharp
public sealed class Order
{
    public int Id { get; set; }

    public int BillingAddressId { get; set; }
    public int ShippingAddressId { get; set; }

    [ForeignKey(nameof(BillingAddressId))]
    public Address BillingAddress { get; set; } = null!;

    [ForeignKey(nameof(ShippingAddressId))]
    public Address ShippingAddress { get; set; } = null!;
}
```

- `[ForeignKey]` explicitly pairs a foreign-key property with a navigation property.
- `[InverseProperty]` identifies the inverse navigation when two relationships exist between the same entity types.
- `[Required]` on a foreign-key property makes that relationship required.[1][3][4]

For relationships with custom delete behavior, composite foreign keys, many-to-many configuration, or other non-trivial rules, Fluent API is usually clearer and more capable.

### Optimistic concurrency

```csharp
public sealed class Document
{
    public int Id { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
}
```

`[Timestamp]` marks a property as a row-version/concurrency token. EF Core uses the original value in update/delete checks so it can detect if another writer changed the row first. `[ConcurrencyCheck]` can mark other properties as concurrency tokens.[3][4][6]

## Namespaces

Most common attributes come from:

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
```

EF Core also has EF-specific mapping attributes in the `Microsoft.EntityFrameworkCore.Abstractions` package; it is included by EF Core/provider packages or can be referenced separately.[1]

For example, `[Precision(18, 2)]` is an EF Core-specific annotation for precision and scale.[2]

## Data Annotations vs Fluent API

| Concern                     | Data Annotations                  | Fluent API                                 |
| --------------------------- | --------------------------------- | ------------------------------------------ |
| Location                    | On entity classes/properties      | Context or dedicated configuration classes |
| Best for                    | Simple, local mappings            | Complex or centralized mappings            |
| Domain persistence-agnostic | No; adds metadata to domain types | Yes; mapping stays outside entities        |
| Configuration capability    | Subset of EF Core features        | Full EF Core model configuration           |
| Precedence                  | Overrides conventions             | Overrides annotations and conventions      |

Annotations are concise and convenient for simple applications. Fluent API is usually preferred for advanced mappings or Clean/Hexagonal/DDD-style designs that avoid persistence attributes in domain entities.[1][3][5][7][8]

## Practical guidance

- Use conventions first when they already produce the intended model.
- Use annotations for simple metadata when coupling entities to EF/validation attributes is acceptable.
- Use Fluent API for complex relationships, delete behavior, indexes, composite keys, value objects, provider-specific features, and configuration you want separate from domain classes.
- Avoid contradictory configuration across conventions, attributes, and Fluent API; Fluent API will win, but mixed sources make the model harder to understand.[1][3][5]

## Interview answer

> Data Annotations in EF Core are attributes placed on entity types and properties to override EF conventions. Common examples are `[Key]`, `[Required]`, `[MaxLength]`, `[Table]`, `[Column]`, `[ForeignKey]`, `[NotMapped]`, and `[Timestamp]`. EF Core uses them when building its mapping model, and ASP.NET Core may also use some of them for validation. They are good for simple local rules, but they cover only part of EF Core’s configuration surface. Fluent API has higher precedence and is better for complex mappings or when I want to keep persistence details outside my domain entities.[1][2][3][5]

## Sources

[1] Mapping attributes (aka Data Annotations) for relationships https://learn.microsoft.com/en-us/ef/core/modeling/relationships/mapping-attributes
[2] Entity Properties - EF Core https://learn.microsoft.com/en-us/ef/core/modeling/entity-properties
[3] Data Annotation Attributes in EF 6 and EF Core https://www.entityframeworktutorial.net/code-first/dataannotation-in-code-first.aspx
[4] Data Annotations Attributes https://www.learnentityframeworkcore.com/configuration/data-annotation-attributes
[5] Creating and Configuring a Model - EF Core https://learn.microsoft.com/en-us/ef/core/modeling/
[6] Code First Data Annotations - EF6 https://learn.microsoft.com/en-us/ef/ef6/modeling/code-first/data-annotations
[7] Fluent API in Entity Framework Core https://www.entityframeworktutorial.net/efcore/fluent-api-in-entity-framework-core.aspx
[8] Data Annotation vs Fluent API : r/dotnet https://www.reddit.com/r/dotnet/comments/1ioe0dh/data_annotation_vs_fluent_api/
[9] Entity Framework Core Data Annotation Database ... https://stackoverflow.com/questions/42036291/entity-framework-core-data-annotation-database-generated-values
