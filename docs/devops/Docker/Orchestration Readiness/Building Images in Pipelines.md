## Building Images in Pipelines

CI pipelines build Docker images by running `docker build`, tagging the result, and then pushing it to a registry so deployment jobs can pull the exact same artifact later. In GitHub Actions and GitLab CI, the main difference is mostly the workflow syntax and how you authenticate to the registry, not the core build process. [dev](https://dev.to/lykins/github-actions-pipeline-4397)

## Common Pipeline Flow

A typical image pipeline does four things: checks out code, builds the image, tests or scans it, then pushes it if everything passes. Most teams tag images with a version, branch name, or commit SHA so deployments are reproducible and traceable. [github](https://github.com/marketplace/actions/build-and-push-docker-images)

## GitHub Actions

In GitHub Actions, a common setup uses a job that logs into the registry, builds the image with Docker Buildx, and then pushes it. The official build-and-push action supports multi-platform builds, secrets, and remote cache, which makes it a strong default for production pipelines. [youtube](https://www.youtube.com/watch?v=6Roj4l4MdtE)

Typical pattern:

```yaml
- uses: actions/checkout@v4
- uses: docker/login-action@v3
- uses: docker/build-push-action@v6
  with:
    context: .
    push: true
    tags: user/app:${{ github.sha }}
```

## GitLab CI

GitLab CI commonly uses a `docker` image plus a `docker:dind` service, then runs `docker build` and `docker push` inside the job. GitLab also integrates cleanly with its container registry, so you can tag images using variables like `CI_REGISTRY_IMAGE` and push them directly to the built-in registry. [verifa](https://verifa.io/blog/automatically-package-tools-gitlab-container-registry/)

Typical pattern:

```yaml
build_image:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
    - docker build -t "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA" .
    - docker push "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
```

## Best Practices

- Use immutable tags like commit SHA or release version, not only `latest`. [infn-bari-school.github](https://infn-bari-school.github.io/docker-tutorial/image/automation/)
- Add build caching where possible to speed up repeated builds. [youtube](https://www.youtube.com/watch?v=6Roj4l4MdtE)
- Scan images before pushing or before deployment. [jfrog](https://jfrog.com/devops-tools/article/what-is-a-container-registry-and-why-do-i-need-one/)
- Keep secrets in CI variables or secret stores, not in the Dockerfile. [github](https://github.com/canonical/azure-image-builder-pipeline-demo)

## Mental Model

Think of the pipeline as: source code in, image out, registry in the middle, deployment at the end. GitHub Actions is often chosen for GitHub-native repos, while GitLab CI is especially convenient when you want the registry, CI, and repo all in one platform. [youtube](https://www.youtube.com/watch?v=GdY_haXvgXw)
