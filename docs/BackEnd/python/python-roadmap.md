# Python — Architect-Level Roadmap

**1. Core Language Mastery**

- Data model (dunder methods, `__slots__`, descriptors, metaclasses)
- Memory model (references, GC, reference counting, weakrefs)
- Typing system (generics, protocols, `TypedDict`, `mypy`/`pyright` strictness)
- Decorators, context managers, generators/coroutines internals

**2. Concurrency & Performance**

- GIL internals, threading vs multiprocessing vs `asyncio`
- `asyncio` event loop, structured concurrency, task groups
- Profiling (`cProfile`, `py-spy`), C-extension hotspots, Cython/Rust interop
- Memory profiling and leak diagnosis at scale

**3. Application Architecture**

- Clean/Hexagonal/DDD patterns in Python
- Dependency injection patterns (no native DI container—idiomatic approaches)
- Plugin architectures, entry points, extensibility patterns
- Monolith → service decomposition strategies

**4. API & Service Design**

- FastAPI/Django/Flask trade-offs at scale
- REST, GraphQL, gRPC in Python ecosystems
- Async I/O boundaries, connection pooling, backpressure
- API versioning, contract testing (Pact), OpenAPI-driven design

**5. Data & Persistence**

- ORM internals (SQLAlchemy Core vs ORM), N+1 pitfalls
- Async DB drivers, connection pool tuning
- Caching layers (Redis patterns, cache invalidation strategies)
- Event sourcing/CQRS implementations in Python

**6. Distributed Systems**

- Message queues (Kafka, RabbitMQ, Celery) — idempotency, retries, DLQs
- Service discovery, circuit breakers, resilience (`tenacity`, `pybreaker`)
- Distributed tracing (OpenTelemetry), correlation IDs
- Saga patterns, eventual consistency handling

**7. Testing & Quality at Scale**

- Test pyramids, contract/property-based testing (`hypothesis`)
- Mutation testing, mocking async code
- Load/perf testing (`locust`), chaos testing approaches

**8. Packaging, Deployment & Ops**

- Packaging (`poetry`/`uv`, wheels, monorepo strategies)
- Dockerizing Python services (multi-stage builds, slim images)
- WSGI vs ASGI servers (gunicorn/uvicorn tuning)
- Observability: structured logging, metrics, SLOs

**9. Security & Compliance**

- Secrets management, dependency vulnerability scanning (`pip-audit`)
- AuthN/AuthZ patterns (OAuth2/OIDC libs), input validation at boundaries
- Supply-chain security (SBOMs, hash-pinning)

**10. Architect-Level Judgment**

- Python vs polyglot decisions (when NOT to use Python)
- Team scaling: typing discipline, linting/formatting standards (`ruff`, `black`) as org policy
- Migration strategy (Py2→3 lessons, major version upgrades)
- Cost/performance trade-offs (serverless vs containers vs bare metal)
