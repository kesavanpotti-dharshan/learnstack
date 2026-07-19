## Top Commonly Used Docker Commands

**Image Management**: `docker pull <image>` downloads an image from a registry, `docker build -t <name> .` builds an image from a Dockerfile, `docker images` lists all local images, and `docker rmi <image>` removes an image. [docs.docker](https://docs.docker.com/get-started/docker_cheatsheet.pdf)

**Container Lifecycle**: `docker run -d -p <host>:<container> <image>` creates and runs a container in detached mode with port mapping, `docker ps` lists running containers, `docker stop <container>` gracefully stops a container, and `docker rm <container>` removes a stopped container. [medium](https://medium.com/@Techwithhearts/50-docker-commands-you-should-know-and-their-use-cases-303baff8279d)

**Debugging & Interaction**: `docker exec -it <container> bash` opens an interactive shell inside a running container, `docker logs -f <container>` streams container logs in real-time, and `docker inspect <container>` shows detailed configuration and state information. [dev](https://dev.to/tungbq/the-essential-docker-commands-1c23)

**Cleanup & Maintenance**: `docker system prune` removes unused data (stopped containers, dangling images, unused networks), `docker volume prune` cleans up unused volumes, and `docker logout` logs out from registries. [github](https://github.com/pyxelr/my-frequent-docker-commands)
