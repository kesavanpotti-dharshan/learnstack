## Environment Variables & .env Files in Docker

Environment variables are key-value pairs used to configure applications without hardcoding values like passwords, database URLs, or API keys directly into your code or Dockerfiles. They enable you to separate configuration from code, making containers portable across development, staging, and production environments. [medium](https://medium.com/@kilamaelie/beginners-guide-to-environment-variables-with-docker-f716f65af5ec)

---

## What Are Environment Variables?

Environment variables are configuration values that your application reads at runtime:

```bash
# Example environment variables
DB_HOST=postgres
DB_PORT=5432
DB_PASSWORD=secret123
API_KEY=sk_test_abc123
NODE_ENV=production
```

**Why use them**:

- ✅ **Security**: Keep secrets out of your codebase [securebin](https://securebin.ai/blog/docker-environment-variables-guide/)
- ✅ **Portability**: Same image works across environments with different configs [oneuptime](https://oneuptime.com/blog/post/2026-01-16-docker-env-files/view)
- ✅ **Flexibility**: Change behavior without rebuilding images [spacelift](https://spacelift.io/blog/docker-run-environment-variables)
- ✅ **Separation of concerns**: Code stays the same, configuration changes [medium](https://medium.com/@hareshvidja/docker-environment-variables-in-depth-guide-to-same-vs-mapped-names-5625f329521b)

---

## How to Set Environment Variables in Docker

There are several ways to pass environment variables to containers, each suited for different scenarios. [docs.docker](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/)

### Method 1: Inline in `docker run`

```bash
# Single variable
docker run -e NODE_ENV=production myapp

# Multiple variables
docker run -e DB_HOST=postgres -e DB_PORT=5432 -e DB_PASSWORD=secret myapp

# From shell variable
export DB_PASSWORD=secret
docker run -e DB_PASSWORD=$DB_PASSWORD myapp
```

**Use case**: Quick testing, one-off containers. [dash0](https://www.dash0.com/faq/how-to-pass-environment-variables-to-a-docker-container)

---

### Method 2: Using `.env` Files with `docker run`

```bash
# Create .env file
cat > .env << EOF
DB_HOST=postgres
DB_PORT=5432
DB_PASSWORD=secret
API_KEY=sk_test_abc123
EOF

# Load all variables from file
docker run --env-file .env myapp
```

**Benefits**:

- Keep all configuration in one file
- Reuse across multiple containers
- Avoid long command lines [khabdrick-dev.medium](https://khabdrick-dev.medium.com/use-an-env-file-in-docker-286ec79d4543)

---

### Method 3: In Dockerfile (Build-Time with `ARG`, Runtime with `ENV`)

```dockerfile
# Build-time variable (only during build)
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}

# Runtime variable (available in container)
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

**Key difference**:

- `ARG`: Only available during **image build** (not in running container) [medium](https://medium.com/@kilamaelie/beginners-guide-to-environment-variables-with-docker-f716f65af5ec)
- `ENV`: Available in **running container** at runtime [phoenixnap](https://phoenixnap.com/kb/docker-environment-variables)

**Override ENV values at runtime**:

```bash
docker run -e NODE_ENV=development myimage  # Overrides ENV NODE_ENV=production
```

---

### Method 4: In Docker Compose (Most Common for Development)

#### Option A: Inline in `docker-compose.yml`

```yaml
services:
  api:
    image: myapi:latest
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_PASSWORD=secret
      - NODE_ENV=production
```

**Alternative syntax (mapping)**:

```yaml
services:
  api:
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      NODE_ENV: production
```

Both are equivalent. [docs.docker](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/)

---

#### Option B: Using `.env` Files (Recommended)

**Step 1**: Create a `.env` file in the same directory as `docker-compose.yml`:

```bash
# .env file
DB_HOST=postgres
DB_PORT=5432
DB_PASSWORD=secret
API_KEY=sk_test_abc123
NODE_ENV=production
PORT=5000
```

**Step 2**: Reference in `docker-compose.yml`:

```yaml
services:
  api:
    image: myapi:latest
    environment:
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_PASSWORD=${DB_PASSWORD}
      - NODE_ENV=${NODE_ENV}
```

**Auto-detection**: Docker Compose automatically loads `.env` from the same directory as your `docker-compose.yml` file—no explicit reference needed. [oneuptime](https://oneuptime.com/blog/post/2026-01-16-docker-env-files/view)

---

#### Option C: Using `env_file` Key

```yaml
services:
  api:
    image: myapi:latest
    env_file:
      - .env
      - .env.production # Multiple files, loaded in order

  worker:
    image: myworker:latest
    env_file:
      - .env # Share same .env across services
```

**Benefits**:

- Keeps sensitive data separate from `docker-compose.yml`
- Reuse same `.env` file for `docker run --env-file` and Compose
- Can use different files for different environments (`.env.dev`, `.env.prod`) [gist.github](https://gist.github.com/brianjbayer/f5ec96f29ee45a4d5514a34129306ddf)

---

## .env File Syntax & Best Practices

### Basic Format

```bash
# .env file
# Each line is KEY=VALUE

DB_HOST=postgres
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=supersecret123

# Quoted values (for special characters)
API_KEY="sk_test_abc123xyz"

# Boolean values
DEBUG=true
ENABLE_LOGGING=false

# Empty values
OPTIONAL_VAR=

# Comments (lines starting with #)
# This is a comment
```

**Rules**:

- One variable per line [khabdrick-dev.medium](https://khabdrick-dev.medium.com/use-an-env-file-in-docker-286ec79d4543)
- No spaces around `=` sign
- Use quotes for values with spaces or special characters [khabdrick-dev.medium](https://khabdrick-dev.medium.com/use-an-env-file-in-docker-286ec79d4543)
- Comments start with `#` [oneuptime](https://oneuptime.com/blog/post/2026-01-16-docker-env-files/view)

---

### Environment-Specific Files

Create separate `.env` files for different environments:

```bash
# .env.development
NODE_ENV=development
DB_HOST=localhost
DEBUG=true

# .env.staging
NODE_ENV=staging
DB_HOST=staging-db.example.com
DEBUG=false

# .env.production
NODE_ENV=production
DB_HOST=prod-db.example.com
DEBUG=false
```

**Usage in Compose**:

```yaml
services:
  api:
    env_file:
      - .env.${NODE_ENV} # Dynamically load based on env
```

**Command line override**:

```bash
# Use specific .env file
docker compose --env-file .env.staging up

# Override specific variable
docker compose run -e DEBUG=true api python manage.py shell
```

---

### Variable Interpolation in `.env` Files

You can use shell-style variable substitution:

```bash
# .env file
APP_NAME=myapp
VERSION=1.0.0
IMAGE_TAG=${APP_NAME}:${VERSION}  # myapp:1.0.0

# Default values if variable is not set
DB_HOST=${DB_HOST:-localhost}  # Uses localhost if DB_HOST not set
PORT=${PORT:-3000}  # Default to 3000
```

**In `docker-compose.yml`**:

```yaml
services:
  api:
    image: ${IMAGE_TAG:-myapp:latest}
    ports:
      - "${PORT:-5000}:5000"
```

---

## Precedence: Which Method Wins?

When multiple methods set the same variable, Docker Compose follows this order (highest to lowest priority): [gist.github](https://gist.github.com/brianjbayer/f5ec96f29ee45a4d5514a34129306ddf)

1. **Command-line overrides** (`docker compose run -e DEBUG=true`)
2. **Environment section** in `docker-compose.yml` (`environment: - DEBUG=true`)
3. **Local shell environment** (`export DEBUG=true` before running Compose)
4. **`.env` file** (auto-loaded or via `--env-file`)
5. **`env_file` key** in Compose file
6. **Dockerfile `ENV`** (default values)

**Example**:

```bash
# .env file
DEBUG=false

# docker-compose.yml
services:
  api:
    environment:
      - DEBUG=true

# Command line
docker compose run -e DEBUG=false api  # This wins!
```

---

## Complete Example: .NET Core + PostgreSQL

### Project Structure

```
myapp/
├── docker-compose.yml
├── .env
├── .env.production
├── api/
│   ├── Dockerfile
│   └── Program.cs
└── .gitignore
```

### `.env` File

```bash
# .env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=MyApp
DB_USER=postgres
DB_PASSWORD=devsecret123
ASPNETCORE_ENVIRONMENT=Development
API_PORT=5000
JWT_SECRET=dev_jwt_secret_key
```

### `docker-compose.yml`

```yaml
version: "3.8"

services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: myapi
    ports:
      - "${API_PORT}:8080"
    environment:
      - ConnectionStrings__Default=Server=${DB_HOST};Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD}
      - ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT}
      - JwtSettings__Secret=${JWT_SECRET}
    depends_on:
      - postgres
    networks:
      - backend

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend

networks:
  backend:
    driver: bridge

volumes:
  pgdata:
```

### `.gitignore`

```bash
# Never commit .env files with secrets!
.env
.env.*
!.env.example  # But commit an example template
```

### `.env.example` (Safe to commit)

```bash
# Template for new developers
DB_HOST=postgres
DB_PORT=5432
DB_NAME=MyApp
DB_USER=postgres
DB_PASSWORD=changeme
ASPNETCORE_ENVIRONMENT=Development
API_PORT=5000
JWT_SECRET=change_this_in_production
```

---

## Best Practices

### 1. Never Commit Secrets

```bash
# ✅ Good: .gitignore
.env
*.env
!.env.example

# ❌ Bad: Committing .env with real passwords
```

Use `.env.example` as a template with placeholder values. [medium](https://medium.com/@kilamaelie/beginners-guide-to-environment-variables-with-docker-f716f65af5ec)

---

### 2. Use Different Files for Different Environments

```bash
# Development
docker compose --env-file .env.dev up

# Production
docker compose --env-file .env.prod up
```

Or in CI/CD pipelines, inject environment-specific variables directly. [medium](https://medium.com/@kilamaelie/beginners-guide-to-environment-variables-with-docker-f716f65af5ec)

---

### 3. Provide Default Values

```yaml
# In docker-compose.yml
services:
  api:
    environment:
      - DB_HOST=${DB_HOST:-localhost} # Default to localhost
      - PORT=${PORT:-5000} # Default to 5000
```

Ensures the app works even if `.env` is missing or incomplete. [gist.github](https://gist.github.com/brianjbayer/f5ec96f29ee45a4d5514a34129306ddf)

---

### 4. Validate Variables at Startup

```dockerfile
# In Dockerfile
ENV DB_HOST=postgres
ENV DB_PORT=5432

# In your app code (C# example)
var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
if (string.IsNullOrEmpty(dbHost))
{
    throw new Exception("DB_HOST environment variable is required");
}
```

Fail fast if critical configuration is missing. [securebin](https://securebin.ai/blog/docker-environment-variables-guide/)

---

### 5. Use Docker Secrets for Production

For sensitive data (passwords, API keys) in production, use Docker Secrets instead of environment variables:

```yaml
# docker-compose.yml (Swarm mode only)
services:
  db:
    image: postgres
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```

Environment variables are visible via `docker inspect`—secrets are encrypted and only accessible inside containers. [securebin](https://securebin.ai/blog/docker-environment-variables-guide/)

---

### 6. Verify Variables Are Loaded

```bash
# Check environment variables in running container
docker compose exec api env | grep DB

# Or inspect the container
docker inspect myapi | grep -A 20 "Env"
```

Confirms your configuration is actually being applied. [stackoverflow](https://stackoverflow.com/questions/34051747/get-environment-variable-from-docker-container)

---

## For Your Stack (.NET Core + Python)

### .NET Core

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Read from environment variables
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default");
var jwtSecret = Environment.GetEnvironmentVariable("JwtSettings__Secret");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
```

### Python (Flask/FastAPI)

```python
# config.py
import os

class Config:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    SECRET_KEY = os.getenv("SECRET_KEY")
```

```yaml
# docker-compose.yml
services:
  api:
    environment:
      - DB_HOST=${DB_HOST:-localhost}
      - DB_PASSWORD=${DB_PASSWORD}
```

---

## Summary

- **Environment variables** separate configuration from code, enabling portability and security [medium](https://medium.com/@hareshvidja/docker-environment-variables-in-depth-guide-to-same-vs-mapped-names-5625f329521b)
- **`.env` files** store key-value pairs for easy configuration management
- **Docker Compose** auto-loads `.env` files from the same directory
- **Use `environment`** for inline variables, **`env_file`** for external files
- **Cannot commit `.env`** with secrets—use `.env.example` as a template [oneuptime](https://oneuptime.com/blog/post/2026-01-16-docker-env-files/view)
- **For production**, consider Docker Secrets for sensitive data [securebin](https://securebin.ai/blog/docker-environment-variables-guide/)

Environment variables and `.env` files are foundational for containerized applications—they're how you configure the same Docker image to work in development, testing, and production without code changes. [medium](https://medium.com/@kilamaelie/beginners-guide-to-environment-variables-with-docker-f716f65af5ec)
