## Least Privilege

The principle of least privilege means giving a container, process, or user only the **minimum permissions** it needs to do its job. In Docker, this usually means running as a non-root user, dropping unnecessary Linux capabilities, and avoiding access to host resources unless required. [armosec](https://www.armosec.io/glossary/principle-of-least-privilege-polp/)

Why it matters:

- It limits damage if the container is compromised. [dev](https://dev.to/hexshift/read-only-root-filesystems-in-docker-minimizing-container-write-access-for-better-security-3i43)
- It reduces the chance of accidental system changes. [docker](https://docker.recipes/docs/readonly-containers)
- It supports defense in depth alongside scanning, non-root users, and network isolation. [dockerworkshop.vercel](https://dockerworkshop.vercel.app/security/container-security/readonly-capabilities/)

## Read-only Filesystems

A read-only filesystem makes the container’s root filesystem immutable, so the app cannot create, modify, or delete files there at runtime. This helps block malware installation, binary tampering, and persistence attempts if an attacker gets code execution. [codartium](https://www.codartium.com/read-only-filesystems-in-docker/)

What still works:

- The app can still read files from the image.
- You can allow specific writable paths using `tmpfs` or mounted volumes. [lours](https://lours.me/posts/compose-tip-043-read-only-rootfs/)

Example:

```bash
docker run --read-only --tmpfs /tmp myapp
```

## Why Use Both

Together, least privilege and read-only filesystems make a container much harder to abuse. A common hardening pattern is: run as a non-root user, drop all extra capabilities, and set the root filesystem to read-only while adding only the few writable paths the app truly needs. [dockerworkshop.vercel](https://dockerworkshop.vercel.app/security/container-security/readonly-capabilities/)
