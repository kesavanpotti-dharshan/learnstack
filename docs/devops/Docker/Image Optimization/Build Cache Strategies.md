## .dockerignore

`.dockerignore` works like `.gitignore`, but for Docker builds. It tells Docker which files and folders to exclude from the build context, so less data gets sent to the daemon, builds are faster, and secrets like `.env`, logs, `node_modules`, `bin`, and `obj` stay out of images. [linkedin](https://www.linkedin.com/posts/amaan-shah-_docker-devops-containers-activity-7472883244116520961-RIZn)

Example:

```dockerignore
.git
node_modules
bin
obj
*.log
.env
```

## Build cache strategies

Docker reuses unchanged layers from previous builds, so place **stable steps first** and **frequently changing code last**. A common pattern is to copy dependency files first, install packages, and only then copy the rest of the source code so small app changes don’t force expensive dependency reinstalls. [freecodecamp](https://www.freecodecamp.org/news/how-to-optimize-your-docker-build-cache/)

Good patterns:

```dockerfile
COPY package*.json ./
RUN npm install
COPY . .
```

## Practical rules

- Keep your build context small with a strong `.dockerignore`. [oneuptime](https://oneuptime.com/blog/post/2026-01-25-docker-ignore-files/view)
- Order Dockerfile instructions from least-changing to most-changing. [docs.docker](https://docs.docker.com/build/cache/optimize/)
- Use multi-stage builds to avoid carrying build tools into the final image. [docs.docker](https://docs.docker.com/build/building/best-practices/)
- Reuse cache-friendly dependency layers for faster CI builds. [jonesrussell.github](https://jonesrussell.github.io/blog/docker-build-performance/)

## For your stack

For .NET, copy `.csproj` files first, run `dotnet restore`, then copy the rest and publish. For Python, copy `requirements.txt` first, install dependencies, then copy app code. That keeps rebuilds fast when you only change source files.
