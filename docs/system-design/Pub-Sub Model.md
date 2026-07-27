---
title: Pub-Sub Model
sidebar_label: Pub-Sub Model
sidebar_position: 3
---

---

### 1. Definition

The Pub-Sub (Publish-Subscribe) model is an **asynchronous messaging pattern** where publishers send messages to a topic or broker without knowing which subscribers will receive them, and subscribers receive only the topics they are interested in.[1][2][3][4][5][6]

It enables **many-to-many communication** while keeping producers and consumers decoupled.[3][4][5][7]

---

### 2. Core Idea

The core idea is to **separate message producers from message consumers** so they can scale, evolve, and fail independently.[2][3][7][8][9]

Instead of direct point-to-point communication:

- Publishers emit events.
- A broker or event bus routes them.
- Subscribers independently process what they care about.[1][3][4][6][10]

This is especially useful when one event must fan out to multiple systems at once.[3][6][9][1]

---

### 3. How it Works

### Basic Flow

1. A publisher creates a message.[1][3][6]
2. The message is sent to a topic, channel, or broker.[3][4][6][1]
3. Subscribers register interest in one or more topics.[4][6][1][3]
4. The broker delivers each message to all matching subscribers.[6][1][3][4]
5. Subscribers process the message asynchronously.[7][1][3][6]

### Lifecycle

- **Publish**: event is produced.
- **Route**: broker maps event to topic.
- **Deliver**: matching subscribers receive copies.
- **Process**: each subscriber handles the event independently.
- **Acknowledge / retry**: depending on the system, delivery may be confirmed or retried.[1][6][11]

### Message Flow Behavior

- Publishers do not wait for subscribers to be ready.
- One event can trigger many downstream actions.
- Subscribers can scale independently based on their own workload.[2][3][5][6][9]

---

### 4. Internal Architecture

### Main Components

- **Publisher**
  - Creates and sends messages.[1][3][6]
- **Subscriber**
  - Registers interest and consumes messages.[3][6][1]
- **Topic / Channel**
  - Logical grouping for related messages.[4][6][1][3]
- **Broker / Event Bus**
  - Routes, stores, and delivers messages.[6][10][1][3][4]

### Delivery Semantics

Depending on the system, pub-sub can offer:

- At-most-once delivery.
- At-least-once delivery.
- Exactly-once semantics in more advanced systems.[6][11]

### Storage / Persistence

Some pub-sub systems persist messages until subscribers consume them, while others are more transient.[6][10][11][12]

### Fan-Out

- A single published event may be copied to many subscribers.
- This is ideal when multiple services need to react to the same business event.[1][3][6][9]

### Memory and Failure Behavior

- The broker may buffer messages if subscribers are slow.
- If buffering is bounded, the system may apply backpressure or drop policies.
- If a subscriber is offline, durable brokers can replay or retain messages depending on configuration.[6][11]

---

### 5. When to Use It

Use pub-sub when:

- One event must trigger multiple downstream actions.
- Producers and consumers should be **loosely coupled**.[1][3][7][8][9]
- Services need to scale independently.
- Work should happen asynchronously.
- You want to integrate microservices or event-driven workflows.[3][5][6][9]

Common use cases:

- Order placed → inventory update, payment, email notification.
- Social media post → feed fan-out, notifications, analytics.
- IoT sensor updates → alerting, monitoring, archival.
- Audit/event streaming pipelines.[2][5][6][9][13]

---

### 6. When Not to Use It

Avoid pub-sub when:

- You need a simple one-to-one synchronous request/response.
- The message must be processed immediately by one specific consumer.
- You need strong ordering and direct control without broker complexity.
- The system is small enough that a queue or direct call is simpler.[3][5][10][12]

It is also not ideal if:

- You have no clear topic structure.
- Consumers require strict transactional coupling with the publisher.

---

### 7. Pros and Cons

**Pros**

- Decouples producers and consumers.[3][4][5][7]
- Supports asynchronous processing.
- Easy fan-out to many subscribers.
- Independent scaling of producers and consumers.
- Improves resilience by avoiding tight coupling.[1][6][9][3]

**Cons**

- More operational complexity than direct calls.
- Harder debugging and tracing.
- Delivery guarantees depend on broker configuration.
- Ordering can be tricky.
- Duplicate delivery may happen in at-least-once systems.[6][11]

---

### 8. Trade Offs

- **Decoupling vs complexity**
  - Pub-sub simplifies service boundaries but adds messaging infrastructure.
- **Asynchronous vs immediate**
  - Better scalability, but not ideal for immediate user-facing logic.
- **Fan-out vs cost**
  - One event can drive many consumers, but broker and storage load increase.
- **Durability vs speed**
  - Persisted messages are safer but may be slower than transient delivery.

Architect-level insight: pub-sub is best when the business event is important enough that multiple systems should react independently.

---

### 9. Real World Example (Minimum One)

**Example: E-commerce order event**

- The checkout service publishes `OrderPlaced`.
- Subscribers include:
  - Inventory service,
  - Payment service,
  - Email service,
  - Analytics service.[1][3][6][9]

Each subscriber processes the same event independently:

- Inventory reserves stock.
- Payment captures money.
- Email sends confirmation.
- Analytics records the conversion.

This is a classic pub-sub use case because the publisher does not need to know who consumes the event.

---

### 10. Architect’s Perspective

If I were designing a large-scale system, I’d use pub-sub whenever I need **event-driven fan-out and loose coupling** across services.[3][5][6][9]

I’d choose it for:

- Microservice coordination.
- Workflow orchestration.
- Notifications.
- Audit logging.
- Streaming event pipelines.

I’d be careful about:

- Topic design.
- Idempotent consumers.
- Replay/retry behavior.
- Dead-letter handling.
- Observability and tracing across async flows.

**Cloud angle**  
In cloud architectures, pub-sub is a foundation for serverless and event-driven systems. Services publish events, and managed messaging services deliver them to subscribers without direct coupling. This makes scaling and independent deployment much easier.

---

### 11. Interview Answer (2-Minute Version)

The Pub-Sub model is an asynchronous messaging pattern where publishers send events to a topic or broker without knowing who will consume them, and subscribers receive only the topics they subscribe to. It creates many-to-many communication while decoupling producers from consumers.

The main components are publishers, subscribers, topics, and a broker or event bus. A publisher emits an event, the broker stores or routes it, and all subscribed consumers receive their own copy. This is useful when one event needs to trigger multiple actions, like an order event causing inventory updates, payment processing, and email notifications.

Architecturally, I use pub-sub when I want loose coupling, independent scaling, and asynchronous fan-out. I avoid it when I need a simple synchronous request/response flow or when the overhead of a broker is not justified.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Pub-sub is **decoupled, asynchronous, many-to-many communication**.[3][4][5][7]
- They clearly define:
  - publisher,
  - subscriber,
  - topic,
  - broker.
- They mention delivery semantics, retries, and durability.[6][11]
- They give real fan-out examples like order events.[9][6]

**Common red flags**

- Confusing pub-sub with a simple queue.
- Saying publishers send directly to subscribers.
- Ignoring persistence and delivery guarantees.
- Not distinguishing pub-sub from request/response.

**Likely follow-ups**

- “What’s the difference between pub-sub and message queues?”  
  → Pub-sub fans out to many subscribers; a queue usually gives work to one consumer.

- “How do you avoid duplicate processing?”  
  → Use idempotent consumers and message deduplication.

- “What happens if a subscriber is down?”  
  → Depends on broker durability, retention, and replay features.

Would you like the next topic to be **pub-sub vs message queue**, **Kafka vs RabbitMQ**, or **event-driven architecture**?

### 13. Sources

[1] Pub/Sub Architecture https://www.geeksforgeeks.org/system-design/what-is-pub-sub/
[2] Publish-Subscribe (Pub/Sub) - System Design https://algomaster.io/learn/system-design/pub-sub
[3] Publish-subscribe (Pub/Sub) - GetStream.io https://getstream.io/glossary/publish-subscribe/
[4] Publish–subscribe pattern https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern
[5] What is Pub/Sub? The Publish/Subscribe model explained https://ably.com/topic/pub-sub
[6] What is Pub/Sub Messaging? https://aws.amazon.com/what-is/pub-sub-messaging/
[7] The publish-subscribe pattern: Everything you need to ... https://www.contentful.com/blog/publish-subscribe-pattern/
[8] Understanding Pub/Sub in Distributed Systems by Austin ... https://cleancoders.com/blog/2026-01-23-crossing-the-single-process-boundary-understanding-pubsub-in-distributed-systems
[9] System Design: The Pub-Sub Abstraction https://www.educative.io/courses/grokking-the-system-design-interview/system-design-the-pub-sub-abstraction
[10] architecture design: In Pub Sub, how are publishing and subscription ... https://softwareengineering.stackexchange.com/questions/450782/architecture-design-in-pub-sub-how-are-publishing-and-subscription-servers-con
[11] Design a Pub/Sub System: The Complete Guide (2026) https://www.systemdesignhandbook.com/guides/design-a-pub-sub-system/
[12] The Many Faces of Publish/Subscribe http://systems.cs.columbia.edu/ds2-class/papers/eugster-pubsub.pdf
[13] Opting for a distributed Pub/Sub system VS in-process ... https://www.reddit.com/r/golang/comments/iv2zgc/opting_for_a_distributed_pubsub_system_vs/
[14] Publisher Subscriber Pattern | Pub Sub | System Design https://www.youtube.com/watch?v=algmP8MGeL4
