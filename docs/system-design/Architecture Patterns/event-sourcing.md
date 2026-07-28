---
title: Event Sourcing Architecture
sidebar_label: Event Sourcing
sidebar_position: 1
---

Event sourcing is a data‑storage pattern where **you store every state change as an event and derive the current state by replaying those events**, instead of storing only the latest snapshot.[1][2][3][4][5]

---

## Core Idea

Traditional systems store the _current_ state (e.g., a row in a database). Event sourcing instead stores a **log of all changes**: `ItemAddedToCart`, `ItemRemoved`, `OrderPlaced`, `PaymentCaptured`, etc.[3][4][5][6][1]

Key points:

- Every change to an aggregate (like an Order or Account) is captured as an immutable event.[5][7][1][3]
- The **event stream is the source of truth**; current state is a projection of those events.[2][8][1][5]
- To get the current state, you **replay events in order** (often starting from a recent snapshot).[4][9][1][5]

---

## How It Works

### Basic Flow

1. A command comes in (e.g., “add item to cart”).
2. Business logic decides it’s valid and produces one or more events (e.g., `ItemAddedToCart`).[7][1][3]
3. The system **appends** those events to an **event store** (an events database).[9][1][3][5]
4. To rebuild an aggregate:
   - Load all events for that aggregate (or from the last snapshot onward).
   - Replay them to reconstruct current state.[1][3][4][5]

Because appending an event is a single atomic operation, writes are naturally append‑only and often simpler to make consistent.[10][9][1]

### Event Store

The event store:

- Holds all events in sequence, usually per aggregate ID.[3][9][1]
- Exposes APIs to append events and read streams.[1][3]
- Often doubles as a **publisher**, letting other services subscribe to events for integration or projections.[9][1]

---

## What Event Sourcing Is (and Isn’t)

Event sourcing is:

- A **persistence strategy**—how one service stores and reconstructs its data.[6][8][11][2][7][1]
- About treating the event log as the **canonical state**, not about inter‑service communication.

Event sourcing is **not** the same as event‑driven architecture:

- **EDA**: events are used to communicate between services, via brokers, for loose coupling.[8][11][2][4][6]
- **Event sourcing**: events are used _inside a service_ as its data model, with replayable history.[11][2][5][6][7][8]

They often coexist, but address different concerns.

---

## Benefits

Event sourcing gives several powerful benefits:[4][5][6][7][3][9][1]

- **Full audit trail**
  - Every change is recorded; you can see who did what and when.[7][9][1]

- **Temporal queries**
  - You can reconstruct state at any point in time (“What was this order on Jan 1?”).[6][4][7][1]

- **Debugging and replay**
  - You can replay events to reproduce bugs, rebuild state after changes, or simulate scenarios.[5][4][6][7]

- **Natural fit with CQRS and EDA**
  - Events from the store feed read models or downstream services.[12][2][3][4][6][1]

- **Avoids ORM impedance mismatch**
  - You store domain events instead of trying to shoehorn rich aggregates into relational tables.[5][1]

---

## Trade‑Offs and Complexity

Event sourcing is powerful but comes with serious trade‑offs:[10][6][7][9][1]

- **Complexity**
  - You need event schemas, versioning, migration, replay logic, snapshots, projections, and tooling.[4][9][10][1]

- **Schema evolution**
  - Once events are persisted, changing their structure must be backward‑compatible or carefully migrated.[6][10][1]

- **Read models**
  - Querying directly from event streams is impractical for complex queries; you usually need projections/read stores built from events.[3][1][4]

- **Mental model**
  - Developers must think in terms of “what happened?” rather than “current row”; this can be a shift in modelling style.[7][4][5][6]

Because of these trade‑offs, event sourcing is recommended only for **domains that truly benefit from historical traceability and complex workflows**, not for simple CRUD apps.[9][10][1][7]

---

## Simple Example (Bank Account)

Consider a bank account modeled with event sourcing:[1][3][5][7]

- Events:
  - `AccountOpened`
  - `MoneyDeposited`
  - `MoneyWithdrawn`
  - `FeeApplied`

- Event store:
  - For account `A123`, you store each of these events in order.

To get current balance:

- Start at zero.
- Replay all events for `A123`:
  - Add deposits, subtract withdrawals and fees.
- The balance emerges from the event history.[3][4][5][1]

To see balance on a past date, you replay only events up to that timestamp.

---

## Relationship to CQRS and EDA

Event sourcing is often combined with:

- **CQRS**
  - Command side appends events.
  - Query side builds read models from those events (tables, views, search indexes).[13][4][6][1][3]

- **Event‑Driven Architecture**
  - Events in the store are also published to other services (e.g., notifications, analytics).[12][6][9][1]

Think of event sourcing as **how you store data**, and EDA as **how systems talk**, with CQRS organizing read vs write paths.

---

## Interview‑Style Summary

Event sourcing is a persistence pattern where an application doesn’t just store the current state of an entity; instead, it stores **every state change as an immutable event** in an event store. The current state is reconstructed by replaying those events (often from a snapshot). This gives you a complete audit trail, supports temporal queries, and meshes well with CQRS and event‑driven architectures. The trade‑off is significantly higher complexity in schema evolution, projections, and tooling, so event sourcing is best reserved for domains that truly need rich history and replayable state, not for simple CRUD systems.[2][8][10][4][5][6][7][9][1][3]

Is your main interest in using event sourcing **with CQRS**, or in how to decide **when event sourcing is worth it** for a system you’re designing?

## Sources

[1] Pattern: Event sourcing https://microservices.io/patterns/data/event-sourcing.html
[2] Event Sourcing vs Event Driven Architecture https://codeopinion.com/event-sourcing-vs-event-driven-architecture/
[3] Event Sourcing Pattern https://www.geeksforgeeks.org/system-design/event-sourcing-pattern/
[4] Event-Driven Architecture vs State-Based Systems https://developer.confluent.io/courses/event-sourcing/event-driven-vs-state-based/
[5] Event Sourcing https://martinfowler.com/eaaDev/EventSourcing.html
[6] Event-Driven Architecture vs. Event Sourcing: Clarifying the ... https://dev.to/actor-dev/eventing-sourcing-and-event-driven-3lc1
[7] What is Event Sourcing? : r/softwarearchitecture https://www.reddit.com/r/softwarearchitecture/comments/1ipv71r/what_is_event_sourcing/
[8] Event Sourcing vs Event-Driven Architecture: Core Contrasts https://estuary.dev/blog/event-driven-vs-event-sourcing/
[9] The pros and cons of the Event Sourcing architecture pattern https://www.redhat.com/en/blog/pros-and-cons-event-sourcing-architecture-pattern
[10] Event Sourcing Pattern - Azure Architecture Center https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing
[11] Event Sourcing vs Event Driven Architecture difference https://stackoverflow.com/questions/71083541/event-sourcing-vs-event-driven-architecture-difference
[12] Best architectural patterns for event-driven systems https://www.gravitee.io/blog/event-driven-architecture-patterns
[13] Command Query Responsibility Segregation (CQRS) https://www.confluent.io/learn/cqrs/
[14] Event Driven Design Vs Event Sourcing | EDD vs ES https://www.youtube.com/watch?v=C471HVRetcQ
[15] System Design - Event Sourcing https://www.youtube.com/watch?v=JTmgi0vO5Ug
