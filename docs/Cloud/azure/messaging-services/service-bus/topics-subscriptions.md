---
title: Topics & Subscriptions
sidebar_position: 3
---

Azure Service Bus **Topics and Subscriptions** implement a durable **publish/subscribe** messaging pattern: a publisher sends a message once to a topic, and Azure Service Bus delivers a separate copy to every matching subscription.[1][2]

## Core concepts

| Component         | Role                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **Topic**         | The publish endpoint. Producers send messages here, not directly to consumers.                               |
| **Subscription**  | A durable, virtual queue attached to a topic. Consumers receive messages from a specific subscription.       |
| **Rule / filter** | Controls which topic messages are copied into a subscription; an optional action can alter message metadata. |

A topic supports **one-to-many fan-out**: each subscription gets its own independent copy of a message, and each subscription is consumed like a queue.[1][2]

```text
Order service
     |
     |  OrderPlaced event
     v
 Topic: orders
   |          |             |
   v          v             v
inventory   email        analytics
 subscription subscription subscription
```

In this example, inventory can reserve stock, email can send a receipt, and analytics can record the event—without the order service needing to know any of those consumers.

## Topic vs. queue

| Concern                 | Queue                                             | Topic + subscriptions                                 |
| ----------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| Communication style     | Point-to-point                                    | Publish/subscribe                                     |
| Who receives a message? | One competing consumer processes it               | Each matching subscription receives a copy            |
| Best for                | Work distribution, background jobs, load leveling | Events, notifications, integration, fan-out           |
| Filtering               | Not supported at the entity level                 | Rules can selectively route messages per subscription |

With a queue, multiple consumers compete for work and only one processes a given message. With a topic, subscribers are independent: adding an `analytics` subscription does not change the publisher or affect the `inventory` subscription.[1]

## Filters and rules

By default, a subscription accepts every message sent to the topic. You can add rules so each subscriber receives only relevant messages—for example, route based on message properties such as event type, region, priority, or customer tier. A rule consists of a filter condition and, optionally, an action that modifies message properties as it is copied to the subscription.[2]

Example:

```text
Topic: orders

Subscription: inventory
Filter: eventType = 'OrderPlaced'

Subscription: refunds
Filter: eventType = 'OrderCancelled'

Subscription: europe-ops
Filter: region = 'EU'
```

A message can match more than one subscription, so it can still fan out to multiple consumers.

## Delivery and reliability

Topics and subscriptions are durable messaging entities. If a consumer is offline, its subscription can retain its copy until the consumer returns, subject to configured message time-to-live and retention settings. Topic subscriptions also have dead-letter queues, which hold messages that cannot be delivered or processed normally.[1][2]

A consumer completes a message **within its own subscription**. That completion does not remove the copies held by other subscriptions.

## Typical flow

1. Create a Service Bus namespace, a topic, and one or more subscriptions.[3]
2. A producer sends a message to the topic.
3. Service Bus evaluates each subscription’s rules.
4. Service Bus copies a matching message into each subscription.
5. A consumer receives and processes from its subscription, then completes or abandons/dead-letters the message as appropriate.[1][2]

## When to use them

Use topics and subscriptions when several systems must react independently to the same event—for example:

- `OrderPlaced` → inventory, billing, shipping, email, analytics.
- `CustomerUpdated` → CRM sync, search index, audit log.
- `FileUploaded` → virus scan, thumbnail generation, metadata extraction.

Choose a queue when the message is a single task that should be processed once by one worker; choose a topic when it is an event that multiple independent consumers should observe.[1]

## Interview answer

> Azure Service Bus Topics and Subscriptions provide durable pub/sub messaging. A publisher sends a message to a topic, and Service Bus creates an independent copy in every subscription whose rules match the message. A subscription behaves like a virtual queue, so each consumer processes its own copy independently. Topics are ideal for event fan-out, while queues are better for distributing a task to one worker.[1][2]

Sources
[1] Azure Service Bus Queues, Topics, and Subscriptions https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions
[2] Introduction to Azure Service Bus Messaging - Microsoft Learn https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview
[3] Azure Service Bus Topics Quickstart With .NET - Microsoft Learn https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dotnet-how-to-use-topics-subscriptions
[4] Azure Service Bus Topics Explained - Stephen W Thomas https://www.stephenwthomas.com/azure-integration-thoughts/azure-service-bus-topics/
[5] Azure Service Bus | Queue | Topics-Subscription | Hands-on https://k21academy.com/azure-cloud/azure-service-bus/
[6] Azure Service Bus Queue vs Topic EXPLAINED - YouTube https://www.youtube.com/watch?v=NwTABr5kyvc
[7] Azure Service Bus 11 - Topics and Subscriptions - YouTube https://www.youtube.com/watch?v=nKkf0Z1iq10
