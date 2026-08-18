---
title: EF Core — Architect-Level Roadmap
sidebar_label: EF Core - Topics
sidebar_position: 1
---

**1. Foundations**

- DbContext/DbSet lifecycle, Change Tracker, Unit of Work pattern
- Providers (SQL Server, PostgreSQL/Npgsql, SQLite, Cosmos)
- Code-First vs DB-First, Migrations basics

**2. Modeling & Mapping**

- Fluent API vs Data Annotations
- Relationships (1:1, 1:N, N:N, owned entities, shadow properties)
- Value Objects & Owned Types, Complex Types
- Table splitting, Entity splitting, Inheritance (TPH/TPT/TPC)
- Global query filters, Value Converters

**3. Querying**

- LINQ-to-Entities translation internals
- Eager/Lazy/Explicit loading — tradeoffs
- Projections (Select) vs full entity loads
- Compiled queries, Raw SQL (FromSqlRaw/Interpolated), Stored Procs
- Split queries vs single query (cartesian explosion)
- AsNoTracking/AsNoTrackingWithIdentityResolution

**4. Performance & Scalability**

- N+1 detection & mitigation
- Query batching, bulk insert/update/delete strategies
- Connection resiliency, retry policies (transient fault handling)
- Second-level/output caching strategies
- Compiled models (startup perf), DbContext pooling
- Read replicas & CQRS query-side offloading

**5. Transactions & Concurrency**

- Optimistic vs pessimistic concurrency (RowVersion/Timestamp)
- Explicit transactions, TransactionScope, distributed transactions
- SaveChanges internals, batching commands
- Isolation levels & their tradeoffs

**6. Architecture Patterns**

- Repository/UoW: when it adds value vs anti-pattern over EF Core
- DbContext per request vs per operation (lifetime scoping in DI)
- Multi-tenancy strategies (shared schema, schema-per-tenant, DB-per-tenant)
- CQRS integration (write model via EF, read model via Dapper/raw SQL)
- Domain-Driven Design mapping (aggregate boundaries vs EF navigation graphs)
- Bounded contexts → multiple DbContexts per microservice

**7. Migrations at Scale**

- Zero-downtime migration strategies (expand/contract pattern)
- Idempotent scripts, migration bundles for CI/CD
- Managing migrations across microservices/teams

**8. Testing**

- In-memory provider pitfalls vs SQLite in-memory vs Testcontainers
- Integration testing strategies for repositories/queries

**9. Observability & Ops**

- Query logging/interceptors, diagnostic events
- Integrating with OpenTelemetry/App Insights
- Detecting slow queries, execution plan analysis via EF logs

**10. Advanced/Architect Decisions**

- EF Core vs Dapper vs hybrid — when to choose what
- Scaling writes: sharding considerations
- Handling large datasets (streaming with IAsyncEnumerable)
- Schema evolution strategy for long-lived systems
- Security: SQL injection surface with raw SQL, row-level security integration
