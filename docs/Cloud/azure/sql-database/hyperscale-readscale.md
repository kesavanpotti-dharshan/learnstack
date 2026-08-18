---
title: Hyper Scale and Read Scale
sidebar_label: Hyperscale & Readscale
sidebar_position: 3
---

In Azure SQL Database, **Hyperscale** is a vCore service tier built for very large, high-throughput databases and fast scaling. **Read scale-out** is the practice of sending read-only workloads to secondary replicas so reporting, dashboards, and read-heavy APIs do not compete with the primary replica that handles writes.[1][2][3]

## Hyperscale in one picture

Traditional database architectures often tie compute, storage, and log capacity closely together. Hyperscale separates them so they can scale more independently.[2][4]

```text
                    ┌─────────────────────┐
Writes + primary    │ Primary compute node │
transactions        └──────────┬──────────┘
                               │ transaction log
                               v
                    ┌─────────────────────┐
                    │ Log service / log   │
                    │ processing          │
                    └──────────┬──────────┘
                               v
                    ┌─────────────────────┐
                    │ Distributed storage │
                    │ up to 128 TB        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              v                v                v
        HA replica       Named replica      Geo-replica
        read-only        read-only          read-only
```

This architecture enables a single Hyperscale database to grow from 10 GB up to **128 TB**, independently scale storage and compute, and scale compute without moving the full database data set.[1][2][4]

## What Hyperscale provides

Hyperscale is useful when ordinary General Purpose or Business Critical configurations cannot comfortably meet size, scale, performance, recovery, or read-replica requirements.

Key capabilities include:

- Storage scaling up to **128 TB** for a single database.[1][4]
- Rapid compute scale-up/scale-down without full data movement; Microsoft describes scaling as independent of database size.[1][4]
- High transaction-log throughput.
- Near-instantaneous backup architecture and fast restore characteristics compared with traditional architectures.[2][4]
- Read scale-out through high-availability replicas, named replicas, and geo-replicas.
- Up to **four high-availability replicas** and up to **30 named replicas**, subject to current service limits and configuration.[1][4]

Hyperscale is a **vCore-only** Azure SQL Database tier; it is not part of the DTU purchasing model.[4][5]

## Primary and secondary replicas

A Hyperscale database has one **primary compute node** that processes read-write transactions. Secondary nodes are read-only and serve one or more purposes: high availability, read scale-out, and geo-disaster recovery.[2][6]

| Replica type  | Main purpose                                    | Can serve reads? | Location         |
| ------------- | ----------------------------------------------- | ---------------: | ---------------- |
| Primary       | Writes and normal transactional workload        |              Yes | Primary region   |
| HA replica    | Hot standby and optional read offload           |              Yes | Primary region   |
| Named replica | Dedicated, independently scalable read workload |              Yes | Primary region   |
| Geo-replica   | Regional DR and geographic read scale-out       |              Yes | Secondary region |

[1][2][6]

## Read scale-out

Read scale-out routes eligible **read-only** connections to a readable secondary replica instead of the primary. This separates analytical/reporting/read-heavy work from write traffic.[3]

```text
                 ┌──────────────────────┐
Write API ──────>│ Primary replica       │
                 │ INSERT / UPDATE /     │
                 │ DELETE / transactions │
                 └──────────────────────┘

Reporting API ──>┌──────────────────────┐
Dashboard ──────>│ Read-only replica     │
Exports ────────>│ SELECT workloads      │
                 └──────────────────────┘
```

This helps when the primary is affected by:

- Dashboards with expensive aggregations.
- Reporting queries.
- Search/list APIs with high read volume.
- ETL/read-model extraction.
- Read-only analytics or BI workloads.
- Long-running queries that should not compete with transactional writes.[3]

### Connection routing

For Azure SQL Database, clients request read-only routing through the connection string:

```text
ApplicationIntent=ReadOnly
```

Example:

```csharp
var connectionString =
    "Server=tcp:mydb.database.windows.net,1433;" +
    "Initial Catalog=OrdersDb;" +
    "Authentication=Active Directory Default;" +
    "ApplicationIntent=ReadOnly;";
```

Write connections should use the normal read-write connection string without `ApplicationIntent=ReadOnly`.

Read scale-out is enabled by default for new Premium, Business Critical, and Hyperscale databases. For Hyperscale, it is automatically disabled when the database has zero secondary replicas. It is not available in Basic, Standard, or General Purpose tiers.[3]

## HA replicas vs named replicas

### High-availability replicas

HA replicas are primarily hot standbys for quick failover, but they can also offload read workload. Hyperscale can have up to four HA replicas, and these replicas have the same compute size as the primary.[1][2]

Use HA replicas when:

- You need additional local high availability.
- You have modest read offload needs.
- The read workload can use the same compute sizing as the primary.
- You want Azure-managed replica load balancing for read-only connections.

### Named replicas

A named replica is a dedicated, named, read-only compute node. It can have a different compute size from the primary, enabling independent sizing and better workload isolation. Hyperscale supports up to 30 named replicas.[1][4][6]

```text
Primary: 16 vCores
  ├─ HA replica: 16 vCores
  ├─ Reporting named replica: 32 vCores
  ├─ Dashboard named replica: 8 vCores
  └─ ETL named replica: 16 vCores
```

This is valuable when reporting needs more CPU than the write workload, or when one consumer should not affect another.

Use named replicas when:

- You need a stable endpoint for a specific workload.
- You need independent read compute sizing.
- You want to isolate BI from API reads.
- You need multiple dedicated read consumers.
- You are supporting hybrid transactional/analytical processing (HTAP).[2][4][6]

## Geo-replication and geographic reads

A geo-replica is placed in another Azure region. It serves two purposes:

1. **Disaster recovery** if the primary region becomes unavailable.
2. **Read scale-out closer to users in another region.**[1][2][4]

```text
Primary region: East US
  └─ Primary writes + local read replicas

Secondary region: West Europe
  └─ Geo-replica for DR + European read traffic
```

Geo-replication is asynchronous, so read data can lag behind the primary. It is suitable for workloads that tolerate replication delay, not read-after-write scenarios requiring immediate global consistency.

## Read consistency and replica lag

A read-only secondary is not the same as the primary:

- It does not accept writes.
- It can lag behind the primary because changes must be replicated.
- A user may write data to the primary and then not immediately see that update through a read-only connection.

Example:

```text
1. User places order → write succeeds on primary.
2. API immediately queries a read replica.
3. Replica has not replayed latest log yet.
4. API may not yet return the new order.
```

For read-your-own-write flows, confirmation pages, inventory-sensitive checks, or post-write validation, read from the **primary**. Route stale-tolerant workloads—reporting, dashboards, search, historical views—to replicas.

## Hyperscale vs Business Critical read scale

Both **Business Critical** and **Hyperscale** can support read scale-out.[3]

| Concern                         | Business Critical                              | Hyperscale                                                      |
| ------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| Main focus                      | Low-latency mission-critical workloads         | Extreme database size, elastic scaling, broad replica scale-out |
| Storage architecture            | Local SSD-based architecture                   | Distributed, scale-out storage                                  |
| Database size                   | Lower than Hyperscale limits                   | Up to 128 TB                                                    |
| Read replicas                   | Read scale-out support                         | HA replicas + up to 30 named replicas + geo-replica             |
| Independent read compute sizing | More limited                                   | Named replicas can be independently sized                       |
| Best fit                        | Low-latency OLTP with moderate scale-out needs | Huge database, heavy read scale-out, HTAP, rapid growth         |

[1][2][3][4]

## When to choose Hyperscale

Choose Hyperscale when you need:

- Database storage beyond conventional Azure SQL Database tiers.
- Rapid scale operations for a very large database.
- Very high log throughput or write throughput.
- Fast backup/restore behavior at multi-terabyte scale.
- Multiple read replicas and independently sized read workloads.
- Dedicated reporting, ETL, or analytical read paths.
- Regional read scale-out plus geo-disaster recovery.[1][2][4]

Do not choose Hyperscale merely because a database is “important.” A smaller General Purpose or Business Critical database can be simpler and less expensive if storage, throughput, and read-replica needs do not justify Hyperscale.

## Cost and operational trade-offs

Hyperscale’s flexibility comes with cost and architecture considerations:

- Primary and secondary compute resources incur cost.
- Named replicas are separately provisioned compute resources.
- Replica reads may be stale.
- Your application must deliberately route read-only workloads.
- Reporting query design still matters; a replica can be overloaded too.
- You should monitor primary CPU/log rate, replica CPU, replica lag, query duration, and read-routing behavior.

Read scale-out is not a substitute for efficient SQL, indexes, data modeling, caching, or a warehouse/lakehouse for heavy analytical workloads.

## Practical architecture example

```text
Order-processing app

Primary Hyperscale database
  ├─ Write API
  ├─ Checkout service
  └─ Inventory transactions

Named replica: Reporting
  ├─ Finance reports
  ├─ CSV exports
  └─ Power BI refresh workloads

Named replica: Read API
  ├─ Customer order history
  ├─ Product browse/search metadata
  └─ Dashboard queries

Geo-replica: West Europe
  ├─ European read traffic
  └─ Disaster-recovery failover target
```

Key rule:

```text
Strong freshness required?
  → Read primary

Staleness acceptable?
  → Read replica
```

## Interview answer

> Hyperscale is Azure SQL Database’s vCore tier for very large and high-throughput databases. Its architecture separates compute, log processing, and distributed storage, allowing storage up to 128 TB and compute scaling without moving the entire database. The primary replica handles writes; read-only HA replicas, named replicas, and geo-replicas can offload reads, provide high availability, and support disaster recovery. Read scale-out routes connections marked with `ApplicationIntent=ReadOnly` to a secondary, protecting the primary from reporting and dashboard load. I use it when the workload needs multi-terabyte scale, rapid scaling, heavy log throughput, or independently sized read replicas. I keep read-after-write and correctness-sensitive flows on the primary because replica reads can lag.[1][2][3][4]

## Sources

[1] Azure SQL Database Hyperscale FAQ - Microsoft Learn https://learn.microsoft.com/en-us/azure/azure-sql/database/service-tier-hyperscale-frequently-asked-questions-faq?view=azuresql
[2] Hyperscale distributed functions architecture - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/hyperscale-architecture?view=azuresql
[3] Read Queries on Replicas - Azure SQL Database ... - Microsoft Learn https://learn.microsoft.com/en-us/azure/azure-sql/database/read-scale-out?view=azuresql
[4] What is the Hyperscale service tier? - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/service-tier-hyperscale?view=azuresql
[5] vCore purchasing model - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/service-tiers-sql-database-vcore?view=azuresql
[6] Hyperscale secondary replicas - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/service-tier-hyperscale-replicas?view=azuresql
[7] Announcing Azure SQL Database Hyperscale public preview https://azure.microsoft.com/en-us/blog/announcing-azure-sql-database-hyperscale-public-preview/
[8] How can we scale the read operations on our SQL DB instance? https://learn.microsoft.com/en-us/answers/questions/2260692/how-can-we-scale-the-read-operations-on-our-sql-db
[9] Database performance and scalability with Azure SQL Database ... https://learn.microsoft.com/en-us/shows/data-exposed/database-performance-and-scalability-with-azure-sql-database-hyperscale-elastic-pools-data-exposed
[10] Azure SQL Database Hyperscale - LinkedIn https://www.linkedin.com/pulse/azure-sql-database-hyperscale-sachin-jain-pqiof
[11] Azure SQL DB Hyperscale and the Power of Named Replicas https://www.youtube.com/watch?v=FPU_I0S0Akg
