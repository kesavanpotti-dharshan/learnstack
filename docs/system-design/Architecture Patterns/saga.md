---
title: Saga Software Architecture
sidebar_label: Saga
sidebar_position: 1
---

Saga software architecture is a pattern for managing **distributed transactions** by breaking one large business transaction into a **sequence of smaller local transactions**, each owned by one service. If one step fails, the system runs **compensating transactions** to undo the earlier successful steps instead of using a single global rollback.[1][2][3][4][5][6]

---

## Core Idea

The core idea is to avoid traditional two‑phase commit across services.[3][4][5][6][1]

Instead of one big transaction spanning multiple databases, each service commits its own local transaction, then signals the next step through a message or event.[2][4][5][6][7][1]

If a later step fails, the saga performs compensations such as:

- Canceling an order.
- Releasing reserved inventory.
- Refunding a payment.[4][6][7][8][2]

---

## How It Works

### Basic Flow

1. A business process starts, such as “place order.”[8][1][2][3][4]
2. Service A performs its local transaction and commits.[5][7][1][4]
3. Service A publishes a message or event to trigger the next step.[7][1][2][4][5]
4. Service B performs its local transaction.[1][4][5]
5. This continues until the saga completes.[3][4][5][1]
6. If any step fails, previously completed steps are undone with compensating transactions.[6][2][4][5][7][1][3]

### Lifecycle

- **Start**: business workflow begins.
- **Progress**: each service commits locally and passes control onward.
- **Failure**: one step fails.
- **Compensation**: earlier steps are reversed.
- **Completion**: the transaction reaches a consistent end state.[4][5][6][1][3]

---

## Two Main Styles

### Choreography

In choreography, there is **no central controller**.[9][10][2][6][8][1]

- Each service listens for events.
- When it completes its work, it emits another event.
- Other services react to those events independently.[10][2][6][1][4]

**Pros**

- Decentralized.
- Loosely coupled.
- Fits event-driven systems well.[2][6][9][10]

**Cons**

- Harder to understand the full flow.
- Debugging and tracing can be difficult.
- Business logic becomes spread across services.[11][6][9][10]

### Orchestration

In orchestration, a **central saga orchestrator** tells each service what to do next.[12][5][8][9][11][1][4]

- The orchestrator sends commands to participants.
- It tracks saga state.
- It decides when to invoke compensations.[5][6][11][3][4]

**Pros**

- Clear control flow.
- Easier to observe and debug.
- Centralized state tracking.[6][9][11][5]

**Cons**

- More centralized coupling.
- The orchestrator can become complex.
- More design work up front.[9][11][5][6]

---

## Internal Architecture

### Main Components

- **Participants**
  - The services that execute each local transaction.[8][3][4][5][6]
- **Saga log / state store**
  - Records progress, completion, and compensation state.[3][5][6]
- **Coordinator / orchestrator**
  - Present in orchestration; controls flow and recovery.[11][4][5][6][3]
- **Events / messages**
  - Trigger the next step or notify others of progress.[7][1][2][4][5][6]

### Important Properties

- **Local transaction**:
  - Must be atomic within a single service.[1][4][5][3]
- **Compensating transaction**:
  - Reverses a successful earlier step.
  - Should be idempotent and retryable.[5][6][7]
- **No global rollback**:
  - Instead of undoing everything in one database transaction, the saga explicitly undoes work step by step.[4][6][1][3][5]

### Failure Behavior

- If a service is temporarily unavailable, the saga can retry.
- If a step permanently fails, compensations restore the system to a consistent business state.
- Because each step is local, the system avoids distributed locking and two-phase commit complexity.[6][1][3][4][5]

---

## When to Use It

Use saga when:

- A business workflow spans multiple services or databases.[2][8][1][3][4][6]
- You need consistency across services without distributed transactions.
- A rollback is required if part of the workflow fails.
- Long-running workflows are acceptable.[8][2][3][4][6]

Common examples:

- Order placement.
- Travel booking.
- Payment + inventory + shipping.
- Cross-service onboarding workflows.[7][2][4][6][8]

---

## When Not to Use It

Avoid saga when:

- The transaction stays within one service and a single database transaction is enough.
- The workflow is simple and compensations would be too costly or awkward.
- You require strict synchronous ACID semantics across all steps.[3][4][5][6]

Saga is a good fit for distributed systems, but it is not a replacement for normal local ACID transactions inside one service.

---

## Pros and Cons

**Pros**

- Avoids distributed transactions and 2PC.[1][4][6][3]
- Improves scalability and availability.
- Works well with microservices.
- Encodes business rollback explicitly.[2][4][5][6][7]

**Cons**

- More complex than a single database transaction.
- Requires compensation logic.
- Can be harder to reason about, especially with choreography.
- Needs careful idempotency, retries, and state tracking.[9][11][5][6][7]

---

## Simple Example

Imagine booking a trip.[6][7][8]

- Service 1 reserves a flight.
- Service 2 reserves a hotel.
- Service 3 reserves a rental car.

If the hotel reservation fails:

- Flight reservation is canceled.
- Any other completed steps are compensated.[4][7][8][2][6]

This keeps the overall workflow consistent without one giant transaction across all providers.

---

## Interview Answer

Saga is a pattern for managing distributed transactions by splitting a business process into a sequence of local transactions across multiple services. Each service commits its own work and then triggers the next step, usually through events or commands. If a later step fails, the saga runs compensating transactions to undo earlier work. There are two common implementations: **choreography**, where services react to events with no central controller, and **orchestration**, where a saga orchestrator directs each step. Saga is used when you need business consistency across services without relying on two-phase commit or distributed locking.[5][1][2][3][4][6]

Would you like the next topic to be **saga vs two-phase commit** or **saga choreography vs orchestration**?

## Sources

[1] Pattern: Saga https://microservices.io/patterns/data/saga.html
[2] Saga choreography pattern - AWS Prescriptive Guidance https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-choreography.html
[3] SAGA Design Pattern https://www.geeksforgeeks.org/system-design/saga-design-pattern/
[4] Saga Design Pattern - Azure Architecture Center https://learn.microsoft.com/en-us/azure/architecture/patterns/saga
[5] Saga Pattern in Microservices https://www.baeldung.com/cs/saga-pattern-microservices
[6] Saga Pattern in Distributed Systems https://orkes.io/blog/saga-pattern-in-distributed-systems
[7] Managing Distributed Transactions with the Saga Pattern https://dev.to/willvelida/the-saga-pattern-3o7p
[8] Saga Pattern in Microservices: A Mastery Guide https://temporal.io/blog/mastering-saga-patterns-for-distributed-transactions-in-microservices
[9] Saga Orchestration vs Choreography https://temporal.io/blog/to-choreograph-or-orchestrate-your-saga-that-is-the-question
[10] The Saga Pattern in Microservices | Orchestration VS ... https://www.youtube.com/watch?v=7xred44h4s0
[11] Saga Pattern Demystified: Orchestration vs Choreography https://blog.bytebytego.com/p/saga-pattern-demystified-orchestration
[12] Has anyone implemented the Saga Pattern in a real-world ... https://www.reddit.com/r/softwarearchitecture/comments/1lh7z3b/beginner_question_has_anyone_implemented_the_saga/
[13] What is Saga Pattern in Distributed Systems? https://www.reddit.com/r/programming/comments/1ivk7x9/what_is_saga_pattern_in_distributed_systems/
[14] Saga Pattern | Distributed Transactions | Microservices https://www.youtube.com/watch?v=d2z78guUR4g
