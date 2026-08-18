---
title: Azure SQL Managed Instance
sidebar_label: SQL Managed Instance
sidebar_position: 1
---

Azure SQL Managed Instance (MI) is a fully managed **Platform as a Service (PaaS)** offering that provides near-full SQL Server instance compatibility in Azure. It is designed mainly for moving existing SQL Server workloads to Azure with minimal application changes, while Microsoft manages the underlying OS, SQL patching, backups, high availability, and much of the infrastructure.[1][2]

## What it is

Think of Azure SQL Managed Instance as:

```text
SQL Server instance compatibility
        +
Azure PaaS operations
        =
Azure SQL Managed Instance
```

It is not a SQL Server VM. With SQL Server on an Azure VM, you manage the Windows/Linux OS, SQL Server installation, patching, backups, clustering, and high availability configuration. With Managed Instance, Microsoft runs and maintains that platform for you.[1][2]

At the same time, it is more instance-oriented and SQL Server-compatible than Azure SQL Database.

## Why it exists

Azure SQL Database is an excellent managed relational database, but some existing SQL Server applications depend on **instance-level capabilities** or SQL Server behavior that are not fully available in a single Azure SQL Database.

Managed Instance targets those workloads, especially when they use:

- SQL Server Agent jobs.
- Cross-database queries.
- Linked servers.
- SQL CLR.
- Instance-level logins and configuration.
- SQL Server–style `USE` database context behavior.
- Database Mail and other SQL Server ecosystem features.
- Vendor/ISV applications designed for SQL Server.[1][2][3]

The goal is to make lift-and-shift modernization less disruptive than rewriting an application for a different database platform.

## Core architecture

A Managed Instance is deployed inside your Azure **Virtual Network (VNet)** in a dedicated subnet. It receives a VNet-local IP address and can communicate privately with applications in the same VNet, peered VNets, or connected on-premises networks through VPN or ExpressRoute.[1][4]

```text
On-premises network
        |
   VPN / ExpressRoute
        |
Azure VNet
 ├─ App subnet
 │    └─ App/API services
 │
 └─ Dedicated SQL MI subnet
      └─ Azure SQL Managed Instance
           ├─ Database A
           ├─ Database B
           └─ SQL Server–compatible instance features
```

This makes MI a strong fit for organizations that need private, enterprise-style database connectivity and hybrid migration paths.

## What Microsoft manages

Managed Instance handles many operational tasks automatically:

- Underlying infrastructure provisioning.
- SQL Server and operating-system patching.
- Version upgrades.
- Automated backups.
- Point-in-time restore.
- Built-in high availability.
- Monitoring platform operations.
- Availability SLA and optional zone redundancy.
- Automatic tuning and engine-level platform capabilities.[1][2]

You still manage:

- Database schemas, tables, indexes, stored procedures, functions, and query design.
- Users, permissions, and data access policy.
- Application connection strings and networking integration.
- Performance tuning at the workload/database level.
- Data migration, data retention, and business continuity design.
- Cost, sizing, and capacity decisions.

```text
Microsoft manages:
OS + SQL patching + backups + HA + platform

You manage:
Data + schema + queries + security + workload performance
```

## Service tiers

Managed Instance offers tiers designed for different cost and performance requirements. The major choices include **General Purpose** and **Business Critical**.[5]

| Tier                     | Typical fit                                            | Characteristics                                                                    |
| ------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| General Purpose          | Most business workloads                                | Balanced price/performance; remote premium storage architecture                    |
| Next-gen General Purpose | Workloads needing improved performance characteristics | Newer General Purpose platform option where available                              |
| Business Critical        | Low-latency, I/O-intensive, mission-critical workloads | Local SSD-based storage architecture and an additional read-only secondary replica |

The Business Critical tier includes an additional built-in copy that can support read-only workloads.[5]

Choose based on measured CPU, memory, storage latency/IOPS, read scale requirements, recovery requirements, and cost—not merely because a workload is “important.”

## High availability and backups

Managed Instance has built-in high availability and automated backup mechanisms. It supports point-in-time restore and configurable backup retention, and users can initiate backups that can be restored to SQL Server 2022 in supported scenarios.[1]

For stronger resilience, Azure supports zone redundancy options in applicable configurations, helping protect against an Availability Zone failure.[1][5]

This does not eliminate all responsibility: you still need to define RPO/RTO requirements, test restore procedures, plan regional disaster recovery, and validate that your selected tier/configuration meets business needs.

## Key capabilities

Managed Instance is particularly valuable because it retains familiar SQL Server capabilities while being PaaS.[1][2]

| Capability                          | Why it matters                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| Near-full SQL Server compatibility  | Reduces code and database changes during migration                                |
| SQL Server Agent                    | Supports scheduled jobs and maintenance/application automation                    |
| Cross-database queries              | Helps applications that treat several databases as one instance-level environment |
| Linked servers                      | Helps some hybrid and integration scenarios                                       |
| SQL CLR                             | Supports applications that rely on CLR database code                              |
| Native VNet deployment              | Enables private enterprise network topology                                       |
| Automatic backups and patching      | Reduces DBA/operations workload                                                   |
| Built-in HA                         | Avoids self-managing SQL clustering on VMs                                        |
| Azure identity/security integration | Supports cloud governance and security controls                                   |

## Managed Instance vs Azure SQL Database vs SQL Server on Azure VM

| Concern                  | Azure SQL Database                  | Azure SQL Managed Instance              | SQL Server on Azure VM                                          |
| ------------------------ | ----------------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| Service model            | PaaS database                       | PaaS managed SQL Server–like instance   | IaaS                                                            |
| SQL Server compatibility | High, but database-scoped           | Near-full instance compatibility        | Full control/compatibility                                      |
| SQL Server Agent         | Limited/different patterns          | Supported                               | Supported                                                       |
| Cross-database features  | More limited                        | Supported for common instance scenarios | Supported                                                       |
| OS access                | No                                  | No                                      | Yes                                                             |
| Patching/backups/HA      | Microsoft-managed                   | Microsoft-managed                       | Customer largely manages/configures                             |
| Network model            | Public/private options              | Native VNet deployment                  | Full VNet control                                               |
| Best fit                 | Cloud-native apps and new databases | SQL Server lift-and-shift modernization | Workloads requiring OS/instance control or unsupported features |
| Operational overhead     | Lowest                              | Low                                     | Highest                                                         |

Managed Instance is usually the middle ground: more SQL Server compatibility than Azure SQL Database, but far less infrastructure management than SQL Server on a VM.[1][2][4][6]

## Example use case

Assume a company has an on-premises order-management system with:

- Five databases in one SQL Server instance.
- Cross-database reporting queries.
- SQL Server Agent jobs for nightly reconciliation.
- A linked server to a legacy on-premises database.
- A vendor application that expects standard SQL Server instance behavior.

Moving directly to Azure SQL Database may require substantial application redesign. Moving to SQL Server on a VM preserves compatibility but keeps most patching, backups, and high-availability work with the company.

Azure SQL Managed Instance is often a practical migration target:

```text
On-prem SQL Server
  ├─ Multiple databases
  ├─ SQL Agent jobs
  ├─ Cross-database queries
  └─ Linked server dependencies
          |
          v
Azure SQL Managed Instance
  ├─ Preserves many SQL Server behaviors
  ├─ Runs privately inside VNet
  └─ Azure manages backups, patching, and HA
```

## When to use it

Use Azure SQL Managed Instance when:

- You are migrating existing SQL Server workloads with significant instance-level dependencies.
- You need SQL Server Agent, cross-database queries, linked servers, SQL CLR, or similar features.
- You want private VNet-integrated connectivity.
- You need to migrate many SQL Server databases with minimal code changes.
- You want PaaS operational benefits without giving up important SQL Server compatibility.[1][2][4]

## When not to use it

Managed Instance may not be the best choice when:

- You are building a new cloud-native application with a single database and no instance-level dependencies.
- Azure SQL Database provides all required features at lower complexity or cost.
- You need full OS-level access, custom SQL Server installation settings, unsupported extensions, or specialized drivers—use SQL Server on Azure VM.
- You require a non-SQL Server relational engine, such as PostgreSQL.
- Your workload is small, intermittent, or cost-sensitive and does not justify an instance-oriented managed service.

## Migration considerations

Before migrating, assess:

- SQL Server feature compatibility.
- SQL Agent jobs and maintenance scripts.
- Linked servers and external dependencies.
- Authentication strategy, including Microsoft Entra ID and Windows authentication requirements.
- Networking: VNet, delegated subnet, DNS, VPN/ExpressRoute, firewall rules.
- Database size, migration downtime tolerance, RPO/RTO, and rollback strategy.
- Performance baseline: CPU, memory, IOPS, log-write latency, query plans, and peak concurrency.

Microsoft positions Managed Instance as a migration-friendly platform for custom and vendor-provided applications, and Azure Migrate/Azure Data Studio assessment tooling can help identify compatibility issues.[1][2]

## Interview answer

> Azure SQL Managed Instance is a fully managed PaaS database service that provides near-full SQL Server instance compatibility in Azure. It is aimed at organizations moving existing SQL Server workloads to the cloud with minimal changes, especially workloads that depend on SQL Server Agent, cross-database queries, linked servers, SQL CLR, and private VNet connectivity. Microsoft manages provisioning, OS and SQL patching, backups, upgrades, and built-in high availability, while customers manage schemas, data, permissions, queries, and workload performance. I choose Managed Instance when Azure SQL Database lacks required instance-level features and SQL Server on a VM would create unnecessary infrastructure-management overhead.[1][2][4]

## Sources

[1] What is Azure SQL Managed Instance? - Microsoft Learn https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/sql-managed-instance-paas-overview?view=azuresql
[2] Azure SQL Managed Instance https://azure.microsoft.com/en-us/products/azure-sql/managed-instance
[3] Introducing Azure SQL Database Managed Instance - YouTube https://www.youtube.com/watch?v=W8feSZXm2Ec
[4] Connectivity Architecture - Azure SQL Managed Instance https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/connectivity-architecture-overview?view=azuresql
[5] Overview of Azure SQL Managed Instance resource limits https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/resource-limits?view=azuresql
[6] Azure SQL Database and Azure SQL Managed Instance https://learn.microsoft.com/en-us/answers/questions/1522000/azure-sql-database-and-azure-sql-managed-instance
[7] Azure SQL Managed Instance Overview (6 of 61) - Microsoft Learn https://learn.microsoft.com/en-us/shows/azure-sql-for-beginners/azure-sql-managed-instance-overview-6-of-61
[8] What extra one gets by selecting Azure SQL Managed Instance vis-a ... https://stackoverflow.com/questions/64065118/what-extra-one-gets-by-selecting-azure-sql-managed-instance-vis-a-vis-azure-sql
[9] Security Overview - Azure SQL Database & Azure SQL Managed ... https://learn.microsoft.com/en-us/azure/azure-sql/database/security-overview?view=azuresql
[10] Azure SQL Managed Instance new platform features - Microsoft Learn https://learn.microsoft.com/en-us/shows/data-exposed/azure-sql-managed-instance-new-platform-features-data-exposed-pass-summit
