# C# — Architect-Level Roadmap

## 1. Language Foundations

- Syntax, types, value vs reference types, boxing
- OOP: inheritance, polymorphism, interfaces vs abstract classes
- Generics, delegates, events, lambdas
- LINQ (deferred execution, IQueryable vs IEnumerable)
- Exception handling & custom exceptions
- Nullable reference types

## 2. Intermediate Language Features

- async/await, Task vs ValueTask, cancellation tokens
- Records, pattern matching, span/memory
- Extension methods, reflection basics
- Collections internals (List, Dictionary, concurrent collections)
- Dependency Injection (built-in DI container)

## 3. .NET Runtime & Performance

- CLR internals: GC generations, JIT, assembly loading
- Memory management, Span, Memory, struct vs class perf
- Threading, TPL, SynchronizationContext deadlocks
- Benchmarking (BenchmarkDotNet), profiling tools
- AOT compilation, trimming

## 4. Application Architecture

- SOLID, DDD (aggregates, value objects, bounded contexts)
- Clean Architecture / Onion / Hexagonal
- CQRS + MediatR, Event Sourcing
- Repository/Unit of Work patterns (when to avoid them)
- API design: REST, gRPC, GraphQL trade-offs

## 5. Microservices & Distributed Systems

- Service boundaries, saga pattern, outbox pattern
- Messaging: Service Bus, Kafka, RabbitMQ
- Resilience: Polly (retry, circuit breaker, bulkhead)
- Distributed tracing, correlation IDs, observability (OpenTelemetry)
- API gateways, BFF pattern

## 6. Data & Persistence

- EF Core: change tracking, migrations, performance pitfalls
- Dapper vs EF Core trade-offs
- Transaction management across services
- Caching strategies (in-memory, distributed/Redis)
- Multi-tenancy data patterns

## 7. Security & Identity

- Authentication/authorization (OAuth2, OIDC, Entra ID)
- Secrets management, Key Vault
- Secure coding (input validation, injection prevention)
- Zero-trust patterns in service-to-service auth

## 8. Cloud-Native & DevOps (Architect Focus)

- Containerization (Docker), Kubernetes (AKS) design
- CI/CD pipelines, blue-green/canary deployments
- Infrastructure as Code (Bicep/Terraform)
- Cost optimization, autoscaling strategies
- Multi-region/DR architecture

## 9. Quality & Governance

- Testing pyramid: unit, integration, contract testing (Pact)
- Architecture Decision Records (ADRs)
- Code quality gates, static analysis (Roslyn analyzers)
- Versioning & backward compatibility strategy

## 10. Architect-Level Soft Skills

- Trade-off articulation (build vs buy, sync vs async)
- Technical roadmapping, tech debt prioritization
- Stakeholder communication, RFC writing
- Team mentorship & code review standards
