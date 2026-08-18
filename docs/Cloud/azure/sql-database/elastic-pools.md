---
title: Elastic Pools
sidebar_label: Elastic Pools
sidebar_position: 3
---

Azure SQL Database **Elastic Pools** let multiple Azure SQL single databases share one allocated pool of compute and storage resources. They are designed for many databases with different and unpredictable usage patterns—especially multi-tenant SaaS systems—so you pay for pooled capacity rather than overprovisioning every database individually.[1][2][3]

## Core idea

Without an elastic pool, every database gets its own compute allocation:

```text
Tenant A database → dedicated compute
Tenant B database → dedicated compute
Tenant C database → dedicated compute
```

If each tenant has occasional bursts but is mostly idle, you pay for idle capacity across many databases.

With an elastic pool:

```text
Elastic Pool: shared CPU, memory, I/O, and storage budget
   ├─ Tenant A database
   ├─ Tenant B database
   ├─ Tenant C database
   └─ Tenant D database
```

Each database can use more resources when it needs them, provided the pool has available capacity. The databases remain separate Azure SQL databases, but share the pool’s configured resource budget.[1][2]

## How it works

An elastic pool exists on a single Azure SQL logical server. You configure:

- Pool service tier.
- Total pool compute capacity, measured in **eDTUs** or **vCores**.
- Pool storage capacity.
- Minimum per-database performance allocation.
- Maximum per-database performance allocation.
- Which databases belong to the pool.[1][3][4]

```text
Pool capacity: 100 vCores-equivalent resource budget
   |
   +--> Database A: min 0, max 20
   +--> Database B: min 0, max 20
   +--> Database C: min 0, max 40
   +--> Database D: min 0, max 30
```

The sum of database maximums can be greater than the pool’s total capacity because not all databases are expected to peak simultaneously. However, the pool is the hard collective limit; a busy database cannot use resources that are already consumed by other databases.[1][2][4]

## Why it saves money

Elastic pools are based on the idea of **statistical multiplexing**: not every tenant or database has peak demand at the same time.

Example:

```text
100 tenant databases

Each tenant needs:
- 1 unit most of the time
- 10 units during occasional peak usage

Dedicated capacity:
100 × 10 = 1,000 units reserved

Shared elastic pool:
perhaps 250–400 units, if peaks are spread over time
```

The exact savings depend on usage distribution. If all databases peak together—such as a monthly billing job, a scheduled report, or a shared batch process—the pool can become saturated and provide little cost advantage.

Azure bills at the pool level for its configured resource capacity, not per individual pooled database.[1][3]

## Best use cases

Elastic pools are most useful for:

- Multi-tenant SaaS using **database-per-tenant** architecture.
- Hundreds or thousands of small-to-medium tenant databases.
- Departmental or line-of-business applications with many databases.
- Development, test, or sandbox databases.
- Franchise, branch, customer, or regional databases with different activity patterns.
- Workloads where each database has bursts at different times.[1][2][5]

Example:

```text
SaaS application
  ├─ tenant-acme-db
  ├─ tenant-contoso-db
  ├─ tenant-fabrikam-db
  └─ tenant-northwind-db

All databases:
  - remain isolated at database level
  - share Elastic Pool resources
  - can burst within configured per-database limits
```

## Elastic Pool vs single database

| Concern             | Single Azure SQL Database        | Elastic Pool                                       |
| ------------------- | -------------------------------- | -------------------------------------------------- |
| Resource allocation | Dedicated to one database        | Shared by many databases                           |
| Best workload       | Predictable, steady workload     | Variable, staggered workloads                      |
| Scaling unit        | One database                     | Entire pool                                        |
| Cost model          | Pay for each database’s capacity | Pay for collective pool capacity                   |
| Tenant isolation    | Separate database                | Separate database                                  |
| Noisy-neighbor risk | None from other databases        | Possible if pool is undersized or limits are loose |
| Best fit            | One/few important databases      | Large database fleet, especially SaaS tenants      |

[1][2][3]

## Elastic Pool vs Managed Instance

Elastic Pools and Managed Instance both support multiple databases, but their design goals differ.

| Concern                 | Elastic Pool                                              | Azure SQL Managed Instance                                                 |
| ----------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| Main purpose            | Cost-efficient resource sharing across many SQL databases | SQL Server instance compatibility and migration                            |
| Database model          | Collection of Azure SQL single databases                  | SQL Server–like managed instance                                           |
| Instance-level features | Limited/database-scoped                                   | Broad support for SQL Agent, linked servers, cross-database features, etc. |
| Resource sharing        | Shared pool with per-database min/max limits              | Shared instance resources                                                  |
| Typical fit             | Cloud-native multi-tenant SaaS                            | Existing SQL Server workload migration                                     |

Use an Elastic Pool when the problem is “I have many databases with uneven demand.” Use Managed Instance when the problem is “I need SQL Server instance behavior without running SQL Server on a VM.”[1][2]

## Capacity planning

The important question is not “How many databases can I put in a pool?” It is:

> What is the aggregate concurrent demand of all databases, including the worst realistic overlap?

Start by measuring each database:

- CPU utilization.
- Data I/O and log-write I/O.
- Peak versus average resource use.
- Query latency.
- Storage consumption and growth.
- Timing of scheduled workloads.
- Number of databases active simultaneously.

Microsoft recommends estimating the pool’s required eDTUs or vCores based on aggregate utilization and total storage, then comparing the pool cost with the cost of equivalent standalone databases.[1]

### Avoid synchronized peaks

Elastic Pools are less effective when databases run the same expensive job at the same time:

```text
02:00 AM:
  Tenant A maintenance job starts
  Tenant B maintenance job starts
  Tenant C maintenance job starts
  ...
```

Instead, stagger expensive tasks:

```text
02:00 AM → Tenant A
02:10 AM → Tenant B
02:20 AM → Tenant C
```

For cross-database maintenance or scheduled T-SQL tasks, Azure Elastic Jobs can run scripts across one or many databases.[6]

## Per-database min and max settings

Per-database controls help manage fairness:

- **Minimum resources:** reserves a baseline capacity for a database.
- **Maximum resources:** prevents one database from consuming too much of the pool.

```text
Pool: 200 eDTUs

Tenant A
  min: 0 eDTUs
  max: 50 eDTUs

Tenant B
  min: 0 eDTUs
  max: 30 eDTUs
```

A minimum of zero is common when databases can be idle, but setting many non-zero minimums reduces how much capacity remains genuinely shared. The combined minimums must fit within the pool capacity.[4]

Set maximums when you need to limit a noisy tenant, but do not set them so low that legitimate peak traffic is throttled.

## Scaling

You can scale an elastic pool’s compute and storage resources up or down. Databases can be added to or removed from a pool as needs change.[2][4]

```text
Normal season:
  200 vCore-equivalent pool capacity

Peak season:
  scale pool to 400 capacity

After peak:
  scale down again
```

Pool scaling is simpler than resizing hundreds of individual databases. Applications should still use resilient connection handling because scaling operations can cause brief connectivity interruptions.[4][7]

## Monitoring

Monitor both the **pool** and individual databases:

| Level    | What to watch                                                              |
| -------- | -------------------------------------------------------------------------- |
| Pool     | CPU, data I/O, log I/O, workers, sessions, storage, overall saturation     |
| Database | Resource usage, query performance, throttling, top queries, storage growth |
| Tenant   | Workload pattern, peak behavior, expensive queries, scheduled jobs         |

Warning signs of an undersized pool:

- High pool CPU/data I/O/log I/O for sustained periods.
- Increased query latency during peak windows.
- Resource-governance throttling.
- One tenant repeatedly reaching its database maximum.
- Many databases peaking together.

The correct fix may be a larger pool, better per-database limits, query/index improvements, workload scheduling changes, or moving an unusually demanding tenant to a dedicated database.

## Important limitations

Elastic Pools are not a universal cost-saving mechanism:

- All pooled databases must be on the **same logical server**.[1]
- The pool is a shared resource boundary; one tenant can affect others if limits and capacity are poorly designed.
- It does not provide Managed Instance–style SQL Server instance features.
- It does not turn databases into one transactional/database namespace; each database remains separate.
- Cross-database reporting/querying needs explicit architecture such as Elastic Query, ETL, a reporting store, or application-level aggregation.[2][5]
- A pool is not automatically cheaper if workloads are large, steady, or peak at the same time.

## Interview answer

> Azure SQL Elastic Pools are a cost and resource-management model for multiple Azure SQL single databases with variable demand. Instead of assigning compute to each tenant database independently, I allocate a shared pool of eDTUs or vCores and storage. Each database stays logically isolated but can consume shared capacity when needed, subject to configured per-database minimum and maximum limits. Elastic Pools are ideal for database-per-tenant SaaS, development/test fleets, and many databases with staggered usage. They are not ideal when databases have sustained dedicated demand or synchronized peaks, because all workloads compete for the same pool. I size the pool from aggregate concurrent usage, monitor pool saturation and tenant behavior, cap noisy databases, and move consistently heavy tenants to dedicated capacity when appropriate.[1][2][3][4]

## Sources

[1] Manage Multiple Databases with Elastic Pools - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/elastic-pool-overview?view=azuresql
[2] What is the Azure SQL Database service? - Microsoft Learn https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview?view=azuresql
[3] Pricing - Azure SQL Database Elastic Pool https://azure.microsoft.com/en-us/pricing/details/azure-sql-database/elastic/
[4] Manage elastic pools - Azure SQL Database | Microsoft Learn https://learn.microsoft.com/en-us/azure/azure-sql/database/elastic-pool-manage?view=azuresql
[5] Azure SQL Database elastic pools now generally available https://azure.microsoft.com/en-us/blog/azure-sql-database-elastic-pools-now-generally-available/
[6] Elastic Jobs Overview - Azure SQL Database | Microsoft Learn https://learn.microsoft.com/en-us/azure/azure-sql/database/elastic-jobs-overview?view=azuresql
[7] Scale Resources - Azure SQL Database & Azure SQL Managed ... https://learn.microsoft.com/en-us/azure/azure-sql/database/scale-resources?view=azuresql
[8] Hyperscale elastic pools overview - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/hyperscale-elastic-pool-overview?view=azuresql
[9] Azure Elastic Pool with Azure SQL Databases and MySQL databases https://stackoverflow.com/questions/68316633/azure-elastic-pool-with-azure-sql-databases-and-mysql-databases
[10] Understanding Elastic Pools in Azure SQL Database ... - Cert Library https://www.certlibrary.com/blog/understanding-the-key-differences-between-elastic-pools-and-elastic-queries-in-azure-sql-database/
[11] Database performance and scalability with Azure SQL ... - YouTube https://www.youtube.com/watch?v=Zhj_EiUEaFk
