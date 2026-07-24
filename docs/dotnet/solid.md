---
title: Solid Principles
sidebar_label: SOLID Principles
sidebar_position: 2
---

---

### 1. Definition

SOLID is a mnemonic for five object-oriented design principles introduced by Robert C. Martin (Uncle Bob) that guide class and interface design to produce **maintainable, extensible, and testable** software. [en.wikipedia](https://en.wikipedia.org/wiki/SOLID)

- **S** – Single Responsibility Principle (SRP)
- **O** – Open/Closed Principle (OCP)
- **L** – Liskov Substitution Principle (LSP)
- **I** – Interface Segregation Principle (ISP)
- **D** – Dependency Inversion Principle (DIP)

These are not rigid rules but **design heuristics** to reduce coupling, increase cohesion, and make systems easier to evolve. [reddit](https://www.reddit.com/r/softwarearchitecture/comments/qsaahi/why_solid_principles_are_still_the_foundation_for/)

---

### 2. Core Idea

The core idea behind SOLID is: **design your code so that changes in one place don’t break everything else**. [reddit](https://www.reddit.com/r/softwarearchitecture/comments/qsaahi/why_solid_principles_are_still_the_foundation_for/)

- SRP: Each class/component has **one job**.
- OCP: You can **add new behavior** without changing existing code.
- LSP: Subtypes must be **true substitutes** for their base types.
- ISP: Interfaces should be **small and client-specific**, not monolithic.
- DIP: Depend on **abstractions**, not concrete implementations. [splunk](https://www.splunk.com/en_us/blog/learn/solid-design-principle.html)

Collectively, they push you toward **loose coupling and high cohesion**, which are foundational for scalable architectures.

---

### 3. How it Works

Think of SOLID as a set of constraints on **how responsibilities, dependencies, and abstractions are organized**.

#### SRP – Single Responsibility Principle

- A class should have **one reason to change**.
- Internally:
  - Responsibilities are grouped by **domain concept** or **stakeholder**.
  - When requirements change, only the relevant class changes.
- Example mental model:
  ```text
  OrderProcessor
    - Validates order
    - Calculates total
    - Saves to DB   ← this is a second responsibility → violation
  ```
  Better:
  ```text
  OrderValidator
  OrderPricingService
  OrderRepository
  ```

#### OCP – Open/Closed Principle

- Classes should be **open for extension, closed for modification**.
- Workflow:
  - Define stable **abstractions** (interfaces, base classes).
  - Implement concrete behaviors in **separate classes**.
  - To add new behavior, you **add new classes**, not modify old ones.
- Typical pattern:

  ```text
  IPaymentProcessor
    - ProcessPayment(Order)

  CreditCardPaymentProcessor : IPaymentProcessor
  PayPalPaymentProcessor : IPaymentProcessor
  ```

  Adding a new provider doesn’t touch existing logic.

#### LSP – Liskov Substitution Principle

- Subtypes must be usable wherever the base type is expected **without altering correctness**.
- Execution implications:
  - Client code relies on **base type contracts**.
  - Derived types must honor:
    - Pre-conditions (not stronger)
    - Post-conditions (not weaker)
    - Invariants (must hold)
- Violation example:
  - `Square : Rectangle` where setting width/height behaves differently → breaks assumptions in code using `Rectangle`.

#### ISP – Interface Segregation Principle

- Clients should not depend on methods they don’t use.
- Mechanically:
  - Start with a **fat interface** (e.g., `IWorker`).
  - Split into **role-specific interfaces**:

    ```text
    IWorker
      - Work()
      - Eat()

    → split into
    IWorkable
      - Work()

    IFeedable
      - Eat()
    ```

  - Classes implement only the interfaces they need.

#### DIP – Dependency Inversion Principle

- High-level modules shouldn’t depend on low-level modules; both depend on abstractions.
- Flow:
  - High-level logic (e.g., `OrderService`) depends on `IOrderRepository`.
  - Low-level implementation (`SqlOrderRepository`) implements `IOrderRepository`.
  - Wiring happens via **DI container** or constructor injection.
- Runtime behavior:
  - Application composes concrete implementations at startup.
  - Business logic never sees concrete types directly.

---

### 4. Internal Architecture

Behind the scenes, SOLID principles shape **module boundaries, dependency graphs, and testing surfaces**.

- **SRP**:
  - Encourages **fine-grained classes/services**.
  - Results in more files, but **smaller change impact**.
  - Improves **testability**: each class has a narrow focus.

- **OCP**:
  - Relies heavily on **polymorphism** and **strategy-like patterns**.
  - Internally, you often see:
    - A stable “core” that uses abstractions.
    - A set of interchangeable implementations.
  - At runtime, new behaviors are added by **registering new implementations**, not editing core logic.

- **LSP**:
  - Enforced via **type system + tests**.
  - In statically typed languages (C#, Java), compiler checks type compatibility, but **semantic LSP** is your responsibility.
  - Violations often manifest as:
    - Runtime exceptions
    - Broken invariants
    - Special-case `if (x is Square)` checks in code expecting `Rectangle`.

- **ISP**:
  - Leads to **many small interfaces** rather than one large one.
  - Internally, this reduces:
    - Unnecessary coupling
    - “God interfaces” that force irrelevant implementations.
  - Improves discoverability: interfaces reflect **capabilities**, not just “everything this object can do”.

- **DIP**:
  - Architecturally, this is the backbone of **clean architecture** and **hexagonal architecture**.
  - Dependency graph points **inward toward domain**:
    - Domain → Abstractions
    - Infrastructure → Concrete implementations
  - In .NET, this is realized via:
    - Interfaces in domain/core
    - Implementations in infrastructure
    - DI container wiring in the host (e.g., `Program.cs`).

**Cloud angle (optional but relevant):**  
In cloud-native systems (e.g., Azure microservices), SOLID maps naturally:

- SRP → microservice boundaries, single business capability.
- OCP → plugin-based extensions (e.g., new payment providers, new notification channels) without changing core services.
- LSP → interchangeable implementations (e.g., different storage providers) behind the same interface.
- ISP → fine-grained APIs (gRPC/REST) per capability instead of one giant service contract.
- DIP → services depend on abstract contracts (e.g., `IMessageBus`, `IStorage`) rather than concrete Azure SDK calls scattered everywhere.

---

### 5. When to Use it

Use SOLID when:

- You are building **long-lived, evolving systems** (most enterprise apps).
- Multiple teams or stakeholders will modify the code over time.
- You anticipate:
  - New features
  - New integrations
  - Changing business rules
- You care about **testability** and **maintainability**.
- You’re designing:
  - Domain models
  - Service layers
  - Plugin architectures
  - Libraries/SDKs

As a rule of thumb: **If the code will outlive its first version, SOLID is worth it.** [stackoverflow](https://stackoverflow.blog/2021/11/01/why-solid-principles-are-still-the-foundation-for-modern-software-architecture/)

---

### 6. When Not to Use it

SOLID is not always worth the overhead:

- **Tiny scripts, prototypes, or one-off tools** where speed > long-term maintainability.
- **Performance-critical hot paths** where extra abstraction layers add unacceptable overhead.
- Simple CRUD apps with **stable requirements and no expected evolution**.
- When you’re **over-engineering**:
  - 10 interfaces for 3 classes.
  - “SOLID for the sake of SOLID” without real variability.

Guideline: **Apply SOLID where variability and complexity justify it.** Don’t turn a 20-line utility into a mini-framework. [softwareengineering.stackexchange](https://softwareengineering.stackexchange.com/questions/447532/when-to-not-use-solid-principles)

---

### 7. Pros and Cons

**Pros**

- Makes code:
  - Easier to **understand** (clear responsibilities).
  - Easier to **change** (localized impact).
  - Easier to **test** (small, focused units). [baeldung](https://www.baeldung.com/solid-principles)
- Reduces **accidental coupling** and ripple effects.
- Supports **clean architecture** and **microservices** patterns.
- Encourages thinking in terms of **contracts and capabilities**, not just implementations.

**Cons**

- Can lead to:
  - More files and types → perceived complexity.
  - Over-abstraction if misapplied.
- Slight **runtime overhead** from indirection (usually negligible).
- Requires **discipline and experience** to apply well; beginners can overdo it.

---

### 8. Trade Offs

- **Simplicity vs Flexibility**
  - SOLID increases flexibility but can reduce initial simplicity.
  - Trade-off: Accept more structure now to avoid chaos later.

- **Abstraction vs Readability**
  - More layers = more indirection.
  - Good naming and clear boundaries mitigate this.

- **Granularity vs Overhead**
  - SRP + ISP → many small classes/interfaces.
  - Benefit: precise changes.
  - Cost: more types to navigate.

- **Design time vs Delivery time**
  - Applying SOLID well takes thought upfront.
  - Pays off in reduced bugs and faster changes over time.

Architect-level insight: **SOLID is about managing change cost, not writing “perfect” code today.**

---

### 9. Real World Example (Minimum One)

**Example: Payment Processing in an E-commerce System**

Without SOLID:

```text
OrderService
  - ValidateOrder()
  - CalculateTotal()
  - ChargeCreditCard()
  - ChargePayPal()
  - SendEmailConfirmation()
  - LogToDatabase()
```

Problems:

- Multiple reasons to change (SRP violation).
- Adding a new payment method requires modifying `OrderService` (OCP violation).
- Hard to test in isolation.
- Dependencies are concrete (no DIP).

With SOLID:

- SRP:
  - `OrderValidator`
  - `OrderPricingService`
  - `IPaymentProcessor`
  - `INotificationService`
  - `OrderRepository`

- OCP:
  - `IPaymentProcessor` with implementations:
    - `CreditCardPaymentProcessor`
    - `PayPalPaymentProcessor`
    - `ApplePayPaymentProcessor` (added later without touching core logic).

- LSP:
  - Any `IPaymentProcessor` can be used interchangeably in `OrderService`.

- ISP:
  - Separate interfaces:
    - `IPaymentProcessor`
    - `IRefundProcessor`
    - `INotificationService` (instead of one giant `IPaymentAndNotification`).

- DIP:
  - `OrderService` depends on `IPaymentProcessor`, not `CreditCardPaymentProcessor`.
  - Concrete implementations wired via DI container.

Result:

- Adding a new processor → new class + registration.
- Changing notifications → only `INotificationService` implementers change.
- Tests can mock `IPaymentProcessor`, `INotificationService`, etc.

---

### 10. Architect’s Perspective

If I’m designing a large-scale system:

**Why I’d choose SOLID**

- It directly supports:
  - **Evolvability**: new features, integrations, regulations.
  - **Team scaling**: multiple teams can work on different responsibilities with minimal conflict.
  - **Testability**: crucial for CI/CD and high-confidence deployments.

**When I’d avoid or soften it**

- In:
  - Performance-critical inner loops.
  - Very small, disposable components.
- When the added abstraction doesn’t map to **real variability** (e.g., “we might need 10 payment providers” but we’ll never have more than one).

**Key architectural considerations**

- Use SOLID to:
  - Define **module boundaries** (bounded contexts, services).
  - Drive **dependency direction** (domain at the center, infrastructure at the edges).
  - Create **stable contracts** that external systems and teams can rely on.

- Watch out for:
  - “SOLID theater”: lots of interfaces, no real variability.
  - Over-fragmentation that makes the system hard to navigate.
  - Ignoring **domain semantics** in favor of mechanical rule-following.

Interview-focused takeaway:  
Frame SOLID as **a toolkit for managing change and complexity**, not a checklist. Emphasize **trade-offs, real variability, and system lifespan**.

---

### 11. Interview Answer (2-Minute Version)

SOLID is a set of five object-oriented design principles—Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion—that guide how we structure classes and interfaces to make systems easier to change, test, and scale.

At a high level:

- SRP says each class should have one reason to change, so responsibilities are clearly separated.
- OCP means we design components so we can add new behavior by adding new classes, not by modifying existing ones.
- LSP ensures that subtypes can be used in place of their base types without breaking behavior.
- ISP pushes us to create small, client-specific interfaces instead of large, generic ones.
- DIP tells us to depend on abstractions, not concrete implementations, which decouples high-level logic from low-level details.

In practice, I use SOLID when designing domain models, service layers, and integration points, especially in systems that will evolve over time and be worked on by multiple teams. For example, in a payment system, I’d define an `IPaymentProcessor` interface and have separate implementations for credit cards, PayPal, etc., so adding a new provider doesn’t require changing the core order logic.

I don’t apply SOLID dogmatically—for tiny scripts or performance-critical paths, the extra abstraction may not be worth it. But for most enterprise systems, SOLID helps me manage complexity, reduce coupling, and make the codebase more testable and adaptable, which is exactly what you want in a long-lived architecture.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- They talk about **change over time**, not just “good design”.
- They give **concrete examples** from their own projects (e.g., “We had a god class handling X, Y, Z; we split it into…”).
- They mention **trade-offs** and when they _don’t_ apply SOLID.
- They connect SOLID to:
  - **Testability** (mocking, isolation)
  - **Architecture styles** (clean architecture, hexagonal, microservices)
  - **Team dynamics** (multiple owners, bounded contexts).

**Common red flags**

- Reciting definitions without any **real-world context**.
- Claiming “SOLID should always be followed” with no nuance.
- No mention of **trade-offs** or over-engineering risks.
- Unable to explain **how SOLID affects testing, deployment, or team workflow**.

**Likely follow-ups (and how to steer them)**

- “Can you give an example where you _didn’t_ follow SOLID?”  
  → Talk about a small utility, script, or performance-critical path where simplicity mattered more.

- “How does SOLID relate to microservices?”  
  → Map SRP to service boundaries, DIP to abstraction over infrastructure, OCP to plugin-style extensions.

- “Isn’t this just over-engineering?”  
  → Acknowledge risk; emphasize applying SOLID where there’s **real variability and long-term ownership**.

---
