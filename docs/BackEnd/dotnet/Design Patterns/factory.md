---
title: Factory Method Design Pattern
sidebar_label: Factory Method
sidebar_position: 1
---

---

### 1. Definition

The Factory Method is a **creational design pattern** that defines an **interface (or method) for creating objects** in a base class, but lets **subclasses decide which concrete classes to instantiate**. [refactoring](https://refactoring.guru/design-patterns/factory-method)

Instead of calling constructors directly (`new ConcreteProduct()`), client code calls a **factory method**, and subclasses override that method to return different concrete products. [refactoring](https://refactoring.guru/design-patterns/factory-method/csharp/example)

---

### 2. Core Idea

The core idea: **decouple “what object I need” from “how that object is created”**. [baeldung](https://www.baeldung.com/java-factory-pattern)

- The base class defines **what** needs to be created (product type).
- Subclasses define **which concrete implementation** to create.
- This supports:
  - The **Open/Closed Principle** (add new products by adding new subclasses).
  - **Single Responsibility** (creation logic separated from usage logic). [dofactory](https://www.dofactory.com/net/factory-method-design-pattern)

It’s especially useful when:

- The exact types are not known until runtime.
- You want to centralize and control object creation.
- You anticipate new product types in the future. [dev](https://dev.to/sebastiandevelops/factory-design-pattern-in-c-4nh4)

---

### 3. How it Works

### Key Roles

- **Product**
  - Common interface or abstract base class for all objects the factory creates.
- **ConcreteProduct**
  - Specific implementations of the Product interface.
- **Creator**
  - Declares the **factory method** that returns a Product.
  - May provide a default implementation.
- **ConcreteCreator**
  - Overrides the factory method to return a specific ConcreteProduct. [en.wikipedia](https://en.wikipedia.org/wiki/Factory_method_pattern)

### Execution Flow

1. Client code works with a **Creator** (often via an abstract base or interface).
2. Client calls the **factory method** (e.g., `CreateProduct()`).
3. The ConcreteCreator’s override decides which **ConcreteProduct** to instantiate.
4. Client receives a **Product** reference and uses it via the Product interface.

### Lifecycle

- **Object creation**:
  - Happens inside the factory method, not directly in client code.
- **Usage**:
  - Client code only depends on the Product interface, not concrete classes.
- **Extension**:
  - To add a new product:
    - Add a new ConcreteProduct.
    - Add a new ConcreteCreator (or override the factory method) to return it.

### Simple Pseudocode

```text
interface Product {
    void Use();
}

class ConcreteProductA : Product {
    void Use() { /* ... */ }
}

class ConcreteProductB : Product {
    void Use() { /* ... */ }
}

abstract class Creator {
    // Factory Method
    protected abstract Product CreateProduct();

    void SomeOperation() {
        Product p = CreateProduct();
        p.Use();
    }
}

class ConcreteCreatorA : Creator {
    override Product CreateProduct() {
        return new ConcreteProductA();
    }
}

class ConcreteCreatorB : Creator {
    override Product CreateProduct() {
        return new ConcreteProductB();
    }
}
```

Client code:

```text
Creator creator = new ConcreteCreatorA();  // or B
creator.SomeOperation();
```

---

### 4. Internal Architecture

### What Happens Behind the Scenes

- **Creation logic is centralized**:
  - All `new` calls for Products happen inside factory methods.
  - This isolates construction details from business logic.

- **Inheritance-based variation**:
  - Factory Method uses **subclassing** to vary the product type.
  - The base Creator defines the algorithm; subclasses plug in different products. [en.wikipedia](https://en.wikipedia.org/wiki/Factory_method_pattern)

- **Dependency direction**:
  - Higher-level code depends on **Product** and **Creator** abstractions.
  - Concrete products and creators are low-level details.

- **Runtime behavior**:
  - Polymorphism determines which product gets created:
    - `new ConcreteCreatorA().SomeOperation()` → creates `ConcreteProductA`.
    - `new ConcreteCreatorB().SomeOperation()` → creates `ConcreteProductB`.

### Implementation Details

- Factory method can be:
  - **Abstract** (must be implemented by subclasses).
  - **Virtual with a default** (subclasses optionally override).
- The method may:
  - Accept parameters (e.g., type, config).
  - Use configuration, reflection, or DI to choose the product.

In .NET-style code, you’ll often see:

```text
protected abstract INotification CreateNotification();
```

with each subclass deciding which concrete `INotification` to return.

---

### 5. When to Use it

Use Factory Method when:

- You don’t know **ahead of time** the exact types and dependencies your code must work with. [refactoring](https://refactoring.guru/design-patterns/factory-method)
- You want to **encapsulate object creation** so it can vary independently from usage.
- You expect to add **new product types** without modifying existing client code (OCP). [dev](https://dev.to/sebastiandevelops/factory-design-pattern-in-c-4nh4)
- You have a **framework-style design**, where:
  - The base class defines an algorithm.
  - Subclasses customize parts of it, including object creation.

Typical scenarios:

- Different storage providers (file, database, cloud).
- Different UI controls (buttons, dialogs) per platform.
- Different notification channels (email, SMS, push) based on configuration.

---

### 6. When Not to Use it

Avoid Factory Method when:

- You only have **one concrete product** and no foreseeable variants.
- Object creation is trivial and unlikely to change.
- You’re adding it just to “follow patterns” without real variability.
- You need to create **families of related products** (that’s more Abstract Factory territory). [reddit](https://www.reddit.com/r/learnprogramming/comments/1o8v95p/difference_between_factory_method_and_abstract/)

Anti-pattern signal:

- Multiple layers of factories for a single, stable product type with no extension points.

---

### 7. Pros and Cons

**Pros**

- **Decouples creation from usage**:
  - Client code doesn’t depend on concrete classes. [baeldung](https://www.baeldung.com/java-factory-pattern)
- Supports **Open/Closed Principle**:
  - Add new products by adding new creators, not modifying existing code. [geeksforgeeks](https://www.geeksforgeeks.org/system-design/differences-between-abstract-factory-and-factory-design-patterns/)
- Centralizes construction logic:
  - Easier to change how objects are created (e.g., add logging, validation, DI).
- Improves **testability**:
  - Can override factory methods in test subclasses to return test doubles.

**Cons**

- Can lead to:
  - Many small classes (Creator + ConcreteCreator + Product + ConcreteProduct).
  - Perceived complexity for simple cases.
- Relies on **inheritance**, which can be less flexible than composition in some designs. [baeldung](https://www.baeldung.com/java-factory-pattern)
- If overused, you may end up with:
  - “Factory sprawl” with little real benefit.

---

### 8. Trade Offs

- **Inheritance vs Composition**
  - Factory Method uses inheritance to vary creation.
  - This can be less flexible than composition-based approaches (e.g., passing a factory object).

- **Simplicity vs Extensibility**
  - Direct `new` is simpler but couples code to concrete types.
  - Factory Method adds indirection to gain extensibility.

- **Centralization vs Distribution**
  - Centralized creation is easier to manage.
  - But if creation logic is scattered across many creators, it can become harder to track.

Architect-level insight:  
Factory Method is most valuable when **creation rules are likely to evolve** or when you’re building **frameworks or libraries** where others will extend your base classes.

---

### 9. Real World Example (Minimum One)

**Example: Notification System**

Scenario:

- An application needs to send notifications.
- Different deployments use different channels:
  - Email
  - SMS
  - Push

Without Factory Method:

```text
class NotificationService {
    void Send(string message) {
        if (config.Channel == "Email")
            new EmailNotification().Send(message);
        else if (config.Channel == "SMS")
            new SmsNotification().Send(message);
        // ...
    }
}
```

Problems:

- Tight coupling to concrete notification classes.
- Every new channel requires modifying `NotificationService`.

With Factory Method:

```text
interface INotification {
    void Send(string message);
}

class EmailNotification : INotification { /* ... */ }
class SmsNotification : INotification { /* ... */ }

abstract class NotificationService {
    protected abstract INotification CreateNotification();

    void SendNotification(string message) {
        INotification n = CreateNotification();
        n.Send(message);
    }
}

class EmailNotificationService : NotificationService {
    override INotification CreateNotification() {
        return new EmailNotification();
    }
}

class SmsNotificationService : NotificationService {
    override INotification CreateNotification() {
        return new SmsNotification();
    }
}
```

Client code:

```text
NotificationService service = new EmailNotificationService();
service.SendNotification("Order placed");
```

To add a new channel:

- Implement `PushNotification`.
- Create `PushNotificationService` overriding `CreateNotification()`.
- No changes to existing code.

---

### 10. Architect’s Perspective

If I’m designing a large-scale system:

**Why I’d choose Factory Method**

- When I’m building:
  - Frameworks
  - Libraries
  - Extensible components
    where I want to **define an algorithm** but let others customize **which concrete types** are used.
- When I need:
  - Centralized creation logic
  - Easy extension with new product types
  - Clear separation between **how** something is created and **how** it’s used.

**When I’d avoid it**

- For simple, stable components with a single implementation.
- When dependency injection already gives me the flexibility I need (e.g., injecting `INotification` directly rather than subclassing a creator).
- When the pattern would just add extra classes without real variability.

**Important architectural considerations**

- Factory Method is often complementary to:
  - **Dependency Injection**: DI containers can act as generalized factories.
  - **Strategy pattern**: Different behaviors can be injected or created via factory methods.
- In modern .NET / cloud systems:
  - I often use DI for wiring, but still apply the **concept** of Factory Method when:
    - Creating domain objects with complex rules.
    - Encapsulating provider-specific logic behind a common interface.

**Cloud angle (optional)**  
In cloud-native apps, you might have:

- `IStorageProvider` with implementations:
  - `BlobStorageProvider`
  - `S3StorageProvider`
  - `LocalDiskProvider`

A factory method (or DI-configured provider) decides which implementation to use based on configuration or environment, allowing the same core logic to run in Azure, AWS, or on-prem.

---

### 11. Interview Answer (2-Minute Version)

The Factory Method is a creational design pattern that defines an interface for creating objects but lets subclasses decide which concrete classes to instantiate. Instead of calling constructors directly, client code calls a factory method, and subclasses override that method to return different implementations of a common product interface.

I use it when I want to decouple object creation from usage, especially when I expect new product types in the future or when I’m designing a framework where others will extend my base classes. For example, in a notification system, I might define a `NotificationService` with a `CreateNotification()` factory method, and then have `EmailNotificationService` and `SmsNotificationService` subclasses that return different notification implementations.

The main benefits are that it supports the Open/Closed Principle—adding new products doesn’t require changing existing code—and it centralizes creation logic, which makes it easier to manage and test. I avoid it when there’s only one product type and no real need for variation, since it can add unnecessary complexity.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Clear distinction between:
  - **Factory Method** (one creation method, varied via subclassing).
  - **Abstract Factory** (family of related products, often via composition). [dzone](https://dzone.com/articles/factory-method-vs-abstract)
- Connection to **OCP** and **SRP**.
- Real examples where they’ve used it to:
  - Add new providers/channels.
  - Ispect creation logic from business logic.

**Common red flags**

- Confusing Factory Method with:
  - Simple “factory class” (static create method).
  - Abstract Factory.
- Claiming “always use factories” without considering simplicity.
- No sense of **when not to use it**.

**Likely follow-ups (and how to steer them)**

- “How is this different from a static factory class?”  
  → Emphasize:
  - Factory Method uses **inheritance** and is tied to a class hierarchy.
  - Static factory is just a helper; no polymorphic variation via subclasses.

- “How does this compare to Abstract Factory?”  
  → Highlight:
  - Factory Method: **one product type**, varied via subclassing.
  - Abstract Factory: **families of related products**, often via a separate factory object. [reddit](https://www.reddit.com/r/learnprogramming/comments/1bikubq/difference_between_factory_method_and_abstract/)

- “Do you still use this with DI containers?”  
  → Explain:
  - DI often replaces explicit factories for wiring.
  - But the conceptual idea—encapsulating creation and varying it—still applies, especially for domain objects or provider-specific logic.

---
