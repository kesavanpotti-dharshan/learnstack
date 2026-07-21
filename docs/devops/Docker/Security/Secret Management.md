## Secrets Management in Docker

Secrets management in Docker is about keeping sensitive data like passwords, API keys, SSH keys, and certificates out of images, source code, and plain environment variables. The safest approach is to store secrets outside the image and expose them only to the containers that actually need them, for only as long as they need them. [docs.docker](https://docs.docker.com/engine/swarm/secrets/)

## What Not To Do

Do not bake secrets into a Dockerfile or copy them into an image layer, because they can be hard to remove later and may persist in image history or caches. Also avoid committing `.env` files with real secrets to source control, because they are easy to leak accidentally. [blog.gitguardian](https://blog.gitguardian.com/how-to-handle-secrets-in-docker/)

## Common Ways To Handle Secrets

- **Environment variables** are convenient for non-sensitive configuration, but they are not ideal for secrets because they can be visible through container metadata or logs. [medium](https://medium.com/cuc4/docker-secret-management-best-practices-507ca21b5535)
- **Docker Secrets** are the Docker-native option for sensitive data, and in Swarm they are encrypted and mounted into containers as files under `/run/secrets/`. [stackoverflow](https://stackoverflow.com/questions/44615837/why-is-docker-secrets-more-secure-than-environment-variables)
- **External secret managers** like Vault or cloud secret services are often the best choice for larger production systems, especially when you need rotation, auditing, or centralized control. [dockertokubernetes](https://www.dockertokubernetes.live/learn-docker/docker/docker-secrets-management)

## Docker Secrets in Practice

With Docker Secrets, the application reads the secret from a file instead of an environment variable. That reduces accidental exposure because files are less likely to be dumped into logs or surfaced by routine debugging than environment variables. [shshell](https://shshell.com/blog/docker-module-7-lesson-4)

## Good Rules of Thumb

- Use environment variables for **non-sensitive** settings like port numbers, log levels, or feature flags. [devops.aibit](https://devops.aibit.im/en/article/mastering-environment-variables-configuration-secrets)
- Use secrets for **sensitive** values like database passwords and API tokens. [freecodecamp](https://www.freecodecamp.org/news/manage-secrets-in-docker/)
- Keep build-time credentials separate from runtime secrets, because those are different problems. [dev](https://dev.to/spacelift/how-to-keep-docker-secrets-secure-gmh)
- Rotate secrets regularly and revoke old ones quickly when possible. [blog.gitguardian](https://blog.gitguardian.com/how-to-handle-secrets-in-docker/)

If you want, I can show a minimal `docker-compose.yml` example using secrets for a database password.
