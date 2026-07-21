## Container registries in CI/CD

A container registry is the place where your CI/CD pipeline stores built images and where deployment systems pull them from later. In a typical flow, CI builds the image, tags it with a version or commit SHA, pushes it to a registry, and CD pulls that exact image for deployment. [latchkey](https://latchkey.dev/learn/ci-explained/what-is-a-container-registry)

## Why registries matter

Registries make deployments repeatable because the image built in CI is the same artifact used in production. They also decouple build time from deploy time, which is especially useful when your runtime environment, like Kubernetes, only needs to pull images rather than build them. [medium](https://medium.com/@vincentiusvin1/container-registry-and-ci-cd-ff602a61e6e3)

## Typical CI/CD flow

1. Build the image from your Dockerfile.
2. Tag it with something meaningful, such as `app:1.4.2` or `app:<commit-sha>`.
3. Push it to a registry such as Docker Hub, GHCR, ECR, ACR, Artifact Registry, or a self-hosted registry like Harbor.
4. Deploy by pulling that same image reference in your runtime environment. [grizzlypeaksoftware](https://www.grizzlypeaksoftware.com/library/container-registry-management-strategies-m07yc39i)

## Good practices

- Use immutable tags like commit SHAs or release versions instead of relying only on `latest`. [jfrog](https://jfrog.com/devops-tools/article/what-is-a-container-registry-and-why-do-i-need-one/)
- Authenticate with short-lived or scoped credentials where possible. [developer.humanitec](https://developer.humanitec.com/app-humanitec-io/docs/integration-and-extensions/ci-cd/container-registries/)
- Scan images before pushing or before deployment. [blog.pmunhoz](https://blog.pmunhoz.com/docker/docker-container-registries)
- Keep a retention policy so old images do not pile up forever. [grizzlypeaksoftware](https://www.grizzlypeaksoftware.com/library/container-registry-management-strategies-m07yc39i)

## Simple mental model

Think of CI as the **factory**, the registry as the **warehouse**, and CD as the **delivery truck**. The factory builds the artifact once, the warehouse stores it, and the truck delivers the exact same artifact to production. [cleanstart](https://www.cleanstart.com/knowledge-hub/container-images-in-cicd)
