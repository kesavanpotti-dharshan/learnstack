## Multi-stage builds

Multi-stage builds let you use multiple `FROM` statements in one Dockerfile so you can **build** in one stage and **ship** only the final runtime artifacts in another. The main benefit is a much smaller, cleaner, more secure final image because build tools, caches, and source files stay behind. [docs.docker](https://docs.docker.com/build/building/multi-stage/)

## How it works

Each stage starts from a base image, does its job, and then later stages can copy only the needed output using `COPY --from=...`. For example, a .NET app can build with the SDK image, publish binaries, and then copy those binaries into a smaller ASP.NET runtime image. [docs.docker](https://docs.docker.com/get-started/docker-concepts/building-images/multi-stage-builds/)

## Why use it

- Smaller images, which pull and start faster. [depot](https://depot.dev/blog/docker-multi-stage-builds)
- Better security, because compilers and extra build tools are not included in production. [blacksmith](https://www.blacksmith.sh/blog/understanding-multi-stage-docker-builds)
- Cleaner Dockerfiles for apps that need a heavy build step, like .NET, Java, Node, or Python with native dependencies. [docker](https://www.docker.com/blog/multi-stage-builds/)

## Simple example

```dockerfile
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

Here, the first stage builds the app, and the second stage contains only the static output needed to run it. [docs.docker](https://docs.docker.com/build/building/multi-stage/)
