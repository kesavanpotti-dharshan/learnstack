---
title: SOLID Principlese
sidebar_label: SOLID Principlese
---

SOLID is a set of five object-oriented design principles that help make software easier to understand, test, extend, and maintain. They are guidelines—not rigid rules—and should be applied when they reduce coupling and complexity rather than adding unnecessary abstractions.[1][2][3]

## The five principles

| Letter | Principle             | Core idea                                                          |
| ------ | --------------------- | ------------------------------------------------------------------ |
| S      | Single Responsibility | A class/module should have one reason to change                    |
| O      | Open/Closed           | Extend behavior without repeatedly changing stable code            |
| L      | Liskov Substitution   | A subtype must be safely usable wherever its base type is expected |
| I      | Interface Segregation | Clients should not depend on methods they do not need              |
| D      | Dependency Inversion  | Depend on abstractions, not concrete details                       |

[1][2][4]

## S: Single Responsibility Principle

**SRP:** A class should have one responsibility, or more precisely, **one reason to change**.[1][2][5]

Bad example: an `InvoiceService` calculates totals, saves invoices, generates PDFs, and emails customers. It has several unrelated reasons to change: pricing rules, database schema, PDF layout, and email behavior.

```csharp
public sealed class InvoiceService
{
    public decimal CalculateTotal(Invoice invoice) => /* ... */;
    public Task SaveAsync(Invoice invoice) => /* ... */;
    public byte[] GeneratePdf(Invoice invoice) => /* ... */;
    public Task EmailAsync(Invoice invoice) => /* ... */;
}
```

Better: separate concerns.

```csharp
public sealed class InvoiceCalculator { /* pricing rules */ }
public sealed class InvoiceRepository { /* persistence */ }
public sealed class InvoicePdfGenerator { /* presentation */ }
public sealed class InvoiceEmailSender { /* notification */ }
```

SRP does **not** mean every class must have only one method. It means methods in a class should belong together because they change for the same business or technical reason.

## O: Open/Closed Principle

**OCP:** Software should be **open for extension but closed for modification**—you should be able to add a new behavior without constantly editing stable existing logic.[1][2][3]

Bad example: every new discount requires adding another `if` branch.

```csharp
decimal CalculateDiscount(string customerType, decimal total) =>
    customerType switch
    {
        "Regular" => total * 0.05m,
        "Premium" => total * 0.15m,
        _ => 0m
    };
```

Better: extend with a new policy implementation.

```csharp
public interface IDiscountPolicy
{
    bool AppliesTo(Customer customer);
    decimal Calculate(Customer customer, decimal total);
}

public sealed class PremiumDiscountPolicy : IDiscountPolicy
{
    public bool AppliesTo(Customer customer) => customer.IsPremium;

    public decimal Calculate(Customer customer, decimal total) => total * 0.15m;
}
```

The application can add a `StudentDiscountPolicy` without editing the calculation coordinator. Do not create interfaces for every class “just in case”; use OCP where variation is real and expected.

## L: Liskov Substitution Principle

**LSP:** Code that works with a base type must continue to work correctly when given any valid subtype. A derived type must honor the behavioral contract of its base type.[1][2][4]

Classic violation:

```csharp
public class Bird
{
    public virtual void Fly() { }
}

public sealed class Penguin : Bird
{
    public override void Fly()
        => throw new NotSupportedException();
}
```

A caller expecting any `Bird` may call `Fly()`, but `Penguin` breaks that expectation.

Better model the actual capability:

```csharp
public abstract class Bird { }

public interface IFlyingBird
{
    void Fly();
}

public sealed class Sparrow : Bird, IFlyingBird
{
    public void Fly() { /* ... */ }
}

public sealed class Penguin : Bird { }
```

LSP is about more than avoiding exceptions. A subtype should not:

- Strengthen required input conditions.
- Weaken promised output/behavior.
- Break invariants expected by callers.
- Change error or state behavior in surprising ways.

## I: Interface Segregation Principle

**ISP:** Clients should not be forced to depend on methods they do not use. Prefer small, focused interfaces over large “god interfaces.”[1][2][3]

Bad example:

```csharp
public interface IWorker
{
    Task WorkAsync();
    Task EatLunchAsync();
}

public sealed class RobotWorker : IWorker
{
    public Task WorkAsync() => Task.CompletedTask;

    public Task EatLunchAsync()
        => throw new NotSupportedException();
}
```

Better:

```csharp
public interface IWork
{
    Task WorkAsync();
}

public interface ILunchBreak
{
    Task EatLunchAsync();
}

public sealed class RobotWorker : IWork
{
    public Task WorkAsync() => Task.CompletedTask;
}
```

Focused interfaces improve testability too. A service that only needs to send email should depend on `IEmailSender`, not a huge `INotificationPlatform` containing SMS, push, templates, reporting, and user-preference methods.

## D: Dependency Inversion Principle

**DIP:** High-level business policies should not depend directly on low-level implementation details. Both should depend on abstractions; details implement those abstractions.[1][2][4]

Bad example:

```csharp
public sealed class OrderService
{
    private readonly SqlOrderRepository _repository = new();

    public Task PlaceOrderAsync(Order order)
        => _repository.SaveAsync(order);
}
```

`OrderService` is coupled to SQL Server persistence.

Better:

```csharp
public interface IOrderRepository
{
    Task SaveAsync(Order order, CancellationToken ct);
}

public sealed class OrderService(IOrderRepository repository)
{
    public Task PlaceOrderAsync(Order order, CancellationToken ct)
        => repository.SaveAsync(order, ct);
}

public sealed class SqlOrderRepository : IOrderRepository
{
    public Task SaveAsync(Order order, CancellationToken ct)
    {
        // EF Core / SQL-specific implementation
        return Task.CompletedTask;
    }
}
```

Now the application layer depends on an abstraction it needs, while infrastructure supplies the SQL/EF Core implementation. This supports test doubles and aligns with Clean, Hexagonal, and Onion architectures.

**Dependency injection** is a common way to provide dependencies, but it is not the same as DIP. DI is a wiring technique; DIP is the architectural principle about dependency direction.

## How they fit together

Imagine an e-commerce checkout flow:

- **SRP:** pricing, persistence, payment, and notification each have separate responsibilities.
- **OCP:** add a payment provider via a new implementation rather than changing checkout logic.
- **LSP:** every payment-provider implementation honors the same success/failure contract.
- **ISP:** checkout depends on a small `IPaymentGateway`, not a large external-SDK-shaped interface.
- **DIP:** checkout depends on `IPaymentGateway`; Stripe/PayPal adapters implement it.

```csharp
public interface IPaymentGateway
{
    Task<PaymentResult> ChargeAsync(
        PaymentRequest request,
        CancellationToken ct);
}

public sealed class CheckoutService(
    IPaymentGateway payments,
    IOrderRepository orders)
{
    public async Task CheckoutAsync(Order order, CancellationToken ct)
    {
        var result = await payments.ChargeAsync(
            PaymentRequest.From(order), ct);

        if (!result.Succeeded)
            throw new PaymentFailedException();

        await orders.SaveAsync(order, ct);
    }
}
```

## Common mistakes

- **Over-abstraction:** creating an interface and factory for every class makes simple code harder to follow.
- **Treating SOLID as a checklist:** the principles can conflict; optimize for understandable code and real change patterns.
- **Using inheritance where composition fits better:** many LSP problems disappear by composing behavior through policies/services.
- **Confusing DI with DIP:** injecting a concrete `SqlOrderRepository` uses DI but does not achieve dependency inversion.
- **Ignoring the domain:** boundaries should follow business responsibilities and expected change, not arbitrary technical categories.

## Interview answer

> SOLID is a set of five object-oriented design principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. SRP keeps a class focused on one reason to change. OCP lets us add behavior through extension rather than constantly modifying stable code. LSP ensures subtypes preserve the contract of their base type. ISP favors small client-specific interfaces. DIP ensures high-level business logic depends on abstractions rather than infrastructure details. I use SOLID to reduce coupling and make expected changes safer, but I avoid adding abstractions without a concrete need.[1][2][3]

## Sources

[1] SOLID Design Principles Explained: Building Better Software ... https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design
[2] SOLID - Wikipedia https://en.wikipedia.org/wiki/SOLID
[3] SOLID Design Principles: Hands-On Examples - Splunk https://www.splunk.com/en_us/blog/learn/solid-design-principle.html
[4] Applying SOLID Principles in C++ | CodeSignal Learn https://codesignal.com/learn/courses/applying-clean-code-principles-in-cpp/lessons/applying-solid-principles-in-cpp
[5] SOLID Design Principles: The Single Responsibility Explained https://stackify.com/solid-design-principles/
[6] SOLID Design Principles: Improve Object-Oriented Code in Python https://realpython.com/solid-principles-python/
[7] A comprehensive guide to understanding the SOLID principles https://engineering.deptagency.com/guide-solid-principles
[8] S.O.L.I.D design principles for everyone : r/learnprogramming - Reddit https://www.reddit.com/r/learnprogramming/comments/cr3m01/solid_design_principles_for_everyone/
[9] SOLID Principles Explained in 5 Minutes | Clean Code ... - YouTube https://www.youtube.com/watch?v=WBPxN2C_PNg
