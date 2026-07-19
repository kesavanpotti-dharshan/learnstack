## Tagging, Pushing, and Pulling Docker Images

Tagging, pushing, and pulling are the core operations for sharing and distributing Docker images across machines and environments. You'll use these daily in CI/CD pipelines, multi-environment deployments, and team collaboration. [youtube](https://www.youtube.com/watch?v=Cjr9bIrePSM)

---

## Image Tagging

### What Is a Tag?

A **tag** is a human-readable label attached to an image ID, making it easy to reference specific versions. Tags are metadata—they don't change the image content, just how you refer to it. [geeksforgeeks](https://www.geeksforgeeks.org/devops/docker-using-image-tags/)

### Tag Format

```
<registry>/<username>/<repository>:<tag>
```

- **Registry**: `docker.io` (Docker Hub), `ghcr.io` (GitHub), `your-registry.com` (private)
- **Username**: Your Docker Hub or organization name
- **Repository**: Image name (e.g., `myapp`, `backend-api`)
- **Tag**: Version label (e.g., `v1.2.3`, `latest`, `prod`) [owais](https://owais.io/blog/2025-10-03_docker-hub-image-distribution-part2)

### Common Tagging Patterns

| Pattern                 | Example                              | Use Case                                                                                                                            |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Semantic Versioning** | `myapp:v1.2.3`                       | Production releases (recommended) [youtube](https://www.youtube.com/watch?v=Cjr9bIrePSM)                                            |
| **Major version**       | `myapp:v1`                           | Backward-compatible updates                                                                                                         |
| **Environment**         | `myapp:prod`, `myapp:dev`            | Environment-specific builds                                                                                                         |
| **Branch/Commit**       | `myapp:feature-auth`, `myapp:abc123` | CI/CD traceability [youtube](https://www.youtube.com/watch?v=Cjr9bIrePSM)                                                           |
| **Latest**              | `myapp:latest`                       | Default tag (use sparingly in production) [augmentedmind](https://www.augmentedmind.de/2022/05/15/docker-image-tag-best-practices/) |

### Tagging Commands

```bash
# Build with a tag
docker build -t myapp:v1.0.0 .

# Tag an existing image (after build)
docker tag myapp:abc123 myapp:v1.0.0

# Multiple tags for the same image
docker tag myapp:v1.0.0 myapp:latest
docker tag myapp:v1.0.0 myapp:v1

# Tag for a specific registry
docker tag myapp:v1.0.0 docker.io/johndoe/myapp:v1.0.0
docker tag myapp:v1.0.0 myregistry.azurecr.io/myapp:v1.0.0
```

**Note**: If you don't specify a tag, Docker defaults to `:latest`. [forums.docker](https://forums.docker.com/t/docker-tags-pull-and-push/57271)

---

## Pushing Images to Registries

### Docker Hub (Public Registry)

Docker Hub is the default public registry for sharing images. [youtube](https://www.youtube.com/watch?v=dQlk7uIjhEc&vl=en)

**Step 1: Login**

```bash
docker login
# Enter username and password (or use Personal Access Token for 2FA)
```

**Step 2: Build and Tag**

```bash
docker build -t johndoe/myapp:v1.0.0 .
```

**Step 3: Push**

```bash
docker push johndoe/myapp:v1.0.0
```

**Step 4: Push Multiple Tags**

```bash
docker push johndoe/myapp --all-tags
# Or push each tag individually
docker push johndoe/myapp:latest
docker push johndoe/myapp:v1.0.0
```

### Private Registries

Common private registries: **Azure Container Registry (ACR)**, **Amazon ECR**, **Google Artifact Registry**, **GitHub Container Registry (GHCR)**. [docs.docker](https://docs.docker.com/reference/cli/docker/image/push/)

**Azure ACR Example**:

```bash
# Login to ACR
az acr login --name myregistry

# Tag for ACR
docker tag myapp:v1.0.0 myregistry.azurecr.io/myapp:v1.0.0

# Push
docker push myregistry.azurecr.io/myapp:v1.0.0
```

**Amazon ECR Example**:

```bash
# Get login command
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-std 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag myapp:v1.0.0 123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:v1.0.0
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:v1.0.0
```

**Self-Hosted Registry**:

```bash
docker tag myapp:v1.0.0 registry.example.com:5000/myapp:v1.0.0
docker push registry.example.com:5000/myapp:v1.0.0
```

---

## Pulling Images

### Pull from Docker Hub

```bash
# Pull specific version
docker pull johndoe/myapp:v1.0.0

# Pull latest (default tag)
docker pull johndoe/myapp
# Equivalent to: docker pull johndoe/myapp:latest

# Pull from official library (no username)
docker pull python:3.11-slim
docker pull nginx:alpine
```

### Pull from Private Registry

```bash
# Login first (if private)
docker login myregistry.azurecr.io

# Pull
docker pull myregistry.azurecr.io/myapp:v1.0.0
```

### Auto-Pull on Run

If an image isn't local, Docker automatically pulls it:

```bash
docker run -d johndoe/myapp:v1.0.0
# If not found locally, Docker pulls from registry first
```

---

## Best Practices for Your Workflow

### 1. Avoid `:latest` in Production

**Why `:latest` is risky**:

- **Unpredictable**: Points to whatever was pushed last, not a stable version. [augmentedmind](https://www.augmentedmind.de/2022/05/15/docker-image-tag-best-practices/)
- **Breaking changes**: A new `:latest` might include incompatible updates. [youtube](https://www.youtube.com/watch?v=fdw53IdvN9A)
- **No rollback**: You can't easily revert to a previous "latest" version. [augmentedmind](https://www.augmentedmind.de/2022/05/15/docker-image-tag-best-practices/)

**Recommended approach**:

```bash
# ✅ Good: Specific versions
docker pull myapp:v1.2.3
docker run myapp:v1.2.3

# ❌ Bad: Relies on mutable latest tag
docker pull myapp:latest
```

In CI/CD, build once and tag multiple times:

```bash
docker build -t myapp:abc123 -t myapp:v1.2.3 -t myapp:latest .
docker push myapp --all-tags
```

Then deploy to production with `:v1.2.3`, not `:latest`. [youtube](https://www.youtube.com/watch?v=Cjr9bIrePSM)

---

### 2. Use Semantic Versioning

Follow **MAJOR.MINOR.PATCH** (e.g., `v1.2.3`):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes only [owais](https://owais.io/blog/2025-10-03_docker-hub-image-distribution-part2)

This enables:

- Predictable deployments
- Easy rollbacks to previous versions
- Clear changelog tracking [youtube](https://www.youtube.com/watch?v=fdw53IdvN9A)

---

### 3. Tag for Traceability

In CI/CD pipelines, include:

- **Git commit SHA**: `myapp:abc123f`
- **Branch name**: `myapp:feature-auth`
- **Build number**: `myapp:build-456` [youtube](https://www.youtube.com/watch?v=Cjr9bIrePSM)

Example Jenkins/GitHub Actions workflow:

```bash
VERSION=$(git describe --tags --always)
COMMIT_SHA=$(git rev-parse --short HEAD)

docker build -t myapp:$VERSION -t myapp:$COMMIT_SHA .
docker push myapp:$VERSION
docker push myapp:$COMMIT_SHA
```

---

### 4. Push Once, Tag Multiple Times

Build the image once, then apply multiple tags:

```bash
docker build -t myapp:raw .
docker tag myapp:raw johndoe/myapp:v1.2.3
docker tag myapp:raw johndoe/myapp:latest
docker push johndoe/myapp:v1.2.3
docker push johndoe/myapp:latest
```

**Why**: Ensures all tags point to the exact same image layers, avoiding rebuild inconsistencies. [docs.docker](https://docs.docker.com/reference/cli/docker/image/push/)

---

### 5. Secure Private Repositories

- **Docker Hub**: Set repo to **Private** in Settings → Visibility. [youtube](https://www.youtube.com/watch?v=dQlk7uIjhEc&vl=en)
- **Cloud registries (ACR, ECR)**: Use IAM roles, service principals, or managed identities. [docs.docker](https://docs.docker.com/reference/cli/docker/image/push/)
- **2FA**: Enable two-factor authentication and use Personal Access Tokens (PATs) instead of passwords. [youtube](https://www.youtube.com/watch?v=dQlk7uIjhEc&vl=en)

---

### 6. Multi-Platform Builds

For cross-architecture support (e.g., `linux/amd64` and `linux/arm64`):

```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  -t myapp:v1.2.3 \
  --push .
```

This creates a multi-arch manifest so the same tag works on different hardware. [owais](https://owais.io/blog/2025-10-03_docker-hub-image-distribution-part2)

---

## Common Issues & Fixes

| Issue                                                    | Cause                                | Solution                                                                                                                               |
| -------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **"denied: requested access to the resource is denied"** | Not logged in or wrong credentials   | Run `docker login` with correct username/password or PAT [youtube](https://www.youtube.com/watch?v=Cjr9bIrePSM)                        |
| **"unauthorized: authentication required"**              | 2FA enabled, password rejected       | Use Personal Access Token from Docker Hub instead of password [youtube](https://www.youtube.com/watch?v=Cjr9bIrePSM)                   |
| **"image not found"**                                    | Wrong tag or repo name               | Verify tag exists: `docker pull johndoe/myapp:v1.2.3` (not just `myapp`) [youtube](https://www.youtube.com/watch?v=dQlk7uIjhEc&vl=en)  |
| **Pushing creates duplicate tags**                       | Pushing without specifying `:latest` | Always tag explicitly: `docker push johndoe/myapp:latest` [forums.docker](https://forums.docker.com/t/docker-tags-pull-and-push/57271) |

---
