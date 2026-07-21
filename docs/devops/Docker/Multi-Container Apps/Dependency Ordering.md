## Dependency Ordering in Docker Compose: `depends_on` and Healthchecks

When running multi-container applications, you often need to ensure services start in the correct order—for example, a database must be ready before your API tries to connect to it. Docker Compose provides two mechanisms for this: **`depends_on`** (basic startup order) and **healthchecks** (ensuring services are actually ready). [docs.docker](https://docs.docker.com/compose/how-tos/startup-order/)

---

## The Problem: Why Dependency Ordering Matters

Consider this typical scenario:

```yaml
# ❌ Problematic: No dependency control
services:
  api:
    image: myapi:latest
    # Tries to connect to postgres immediately

  db:
    image: postgres:15
    # Takes 10-30 seconds to initialize
```

**What happens**:

1. Docker Compose starts both containers **in parallel**
2. API container starts and immediately tries to connect to `postgres:5432`
3. PostgreSQL is still initializing (creating databases, users, etc.)
4. API crashes with "connection refused" error [youtube](https://www.youtube.com/watch?v=pCY6khpKqM4)

**Solution**: Use `depends_on` with healthchecks to ensure the database is **ready**, not just started. [docker](https://docker.recipes/docs/healthchecks-dependencies)

---

## 1. `depends_on`: Basic Startup Order

### Short Syntax (Simple but Limited)

```yaml
services:
  api:
    image: myapi:latest
    depends_on:
      - db # db starts before api

  db:
    image: postgres:15
```

**What it does**:

- ✅ Ensures `db` container **starts** before `api`
- ✅ Stops containers in reverse order (api first, then db)
- ❌ **Does NOT wait for `db` to be ready**—only that it's running [docs.docker](https://docs.docker.com/compose/how-tos/startup-order/)

**The catch**: A container can be "running" but not yet "ready" (e.g., PostgreSQL process started but not accepting connections). [denhox](https://denhox.com/posts/forget-wait-for-it-use-docker-compose-healthcheck-and-depends-on-instead/)

---

### Long Syntax (Advanced with Conditions)

```yaml
services:
  api:
    image: myapi:latest
    depends_on:
      db:
        condition: service_healthy # Wait until db is healthy
      redis:
        condition: service_started # Just wait for redis to start
      migrations:
        condition: service_completed_successfully # Wait for migrations to finish
```

**Available conditions**: [youtube](https://www.youtube.com/watch?v=pCY6khpKqM4)

| Condition                            | Description                                      | Use Case                       |
| ------------------------------------ | ------------------------------------------------ | ------------------------------ |
| **`service_started`**                | Default: Wait for container to start             | Simple services (Redis, Nginx) |
| **`service_healthy`**                | Wait for healthcheck to pass                     | Databases (PostgreSQL, MySQL)  |
| **`service_completed_successfully`** | Wait for one-time container to exit successfully | Migration scripts, init jobs   |

---

## 2. Healthchecks: Defining "Ready"

A **healthcheck** is a command Docker runs periodically to determine if a container is healthy (ready to accept connections). [docker](https://docker.recipes/docs/healthchecks-dependencies)

### Healthcheck Configuration

```yaml
services:
  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myapp"] # Command to run
      interval: 10s # Run every 10 seconds
      timeout: 5s # Wait 5 seconds for response
      retries: 5 # Mark unhealthy after 5 failures
      start_period: 30s # Grace period for slow-starting services
```

**How it works**:

1. Docker runs `pg_isready -U postgres -d myapp` every 10 seconds
2. If command exits with code `0` → container is **healthy**
3. If command exits with code `1` → container is **unhealthy**
4. After 5 consecutive failures → container marked unhealthy
5. `start_period` (30s) gives PostgreSQL time to initialize before counting failures [docs.docker](https://docs.docker.com/compose/how-tos/startup-order/)

---

### Common Healthcheck Examples

#### PostgreSQL

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  interval: 5s
  timeout: 5s
  retries: 5
  start_period: 30s
```

`pg_isready` is a built-in PostgreSQL utility that checks if the server accepts connections. [denhox](https://denhox.com/posts/forget-wait-for-it-use-docker-compose-healthcheck-and-depends-on-instead/)

#### MySQL/MariaDB

```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 5s
  timeout: 5s
  retries: 5
  start_period: 30s
```

#### Redis

```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 5s
  timeout: 3s
  retries: 3
```

Sends `PING` command—expects `PONG` response. [youtube](https://www.youtube.com/watch?v=pCY6khpKqM4)

#### MongoDB

```yaml
healthcheck:
  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

#### HTTP-Based Services (APIs, Web Apps)

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

Or using `wget`:

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
```

#### .NET Core Applications

```yaml
# In Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
CMD curl -f http://localhost:8080/health || exit 1
```

**Better**: Use ASP.NET Core's built-in health endpoints:

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

---

## Combining `depends_on` + Healthchecks

### Complete Example: API + Database + Cache

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - backend

  # Redis Cache
  redis:
    image: redis:alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3
    networks:
      - backend

  # .NET Core API
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    environment:
      - ConnectionStrings__Default=Server=db;Database=myapp;User=postgres;Password=secret
    depends_on:
      db:
        condition: service_healthy # Wait for db to be ready
      redis:
        condition: service_healthy # Wait for redis to be ready
    ports:
      - "5000:8080"
    networks:
      - backend
    restart: unless-stopped

  # Database Migrations (runs once, then exits)
  migrations:
    build:
      context: ./api
      dockerfile: Dockerfile
    command: dotnet ef database update
    depends_on:
      db:
        condition: service_healthy # Wait for db to be ready
    networks:
      - backend
    restart: "no" # Don't restart after completion

  # Frontend (React, Vue, etc.)
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - api # Wait for api to start (not necessarily healthy)
    networks:
      - frontend

networks:
  backend:
    driver: bridge
  frontend:
    driver: bridge

volumes:
  db-data:
```

**Startup order**:

1. `db` starts first (healthcheck runs every 5s)
2. `redis` starts (healthcheck runs every 5s)
3. After ~30s, `db` healthcheck passes → `db` is healthy
4. `migrations` starts (waits for `db` to be healthy), runs, exits
5. `api` starts (waits for both `db` and `redis` to be healthy)
6. `web` starts (waits for `api` to start) [docker](https://docker.recipes/docs/healthchecks-dependencies)

---

## Checking Health Status

### View Container Health

```bash
# Check health status of all containers
docker compose ps

# Output example:
# NAME                STATUS
# myapp-db-1          healthy (starting)
# myapp-redis-1       healthy
# myapp-api-1         starting
# myapp-web-1         running
```

### Inspect Health Details

```bash
# Detailed health information
docker inspect myapp-db-1 --format '{{json .State.Health}}' | jq

# Output:
# {
#   "Status": "healthy",
#   "FailingStreak": 0,
#   "Log": [
#     {"Start": "2024-01-01T12:00:00Z", "End": "2024-01-01T12:00:01Z", "ExitCode": 0, "Output": "..."},
#     {"Start": "2024-01-01T12:00:10Z", "End": "2024-01-01T12:00:11Z", "ExitCode": 0, "Output": "..."}
#   ]
# }
```

### View Health Logs

```bash
# See healthcheck command output
docker logs myapp-db-1

# Or watch in real-time
docker logs -f myapp-db-1
```

---

## Best Practices

### 1. Use Healthchecks for Databases, Not Simple Services

```yaml
# ✅ Good: Databases need healthchecks
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]

# ✅ Good: Simple services don't need healthchecks
nginx:
  image: nginx:alpine
  # No healthcheck needed—starts instantly
```

**Why**: Healthchecks add overhead. Only use them for services that need time to initialize. [docker](https://docker.recipes/docs/healthchecks-dependencies)

---

### 2. Set `start_period` for Slow-Starting Services

```yaml
# ✅ Good: Give PostgreSQL 30 seconds to initialize
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 5s
    retries: 5
    start_period: 30s # Grace period
```

**Why**: Prevents healthcheck failures during initial startup (e.g., Elasticsearch, Java apps, databases). [docs.docker](https://docs.docker.com/compose/how-tos/startup-order/)

---

### 3. Keep Healthchecks Fast

```yaml
# ✅ Good: Quick check
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 5s
  timeout: 3s

# ❌ Bad: Slow, resource-intensive
healthcheck:
  test: ["CMD-SHELL", "SELECT COUNT(*) FROM users"]  # Queries database!
  interval: 5s
  timeout: 10s
```

**Why**: Healthchecks run frequently. Slow checks waste resources and can delay startup. [docker](https://docker.recipes/docs/healthchecks-dependencies)

---

### 4. Use `service_completed_successfully` for One-Time Tasks

```yaml
# ✅ Good: Migrations run once, then exit
migrations:
  command: dotnet ef database update
  depends_on:
    db:
      condition: service_healthy
  restart: "no"

api:
  depends_on:
    migrations:
      condition: service_completed_successfully # Wait for migrations to finish
```

**Why**: Ensures migrations complete before API starts handling requests. [docs.docker](https://docs.docker.com/compose/how-tos/startup-order/)

---

### 5. Add Retry Logic in Your Code (Defense in Depth)

Even with healthchecks, your application should handle connection failures gracefully:

```csharp
// .NET Core: Polly retry policy
services.AddHttpClient<DatabaseClient>()
  .AddPolicyHandler(GetRetryPolicy());

// Python: Tenacity
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=10))
def connect_to_db():
    return psycopg2.connect(...)
```

**Why**: Healthchecks aren't perfect—your code should also handle transient failures. [github](https://github.com/docker/compose/issues/11582)

---

### 6. Don't Overuse `depends_on`

```yaml
# ❌ Bad: Overcomplicated
services:
  api:
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
      cache:
        condition: service_healthy
      search:
        condition: service_healthy

  # ✅ Good: Only depend on critical services
  api:
    depends_on:
      db:
        condition: service_healthy
    # Other services: add retry logic in code
```

**Why**: Long dependency chains slow startup. Use retry logic for non-critical dependencies. [docker](https://docker.recipes/docs/healthchecks-dependencies)

---

## Common Issues & Solutions

### Problem 1: Healthcheck Fails with "command not found"

**Symptom**:

```bash
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  # Error: pg_isready: command not found
```

**Solution**: Use full path or install the tool:

```yaml
healthcheck:
  test: ["CMD-SHELL", "/usr/bin/pg_isready -U postgres"]
```

Or use a different check:

```yaml
healthcheck:
  test: ["CMD", "psql", "-U", "postgres", "-c", "SELECT 1"]
```

---

### Problem 2: Container Stuck in "Starting" State

**Symptom**:

```bash
docker compose ps
# myapp-db-1   starting
```

**Causes**:

- Healthcheck failing (check logs)
- `start_period` too short
- Service not responding to healthcheck

**Solution**:

```bash
# Check health status
docker inspect myapp-db-1 --format '{{json .State.Health}}' | jq

# View healthcheck logs
docker logs myapp-db-1
```

---

### Problem 3: Application Still Crashes Despite Healthchecks

**Symptom**: API starts but still fails to connect to database.

**Causes**:

- Healthcheck passes, but service becomes unhealthy later
- Network issues, firewall, DNS
- Insufficient retries in application code

**Solution**:

- Add retry logic in your application code
- Use longer `start_period` for dependencies
- Monitor health status continuously [github](https://github.com/docker/compose/issues/11582)

---

## Summary

- **`depends_on` (short syntax)**: Ensures containers start in order, but doesn't wait for readiness
- **`depends_on` (long syntax)**: Use `condition: service_healthy` to wait for healthchecks to pass
- **Healthchecks**: Define what "ready" means (e.g., `pg_isready` for PostgreSQL, `redis-cli ping` for Redis)
- **Best practice**: Use healthchecks for databases and critical services, add retry logic in your code [denhox](https://denhox.com/posts/forget-wait-for-it-use-docker-compose-healthcheck-and-depends-on-instead/)

For your .NET Core and Python microservices, always configure `depends_on` with `service_healthy` for databases, and implement retry logic in your connection code as a defense-in-depth strategy. [youtube](https://www.youtube.com/watch?v=pCY6khpKqM4)
