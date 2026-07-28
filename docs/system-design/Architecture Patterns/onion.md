---
title: Onion Software Architecture
sidebar_label: Onion
sidebar_position: 1
---

Onion architecture is a **domain-centered** software architecture that organizes code into concentric layers, with the business domain at the center and technical details pushed to the outside.[1][2][3][4][5]

---

## Core Idea

The main idea is that **all dependencies point inward** toward the domain model.[2][3][4][6]

- Inner layers know nothing about databases, web frameworks, or UI.
- Outer layers depend on inner layers, not the other way around.
- The domain stays stable even if infrastructure changes.[3][4][5][6][1][2]

This makes onion architecture especially useful for long-lived business systems.[4][2][3]

---

## Layer Structure

A common onion architecture layout looks like this:[7][1][2][3][4]

### 1. Domain Model

- The center of the onion.
- Contains entities and core business rules.
- Has the least dependency on anything else.[2][3][4]

### 2. Application / Service Layer

- Orchestrates use cases.
- Coordinates domain objects and business workflows.
- Defines interfaces when needed, especially for persistence and external services.[5][8][4][2]

### 3. Infrastructure Layer

- Implements database access, external API calls, messaging, file storage, and similar details.[8][1][3][4][5][2]
- This layer is replaceable.
- It plugs into the inner layers through interfaces.[4][8][2]

### 4. Presentation Layer

- UI, web API, CLI, tests, or other entry points.[1][3][7][8]
- Talks to the application layer, not directly to infrastructure.[5][2][4]

---

## Dependency Inversion

Onion architecture relies heavily on the **Dependency Inversion Principle**.[6][9][3][2][4]

That means:

- High-level business code depends on abstractions.
- Low-level technical code implements those abstractions.
- Repository interfaces may live near the domain or application core, while their implementations live in infrastructure.[6][8][2][4]

This is the key mechanism that keeps the core independent.[3][1][2][4]

---

## How It Works

### Typical Flow

1. A request enters through the UI or API layer.[7][2][3][4]
2. The presentation layer calls an application service.[2][4][5]
3. The application service executes business logic using domain entities.[3][4][2]
4. If persistence or external interaction is needed, the application calls an interface.[8][4][6][2]
5. Infrastructure implements that interface and performs the concrete operation.[1][4][5][8][2]

The result is a system where business rules remain isolated from technology choices.[4][5][1][2][3]

---

## Why It’s Useful

Onion architecture helps you build software that is:[9][5][1][2][3][4]

- **Testable**
  - You can unit test core logic without a database or web server.
- **Maintainable**
  - Changes in UI or storage affect fewer parts of the system.
- **Portable**
  - You can replace SQL with MongoDB, or a REST API with another transport, without rewriting the domain.[1][2][4]
- **Decoupled**
  - The business core is not tangled with frameworks or frameworks-specific APIs.
- **Long-lived**
  - Better suited to complex systems with evolving business rules.[2][3][4]

---

## Example: Order Processing

Imagine an order system.[5][4][1][2]

- **Domain**
  - `Order`, `OrderItem`, `Money`, business rules like “an order must have at least one item.”
- **Application**
  - `PlaceOrderService` coordinates validation, payment, and persistence.
- **Infrastructure**
  - `SqlOrderRepository` saves orders.
  - `StripePaymentGateway` charges the card.
- **Presentation**
  - REST controller accepts HTTP requests.[4][5][1][2]

If you later swap Stripe for another provider, only the infrastructure adapter changes. The core order logic stays the same.

---

## Relation to Clean and Hexagonal

Onion architecture is closely related to **clean architecture** and **hexagonal architecture**.[10][11][12][5]

They all share the same core idea:

- Keep the domain at the center.
- Depend on abstractions.
- Push technical details outward.[11][6][5][2][4]

The main difference is mostly terminology and emphasis:

- Onion focuses on concentric layers around the domain.
- Hexagonal emphasizes ports and adapters.
- Clean architecture emphasizes dependency rule and use cases.[12][10][11][5]

---

## Trade-Offs

- **More structure**
  - You need interfaces and clear boundaries.
- **Better separation**
  - Core logic is easier to protect from change.
- **More upfront design**
  - Can feel heavy for small CRUD apps.
- **Worth it for complexity**
  - Very valuable when domain rules are important and likely to change.[3][5][1][2][4]

---

## Interview Answer

Onion architecture is a software architecture pattern that arranges an application in concentric layers around a central domain model. The domain sits at the core, while application services, infrastructure, and presentation layers surround it. All dependencies point inward, so the domain never depends on databases, UI frameworks, or external services. Outer layers implement interfaces defined by inner layers, which is a form of dependency inversion. This makes the system easier to test, maintain, and evolve over time.[6][5][1][2][3][4]

Would you like the next topic to be **onion vs clean architecture** or **onion vs hexagonal architecture**?

## Sources

[1] What makes Onion Architecture so popular among techies? https://anarsolutions.com/onion-architecture/
[2] The Onion Architecture : part 1 | Programming with Palermo https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
[3] Do you know the layers of the onion architecture? https://www.ssw.com.au/rules/do-you-know-the-layers-of-the-onion-architecture
[4] Onion Architecture: Going Beyond Layers https://blog.ndepend.com/onion-architecture-layers/
[5] Onion Architecture: Benefits of Layered and Modular Software ... https://bitloops.com/docs/bitloops-language/learning/software-architecture/onion-architecture
[6] Exploring DIP's Relationship with Onion Architecture, Hexagonal ... https://andrelucas.io/exploring-dips-relationship-with-onion-architecture-hexagonal-architecture-and-ports-adapters-ef5b3c8fae86
[7] 🧅 Onion Architecture Explained Quickly https://dev.to/narender_reddy_0fa71a7ec8/onion-architecture-explained-quickly-4ccj
[8] How to structure a Domain Driven Design in an Onion Architecture? https://softwareengineering.stackexchange.com/questions/352083/how-to-structure-a-domain-driven-design-in-an-onion-architecture
[9] Onion Architecture in Software Development https://codefinity.com/blog/Onion-Architecture-in-Software-Development
[10] Layered Architecture != Hexagonale, Onion and Clean Architecture https://www.reddit.com/r/softwarearchitecture/comments/1paq2d7/layered_architecture_hexagonale_onion_and_clean/
[11] Dependency Inversion + DDD = domain-centric design | Milan Jovanović https://www.linkedin.com/posts/milan-jovanovic_dependency-inversion-ddd-domain-centric-activity-7406959262112866304-SquI
[12] Domain centric? Why Hexagonal, Onion and Clean architecture are ... https://www.youtube.com/watch?v=co3acmgP2Ng
[13] Why Should I Use Onion Architecture If I Already Apply Dependency ... https://www.reddit.com/r/csharp/comments/1ok1y1o/why_should_i_use_onion_architecture_if_i_already/
[14] Onion architecture: Dependency Inversion Principle within the ... https://softwareengineering.stackexchange.com/questions/432210/onion-architecture-dependency-inversion-principle-within-the-service-layer
[15] Unpeeling the Layers: Mastering Onion Architecture for Robust ... https://www.linkedin.com/pulse/unpeeling-layers-mastering-onion-architecture-robust-software-goyal-jgs8c
