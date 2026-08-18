---
title: Geo Replication and Failover Groups
sidebar_label: Geo Replication
sidebar_position: 3
---

**Active geo-replication** creates readable secondary copies of individual Azure SQL Databases in other regions. **Failover groups** build on geo-replication to coordinate failover for a group of databases and provide stable read-write/read-only connection endpoints, so applications do not need connection-string changes after regional failover.[1][2][3]

## Core idea

Both features protect against a regional outage by replicating data to another Azure region.

```text
Primary region: East US
   └─ Primary Azure SQL Database
             |
             | asynchronous replication
             v
Secondary region: West US
   └─ Readable secondary Azure SQL Database
```

Replication is asynchronous, so a sudden regional failure can lose the most recently committed transactions that had not reached the secondary. Your actual recovery point objective (RPO) therefore depends on replication lag at the time of the outage.[4][5]

## Active geo-replication

Active geo-replication is configured **per database**. It lets one primary database replicate to up to four readable secondary databases, which can be placed in different Azure regions.[3][4]

```text
Primary: OrdersDb in East US
   ├─ Secondary: OrdersDb in West US
   ├─ Secondary: OrdersDb in West Europe
   └─ Secondary: OrdersDb in Southeast Asia
```

Each secondary is:

- Read-only.
- Asynchronously synchronized.
- Usable for reporting or geographically local read workloads.
- A potential manual/forced failover target.[1][3][4]

### Use geo-replication when

- You need one database replicated independently.
- You need more than one secondary region.
- You need read scale-out in several regions.
- You want manual control over which secondary becomes primary.
- Your databases do not need coordinated failover as one application unit.[3][4]

### Failover behavior

For active geo-replication, you manually promote a secondary:

```bash
az sql db replica set-primary \
  --name OrdersDb \
  --resource-group rg-orders \
  --server orders-westus
```

After promotion, your application must be able to connect to the new primary. If your application uses direct logical-server endpoints, that often means updating configuration, DNS, or connection strings unless you have built an abstraction around them.[1]

## Failover groups

A failover group is a named group of databases on one Azure SQL logical server that replicate and fail over together to one secondary logical server in another Azure region. It is a declarative abstraction built on active geo-replication.[2]

```text
Primary logical server: orders-eastus.database.windows.net
   ├─ OrdersDb
   ├─ BillingDb
   ├─ IdentityDb
   └─ ReportingDb
            |
            | Failover group
            v
Secondary logical server: orders-westus.database.windows.net
   ├─ OrdersDb secondary
   ├─ BillingDb secondary
   ├─ IdentityDb secondary
   └─ ReportingDb secondary
```

The key benefit is **coordinated failover**. If an application depends on several databases, failing over one without the others can produce inconsistent application behavior. A failover group switches its member databases together.[2][3]

## Stable listener endpoints

Failover groups provide two DNS listener endpoints that remain stable during geo-failover:[2]

| Endpoint            | Purpose                         |
| ------------------- | ------------------------------- |
| Read-write listener | Routes to the current primary   |
| Read-only listener  | Routes to the current secondary |

Conceptually:

```text
Read-write:
my-fog.database.windows.net
      |
      +--> East US primary before failover
      |
      +--> West US primary after failover

Read-only:
my-fog.secondary.database.windows.net
      |
      +--> West US secondary before failover
      |
      +--> East US secondary after failover
```

After failover, Azure updates DNS so the same listener name points to the new primary region. The application keeps using the same connection string.[2]

Example write connection string:

```text
Server=tcp:my-fog.database.windows.net,1433;
Initial Catalog=OrdersDb;
Authentication=Active Directory Default;
```

Example read-only connection string:

```text
Server=tcp:my-fog.secondary.database.windows.net,1433;
Initial Catalog=OrdersDb;
ApplicationIntent=ReadOnly;
Authentication=Active Directory Default;
```

Connection resiliency and retry logic are still required because existing connections break during failover and DNS/client caching can delay reconnection.

## Failover policies

A failover group supports two broad approaches.[2]

### Customer-managed failover

This is generally recommended.

```text
Azure regional incident detected
      |
      v
Operations team validates outage, replication state, and impact
      |
      v
Team initiates failover
      |
      v
Listener routes to secondary region
```

It avoids an automatic failover during a transient or partial outage and lets you control the recovery decision.

### Microsoft-managed automatic failover

You can configure automatic failover policy with a grace period. Azure initiates failover if the outage persists beyond that period.[2]

This can reduce RTO, but it has trade-offs:

- It may fail over when you would rather wait for the primary region to recover.
- The application must tolerate replica lag and failover disruption.
- Operations teams still need tested procedures for failback and post-failover validation.

## Geo-replication vs failover groups

| Concern                     | Active geo-replication                          | Failover group                                                   |
| --------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| Scope                       | Individual database                             | Group of databases on a logical server                           |
| Secondary targets           | Up to four readable secondaries                 | One secondary logical server/region per group                    |
| Regions                     | Can use multiple regions                        | One paired secondary region per group                            |
| Read scale                  | Multiple readable replicas possible             | Read-only listener to secondary group                            |
| Failover                    | Manual per database                             | Coordinated group failover; can be customer-managed or automatic |
| Stable application endpoint | Not built in at group level                     | Yes: read-write and read-only listeners                          |
| Best use                    | Independent DB replication / multi-region reads | Multi-database application DR with stable connection strings     |

[1][2][3][4]

## Example: multi-database application

Suppose an order-management application uses:

- `OrdersDb`
- `PaymentsDb`
- `IdentityDb`

With independent geo-replication, each database can fail over separately. That may be acceptable for isolated services, but dangerous if all three are required for the application to operate coherently.

```text
OrdersDb → West US: promoted
PaymentsDb → East US: still primary
IdentityDb → East US: still primary

Application is now split across regions.
```

A failover group is more appropriate:

```text
Failover group:
  OrdersDb + PaymentsDb + IdentityDb

East US outage
      |
      v
All group databases promoted together to West US
      |
      v
Read-write listener now resolves to West US
```

## Important limitations and design concerns

### Asynchronous replication

Neither feature eliminates the possibility of data loss during forced failover. Because replication is asynchronous, a write acknowledged by the primary may not yet exist on the secondary during a sudden outage.[4][5]

For financial or externally visible operations:

- Use idempotency keys.
- Use transactional outbox patterns for integration events.
- Reconcile after failover.
- Make downstream operations retry-safe.
- Define a business-accepted RPO explicitly.

### Read replica lag

Do not use a geo-secondary for a flow requiring immediate read-after-write consistency.

```text
Write order → primary succeeds
Immediately read order → geo-secondary
Possible result → order not visible yet
```

Use the current primary for confirmation, authorization, inventory, payment state, and other freshness-sensitive reads. Use replicas for reporting, dashboards, exports, and stale-tolerant reads.

### Failover groups are not a substitute for backup

Failover groups address regional availability and lower RTO. Backups address accidental deletion, logical corruption, ransomware, bad deployments, and point-in-time recovery. You need both.

### Server-level dependencies

A failover group replicates databases, but not every server-level setting or external dependency automatically follows. Plan and validate:

- Microsoft Entra ID / SQL authentication configuration.
- Firewall and private endpoint/network rules.
- Logins and users.
- SQL Agent jobs or external schedulers.
- Application secrets and managed identities.
- DNS, routing, monitoring, alerting, and key vault access.
- Dependencies such as Storage, Service Bus, Redis, and APIs.

Microsoft’s configuration guidance specifically notes that server logins and firewall settings should match between primary and secondary servers.[6]

## Recommended DR runbook

1. Define RPO and RTO per application/database.
2. Choose geo-replication for independent/multi-region database replicas, or a failover group for coordinated multi-database DR.
3. Use failover-group listener endpoints in application connection strings.
4. Enable resilient client retries and connection-pool recovery behavior.
5. Monitor replication health and lag.
6. Test planned failover regularly.
7. Test forced failover and reconciliation procedures.
8. Document recovery/failback ownership and communication.
9. Verify network, identity, firewall, secrets, and application dependencies in the secondary region.
10. Keep point-in-time restore and long-term backup strategy separate from geo-DR.

## Interview answer

> Active geo-replication asynchronously creates readable secondary copies of an individual Azure SQL Database, with up to four secondary replicas for regional DR and read scale-out. Failover groups are a higher-level abstraction over geo-replication that manage a set of databases on a logical server as one failover unit to a single secondary server in another region. Their main operational advantage is stable read-write and read-only listener endpoints: after failover, Azure updates DNS so the application does not need a connection-string change. I use geo-replication for independently replicated databases or multiple read regions, and failover groups for multi-database applications that need coordinated regional disaster recovery. In both cases, replication is asynchronous, so I design for possible data loss, replica lag, retries, and post-failover reconciliation.[2][3][4]

## Sources

[1] Tutorial: Geo-replication & failover in portal - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/active-geo-replication-configure-portal?view=azuresql
[2] Failover Groups Overview & Best Practices - Azure SQL Database https://learn.microsoft.com/en-us/azure/azure-sql/database/failover-group-sql-db?view=azuresql
[3] Active Geo-Replication - Azure SQL Database | Microsoft Learn https://learn.microsoft.com/en-us/azure/azure-sql/database/active-geo-replication-overview?view=azuresql
[4] Failover groups or Geo-Replication - Microsoft Q&A https://learn.microsoft.com/en-us/answers/questions/37772/failover-groups-or-geo-replication
[5] Azure SQL Database Disaster recovery - Microsoft Q&A https://learn.microsoft.com/en-us/answers/questions/1661517/azure-sql-database-disaster-recovery
[6] Configure a Failover Group - Azure SQL Database | Microsoft Learn https://learn.microsoft.com/en-us/azure/azure-sql/database/failover-group-configure-sql-db?view=azuresql
[7] Azure SQL Failover Group cannot add database after geo ... https://learn.microsoft.com/en-us/answers/questions/5668835/azure-sql-failover-group-cannot-add-database-after
[8] Geo-distributed Auto-failover Groups with Read-scale in Azure SQL ... https://learn.microsoft.com/en-us/shows/azure-sql-for-beginners/demo-geo-distributed-auto-failover-groups-with-read-scale-in-azure-sql-52-of-61
[9] Geo Replication,Failover Group and DB Copy, DB backup and restore https://learn.microsoft.com/en-us/answers/questions/2153024/geo-replication-failover-group-and-db-copy-db-back
[10] Geo-replication and Auto-failover Groups in Azure SQL - YouTube https://www.youtube.com/watch?v=oJCwbllnrwY
