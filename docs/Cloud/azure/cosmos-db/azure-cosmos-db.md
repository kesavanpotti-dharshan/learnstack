---
title: Azure Cosmos DB
sidebar_position: 1
---

Azure Cosmos DB is Azure’s fully managed, globally distributed database service designed for low-latency, high-throughput, elastic cloud applications. Its most common form is the **API for NoSQL**, which stores flexible JSON documents, but the Cosmos DB family also supports PostgreSQL, MongoDB, Cassandra, Gremlin, Table, and vector-oriented workloads.[1][2][3]

## What it solves

Cosmos DB is a strong fit when an application needs one or more of these:

- Low-latency reads and writes at global scale.
- Automatic horizontal partitioning and elastic throughput.
- Multi-region replication and high availability.
- Flexible JSON schema for fast-moving product development.
- High request volume, such as IoT, user activity, product catalogs, gaming, or personalization.
- Operational JSON data plus vector/hybrid search for AI or RAG applications.[2][3][4][5]

It is not simply “Azure SQL but NoSQL.” Azure SQL is relational and optimized for normalized schemas, joins, and relational transactions; Cosmos DB is designed around distributed partitions, denormalized documents, predictable throughput, and partition-aware access patterns.

## Core hierarchy

```text
Cosmos DB account
  └─ Database
      └─ Container
          └─ Items (JSON documents)
```

- **Account:** global Cosmos DB resource; configured with regions, APIs, networking, and replication.
- **Database:** logical grouping of containers.
- **Container:** the main scalability and billing boundary. It stores items, indexes them, and has a partition key.
- **Item:** usually a JSON document.

Example item:

```json
{
  "id": "order-1001",
  "tenantId": "tenant-42",
  "customerId": "customer-9",
  "status": "Pending",
  "total": 99.95,
  "items": [
    { "productId": "p-1", "quantity": 2, "unitPrice": 24.99 },
    { "productId": "p-2", "quantity": 1, "unitPrice": 49.97 }
  ]
}
```

A container might use `/tenantId` as its partition key.

## Partitioning: the most important design decision

Cosmos DB scales a container by partitioning its items. Your **partition key** determines which logical partition stores an item and strongly affects scalability, cost, query efficiency, and transaction scope. Cosmos DB natively partitions data for availability and scale.[3][5][6]

```text
Container: Orders
Partition key: /tenantId

tenant-1 documents → logical partition tenant-1
tenant-2 documents → logical partition tenant-2
tenant-3 documents → logical partition tenant-3
```

A good partition key should:

- Have many possible values.
- Distribute reads, writes, and storage evenly.
- Avoid a small number of “hot” keys.
- Be included in common point reads and queries.
- Keep data that needs atomic transactions together when possible.

### Point reads

The cheapest and fastest operation is usually a **point read**, where you know both `id` and partition-key value:

```csharp
var response = await container.ReadItemAsync<Order>(
    id: "order-1001",
    partitionKey: new PartitionKey("tenant-42"));
```

```text
Known: id + partition key
      → target exactly one logical partition
      → efficient point read
```

A query without the partition key can become a cross-partition query, consuming more Request Units and adding latency.

### Hot partitions

A poor key such as `/country` can concentrate most traffic on a few values:

```text
/country
US → 80% of writes
CA → 10%
UK → 10%
```

The US partition can become a throughput bottleneck even if the container has unused capacity elsewhere. Partition-key selection should follow actual access patterns, not merely the field that seems most descriptive.

## Request Units (RUs)

Cosmos DB measures provisioned work in **Request Units per second (RU/s)**. RUs represent the cost of database operations using CPU, I/O, and memory. Throughput and storage are scaled independently.[3][5]

The RU cost depends on factors such as:

- Item size.
- Read versus write operation.
- Indexing configuration.
- Query complexity.
- Whether the query includes the partition key.
- Number of physical partitions scanned.
- Consistency level.

A point read of a small item is inexpensive; a large cross-partition query with many filters and projections can cost far more.

### Throughput models

Cosmos DB offers common capacity approaches:

| Model                  | Best for                                               |
| ---------------------- | ------------------------------------------------------ |
| Provisioned throughput | Predictable, sustained workloads                       |
| Autoscale throughput   | Variable demand with a known maximum                   |
| Serverless             | Low or intermittent workloads, development, small apps |

If an operation exceeds available RU/s, Cosmos DB returns **HTTP 429 Too Many Requests** with retry guidance. Azure SDKs generally retry throttled requests automatically, but persistent 429s mean you need to reduce operation cost, improve partitioning/query design, or increase throughput.

## Consistency levels

Cosmos DB provides tunable consistency, trading latency/availability characteristics against freshness. Common consistency options include:[3]

| Level             | General meaning                                                        |
| ----------------- | ---------------------------------------------------------------------- |
| Strong            | Reads see the latest committed write within the configured scope       |
| Bounded staleness | Reads may lag by a configured number of versions or time interval      |
| Session           | A client sees its own writes; common default for application workloads |
| Consistent prefix | Reads never see out-of-order writes, but may be behind                 |
| Eventual          | Lowest-latency/lowest-cost freshness guarantee                         |

For many application APIs, **Session consistency** is a practical default because it gives read-your-own-write behavior for a client session while avoiding the cost of strong global consistency. Choose consistency based on an explicit business requirement, not as a universal performance switch.[3][5]

## Replication and global distribution

Cosmos DB can replicate data across Azure regions, support multi-region reads, and optionally support multi-region writes. It is built for global distribution and offers SLA-backed dimensions including availability, throughput, latency, and consistency.[3][5]

```text
Write region(s)
  ├─ East US
  ├─ West Europe
  └─ Southeast Asia

Read requests are routed near users,
subject to configured replication and consistency behavior.
```

This is valuable for worldwide consumer apps, but global replication does not remove the need to understand conflict resolution, write-region policy, consistency, and cost.

## Data model and APIs

The modern Cosmos DB portfolio supports several data models and APIs.[1][2]

| API / offering                 | Typical model or use                                   |
| ------------------------------ | ------------------------------------------------------ |
| API for NoSQL                  | Native JSON document model and SQL-like query language |
| API for MongoDB                | MongoDB-compatible application access                  |
| Azure Cosmos DB for PostgreSQL | Distributed PostgreSQL / relational workloads          |
| API for Apache Cassandra       | Wide-column Cassandra-compatible workloads             |
| API for Gremlin                | Graph workloads                                        |
| Table API                      | Key-value/table-style access                           |
| Vector and hybrid search       | Embeddings, RAG, agents, semantic + keyword retrieval  |

For a new document-oriented application on Azure, API for NoSQL is usually the native default unless you have a compatibility reason to choose a different API.

## Querying documents

The API for NoSQL uses a SQL-like query syntax over JSON:

```sql
SELECT
    c.id,
    c.customerId,
    c.total
FROM c
WHERE c.tenantId = "tenant-42"
  AND c.status = "Pending"
ORDER BY c.createdAt DESC
```

It looks like SQL, but it is **not relational SQL**:

- Joins are primarily within a JSON item/array, not arbitrary joins across containers.
- Denormalization is common and often desirable.
- Transactions are scoped to one logical partition.
- Query cost is metered in RUs.

Design documents around the data a request needs together. For example, an order often embeds its order lines rather than storing every line as an independently queried relational row.

## Transactions and concurrency

Cosmos DB supports ACID transactions and transactional batch operations **within one logical partition key value**. This is a major reason the partition key is a domain and correctness decision, not only a scale decision.[6]

Example: if `tenantId` is the partition key, a transactional batch can atomically create an order and write an outbox/audit document for the same tenant, but it cannot directly make an atomic transaction across `tenant-42` and `tenant-99`.

For optimistic concurrency, Cosmos DB provides an `_etag` value. Send an `If-Match` condition when replacing or patching an item; if someone changed it first, the operation fails rather than overwriting a newer version.

## Change Feed

The **Change Feed** is an ordered, persistent record of inserts and updates within a container. Consumers can process new changes to build projections, publish integration events, update a search index, or trigger downstream workflows.

```text
Order document written
      |
      v
Cosmos DB container
      |
      +--> Change Feed processor
              ├─ Update analytics projection
              ├─ Send notification
              └─ Publish integration event
```

This is useful for event-driven architecture, but build consumers to be idempotent because distributed processing can deliver or reprocess work under failure/retry scenarios.

## Indexing

Cosmos DB automatically indexes item properties by default, which makes flexible document querying easier but adds write and storage cost.[7]

For production containers:

- Exclude paths you never query.
- Add composite indexes for multi-property `ORDER BY`/filter patterns when needed.
- Add vector indexes only when using vector search.
- Measure RU cost and query metrics before and after index changes.

More indexing is not automatically better: every indexed property increases write cost.

## Example: multi-tenant SaaS orders

A practical design:

```text
Container: Orders
Partition key: /tenantId
Item ID: order ID
```

```json
{
  "id": "ord-1001",
  "tenantId": "tenant-42",
  "customer": {
    "id": "cust-9",
    "name": "Ada Lovelace"
  },
  "status": "Pending",
  "createdAt": "2026-08-12T22:36:00Z",
  "items": [
    {
      "productId": "p-1",
      "name": "Keyboard",
      "quantity": 1,
      "unitPrice": 99.95
    }
  ],
  "total": 99.95
}
```

Why this works:

- Most tenant-scoped queries include `tenantId`.
- Tenant isolation aligns with the partition boundary.
- Order lines are embedded because they are normally read with the order.
- A point read uses `id + tenantId`.
- Tenant-level transactional operations can remain within one partition.

Potential issue: one giant tenant could become hot. If that is realistic, a higher-cardinality strategy—such as a hierarchical key or tenant-plus-bucket approach—may be necessary.

## When to use Cosmos DB

Use Cosmos DB when you need:

- Global low-latency document access.
- Elastic scale and high throughput.
- Flexible JSON records.
- Multi-region resilience.
- Fast operational workloads such as profiles, carts, content, device state, events, personalization, and catalog data.
- A partition-aware event/change-feed architecture.
- Operational document data and vector search in one managed service.[2][3][4]

## When not to use it

Cosmos DB is often a poor fit when you need:

- Many arbitrary joins across normalized tables.
- Cross-partition ACID transactions as a primary design requirement.
- Complex relational reporting and ad hoc analytics.
- A small, stable, low-throughput application where a relational database is simpler and less costly.
- A schema where no viable high-cardinality partition key exists.

For those workloads, Azure SQL, SQL Server, PostgreSQL, a data warehouse, or a separate search/analytics system may fit better.

## Interview answer

> Azure Cosmos DB is a fully managed, globally distributed database service optimized for low-latency, elastic, high-throughput operational workloads. Its native API for NoSQL stores JSON documents in containers, which scale through a partition key. The partition key is the most important design choice because it determines data distribution, hot-partition risk, point-read efficiency, transaction scope, and RU cost. Cosmos DB meters work in RUs, supports configurable consistency from eventual through strong, multi-region replication, automatic indexing, optimistic concurrency via ETags, and a Change Feed for event-driven processing. I use it for globally distributed document, IoT, personalization, and AI/vector workloads; I avoid it when the domain depends on relational joins or broad cross-partition transactions.[1][2][3][5]

## Sources

[1] Azure Cosmos DB documentation - Microsoft Learn https://learn.microsoft.com/en-us/azure/cosmos-db/
[2] Unified AI Database - Azure Cosmos DB - Microsoft Learn https://learn.microsoft.com/en-us/azure/cosmos-db/overview
[3] Common Azure Cosmos DB use cases - Microsoft Learn https://learn.microsoft.com/en-us/azure/cosmos-db/use-cases
[4] Azure Cosmos DB https://azure.microsoft.com/en-us/products/cosmos-db
[5] A technical overview of Azure Cosmos DB | Microsoft Azure Blog https://azure.microsoft.com/en-us/blog/a-technical-overview-of-azure-cosmos-db/
[6] When to Use Cosmos DB | Pulumi Blog https://www.pulumi.com/blog/when-to-use-azure-cosmos-db/
[7] Azure Cosmos DB Key features and Use-Cases - XenonStack https://www.xenonstack.com/insights/azure-cosmos-db
[8] Azure Cosmos DB documentation https://docs.azure.cn/en-us/cosmos-db/
[9] Cosmos DB - Wikipedia https://en.wikipedia.org/wiki/Cosmos_DB
[10] 7 Key Features of Azure Cosmos DB - AArete https://www.aarete.com/insights/7-key-features-of-azure-cosmos-db/
[11] Azure Cosmos DB Overview - Saigon Technology https://saigontechnology.com/blog/azure-cosmos-db-overview/
[12] Introduction to Azure Cosmos DB - GeeksforGeeks https://www.geeksforgeeks.org/devops/introduction-to-azure-cosmos-db/
[13] What is Azure Cosmos DB? - YouTube https://www.youtube.com/watch?v=hBY2YcaIOQM
[14] When to Use Cosmos DB? Going deep with Azure's distributed ... https://www.reddit.com/r/programming/comments/1gosqpl/when_to_use_cosmos_db_going_deep_with_azures/
[15] When to use Cosmos DB? - YouTube https://www.youtube.com/watch?v=XcB1Prpx-OE
