## Docker logs, inspect, stats, top

- **`docker logs`** shows a container’s stdout/stderr output, which is the first place to check when an app crashes or behaves strangely. [docs.docker](https://docs.docker.com/reference/cli/docker/container/logs/)
- **`docker inspect`** returns detailed low-level JSON about a container, including config, networks, mounts, env vars, and state. [bmc](https://www.bmc.com/blogs/docker-commands/)
- **`docker stats`** gives live resource usage such as CPU, memory, network, and block I/O. [blog.csdn](https://blog.csdn.net/qq_34660967/article/details/149583090)
- **`docker top`** shows the running processes inside the container, useful for seeing what is actually executing. [bmc](https://www.bmc.com/blogs/docker-commands/)

## Quick examples

```bash
docker logs -f myapp
docker inspect myapp
docker stats myapp
docker top myapp
```

A simple debugging flow is: check **logs** first, then **inspect** for configuration, then **stats** for resource pressure, and finally **top** to see the active processes. [docs.docker](https://docs.docker.com/reference/cli/docker/inspect/)
