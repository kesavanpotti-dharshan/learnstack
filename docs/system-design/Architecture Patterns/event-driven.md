---
title: Event Driven Architecture
sidebar_label: Event Driven
sidebar_position: 1
---

Event‑driven architecture (EDA) is a way of building systems where **components communicate by producing and reacting to events (state changes)**, rather than calling each other directly.[1][2][3][4][5][6][7]

---

## Core Idea

In an event‑driven system, “something happened” is a first‑class concept:

- An **event** is a meaningful change in state, like `OrderPlaced`, `UserSignedUp`, or `PaymentFailed`.[3][4][6][8]
- A **producer** emits events when these things happen.[2][4][6][9]
- One or more **consumers** listen for relevant events and react asynchronously.[4][6][9][2]

This decouples services: the producer doesn’t know or care who consumes the event, and consumers don’t need to call the producer.[7][8][9][4]

---

## Main Components

Most event‑driven architectures revolve around three core pieces.[6][2][4]

1. **Event Producer**
   - Any component that generates events when a significant action or state change occurs.[2][4][6]
   - Examples: order service, payment service, IoT device, user interface.[9][6]

2. **Event Broker / Event Bus / Router**
   - Central hub that receives events, stores or buffers them, and routes them to interested consumers.[4][6][9][2]
   - Examples: Kafka, Kinesis, SNS, RabbitMQ, Solace.[10][9][4]
   - Handles fan‑out, filtering, ordering, retries, dead‑letter queues, etc.[9][10][4]

3. **Event Consumer**
   - Services that subscribe to specific event types and run handlers when those events arrive.[6][2][4][9]
   - Each consumer focuses on one job: send email, update inventory, log analytics, start fraud checks, etc.[8][10][9]

Events themselves are usually immutable messages with a type and a payload describing what happened.[3][4][6]

---

## How It Works

### Basic Flow

1. A user or system action causes a state change—e.g., an order is placed.[3][4][6][9]
2. The order service publishes an `OrderPlaced` event to the broker.[10][2][4][9]
3. The broker stores and forwards that event to all subscribers that care about `OrderPlaced`.[2][4][6][9]
4. Consumers react:
   - Payment service starts payment processing.
   - Inventory service reserves stock.
   - Email service sends confirmation.
   - Analytics service logs the event.[8][4][9][10]
5. All of this happens asynchronously; the original API call can return quickly.[4][6][9][10]

There are no long chains of synchronous service‑to‑service calls, which reduces blocking and cascading failures.[7][9][10][4]

---

## Benefits

Event‑driven architecture is popular because it offers:[6][7][8][9][3][4]

- **Loose coupling**
  - Producers and consumers are independent; you can add or change consumers without touching producers.[7][8][9][4]

- **Scalability**
  - Asynchronous, message‑based communication makes it easier to scale horizontally and handle traffic spikes.[8][10][3][4][7]

- **Resilience**
  - Failures can be isolated; brokers can buffer, retry, and dead‑letter failed events instead of crashing the whole system.[9][10][3][4][7]

- **Real‑time responsiveness**
  - Systems can react to events as they happen: streaming, notifications, dashboards, alerts.[1][3][4][6]

- **Flexibility**
  - Easy to add new workflows by wiring new consumers to existing events (e.g., add a new analytics or ML service).[3][4][6][8]

---

## Common Patterns Used with EDA

Event‑driven architecture often incorporates:[11][8][3]

- **Publish/Subscribe**
  - One event is broadcast to many subscribers.[2][6][9]

- **Event Sourcing**
  - Store state as a sequence of events, not just current snapshots.[12][8][3]

- **CQRS**
  - Separate write model (commands) from read model (queries), with read projections built from events.[11][8][3]

These patterns help with decoupling, scalability, and complex workflows.

---

## Trade‑Offs and Challenges

EDA is powerful but adds complexity.[10][4][7][8][9][3]

Key trade‑offs:

- **Complexity**
  - More moving parts: producers, brokers, consumers, schemas, retries, DLQs, monitoring.[4][8][10][3]

- **Observability**
  - Harder to trace a user request through many asynchronous consumers; you need good logging, tracing, and correlation IDs.[8][3][4]

- **Consistency**
  - Consumers may see events at slightly different times; you often work with eventual consistency rather than immediate global state.[3][4][8]

- **Schema evolution**
  - Events are contracts; changing payloads safely requires versioning and compatibility planning.[4][3]

EDA is usually not necessary for very small or simple CRUD systems; the overhead doesn’t pay off there.[10][8][3]

---

## Simple Example (User Signup)

In a typical event‑driven setup for user signup:[6][9][10][4]

- **Producer**: Auth service publishes `UserRegistered` when a signup succeeds.
- **Broker**: Kafka/SNS receives and stores `UserRegistered`.
- **Consumers**:
  - Email service sends a welcome email.
  - Profile service initializes default settings.
  - Analytics service tracks the signup event.
  - Recommendation service queues onboarding tasks.

None of these services call each other directly; they just consume the event and act independently.[9][10][4]

---

## Interview‑Style Summary

Event‑driven architecture is a design style where systems are built around events: producers emit events when something meaningful happens, brokers route those events, and consumers react asynchronously. This decoupling improves scalability, resilience, and flexibility, especially in microservices and real‑time systems. The trade‑offs are increased complexity, the need for good observability, and dealing with eventual consistency.[1][7][2][6][8][9][10][3][4]

Are you mainly interested in **how to design the events and topics**, or in **when you should choose event‑driven architecture instead of direct API calls** in a system you’re building?

## Sources

[1] Event-Driven Architecture (EDA): A Complete Introduction https://www.confluent.io/learn/event-driven-architecture/
[2] Event-Driven Architecture Style - Azure https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven
[3] Event-Driven Architectural Patterns https://blog.bytebytego.com/p/event-driven-architectural-patterns
[4] Event-Driven Architecture https://aws.amazon.com/event-driven-architecture/
[5] What Is Event-Driven Architecture? https://www.ibm.com/think/topics/event-driven-architecture
[6] Event-Driven Architecture(EDA) https://www.geeksforgeeks.org/system-design/event-driven-architecture-system-design/
[7] Event-driven architecture https://en.wikipedia.org/wiki/Event-driven_architecture
[8] Best architectural patterns for event-driven systems https://www.gravitee.io/blog/event-driven-architecture-patterns
[9] A Guide to Event-Driven Architecture Pros and Cons https://solace.com/blog/event-driven-architecture-pros-and-cons/
[10] How Event Driven Architecture Works (System Design) https://www.youtube.com/watch?v=9E4EXBZnN7U
[11] Command Query Responsibility Segregation (CQRS) https://www.confluent.io/learn/cqrs/
[12] Domain-driven design https://en.wikipedia.org/wiki/Domain-driven_design
