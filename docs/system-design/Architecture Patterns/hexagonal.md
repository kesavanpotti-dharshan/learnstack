---
title: Hexagonal Software Architecture
sidebar_label: Hexagonal
sidebar_position: 1
---

Hexagonal architecture, also called **Ports and Adapters**, is a software architecture style that isolates the business core from the outside world so your domain logic does not depend on web frameworks, databases, or other infrastructure.[1][2][3][4][5]

---

## Core Idea

The core idea is to make the application **driven by use cases, not technology**.[2][3][4][5]

Your domain logic lives in the center, and external systems interact with it only through **ports** (interfaces) and **adapters** (implementations).[3][4][5][6][1][2]

That means you can swap a database, UI, or messaging system without rewriting the business core.[5][1][2][3]

---

## Ports and Adapters

### Ports

Ports are the **interfaces** that define how the application communicates with the outside world.[4][6][1][2][3][5]

There are two common kinds:

- **Driving / primary / incoming ports**
  - Define what the application can do.
  - Called by external actors like controllers, CLI commands, or tests.[6][1][2][4][5]

- **Driven / secondary / outgoing ports**
  - Define what the application needs from outside systems.
  - Implemented by adapters for databases, email, payment gateways, queues, etc.[1][2][4][5][6]

### Adapters

Adapters are the concrete classes that connect a port to a specific technology.[2][3][4][5][1]

Examples:

- HTTP controller adapter.
- Database repository adapter.
- Message broker adapter.
- External payment API adapter.[3][4][5][1][2]

Adapters translate between external formats and the domain’s language.[5][1][2][3]

---

## How It Works

### Basic Flow

1. A request comes in through an external adapter, such as an HTTP controller.[7][4][1][2]
2. The adapter calls an **incoming port** defined by the application core.[6][1][2][5]
3. The use case executes domain logic in the center.[4][2][3][5]
4. If the use case needs data or an external action, it calls an **outgoing port**.[2][4][5][6]
5. A secondary adapter implements that port and talks to the actual infrastructure, like a database or API.[1][3][4][5][2]

### Dependency Direction

A key rule is that dependencies should point **inward** toward the core.[3][5][1][2]

- Core code depends on abstractions, not concrete technologies.
- Outer layers implement the abstractions.
- Infrastructure details remain replaceable.[4][5][2][3]

---

## Why It’s Useful

Hexagonal architecture helps you build systems that are:[5][1][2][3][4]

- **Testable**
  - You can test the core without a database or web server.
- **Flexible**
  - You can swap external systems with less impact.
- **Loose-coupled**
  - Business logic stays independent of frameworks.
- **Maintainable**
  - Technology changes do not automatically ripple into domain logic.
- **Multi-interface**
  - The same core can be driven by HTTP, CLI, batch jobs, or tests.[1][2][4][5]

---

## Example: Banking Transfer

Imagine a banking system.[6][2][3][4]

- **Incoming port**: `TransferMoneyUseCase`
- **Core logic**:
  - Validate funds.
  - Apply transfer rules.
  - Emit domain events.
- **Outgoing port**: `AccountRepository`
- **Adapter**:
  - A SQL repository implementation persists the accounts.
  - An HTTP controller receives the transfer request.[2][4][5][6]

If you later switch from SQL to a different storage technology, only the adapter changes; the transfer use case stays the same.

---

## Relationship to Other Styles

Hexagonal architecture is closely related to:[3][5][1][2]

- **Clean architecture**
  - Both isolate the core from frameworks and infrastructure.
- **Onion architecture**
  - Also centers the domain model and points dependencies inward.
- **Layered architecture**
  - Similar layering idea, but hexagonal emphasizes explicit ports and adapters and dependency inversion.[5][1][2]

The main distinction is that hexagonal architecture focuses on **interfaces at the boundary** and encourages multiple ways to drive the same core.

---

## When to Use It

Use hexagonal architecture when:

- Your business logic matters more than infrastructure details.
- You expect to change frameworks, databases, or external systems.
- You want strong testability.
- You have multiple entry points into the same application.[4][1][2][3][5]

It is especially useful for:

- Backend services.
- Microservices.
- Applications with complex business rules.
- Systems that need multiple interfaces like API + batch + CLI.

---

## Trade-Offs

- **More abstraction**
  - You introduce ports and adapters, which adds structure and code.
- **Better isolation**
  - The core stays stable even when infrastructure changes.
- **Clear boundaries**
  - Great for large systems, but can feel heavy for tiny CRUD apps.
- **More upfront design**
  - You need to think in terms of use cases and interfaces early.

Architecturally, hexagonal design is a trade: a bit more upfront ceremony for a much cleaner long-term separation between business logic and technical detail.

---

## Interview Answer

Hexagonal architecture, or Ports and Adapters, is a style that isolates the application’s core business logic from external technologies like databases, UI frameworks, and message brokers. The application is exposed through ports, which are interfaces, and those ports are implemented by adapters that talk to the outside world. Incoming adapters call the core use cases, while outgoing adapters satisfy the core’s needs like persistence or external APIs. The dependency rule is inward only, so the core never depends on infrastructure details. This makes the system easier to test, evolve, and adapt to new technologies.[1][2][3][4][5]

Would you like the next topic to be **hexagonal vs clean architecture** or **hexagonal vs layered architecture**?

## Sources

[1] Hexagonal architecture (software) https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)
[2] Hexagonal architecture pattern - AWS Prescriptive Guidance https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html
[3] Hexagonal Architecture - System Design https://www.geeksforgeeks.org/system-design/hexagonal-architecture-system-design/
[4] Ports and Adapters (Hexagonal Architecture) https://dev.to/rafaeljcamara/ports-and-adapters-hexagonal-architecture-547c
[5] A Color Coded Guide to Ports and Adapters https://8thlight.com/insights/a-color-coded-guide-to-ports-and-adapters
[6] Hexagonal architecture/Ports and adapters: Communication between ... https://stackoverflow.com/questions/77516174/hexagonal-architecture-ports-and-adapters-communication-between-adapters
[7] The HEXAGONAL Architecture Explained | Ports and Adapters ... https://www.youtube.com/watch?v=92eWCQrcsvQ
[8] A very simple question about Hexagonal/Clear architecture https://www.reddit.com/r/softwarearchitecture/comments/1brqh4t/a_very_simple_question_about_hexagonalclear/
[9] I finally understood Hexagonal Architecture after mapping ... https://www.reddit.com/r/softwarearchitecture/comments/1pb9zge/i_finally_understood_hexagonal_architecture_after/
