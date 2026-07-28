---
title: Vertical Slice Software Architecture
sidebar_label: Vertical Slice
sidebar_position: 1
---

Vertical slice architecture is a way of organizing software by **feature or use case** instead of by technical layer. Each slice contains everything needed to implement one piece of functionality, such as API, business logic, validation, and data access.[1][2][3][4][5][6]

---

## Core Idea

The core idea is to **maximize cohesion within a feature and minimize coupling between features**.[2][3][5][6]

Instead of putting all controllers in one folder, all services in another, and all repositories in another, you group code by slice:

- `CreateOrder`
- `CancelOrder`
- `GetOrderDetails`
- `UpdateProfile`[3][5][6][7][2]

Each slice is small, focused, and owns its own flow end-to-end.[4][5][6][2][3]

---

## How It Works

### Basic Structure

A vertical slice often includes:

- **Endpoint or controller**
- **Request/response models**
- **Validation**
- **Use case / handler**
- **Domain logic**
- **Repository or data access**
- **Tests**[5][6][7][8][2][3]

### Example Flow

1. A request arrives for one feature, like `POST /orders`.[6][3][4]
2. The feature’s endpoint/controller receives it.[3][6]
3. Validation and business rules run inside that slice.[2][5][6][3]
4. The slice accesses persistence or external services if needed.[4][5][6][3]
5. The response is returned from the same feature area.[6][3][4]

The important point is that the code for one use case lives together instead of being scattered across layers.[5][2][3][6]

---

## Why People Use It

Vertical slice architecture is useful because it reduces the “change in six places” problem.[2][5][6]

Benefits:

- Easier to find code for one feature.
- Fewer cross-layer dependencies.
- Less shared infrastructure code to reason about.
- Changes are more localized.
- Features can evolve independently.[8][3][5][6][2]

It also fits naturally with **CQRS** and **use-case driven design**, where each command or query is treated as its own slice.[7][3][4][5]

---

## Example: Order Management

Imagine an e-commerce system.[3][4][5][6]

You might organize it like:

- `Features/Orders/CreateOrder`
- `Features/Orders/CancelOrder`
- `Features/Orders/GetOrderDetails`
- `Features/Users/UpdateProfile`

Inside `CreateOrder`, you’d keep:

- Request model.
- Validator.
- Command handler.
- Order creation logic.
- Repository call.
- Unit and integration tests.[4][5][6][3]

If you change how orders are created, you mostly touch one slice instead of multiple shared folders.

---

## Relationship to Other Architectures

Vertical slices are a **feature-first** style, while many traditional architectures are **layer-first**.[9][1][8][5][3]

Compared with layered architecture:

- Layered: controllers in one place, services in another, repositories in another.
- Vertical slice: everything for one feature lives together.[1][8][5][6][2]

Compared with clean or hexagonal architecture:

- Vertical slice is more about **organization by feature**.
- Clean/hexagonal is more about **dependency direction and boundaries**.[5][6]

You can combine them: a vertical slice can still use clean or hexagonal principles inside each feature.

---

## Trade-Offs

Vertical slice architecture is not free of trade-offs.[8][6][2][3][5]

**Pros**

- Better locality of change.
- Easier to reason about a feature end-to-end.
- Less accidental coupling across unrelated features.
- Often simpler for small teams and fast-moving products.

**Cons**

- Some duplication across slices.
- Shared abstractions are intentionally minimized, which can feel repetitive.
- You need discipline to keep slices cohesive and avoid turning them into mini-layered architectures.
- Large codebases still need conventions for cross-cutting concerns.

Architecturally, the main bet is that **duplication is cheaper than coupling** when features change frequently.

---

## When to Use It

Use vertical slice architecture when:

- Your product is feature-driven.
- Teams work on separate user stories or use cases.
- You want to reduce cross-cutting change impact.
- You have a CQRS or request/handler style already.[7][6][3][5]

It is especially useful for:

- APIs.
- Microservices.
- CRUD-heavy business apps.
- Fast-moving product teams.

It may be less compelling for very small apps, or for domains where a classic layered structure is already simple and stable.

---

## Interview Answer

Vertical slice architecture organizes software by **feature or use case** instead of by technical layers. Each slice contains all the code needed for that feature—API, validation, business logic, and data access—so a change is usually localized to one area. The goal is to maximize cohesion within a slice and minimize coupling between slices, which makes the system easier to understand, test, and evolve. It also pairs well with CQRS because commands and queries can be modeled as independent slices.[6][8][3][4][5]

Would you like the next topic to be **vertical slice vs clean architecture** or **vertical slice vs layered architecture**?

## Sources

[1] Vertical Slice Architecture: The Best Ways to Structure Your Project https://www.reddit.com/r/dotnet/comments/1eo7uhk/vertical_slice_architecture_the_best_ways_to/
[2] Vertical Slice Architecture https://www.bensampica.com/blog/verticalslice/
[3] Vertical Slice Architecture | API Template Pack https://www.apitemplatepack.com/docs/introduction/vertical-slice/
[4] Vertical slice explained for 2026: build better features faster https://monday.com/blog/rnd/vertical-slice/
[5] Vertical Slice Architecture https://milanjovanovic.tech/blog/vertical-slice-architecture
[6] Vertical Slice Architecture https://www.jimmybogard.com/vertical-slice-architecture/
[7] Vertical Slice Architecture Is Easier Than You Think https://milanjovanovic.tech/blog/vertical-slice-architecture-is-easier-than-you-think
[8] Vertical slice https://en.wikipedia.org/wiki/Vertical_slice
[9] 7 Reasons Why I Favour Feature Slices https://dev.to/dchowitz/7-reasons-why-i-favour-feature-slices-4kl3
[10] Vertical slice architecture pros and cons : r/ExperiencedDevs https://www.reddit.com/r/ExperiencedDevs/comments/1m1v5pv/vertical_slice_architecture_pros_and_cons/
[11] Tired of Layers? Vertical Slice Architecture to the rescue! https://www.youtube.com/watch?v=lsddiYwWaOQ
[12] My thoughts on Vertical Slices, CQRS, Semantic Diffusion and other fancy ... https://www.architecture-weekly.com/p/my-thoughts-on-vertical-slices-cqrs
[13] What is the difference between Vertical Slice Architecture and Feature-Based Architecture https://softwareengineering.stackexchange.com/questions/459214/what-is-the-difference-between-vertical-slice-architecture-and-feature-based-arc
