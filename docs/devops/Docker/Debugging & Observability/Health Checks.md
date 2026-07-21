## Health checks

A health check tells Docker whether a container is merely running or actually **working correctly**. Docker can run a command inside the container on a schedule, and if that command succeeds the container is marked healthy; if it fails repeatedly, the container becomes unhealthy. [dash0](https://www.dash0.com/guides/docker-health-check-a-practical-guide)

A common example is checking an HTTP endpoint like `/health` or using a database-specific probe like `pg_isready`. Health checks are useful because a process can be “up” while the app itself is stuck, misconfigured, or unable to serve traffic. [oneuptime](https://oneuptime.com/blog/post/2026-01-23-docker-health-checks-effectively/view)

## Restart policies

Restart policies tell Docker when to automatically restart a container after it exits or after the Docker daemon restarts. The main policies are `no`, `on-failure`, `always`, and `unless-stopped`. [linuxhandbook](https://linuxhandbook.com/docker-restart-policy/)

- `no`: never restart automatically.
- `on-failure`: restart only if the container exits with a non-zero code, and you can set a retry limit.
- `always`: restart whenever the container stops.
- `unless-stopped`: like `always`, but it stays stopped if you stopped it manually. [youtube](https://www.youtube.com/watch?v=SC9J6BNX_bU)

## How they work together

Health checks detect whether the app is truly healthy, while restart policies handle recovery after crashes. In production, a common pattern is to combine both: use a health check to detect broken state and a restart policy like `unless-stopped` to recover from unexpected exits. [notes.kodekloud](https://notes.kodekloud.com/docs/Docker-Certified-Associate-Exam-Course/Docker-Engine/Restart-Policies/page)

## Example

```yaml
services:
  api:
    image: myapi
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost/health || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
```

This says: keep the container running unless someone stops it manually, and mark it unhealthy if the health endpoint stops responding. [medium](https://medium.com/@akaashhazarika/docker-health-checks-building-more-resilient-services-b456e9be955e)
