---
title: Strangler Fig Pattern
sidebar_label: Strangler Fig
sidebar_position: 1
---

The **Strangler Fig pattern** is a gradual modernization strategy: build new functionality around a legacy system, redirect traffic to the new pieces one capability at a time, and retire the legacy system only after it has been fully replaced. It is commonly used to move a monolith toward microservices without a risky “big-bang” rewrite. [docs.aws.amazon](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)

## Why the name?

It is named after the strangler fig plant, which grows around a host tree and eventually replaces it. In software, the **legacy application remains operational** while new services progressively take over its responsibilities. [martinfowler](https://martinfowler.com/bliki/StranglerFigApplication.html)

## How it works

A façade, API gateway, reverse proxy, or routing layer sits in front of both the old and new systems:

1. Initially, nearly all requests go to the legacy system.
2. Choose a bounded capability—such as product search, order history, or notifications—and implement it in the new architecture.
3. Move that capability’s data ownership and integrations as needed.
4. Change the routing layer so matching requests go to the new service; all other traffic remains on the legacy system.
5. Validate behavior, monitor errors, and retain a rollback path.
6. Repeat until the monolith has no live responsibilities; then decommission it. [docs.aws.amazon](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)

```text
Clients
   |
API gateway / façade
   |----------------------> Legacy monolith (unmigrated features)
   |
   +----------------------> New services (migrated features)
```

## Example

For an e-commerce monolith, you might migrate in this order:

| Phase | Request destination                                                       |
| ----- | ------------------------------------------------------------------------- |
| Start | All catalog, checkout, orders, and payments go to the monolith            |
| 1     | `/search` routes to a new Search service                                  |
| 2     | `/orders/*` routes to a new Order service                                 |
| 3     | Payments are extracted to a Payment service                               |
| End   | The gateway routes all traffic to new services; the monolith is shut down |

The pattern supports both migrated features and entirely new features in the modern system during the transition. [docs.aws.amazon](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)

## Benefits and trade-offs

**Benefits**

- Reduces transformation risk by delivering smaller, reversible increments.
- Keeps the existing application available while modernization continues.
- Allows the business to ship new functionality before the migration is complete.
- Gives teams time to learn and improve the new architecture incrementally. [docs.aws.amazon](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)

**Trade-offs**

- For a period, you operate two systems and must manage routing, compatibility, data synchronization, and observability.
- Poor service boundaries can create excessive adapters or “adapter hell.”
- Each cutover needs clear ownership, metrics, tests, and a rollback plan.
- The migration can stall if there is no plan to eliminate remaining legacy dependencies. [learn.microsoft](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig)

## When to use it

Use it when a legacy system is too large or business-critical for a full rewrite, users need minimal disruption, and you can identify features that can be safely separated. It is less useful when the old and new systems cannot coexist, or when tightly coupled shared data makes incremental separation impractical without first untangling dependencies. [docs.aws.amazon](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)

## Interview answer

> The Strangler Fig pattern incrementally replaces a legacy application rather than rewriting it all at once. A façade or gateway routes each request to either the monolith or a new service. Teams extract one feature at a time, validate it, switch traffic, and repeat until the new system owns all functionality and the monolith can be retired. Its main advantage is lower migration risk; its cost is temporary complexity around routing, integration, data consistency, and rollback. [docs.aws.amazon](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)
