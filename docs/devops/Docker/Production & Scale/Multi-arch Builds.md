## Multi-arch builds

Multi-arch builds create one image name that can run on multiple CPU architectures, such as `linux/amd64` and `linux/arm64`. With `buildx`, Docker builds the right image for each platform and publishes them as a single **manifest list**, so the correct variant is chosen automatically when someone pulls or runs it. [docs.docker](https://docs.docker.com/build/building/multi-platform/)

## How buildx works

`docker buildx` is the modern Docker build tool for multi-platform builds. It can build for several architectures in one command, often using BuildKit under the hood, then push all the platform-specific images to a registry and link them together with a manifest. [docker](https://www.docker.com/blog/multi-arch-build-and-images-the-simple-way/)

Example:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myorg/myapp:1.0.0 \
  --push .
```

## Why it matters

This is useful because the same app image can run on Intel/AMD servers, Apple Silicon laptops, and ARM-based cloud nodes without separate manual builds. It also fits well in CI/CD because the pipeline can produce all required architectures from one workflow. [youtube](https://www.youtube.com/watch?v=AQeGdMuJWIM)

## Important detail

A multi-arch image is not one binary image file with everything inside; it is a set of platform-specific images connected by a manifest list. When a machine pulls the image, Docker chooses the matching platform automatically. [stackoverflow](https://stackoverflow.com/questions/59613303/how-do-i-make-multi-arch-docker-images)

## When to use it

Use `buildx` when you need the same application to run across different CPU architectures, especially if your team builds on one architecture but deploys on another. [oneuptime](https://oneuptime.com/blog/post/2026-01-06-docker-multi-architecture-images/view)
