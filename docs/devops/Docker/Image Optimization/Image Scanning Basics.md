## Non-root users

Running a container as a **non-root user** means the application inside the container does not run as root by default. Docker’s security guidance recommends using non-privileged users inside containers to reduce risk, and Docker also provides rootless mode for running the daemon and containers without root privileges. [docs.docker](https://docs.docker.com/engine/security/rootless/)

Why it matters:

- If an app is compromised, the attacker has fewer permissions inside the container.
- It reduces the blast radius if the container has access to mounted volumes or sensitive files.
- It is a strong defense-in-depth measure, even though containers already have isolation. [stackoverflow](https://stackoverflow.com/questions/72078975/docker-container-how-non-root-user-secured)

Typical pattern:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN useradd -m appuser
USER appuser
CMD ["python", "app.py"]
```

## Image scanning basics

Image scanning means checking a container image for **known vulnerabilities** and risky packages before you deploy it. Common scanners include Docker Scout, Trivy, and Snyk, and best practice is to run scans in CI/CD so problems are caught early. [sysdig](https://www.sysdig.com/learn-cloud-native/12-container-image-scanning-best-practices)

What scanners look for:

- Outdated OS packages with known CVEs.
- Vulnerable application dependencies.
- Misconfigurations or risky base images. [timesofcloud](https://timesofcloud.com/docker/image-scanning/)

Basic workflow:

1. Build the image.
2. Scan it.
3. Fix high-severity findings.
4. Rebuild and rescan before release. [sysdig](https://www.sysdig.com/learn-cloud-native/12-container-image-scanning-best-practices)

## How they fit together

These two practices work well together: use a minimal base image, run as a non-root user, and scan the final image before shipping it. That combination lowers both the chance of compromise and the impact if something does go wrong. [docs.docker](https://docs.docker.com/engine/security/)
