## Building Images: Dockerfile Basics

A **Dockerfile** is a plain-text recipe that tells Docker how to assemble an image layer by layer. Each instruction creates a new immutable layer, and Docker caches these layers to speed up rebuilds when you change only parts of the file. [youtube](https://www.youtube.com/watch?v=3OWuRxrTTkc)

---

## Core Instructions

### 1. `FROM` — Set the Base Image

```dockerfile
FROM python:3.11-slim
```

- **Purpose**: Defines the starting point—your base image (e.g., `python:3.11`, `node:18`, `mcr.microsoft.com/dotnet/aspnet:8.0`). [dockerhol](https://dockerhol.com/blog/your-first-dockerfile-from-run-copy-cmd-explained)
- **Must be first** (except for `ARG` in multi-stage builds). [medium](https://medium.com/@sabryelhasanin/building-docker-images-understanding-the-basics-of-dockerfile-instructions-182e014c5d1f)
- You can use tags for versioning (`python:3.11`) or `latest` (default, but not recommended for production). [medium](https://medium.com/@harleenkour9164/dockerfile-explained-ultimate-guide-with-examples-cmd-vs-entrypoint-and-arg-2e61c0cd94b0)
- **Multi-stage builds**: Use `AS` to name stages for copying artifacts between images. [medium](https://medium.com/@sabryelhasanin/building-docker-images-understanding-the-basics-of-dockerfile-instructions-182e014c5d1f)

```dockerfile
FROM node:18-alpine AS builder
# ... build steps ...
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

### 2. `RUN` — Execute Commands During Build

```dockerfile
RUN apt-get update && apt-get install -y curl
```

- **Purpose**: Runs shell commands inside the image at **build time** (e.g., installing packages, compiling code, running tests). [dockerhol](https://dockerhol.com/blog/your-first-dockerfile-from-run-copy-cmd-explained)
- Each `RUN` creates a new layer—chain commands with `&&` to reduce layers and image size. [techearl](https://techearl.com/how-to-write-a-dockerfile)
- Commands are executed as `sh -c` by default (shell form). [youtube](https://www.youtube.com/watch?v=Smtrua-bUX4)

```dockerfile
# Bad: Two layers
RUN apt-get update
RUN apt-get install -y python3

# Good: One layer
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*
```

---

### 3. `COPY` — Add Files from Host to Image

```dockerfile
COPY . /app
```

- **Purpose**: Copies files/directories from your build context (host) into the container filesystem at a specified path. [medium](https://medium.com/@harleenkour9164/dockerfile-explained-ultimate-guide-with-examples-cmd-vs-entrypoint-and-arg-2e61c0cd94b0)
- Use `.dockerignore` to exclude unnecessary files (`.git`, `node_modules`, etc.) and reduce image size. [youtube](https://www.youtube.com/watch?v=3OWuRxrTTkc)
- Copy dependency files first, then install, then copy the rest—this leverages layer caching when only app code changes. [techearl](https://techearl.com/how-to-write-a-dockerfile)

```dockerfile
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
```

---

### 4. `CMD` — Default Runtime Command

```dockerfile
CMD ["python", "app.py"]
```

- **Purpose**: Sets the **default command** that runs when a container starts from the image. [dockerhol](https://dockerhol.com/blog/your-first-dockerfile-from-run-copy-cmd-explained)
- **Can be overridden** at runtime: `docker run myimage bash` replaces the `CMD`. [youtube](https://www.youtube.com/watch?v=Smtrua-bUX4)
- Use **exec form** (JSON array) to avoid shell processing and ensure proper signal handling. [youtube](https://www.youtube.com/watch?v=Smtrua-bUX4)

```dockerfile
# Exec form (recommended)
CMD ["node", "server.js"]

# Shell form (less control)
CMD node server.js
```

---

### 5. `ENTRYPOINT` — Fixed Executable

```dockerfile
ENTRYPOINT ["python3"]
```

- **Purpose**: Defines the **main executable** that always runs when the container starts—ideal for making images behave like commands. [medium](https://medium.com/@harleenkour9164/dockerfile-explained-ultimate-guide-with-examples-cmd-vs-entrypoint-and-arg-2e61c0cd94b0)
- **Harder to override**: Requires `--entrypoint` flag to change. [youtube](https://www.youtube.com/watch?v=Smtrua-bUX4)
- Often paired with `CMD` to provide **default arguments** that users can override. [techearl](https://techearl.com/how-to-write-a-dockerfile)

```dockerfile
ENTRYPOINT ["python3"]
CMD ["app.py"]

# Default: runs "python3 app.py"
# Override CMD: docker run myapp script.py → runs "python3 script.py"
# Override both: docker run --entrypoint bash myapp → runs "bash"
```

---

## CMD vs ENTRYPOINT: When to Use Which

| Scenario                                       | Use                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| Default command that users might override      | `CMD` [techearl](https://techearl.com/how-to-write-a-dockerfile)            |
| Image should act like an executable (CLI tool) | `ENTRYPOINT` [youtube](https://www.youtube.com/watch?v=Smtrua-bUX4)         |
| Fixed command with flexible arguments          | `ENTRYPOINT` + `CMD` [youtube](https://www.youtube.com/watch?v=Smtrua-bUX4) |

**Example: CLI Tool Pattern**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

ENTRYPOINT ["python", "cli_tool.py"]
CMD ["--help"]
```

- Default: `docker run mytool` → runs `python cli_tool.py --help`
- Override: `docker run mytool --process data.json` → runs `python cli_tool.py --process data.json`

---

## Complete Example: Python Web App

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy dependencies first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (documentation only)
EXPOSE 5000

# Default command
CMD ["python", "app.py"]
```

Build and run:

```bash
docker build -t my-python-app .
docker run -p 5000:5000 my-python-app
```

---

## Best Practices for Your Stack

Given your .NET Core and Python background:

- **Use slim/alpine base images** for smaller production images (`python:3.11-slim`, `mcr.microsoft.com/dotnet/aspnet:8.0`). [medium](https://medium.com/@harleenkour9164/dockerfile-explained-ultimate-guide-with-examples-cmd-vs-entrypoint-and-arg-2e61c0cd94b0)
- **Multi-stage builds** for compiled languages (build in one stage, copy binaries to a minimal runtime image). [medium](https://medium.com/@harleenkour9164/dockerfile-explained-ultimate-guide-with-examples-cmd-vs-entrypoint-and-arg-2e61c0cd94b0)
- **Leverage layer caching** by ordering instructions from least to most frequently changing (dependencies first, then app code). [youtube](https://www.youtube.com/watch?v=3OWuRxrTTkc)
- **Use `.dockerignore`** to exclude build artifacts, IDE configs, and `.git` directories. [youtube](https://www.youtube.com/watch?v=3OWuRxrTTkc)
