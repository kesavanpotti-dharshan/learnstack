---
title: Clean Software Architecture
sidebar_label: Clean
sidebar_position: 1
---

Clean architecture is a way of structuring software so that **your business logic is independent of frameworks, databases, and UI**, organized into concentric layers where dependencies always point inward.[1][2][3][4][5]

---

## Core Goals

Clean architecture (popularized by Robert “Uncle Bob” Martin) aims for systems that are:[2][3][1]

- Independent of frameworks (you can swap web, ORM, UI tools).[3][1][2]
- Testable without UI, database, or external services.[4][1][3]
- Independent of UI and database (they become replaceable details).[1][2][3]
- Centered around business rules and use cases, not technology.[5][2][3][1]

---

## The Concentric Layers

Uncle Bob’s clean architecture is usually shown as circles: inner circles are **policies and business rules**, outer circles are **mechanisms and details**.[2][3][5][1]

Typical layers (from inside out):

1. **Entities (Domain Model)**
   - Core business objects and rules (e.g., `Order`, `Customer`, `Account`).[3][5][1][2]
   - Pure domain logic, reusable across applications.
   - No dependencies on frameworks, databases, or UI.

2. **Use Cases (Application Layer)**
   - Application-specific business logic: “place order”, “transfer funds”, “register user”.[4][5][1][2]
   - Coordinates entities to fulfill scenarios.
   - Defines interfaces (ports) it needs (e.g., `OrderRepository`, `PaymentGateway`), but not their implementations.[6][7][2][3]

3. **Interface Adapters**
   - Adapters between the inner world and outer world:
     - Web controllers, presenters, view models.
     - Repository implementations, mappers, DTOs.[5][1][3][4]
   - Implement the interfaces defined by use cases and entities, translating external formats (HTTP, DB rows) into internal models.[7][6][2][3]

4. **Frameworks & Drivers**
   - Outer shell: web framework, database, message bus, UI technology, OS.[1][2][3][5]
   - Contains infrastructure code that plugs into adapters.
   - Knows about inner layers, but inner layers **do not** know about these details.

---

## The Dependency Rule

The fundamental rule of clean architecture is the **Dependency Rule**:[2][3][1]

> Source code dependencies can only point **inward**.

That means:

- Inner layers (entities, use cases) must not depend on outer layers (frameworks, DB, UI).[3][1][2]
- Outer layers depend on inner layers:
  - Repositories implement interfaces defined in use cases.
  - Controllers call use case classes.
  - Infrastructure plugs into the core, not vice versa.[6][7][2][3]

This is just dependency inversion in architectural form: **inner layers declare interfaces; outer layers implement them**.[8][7][6][2]

---

## Why It’s Useful

Because dependencies point inward and business logic is isolated, you get:[4][1][2][3]

- Easier testing:
  - You can test use cases and entities without database or web server.
- Technology independence:
  - Swap database or web framework with minimal changes to core logic.[1][2][3]
- Better separation of concerns:
  - Business rules separated from technical details like HTTP, SQL, JSON.[3][4][1]
- Long-term maintainability:
  - When UI or frameworks become obsolete, you replace them without rewriting the core.[5][1][3]

---

## Example: E‑Commerce “Place Order”

Imagine an e‑commerce system. In clean architecture you might have:[2][4][5][3]

- **Entities**
  - `Order`, `Product`, `Customer`, with business invariants (e.g., stock checks).

- **Use Case**
  - `PlaceOrderUseCase`:
    - Validates cart.
    - Calculates totals.
    - Calls `PaymentService` and `OrderRepository` via interfaces.[6][2][3]

- **Interface Adapters**
  - `HttpOrderController` (maps HTTP request to use case input).
  - `OrderRepositoryImpl` (maps between DB rows and `Order` entity).
  - `PaymentServiceStripeAdapter` (calls Stripe API).[4][5][3]

- **Frameworks & Drivers**
  - Web framework routes to `HttpOrderController`.
  - ORM/DB driver used inside `OrderRepositoryImpl`.
  - Stripe SDK used inside `PaymentServiceStripeAdapter`.[1][2][3]

If you switch from Stripe to another provider, you update the adapter and outer layer; `PlaceOrderUseCase` and entities remain unchanged.

---

## How It Relates to Other Patterns

Clean architecture unifies ideas from **layered**, **hexagonal**, and **onion** architectures:[5][2][3][1]

- Like layered architecture, it has clear layers.
- Like hexagonal architecture (ports & adapters), interfaces (ports) are declared in inner layers, implemented by adapters in outer layers.[7][8][6][2]
- Like onion architecture, it emphasizes a domain core with inward‑pointing dependencies.[2][3][1]

---

## Interview‑Style Summary

Clean architecture is an architectural pattern that organizes code into concentric layers—entities, use cases, interface adapters, and frameworks—so that **business rules sit at the center and all dependencies point inward**. The core domain and use cases do not depend on frameworks, databases, or UI; instead, they define interfaces that outer layers implement. This makes systems more testable, maintainable, and technology‑independent over time.[3][4][5][1][2]

Are you more interested in how to **structure a codebase** in clean architecture (e.g., packages/modules), or in how it compares to **hexagonal/onion architecture**?

### Sources

[1] Clean Architecture - The Clean Code Blog - Uncle Bob https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
[2] Clean Architecture: The Dependency Rule and Concentric ... https://bitloops.com/resources/software-architecture/clean-architecture
[3] Building Software with a Clean Architecture https://softengbook.org/articles/clean-architecture
[4] Clean architecture layers – what they are and the benefits https://www.transparity.com/app-innovation/clean-architecture-layers-what-they-are-and-the-benefits/
[5] Clean Architecture: A Deep Dive into Structured Software ... https://www.spaceteams.de/en/insights/clean-architecture-a-deep-dive-into-structured-software-design
[6] The Interface Adapter Layer in Clean Architecture. https://www.reddit.com/r/softwarearchitecture/comments/15mfbkb/the_interface_adapter_layer_in_clean_architecture/
[7] How can Clean Architecture's interface adapters ... https://stackoverflow.com/questions/74035957/how-can-clean-architectures-interface-adapters-adapt-interfaces-if-they-cannot
[8] Is Clean Architecture basically Layered Architecture + interfaces? https://www.reddit.com/r/golang/comments/18dmkxg/is_clean_architecture_basically_layered/
[9] Is "Clean Architecture" by Bob Martin a rule of thumb for all ... https://softwareengineering.stackexchange.com/questions/371966/is-clean-architecture-by-bob-martin-a-rule-of-thumb-for-all-architectures-or-i
[10] I summarized the book, which is essential for every ... https://www.reddit.com/r/softwarearchitecture/comments/f25ukp/i_summarized_the_book_which_is_essential_for/
[11] Clean Architecture: A Craftsman's Guide to Software ... https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164
[12] Clean architecture book, how many of you have read it? https://www.reddit.com/r/dotnet/comments/1bzw4vw/clean_architecture_book_how_many_of_you_have_read/
[13] Clean Architecture – Robert (Uncle Bob) Martin https://www.youtube.com/watch?v=G08FxxwPjXE
[14] Should I create interfaces for each entity, or should I use ... https://softwareengineering.stackexchange.com/questions/455597/should-i-create-interfaces-for-each-entity-or-should-i-use-plain-classes
[15] Clean Coders - Professional Software Development Training https://cleancoders.com/
