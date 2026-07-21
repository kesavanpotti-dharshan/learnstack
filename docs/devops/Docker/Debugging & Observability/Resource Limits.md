## Resource Limits

Docker resource limits let you cap how much **CPU** and **memory** a container can use, so one container can’t starve the host or other containers. This is especially important in production, where uncontrolled containers can cause slowdowns or crashes across the whole machine. [docs.docker](https://docs.docker.com/engine/containers/resource_constraints/)

## CPU Limits

You can limit CPU with flags like `--cpus`, which sets the maximum number of CPU cores a container may use, or with lower-level settings like CPU shares and CPU quotas. For example, `docker run --cpus=1.5 myapp` gives the container access to at most one and a half CPUs. [youtube](https://www.youtube.com/watch?v=2AvcRHADSAQ)

## Memory Limits

Memory limits use `-m` or `--memory`, such as `docker run -m 512m myapp`, which caps the container at 512 MB RAM. You can also set related options like memory reservation or swap limits to control behavior under pressure. [baeldung](https://www.baeldung.com/ops/docker-memory-limit)

## Why They Matter

Resource limits improve **stability**, **fairness**, and **predictability** by preventing a single container from consuming all available host resources. They also make performance tuning easier because you can observe container behavior under a known ceiling using `docker stats`. [oneuptime](https://oneuptime.com/blog/post/2026-01-16-docker-limit-cpu-memory/view)
