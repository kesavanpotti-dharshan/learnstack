## Container-to-Container Communication & DNS in Docker

Docker enables containers to communicate with each other through **networks** and provides built-in **DNS resolution** so you can reference containers by name instead of IP addresses. This is essential for microservices architectures where services need to discover and talk to each other dynamically. [kahibaro](https://kahibaro.com/course/61-docker/5578-container-to-container-communication)

---

## How Container-to-Container Communication Works

### Network Isolation

Containers on **different networks cannot communicate** by default—they're completely isolated. For communication, containers must be on the **same Docker network** (bridge, overlay, etc.). [oneuptime](https://oneuptime.com/blog/post/2026-02-08-how-to-use-docker-embedded-dns-server/view)

### Communication Methods

There are two primary ways containers communicate:

#### 1. **IP-Based Communication** (Not Recommended)

```bash
# Container A calls Container B using its IP address
curl http://172.17.0.3:8080/api/data
```

**Why this is bad**:

- Container IPs change on restart/recreation [medium](https://medium.com/@abhilashkrish/dns-resolution-in-docker-43c3d94d5384)
- Not portable across environments
- Breaks when containers are rescheduled [c-sharpcorner](https://www.c-sharpcorner.com/article/docker-part-2-dns-based-inter-container-communication-for-asp-net-core-web-api/)

#### 2. **DNS-Based Communication** (Recommended)

```bash
# Container A calls Container B using its name
curl http://api-service:8080/api/data
```

**Why this is good**:

- Container names are stable [medium](https://medium.com/@abhilashkrish/dns-resolution-in-docker-43c3d94d5384)
- Docker DNS automatically resolves names to current IPs [oneuptime](https://oneuptime.com/blog/post/2026-02-08-how-to-use-docker-embedded-dns-server/view)
- Works across environments and orchestration platforms [c-sharpcorner](https://www.c-sharpcorner.com/article/docker-part-2-dns-based-inter-container-communication-for-asp-net-core-web-api/)

---

## Docker's Embedded DNS Server

Docker includes an **embedded DNS server** (running at `127.0.0.11`) that handles name resolution for containers. [youtube](https://www.youtube.com/watch?v=AppY3iQVxAc)

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│ Container A (app1)                                      │
│  └─> DNS Query: "Where is api-service?"                │
│       (sent to 127.0.0.11:53)                          │
│                                                         │
│  ┌────────────────────────────────────────────┐        │
│  │ Docker Embedded DNS Server (127.0.0.11)   │        │
│  │  - Maintains container name ↔ IP mapping  │        │
│  │  - Responds with: 172.18.0.5              │        │
│  └────────────────────────────────────────────┘        │
│                                                         │
│  └─> HTTP Request: http://172.18.0.5:8080/api         │
└─────────────────────────────────────────────────────────┘
```

**Process**:

1. Container A sends a DNS query for `api-service` to `127.0.0.11` (Docker's internal DNS)
2. Docker's embedded DNS intercepts the query and looks up the container name
3. DNS server responds with the current IP address of `api-service`
4. Container A establishes a direct connection to that IP [youtube](https://www.youtube.com/watch?v=AppY3iQVxAc)

### DNS Configuration

Inside a container, check `/etc/resolv.conf`:

```bash
docker run --rm alpine cat /etc/resolv.conf
# Output:
nameserver 127.0.0.11
options ndots:0
```

The `127.0.0.11` is Docker's embedded DNS server that resolves container names and forwards external queries. [oneuptime](https://oneuptime.com/blog/post/2026-02-08-how-to-use-docker-embedded-dns-server/view)

---

## DNS on Different Network Types

### 1. Default Bridge Network (`bridge`)

- **DNS resolution**: ❌ **Container names only work via `--link` (deprecated)**
- **IP-based**: ✅ Yes
- **Custom DNS**: ⚠️ Limited support [medium](https://medium.com/@abhilashkrish/dns-resolution-in-docker-43c3d94d5384)

```bash
# Default bridge - containers can't resolve each other by name
docker run -d --name web nginx
docker run -d --name db postgres

# This FAILS:
docker exec web curl http://db:5432  # DNS resolution fails
```

### 2. Custom Bridge Networks (Recommended for Single Host)

- **DNS resolution**: ✅ **Automatic container name resolution**
- **Service discovery**: ✅ Yes (by container name)
- **Isolation**: ✅ Yes (separate from default bridge) [c-sharpcorner](https://www.c-sharpcorner.com/article/docker-part-2-dns-based-inter-container-communication-for-asp-net-core-web-api/)

```bash
# Create custom bridge network
docker network create my-network

# Run containers on the same network
docker run -d --name web --network my-network nginx
docker run -d --name db --network my-network postgres

# Containers can now communicate by name
docker exec web curl http://db:5432  # ✅ Works!
docker exec db curl http://web:80    # ✅ Works!
```

**Why this works**: Docker automatically registers container names in the DNS server when they're on a custom bridge network. [medium](https://medium.com/@abhilashkrish/dns-resolution-in-docker-43c3d94d5384)

### 3. Overlay Networks (Docker Swarm)

- **DNS resolution**: ✅ **Service name resolution (not just container names)**
- **Multi-host**: ✅ Yes (across Swarm nodes)
- **Load balancing**: ✅ Yes (round-robin DNS) [docs.docker](https://docs.docker.com/engine/network/drivers/overlay/)

```bash
# In Swarm mode
docker service create --name api --network my-overlay nginx
docker service create --name db --network my-overlay postgres

# Services can resolve each other by service name
docker exec api curl http://db:5432  # ✅ Works across hosts
```

**Feature**: Swarm's DNS provides **service discovery** and load balances requests across multiple replicas. [docs.docker](https://docs.docker.com/engine/network/drivers/overlay/)

### 4. Host Network

- **DNS resolution**: Uses host's DNS (no Docker DNS)
- **Container isolation**: ❌ No (shares host network)
- **Use case**: Performance-critical, trusted containers [docs.docker](https://docs.docker.com/engine/network/drivers/)

---

## Practical Examples

### Example 1: Web App + Database

```bash
# Create custom network
docker network create app-network

# Start database
docker run -d --name postgres \
  --network app-network \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# Start web app that connects to database
docker run -d --name webapp \
  --network app-network \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  myapp:latest

# Inside webapp container:
# - Can connect to "postgres:5432" (DNS resolves to 172.18.0.2)
# - No need to hardcode IP addresses
```

### Example 2: Docker Compose (Automatic DNS)

```yaml
# docker-compose.yml
version: "3.8"
services:
  web:
    image: nginx
    depends_on:
      - api

  api:
    image: myapi:latest
    environment:
      - DB_HOST=db

  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret

# All services are on the same network automatically
# - web can call http://api:8080
# - api can connect to db:5432
# - No network configuration needed!
```

When using Docker Compose:

- All services are on the same default network
- Container names are automatically resolvable via DNS
- No manual network creation required [docs.docker](https://docs.docker.com/compose/how-tos/networking/)

### Example 3: ASP.NET Core Microservices

```csharp
// In your .NET Core API (ServiceOne)
// ❌ Bad: Hardcoded IP
var client = new HttpClient { BaseAddress = new Uri("http://172.17.0.3:8080/") };

// ✅ Good: Use DNS name
var client = new HttpClient { BaseAddress = new Uri("http://servicetwo:8080/") };
```

**Configuration**:

```yaml
# docker-compose.yml
version: "3.4"
services:
  serviceone:
    image: serviceone
    environment:
      - ServiceTwoUrl=http://servicetwo:8080
    networks:
      - my-network

  servicetwo:
    image: servicetwo
    networks:
      - my-network

networks:
  my-network:
    driver: bridge
```

This ensures `serviceone` can always reach `servicetwo` by name, regardless of IP changes. [c-sharpcorner](https://www.c-sharpcorner.com/article/docker-part-2-dns-based-inter-container-communication-for-asp-net-core-web-api/)

---

## DNS-Based vs. IP-Based Communication

| Aspect            | DNS-Based                       | IP-Based                                                                                                                                                      |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stability**     | ✅ Container names are stable   | ❌ IPs change on restart [medium](https://medium.com/@abhilashkrish/dns-resolution-in-docker-43c3d94d5384)                                                    |
| **Portability**   | ✅ Works across environments    | ❌ Hardcoded IPs break portability                                                                                                                            |
| **Orchestration** | ✅ Works with Kubernetes, Swarm | ❌ Requires manual IP updates                                                                                                                                 |
| **Maintenance**   | ✅ No manual updates needed     | ❌ Must track IP changes                                                                                                                                      |
| **Best Practice** | ✅ Recommended                  | ❌ Avoid in production [c-sharpcorner](https://www.c-sharpcorner.com/article/docker-part-2-dns-based-inter-container-communication-for-asp-net-core-web-api/) |

---

## Troubleshooting DNS Issues

### Problem 1: Container Can't Resolve Name

**Symptoms**:

```bash
docker exec web curl http://db:5432
# curl: (6) Could not resolve host: db
```

**Causes & Fixes**:

- Containers on **different networks**: Add both to the same network
  ```bash
  docker network connect my-network db
  ```
- Using **default bridge**: Create a custom bridge network [oneuptime](https://oneuptime.com/blog/post/2026-02-08-how-to-use-docker-embedded-dns-server/view)
- **Typo in container name**: Check exact name with `docker ps`

### Problem 2: DNS Not Working on Default Bridge

**Solution**: Create a custom bridge network:

```bash
# Default bridge lacks DNS
docker network create my-bridge
docker run -d --name app --network my-bridge myapp
```

### Problem 3: Custom DNS Server Needed

**Use case**: You want to use your own DNS (e.g., Pi-hole, dnsmasq)

```bash
docker run -d --network my-network \
  --dns 192.168.1.100 \
  --dns 8.8.8.8 \
  myapp
```

Or in `docker-compose.yml`:

```yaml
services:
  myapp:
    image: myapp
    dns:
      - 192.168.1.100
      - 8.8.8.8
```

This overrides Docker's embedded DNS with your own. [stackoverflow](https://stackoverflow.com/questions/61479040/docker-container-to-container-dns-with-containerised-dns-server)

---

## Best Practices for Your Stack

### .NET Core Microservices

1. **Use Docker Compose** for local development (automatic DNS)
2. **Reference services by name** in configuration (never IPs)
3. **Use environment variables** for service URLs:
   ```csharp
   var apiBaseUrl = Configuration["ApiService:BaseUrl"]; // "http://api:8080"
   ```

### Python Applications

1. **Specify networks explicitly** in `docker-compose.yml`:

   ```yaml
   networks:
     - backend
   services:
     web:
       networks:
         - backend
     db:
       networks:
         - backend
   ```

2. **Use `depends_on`** to ensure services start in order (though DNS still needs time to propagate) [docs.docker](https://docs.docker.com/compose/how-tos/networking/)

### Kubernetes (Your Target)

In Kubernetes, DNS works similarly:

- **Services** are automatically resolvable (`api-service.default.svc.cluster.local`)
- **Pods** can use short names within the same namespace
- **CoreDNS** provides cluster-wide DNS resolution

This is why learning Docker DNS concepts translates directly to Kubernetes service discovery. [medium](https://medium.com/@abhilashkrish/dns-resolution-in-docker-43c3d94d5384)

---

## Summary

- Containers on the **same network** can communicate via DNS (custom bridge networks)
- Docker's **embedded DNS server** (`127.0.0.11`) resolves container names to IPs
- **Always use DNS-based communication** (container names), never IP addresses
- **Custom bridge networks** enable automatic DNS for container names
- **Docker Compose** simplifies this by creating networks and enabling DNS automatically

For microservices (like your .NET Core and Python projects), always configure services to reference each other by DNS name (e.g., `http://api:8080`, `postgres:5432`) rather than hardcoding IPs—this ensures your applications work reliably across development, testing, and production environments. [oneuptime](https://oneuptime.com/blog/post/2026-02-08-how-to-use-docker-embedded-dns-server/view)
