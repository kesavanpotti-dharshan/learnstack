---
title: Domain Driven Architecture
sidebar_label: Domain Driven
sidebar_position: 1
---

Domain‑driven design (DDD) is a way of structuring software so that **the business domain and its rules are the primary driver of your architecture**, rather than databases, frameworks, or technical layers.[1][2][3][4]

---

## Core Idea

DDD says: start by deeply understanding the business problem (the _domain_), then build your models, services, and boundaries around that understanding.[2][3][4][1]

It emphasizes:

- A **ubiquitous language** shared between developers and domain experts.
- Domain models that reflect real-world concepts and behaviors.
- Clear boundaries (bounded contexts) so each part of the system has its own coherent model.[3][5][6][1]

---

## Strategic vs Tactical DDD

DDD is usually split into two levels.[5][7][8][9][2]

### Strategic DDD

High-level architecture and boundaries:

- Identify **subdomains** (core, supporting, generic).[8][10][3][5]
- Define **bounded contexts**—explicit areas where a particular model and language are valid.[6][11][5][8]
- Map relationships between contexts (context map): partnerships, upstream/downstream, anti‑corruption layers.[2][5][6][8]

Goal: align system structure and team structure with the business, so each context can evolve independently.[5][8][2]

### Tactical DDD

Low-level modeling inside a bounded context:

- **Entities** (with identity and behavior).
- **Value objects** (immutable concepts defined by value).
- **Aggregates and aggregate roots** (clusters of entities with invariants).
- **Domain services**, **domain events**, **repositories**, etc.[9][12][13][2]

Goal: turn the strategic model into concrete classes and interfaces that capture business rules cleanly.[4][13][9]

---

## Key Constructs

### Ubiquitous Language

DDD insists that everyone use the same language—terms, names, verbs—for the domain, in discussions _and_ in code.[1][4][2][5]

- Model classes, methods, and events use business terms.
- Domain experts can read code and recognize their concepts.
- Reduces ambiguity and miscommunication.[4][1][2]

### Bounded Contexts

A bounded context is a **boundary within which a specific domain model and language apply consistently**.[11][3][6][5]

- Each context has its own model for terms like “Customer” or “Order”.
- Code, data, and language inside a context are aligned.
- Different contexts are allowed to use the same term differently.[3][6][5]

Bounded contexts are the main strategic tool for managing complexity; they often map to modules or services.[6][8][11][5]

### Entities and Value Objects

Inside a context:[12][13][9]

- **Entities**:
  - Have identity and lifecycle.
  - Represent business objects with behavior (not just DB rows).[9][12]
- **Value objects**:
  - Immutable, identity by value (e.g., Money, Address).
  - Help express domain concepts and maintain invariants.

### Aggregates

An aggregate is a **cluster of entities and value objects treated as a consistency boundary**, with a single aggregate root as the entry point.[13][12][9]

- Aggregate root enforces invariants (rules that must always hold).[12]
- Aggregates help avoid huge object graphs and keep transactional boundaries clear.
- Aggregates belong to exactly one bounded context and should remain independent of each other.[14][15][12]

---

## Why Use Domain‑Driven Architecture

DDD is most valuable in **complex domains**, where business rules, workflows, and language are intricate and changing.[1][2][4]

It helps you:

- Align software structure with business structure.
- Keep core domain logic central and protected.
- Avoid “database‑driven” designs that mirror tables instead of business concepts.
- Support long‑term maintainability and evolution.[2][3][4][1]

Often, DDD complements other architectures like clean architecture, hexagonal, or microservices: you use DDD to decide **what the domain modules/services are**, and those other patterns to decide **how they are implemented and wired**.[8][11][4][2]

---

## Simple Example (Order Management)

In a retail system, DDD might lead to:[10][6][9][1]

- Strategic:
  - Subdomains: Ordering, Payments, Shipping.
  - Bounded contexts:
    - Ordering Context (cart, orders, promotions),
    - Payments Context (charges, refunds),
    - Shipping Context (fulfilment, tracking).[10][5][6]

- Tactical inside Ordering Context:
  - Entities: `Order`, `OrderItem`, `Customer`.
  - Value objects: `Money`, `ProductId`.
  - Aggregate: `Order` aggregate root enforces invariants:
    - No order with zero items.
    - Total must be non‑negative, etc.[9][12]

Each context has its own model and can be implemented as its own module or service. Interactions are explicit through messages or APIs, not shared tables.

---

## Interview‑Style Summary

Domain‑driven design is a way to architect software by modeling the business domain first and using that model to drive the structure of your code and services. Strategically, DDD uses **bounded contexts**, subdomains, and context maps to break a large problem into coherent parts that each have their own model and language. Tactically, it uses **entities, value objects, aggregates, domain services, and domain events** to implement rich domain models that enforce business rules.

The aim is to make the code reflect the real-world domain so that complex systems stay understandable and can evolve with the business. It’s most useful in complex domains; for simple CRUD apps, DDD’s overhead is often unnecessary.[11][4][5][8][1][2][9]

Is your main interest in **strategic DDD** (bounded contexts, subdomains) or **tactical DDD** (entities, aggregates, domain events) for your current project?

## Sources

[1] Understanding Domain-Driven Design: A Practical ... https://sensiolabs.com/blog/2024/understanding-domain-driven-design
[2] Is anyone using DDD? : r/softwarearchitecture https://www.reddit.com/r/softwarearchitecture/comments/feaxil/is_anyone_using_ddd/
[3] Domain-driven design https://en.wikipedia.org/wiki/Domain-driven_design
[4] Tactical Software Architecture: Domain-driven design https://www.aoe.com/en/services/academy/training/domain-driven-design
[5] Activity/Technique: Strategic Domain-Driven Design (DDD) https://socadk.github.io/design-practice-repository/activities/DPR-StrategicDDD.html
[6] Bounded Contexts https://software-architecture-guild.com/guide/architecture/domains/bounded-contexts/
[7] Strategic Domain-Driven Design: The Missing Link in ... https://javapro.io/2025/11/18/strategic-domain-driven-design-the-missing-link-in-modern-java-projects/
[8] Strategic vs. Tactical Domain-Driven Design (DDD) https://www.linkedin.com/pulse/strategic-vs-tactical-domain-driven-design-ddd-vintageglobal-lisbe
[9] Tactical Design in DDD https://deviq.com/domain-driven-design/tactical-design/
[10] DDD Bounded Contexts & Subdomains https://www.youtube.com/watch?v=NvBsEnDgA4o
[11] Use Tactical DDD to Design Microservices - Azure https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design
[12] Bounded Contexts: Behavior Over Data Structures - Part II https://ricofritzsche.me/ddd-modularization-concepts-aggregates-part-ii/
[13] DDD Part 2: Tactical Domain-Driven Design https://vaadin.com/blog/ddd-part-2-tactical-domain-driven-design
[14] DDD: How many aggregates should have a single bounded context? https://stackoverflow.com/questions/58484184/ddd-how-many-aggregates-should-have-a-single-bounded-context
[15] DDD aggregates https://www.reddit.com/r/softwarearchitecture/comments/1rct33q/ddd_aggregates/
