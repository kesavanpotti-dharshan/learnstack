---
title: Azure Cosmos DB
sidebar_position: 1
---

## Definition

Azure Cosmos DB is a fully managed, globally distributed, multi-model NoSQL database service designed for mission-critical applications that require single-digit millisecond response times, elastic scalability, and high availability across multiple regions. It supports multiple data models (document, key-value, graph, column-family) and APIs (NoSQL, MongoDB, PostgreSQL, Cassandra, Gremlin, Table). [learn.microsoft](https://learn.microsoft.com/en-us/azure/cosmos-db/)

## Core Idea

Cosmos DB is a "database for the intelligent cloud and intelligent edge" that abstracts the complexity of global distribution, partitioning, and replication. It's built for applications that need to scale horizontally, serve users worldwide with low latency, and handle diverse data models without managing infrastructure. [azure.microsoft](https://azure.microsoft.com/en-us/blog/a-technical-overview-of-azure-cosmos-db/)

## How It Works

- **Global Distribution**: Data is automatically replicated across Azure regions. You can configure read/write regions to optimize for latency and compliance. [azure.github](https://azure.github.io/cloud-scale-data-for-devs-guide/intro-cosmos.html)
- **Multi-Model & Multi-API**:
  - **Document**: JSON-based (Cosmos DB for NoSQL, MongoDB API).
  - **Key-Value**: Cosmos DB for Table.
  - **Graph**: Cosmos DB for Apache Gremlin.
  - **Column-Family**: Cosmos DB for Apache Cassandra.
  - **Relational**: Cosmos DB for PostgreSQL (Hyperscale). [learn.microsoft](https://learn.microsoft.com/en-us/azure/cosmos-db/overview)
- **Partitioning & Scaling**: Data is partitioned horizontally by a user-defined partition key. Throughput (measured in Request Units, RUs) and storage scale independently. Autoscaling adjusts RUs based on demand. [azure.github](https://azure.github.io/cloud-scale-data-for-devs-guide/intro-cosmos.html)
- **Consistency Models**: Five tunable consistency levels to balance latency, availability, and data freshness:
  - **Strong**: Highest consistency, highest latency.
  - **Bounded Staleness**: Configurable lag (time or versions).
  - **Session**: Default; guarantees read-your-writes within a session.
  - **Consistent Prefix**: Ordered writes, no gaps.
  - **Eventual**: Lowest consistency, lowest latency. [oneuptime](https://oneuptime.com/blog/post/2026-02-16-how-to-configure-consistency-levels-in-azure-cosmos-db/view)
- **Throughput & Cost**:
  - **Provisioned Throughput**: Reserve RUs for predictable workloads.
  - **Serverless**: Pay-per-request for sporadic workloads.
  - Cost depends on RU consumption, storage, and multi-region replication. [datacamp](https://www.datacamp.com/tutorial/azure-cosmos-db)
- **Built-in Features**: Automatic indexing, multi-master writes, conflict resolution, encryption at rest, and integration with Azure services (Functions, Event Grid, Synapse Link). [learn.microsoft](https://learn.microsoft.com/en-us/azure/cosmos-db/)

## When to Use It

- Building **globally distributed applications** that need low latency across regions.
- Handling **high-throughput, high-scale workloads** (e.g., IoT telemetry, gaming, e-commerce).
- Storing **semi-structured or schema-less data** (JSON documents, user profiles, session data).
- Enabling **multi-region writes** for disaster recovery and write availability.
- Modernizing **legacy NoSQL databases** (MongoDB, Cassandra, Gremlin) to a managed service.

## Pros and Cons

### Pros

- **Global distribution**: Single-digit millisecond latency worldwide with automatic replication.
- **Elastic scalability**: Scale throughput and storage independently; autoscaling handles traffic spikes.
- **Multi-model flexibility**: Supports diverse data models and APIs without managing separate databases.
- **Tunable consistency**: Choose the right balance of consistency, latency, and availability.
- **High availability**: 99.999% SLA for availability and latency (with multi-region writes).
- **Fully managed**: No infrastructure, OS, or database engine maintenance.

### Cons

- **Cost**: Can be expensive for high-throughput workloads, especially with multi-region writes.
- **Complexity**: Partition key design is critical; poor choices lead to hot partitions and throttling.
- **Query limitations**: NoSQL API has restrictions compared to traditional SQL (e.g., no joins, limited aggregations).
- **Vendor lock-in**: Deep Azure integration and proprietary RU model can complicate migration.
- **Not ideal for relational workloads**: For complex transactions and joins, Azure SQL or PostgreSQL may be better.

## Trade-Offs

- **Consistency vs. Latency**: Strong consistency increases latency; eventual consistency reduces it. Architects must align consistency with business requirements (e.g., financial transactions vs. social media feeds).
- **Cost vs. Scale**: High throughput and multi-region writes improve performance but increase costs. Serverless can reduce costs for low-traffic workloads.
- **Partitioning vs. Query Performance**: Partition key design affects query efficiency. Queries must include the partition key to avoid cross-partition scans (expensive).
- **Flexibility vs. Complexity**: Multi-model support is powerful but requires understanding each API's strengths and limitations.

## Real-World Example

**Scenario**: A fintech company builds a personal finance tracker app that aggregates transactions from multiple banks. The app must:

- Store user profiles, transactions, and categorization rules as JSON documents.
- Serve users globally with low latency (e.g., US, Europe, Asia).
- Handle traffic spikes when users review finances on weekends.
- Ensure data consistency within a user session (e.g., newly added transactions appear immediately).

**Solution**:

- Use **Cosmos DB for NoSQL** with a partition key of `/userId` for efficient user-level queries.
- Enable **multi-region writes** across US East, Europe West, and Southeast Asia for low-latency access.
- Configure **Session consistency** as the default to guarantee read-your-writes per user.
- Set up **autoscaling** (1,000–10,000 RUs) to handle weekend traffic spikes.
- Use **Change Feed** to trigger Azure Functions for real-time analytics (e.g., spending trends, alerts).
- Integrate with **Azure Key Vault** for secure connection string management.

**Why Cosmos DB?**

- Eliminates the need to manage database clusters, replication, and sharding.
- Global distribution ensures low latency for users worldwide.
- Schema-less JSON storage fits user profiles and transactions perfectly.
- Autoscaling and serverless options optimize cost for variable workloads.

## Answer from Architect Point of View (Brief)

Azure Cosmos DB is a globally distributed, multi-model NoSQL database designed for high-scale, low-latency applications. It's ideal for globally distributed apps, semi-structured data, and workloads requiring elastic scalability. Trade-offs include cost for high-throughput scenarios, partition key design complexity, and query limitations compared to relational databases. Architects choose Cosmos DB when global scale, low latency, and operational simplicity outweigh the need for complex transactions or relational queries. For relational workloads, consider Azure SQL or PostgreSQL.

---

**Interview Tip**: Be ready to explain:

- "What are the five consistency levels in Cosmos DB, and when would you use each?"
- "How do you design a partition key for Cosmos DB?"
- "What's the difference between provisioned throughput and serverless in Cosmos DB?"
