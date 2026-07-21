## Docker Compose: Services, Networks, and Volumes Explained

Docker Compose is a tool for defining and running multi-container applications using a single YAML file (`docker-compose.yml`). It simplifies orchestration by declaring **services** (containers), **networks** (communication), and **volumes** (persistent storage) in one place—eliminating the need for complex `docker run` commands. [youtube](https://www.youtube.com/watch?v=Cmi2hD-fcGQ)

---

## The Docker Compose File Structure

A typical `docker-compose.yml` has three main sections:

```yaml
version: "3.8"

services:
  # Your containers (services) defined here

networks:
  # Custom networks (optional)

volumes:
  # Named volumes (optional)
```

Each section serves a specific purpose in orchestrating your application. [docs.docker](https://docs.docker.com/compose/intro/compose-application-model/)

---

## 1. Services

### What Are Services?

A **service** is an abstract definition of a containerized application component (e.g., web server, database, API). Each service can be scaled, updated, or replaced independently. [docs.docker](https://docs.docker.com/reference/compose-file/services/)

### Key Service Configuration Options

```yaml
services:
  web:
    image: nginx:alpine
    container_name: my-web
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - api
    networks:
      - frontend
    volumes:
      - ./app:/usr/share/nginx/html
    restart: unless-stopped
    build:
      context: .
      dockerfile: Dockerfile
```

### Common Service Attributes

| Attribute            | Purpose                                  | Example                                                                                                                             |
| -------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **`image`**          | Docker image to use                      | `nginx:alpine`, `postgres:15` [docs.docker](https://docs.docker.com/reference/compose-file/services/)                               |
| **`build`**          | Build from Dockerfile instead of pulling | `build: .` or `build: {context: ., dockerfile: Dockerfile}` [docs.docker](https://docs.docker.com/reference/compose-file/services/) |
| **`container_name`** | Custom container name (optional)         | `container_name: my-api`                                                                                                            |
| **`ports`**          | Expose container ports to host           | `ports: - "8080:80"`                                                                                                                |
| **`environment`**    | Environment variables                    | `environment: - DB_HOST=postgres`                                                                                                   |
| **`env_file`**       | Load environment from file               | `env_file: - .env`                                                                                                                  |
| **`depends_on`**     | Service startup order                    | `depends_on: - db`                                                                                                                  |
| **`networks`**       | Which networks to attach                 | `networks: - backend`                                                                                                               |
| **`volumes`**        | Mount volumes/bind mounts                | `volumes: - db-data:/var/lib/postgresql` [docs.docker](https://docs.docker.com/reference/compose-file/volumes/)                     |
| **`restart`**        | Restart policy                           | `restart: always`, `restart: unless-stopped`                                                                                        |
| **`command`**        | Override default command                 | `command: npm start`                                                                                                                |
| **`healthcheck`**    | Container health monitoring              | `healthcheck: {test: ["CMD", "curl", "-f", "http://localhost"], interval: 30s}`                                                     |

### Example: Multi-Service Application

```yaml
services:
  # Frontend Web Server
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./static:/usr/share/nginx/html
    depends_on:
      - api
    networks:
      - frontend

  # Backend API
  api:
    build: ./api
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      - db
    networks:
      - frontend
      - backend

  # Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - backend
```

**How it works**:

- `web` depends on `api` (starts after)
- `api` depends on `db` (starts after)
- All three services are on at least one network together [docs.docker](https://docs.docker.com/compose/intro/compose-application-model/)

---

## 2. Networks

### What Are Networks in Compose?

**Networks** control how services communicate with each other. By default, Compose creates a single bridge network for all services, but you can define custom networks for better isolation. [kahibaro](https://kahibaro.com/course/61-docker/5583-defining-services-networks-and-volumes)

### Default Network Behavior

If you don't specify networks, Compose automatically:

- Creates a default bridge network (e.g., `myapp_default`)
- Attaches all services to it
- Enables DNS-based service discovery by name [dev](https://dev.to/dejavo/how-to-use-docker-compose-volumes-networks-and-more-4a24)

```yaml
# All services can communicate automatically
services:
  web:
    image: nginx

  api:
    image: myapi

# Both can reach each other:
# - web -> http://api:5000
# - api -> http://web:80
```

### Custom Networks

Define custom networks to segment traffic (e.g., frontend vs. backend):

```yaml
services:
  web:
    image: nginx
    networks:
      - frontend # Only sees other frontend services

  api:
    image: myapi
    networks:
      - frontend # Talk to web
      - backend # Talk to db

  db:
    image: postgres
    networks:
      - backend # Only accessible from api, not web

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

**Network isolation**:

- `web` can reach `api` (both on `frontend`)
- `api` can reach `db` (both on `backend`)
- `web` **cannot** reach `db` directly (no shared network) [kahibaro](https://kahibaro.com/course/61-docker/5583-defining-services-networks-and-volumes)

### Network Configuration Options

```yaml
networks:
  my-network:
    driver: bridge # or overlay, host, none
    ipam:
      config:
        - subnet: 172.20.0.0/16
    external: true # Use existing network
    name: custom-name # Override default naming
```

---

## 3. Volumes

### What Are Volumes in Compose?

**Volumes** provide persistent storage that survives container restarts and removal. They're essential for databases, file uploads, and any data that must outlive containers. [docs.docker](https://docs.docker.com/reference/compose-file/volumes/)

### Types of Volume Mounts

#### Type 1: Named Volumes (Recommended)

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - db-data:/var/lib/postgresql/data # Named volume

volumes:
  db-data: # Declared at top level
```

**Benefits**:

- Managed by Docker (stored in `/var/lib/docker/volumes/`)
- Portable across environments
- Persistent even if container is deleted [medium](https://medium.com/@Shamimw/docker-a-complete-tutorial-part3-docker-compose-2e3b2f568a6f)

#### Type 2: Bind Mounts (Development)

```yaml
services:
  web:
    image: nginx
    volumes:
      - ./static:/usr/share/nginx/html # Host path
```

**Use case**: Live code editing during development—changes on host reflect immediately in container. [docs.docker](https://docs.docker.com/reference/compose-file/volumes/)

#### Type 3: Anonymous Volumes

```yaml
services:
  cache:
    image: redis
    volumes:
      - /data # No name, auto-generated
```

**Use case**: Temporary data, not managed explicitly. [docs.docker](https://docs.docker.com/reference/compose-file/volumes/)

### Volume Configuration Options

```yaml
volumes:
  db-data:
    driver: local # Default
    driver_opts:
      type: none
      o: bind
      device: /srv/docker-data # Custom host path
    external: true # Use existing volume
    name: my-custom-volume # Override default naming
    labels:
      com.example.description: "Database storage"
```

**External volumes**: Use `external: true` to reference volumes created outside Compose (e.g., in production). [docs.docker](https://docs.docker.com/reference/compose-file/volumes/)

### Sharing Volumes Across Services

```yaml
services:
  backend:
    image: example/database
    volumes:
      - db-data:/etc/data

  backup:
    image: backup-service
    volumes:
      - db-data:/var/lib/backup/data

volumes:
  db-data:
```

Both services mount the same `db-data` volume at different paths—`backup` can back up data from `backend`. [docs.docker](https://docs.docker.com/reference/compose-file/volumes/)

---

## Complete Example: Full-Stack Application

```yaml
version: "3.8"

services:
  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - API_URL=http://api:5000
    depends_on:
      - api
    networks:
      - frontend-network
    restart: unless-stopped

  # .NET Core API
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "5000:8080"
    environment:
      - ConnectionStrings__Default=Server=db;Database=MyApp;User=postgres;Password=secret
      - ASPNETCORE_ENVIRONMENT=Production
    depends_on:
      - db
    networks:
      - frontend-network
      - backend-network
    volumes:
      - api-logs:/var/log
    restart: unless-stopped

  # PostgreSQL Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=MyApp
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - backend-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  cache:
    image: redis:alpine
    networks:
      - backend-network
    restart: unless-stopped

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge

volumes:
  db-data:
  api-logs:
```

**Architecture**:

- `frontend` ↔ `api`: Both on `frontend-network`
- `api` ↔ `db`/`cache`: All on `backend-network`
- `frontend` cannot reach `db` directly (isolated by network)
- Data persists in `db-data` and `api-logs` volumes [dev](https://dev.to/dejavo/how-to-use-docker-compose-volumes-networks-and-more-4a24)

---

## Docker Compose Commands

### Essential Commands

```bash
# Start all services (in foreground)
docker compose up

# Start all services (in background)
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (destructive!)
docker compose down -v

# View logs
docker compose logs
docker compose logs -f  # Follow
docker compose logs api  # Specific service

# List running services
docker compose ps

# Rebuild and restart
docker compose up --build

# Restart a specific service
docker compose restart api

# Run a one-off command
docker compose run api python manage.py migrate

# Execute command in running container
docker compose exec api bash

# View current configuration
docker compose config
```

### For Your Stack (.NET Core + Python)

```bash
# Development workflow
docker compose up --build  # Rebuild after code changes

# Check API logs
docker compose logs -f api

# Run database migrations
docker compose exec api dotnet ef database update

# Execute Python scripts
docker compose run api python script.py
```

---

## Best Practices

### 1. Use Named Volumes for Production

```yaml
# ✅ Good
volumes:
  - db-data:/var/lib/postgresql/data

# ❌ Bad (bind mount, not portable)
volumes:
  - /var/docker/db-data:/var/lib/postgresql/data
```

**Why**: Named volumes are managed by Docker and portable across environments. [medium](https://medium.com/@Shamimw/docker-a-complete-tutorial-part3-docker-compose-2e3b2f568a6f)

### 2. Segment Networks for Security

```yaml
# Isolate database from public-facing services
networks:
  - frontend # Web, API
  - backend # API, DB, Cache

services:
  web:
    networks:
      - frontend
  db:
    networks:
      - backend # Not accessible from web directly
```

### 3. Use `depends_on` for Startup Order

```yaml
services:
  api:
    depends_on:
      - db
      - cache
```

**Note**: `depends_on` only controls startup order, not readiness. Use healthchecks for production. [docs.docker](https://docs.docker.com/reference/compose-file/services/)

### 4. Use Environment Variables

```yaml
# Load from .env file
services:
  api:
    env_file:
      - .env
      - .env.production

# Or inline
environment:
  - DB_HOST=${DB_HOST:-postgres}
  - DB_PASSWORD=${DB_PASSWORD}
```

### 5. Use Healthchecks

```yaml
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

Ensures containers are actually ready before dependent services start. [docs.docker](https://docs.docker.com/reference/compose-file/services/)

---

## Summary

- **Services**: Define your containers (web, API, database) with images, ports, environment, and dependencies
- **Networks**: Control communication between services (default creates one network, custom networks for isolation)
- **Volumes**: Persistent storage for databases and stateful data (named volumes for production, bind mounts for development) [docs.docker](https://docs.docker.com/compose/intro/compose-application-model/)

Docker Compose is essential for local development of microservices—it's the standard way to orchestrate multi-container applications before deploying to Kubernetes or production environments. [youtube](https://www.youtube.com/watch?v=Cmi2hD-fcGQ)
