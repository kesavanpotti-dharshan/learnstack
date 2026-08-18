---
title: DTU and vCore
sidebar_label: DTU - vCore
sidebar_position: 3
---

In Azure SQL Database, **DTU** and **vCore** are two purchasing and capacity models. A DTU is a bundled performance unit combining CPU, memory, and I/O; a vCore model exposes compute capacity more transparently and lets you choose compute and storage more independently. For most new production workloads, the vCore model is usually the better default because it offers more flexibility, clearer sizing, Azure Hybrid Benefit, reservations, serverless options, and Hyperscale.[1][2][3]

## Core difference

```text
DTU model
  One bundled performance number
  = CPU + memory + data I/O + log I/O

vCore model
  Choose compute capacity + service tier + storage
  = more explicit sizing and pricing control
```

| Concern                     | DTU model                     | vCore model                                            |
| --------------------------- | ----------------------------- | ------------------------------------------------------ |
| Unit of capacity            | DTU / eDTU                    | Virtual cores                                          |
| CPU, memory, I/O visibility | Bundled and abstracted        | More transparent                                       |
| Compute and storage         | Bundled/preconfigured         | More independently configurable                        |
| Best for                    | Simple, predictable workloads | Most new, production, migration, or advanced workloads |
| Azure Hybrid Benefit        | No                            | Yes                                                    |
| Reserved capacity pricing   | No                            | Yes                                                    |
| Serverless                  | No                            | Yes                                                    |
| Hyperscale                  | No                            | Yes                                                    |
| Azure SQL Managed Instance  | Not supported                 | Required                                               |

[1][2][3][4]

## DTU: Database Transaction Unit

A **Database Transaction Unit (DTU)** is a Microsoft-defined blended measure of:

- CPU
- Memory
- Data reads
- Data writes
- Transaction-log writes[2][3]

You do not separately choose CPU cores, RAM, or IOPS. Instead, you select a preconfigured service objective, such as a number of DTUs.

```text
Example conceptually:

100 DTUs
  = a predefined blend of CPU + memory + read/write capacity
```

For elastic pools, the equivalent unit is an **eDTU**—Elastic Database Transaction Unit.

### DTU tiers

The DTU model uses these broad tiers:

| DTU tier | Typical use                                                      |
| -------- | ---------------------------------------------------------------- |
| Basic    | Small, low-volume, development/test workloads                    |
| Standard | General business applications                                    |
| Premium  | Higher-performance workloads with lower-latency I/O requirements |

The precise resource limits vary by service objective, but the important idea is that the bundle is fixed. If your workload needs more storage but not more CPU, or more log I/O but not more memory, you often need to move to a larger bundle anyway.[2][3]

### DTU example

```text
Small SaaS database
  → Standard 100 DTUs

Workload grows
  → Scale to Standard 200 DTUs

The upgrade changes the whole resource bundle:
CPU + memory + I/O capacity together
```

DTU is convenient because it is simple, but it gives less control and less transparency into the actual hardware resources allocated.

## vCore: virtual core model

The **vCore model** lets you choose the number of virtual CPU cores and the service tier, with clearer information about compute, memory, storage, and hardware configuration.[1][2]

```text
Example:

General Purpose
  4 vCores
  256 GB storage

Business Critical
  8 vCores
  1 TB storage
```

The model separates key decisions:

1. **Service tier** — General Purpose, Business Critical, or Hyperscale.
2. **Compute tier** — provisioned or serverless where supported.
3. **vCore count** — compute capacity.
4. **Storage amount** — configured separately within service limits.
5. **Hardware generation/configuration** — available options depend on region and tier.[1][2]

### vCore service tiers

| Tier              | Typical fit                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| General Purpose   | Standard business workloads; balanced performance and cost                                               |
| Business Critical | Low-latency, I/O-intensive, mission-critical workloads; local SSD architecture and read-scale capability |
| Hyperscale        | Very large databases and high-scale storage/compute requirements                                         |

The vCore model offers higher limits and more hardware/resource transparency than DTU, and it is the only model supporting Hyperscale.[1][3]

## Provisioned vs serverless compute

The vCore model provides two compute approaches.[2]

### Provisioned compute

You select a fixed vCore capacity:

```text
8 vCores provisioned
→ billed while available
→ predictable capacity and performance
```

Use provisioned compute for steady production workloads with consistent demand.

### Serverless compute

Azure automatically scales compute based on workload demand, and eligible configurations can auto-pause after inactivity.

```text
Minimum vCores ── Azure scales up/down ── Maximum vCores
```

Use serverless for:

- Development/test databases.
- Intermittent or low-duty-cycle applications.
- Databases with idle periods.
- Workloads where operational simplicity matters more than perfectly predictable low latency.

Serverless is billed based on compute consumption while the database is online, subject to configured minimums and related billing rules. It is not automatically cheaper for a busy 24/7 database.[2][3]

## Licensing and cost advantages

The vCore model supports:

- **Azure Hybrid Benefit**, allowing eligible SQL Server licenses with Software Assurance to reduce cost.
- **Reserved capacity pricing**, which can reduce cost for predictable long-running workloads.[1][2][3]

These options are unavailable in the DTU model.

```text
Existing eligible SQL Server licenses?
      |
      +--> vCore model may enable Azure Hybrid Benefit

Steady long-term database use?
      |
      +--> vCore reserved capacity may reduce cost
```

## Which should you choose?

### Choose DTU when

- You want the simplest possible configuration.
- You have a small, straightforward database.
- You are maintaining an existing DTU-based deployment.
- You do not need serverless, Hyperscale, license benefits, or detailed hardware planning.
- You can size performance through testing rather than capacity planning.[2][3]

### Choose vCore when

- You are deploying a new production database.
- You need clearer compute, memory, storage, and hardware planning.
- You want independent storage scaling.
- You have eligible SQL Server licenses for Azure Hybrid Benefit.
- You want reserved capacity.
- You need serverless, Hyperscale, or Azure SQL Managed Instance.
- You are migrating from on-premises SQL Server and want a more transparent mapping to CPU capacity.[1][2][3]

## DTU-to-vCore conversion

There is no exact universal formula because DTUs are a blended benchmark, not literal CPU-core counts. The actual right vCore size depends on query patterns, storage latency, concurrency, memory pressure, and I/O behavior.

Microsoft provides a rough starting point for migration:

- About **100 DTUs** in Basic/Standard can require at least **1 vCore**.
- About **125 DTUs** in Premium can require at least **1 vCore**.

Treat this as an initial estimate, then load test and monitor after migration.[5]

```text
100 DTUs ≠ exactly 1 vCore

It is only a rough migration starting point,
not a performance equivalence guarantee.
```

Migration between DTU and vCore is supported, with behavior similar to changing service objectives and typically a minimal connectivity interruption near the end of the transition.[5]

## Practical example

A small customer portal database has:

- 20 GB storage.
- Low usage overnight.
- Occasional daytime bursts.
- No existing SQL Server licenses.

A vCore serverless General Purpose database may be a good candidate because compute can scale with demand and, in eligible configuration, pause during inactivity.

A 24/7 order-processing system has:

- Stable load.
- Predictable CPU use.
- 500 GB storage.
- Eligible SQL Server Enterprise licenses with Software Assurance.

A provisioned vCore database may be a better fit because it supports predictable capacity, potential reserved-capacity savings, and Azure Hybrid Benefit.

## Interview answer

> DTU and vCore are Azure SQL Database purchasing models. A DTU is a bundled performance unit that combines CPU, memory, and I/O into one preconfigured capacity level, so it is simple but less transparent and less flexible. The vCore model lets me choose a service tier, vCore count, storage, and in some cases hardware and serverless behavior. It supports Azure Hybrid Benefit, reserved capacity, serverless, Hyperscale, and is required for Managed Instance. I use DTU mainly for simple or existing deployments; for new production workloads, migrations, or workloads needing cost and capacity control, I generally choose vCore.[1][2][3]

## Sources

[1] vCore purchasing model - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/service-tiers-sql-database-vcore?view=azuresql
[2] Purchasing Models - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/purchasing-models?view=azuresql
[3] DTU-Based Purchasing Model - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/service-tiers-dtu?view=azuresql
[4] DTU and vCore differnces when to use ... https://learn.microsoft.com/en-us/answers/questions/1047748/dtu-and-vcore-differnces-when-to-use-dtu-and-when
[5] Migrate from DTU to vCore - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/migrate-dtu-to-vcore?view=azuresql
[6] Azure SQL Database - How to choose the correct specs https://learn.microsoft.com/en-us/answers/questions/1178964/azure-sql-database-how-to-choose-the-correct-specs
[7] How to Choose Between DTU and vCore Purchasing ... https://oneuptime.com/blog/post/2026-02-16-how-to-choose-between-dtu-and-vcore-purchasing-models-in-azure-sql-database/view
[8] DTU vs. vCore - What's the Difference? https://pragmaticworks.com/blog/dtu-vs-vcore-whats-the-difference
[9] Azure SQL using all DTU https://www.reddit.com/r/AZURE/comments/1d0f248/azure_sql_using_all_dtu/
