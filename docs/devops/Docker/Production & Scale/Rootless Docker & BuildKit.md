## Rootless Docker

Rootless Docker means running both the Docker daemon and containers as a **non-root user** instead of as root on the host. It reduces the impact of a daemon or container compromise because the Docker components are isolated inside a user namespace rather than having full host-root privileges. [docs.docker](https://docs.docker.com/engine/security/rootless/)

Key points:

- No root privileges are needed to run the daemon once the prerequisites are in place. [docs.docker](https://docs.docker.com/engine/security/rootless/)
- It relies on user namespaces and subordinate UID/GID mappings. [docs.docker](https://docs.docker.com/engine/security/rootless/)
- It is a strong security improvement over the default rootful Docker setup. [youtube](https://www.youtube.com/watch?v=uWURUtqLiqQ)

## BuildKit

BuildKit is Docker’s newer build engine for building images more efficiently and securely. It supports faster builds through concurrent execution, smarter caching, and advanced features like secret mounts and SSH forwarding. [docs.docker](https://docs.docker.com/build/buildkit/)

Useful ideas:

- Parallel build steps can reduce build time. [depot](https://depot.dev/blog/buildkit-in-depth)
- Cache can be imported/exported more efficiently than older build flows. [gist.github](https://gist.github.com/Manas-kashyap/f3f63524e52b271d918b352296d67d09)
- Secrets can be used during build without baking them into the final image. [medium](https://medium.com/@obaff/12-docker-buildkit-features-youre-probably-not-using-yet-but-should-ca31e9a3b138)
- You can enable it with `DOCKER_BUILDKIT=1` for a build. [gist.github](https://gist.github.com/Manas-kashyap/f3f63524e52b271d918b352296d67d09)

## Why they matter together

Rootless Docker improves host security, while BuildKit improves build speed and build-time security. In practice, they fit well together for modern CI/CD pipelines, especially when you want faster builds without giving the build system elevated host privileges. [oneuptime](https://oneuptime.com/blog/post/2026-01-22-docker-buildkit-faster-builds/view)

## Simple example

```bash
DOCKER_BUILDKIT=1 docker build -t myapp .
```

That uses BuildKit for the build, while Rootless Docker would change **who runs the daemon** and how much host privilege it has. [gist.github](https://gist.github.com/Manas-kashyap/f3f63524e52b271d918b352296d67d09)
