---
title: Containers and Images
sidebar_label: Containers
sidebar_position: 2
---

In Kubernetes, **images are the blueprints**, and **containers are the running instances of those blueprints inside pods**.[1][2][3][4][5][6][7]

## Container Images: The Blueprint

A **container image** is a static, read‑only file that bundles:[3][4][7][8][9][1]

- Your application code.
- Runtime (e.g., Node.js, Python, JVM).
- Libraries and dependencies.
- Configuration defaults and metadata.

Key properties:

- **Immutable**: once built, you don’t modify an image; you build a new version instead.[2][4][8][10][3]
- **Layered**: composed of layers (base OS/runtime, libs, app code).[4][10][3]
- **Stored in registries**: Kubernetes pulls images from registries like Docker Hub, ECR, GCR, or private registries.[7][9][3][4]

In Kubernetes, you reference images in pod specs:

```yaml
containers:
  - name: api
    image: myorg/api-service:1.0.0
```

Kubernetes then pulls that image to nodes and uses it to create containers.[9][1][4][7]

---

## Containers: The Running Instance

A **container** is a lightweight, isolated runtime environment created from an image.[5][6][8][2][7]

It includes:

- The image contents.
- A thin, writable layer on top (for runtime changes).
- Namespaces and cgroups for isolation (process, filesystem, network).[6][10][2][4]

Key properties:

- **Executable**: it’s a process running your app.[8][2][6]
- **Ephemeral**: containers can be restarted, replaced, or rescheduled; you usually don’t rely on their local filesystem for durable data.[6][7]
- **Isolated**: runs with its own view of the filesystem, environment, and, often, network.[4][8][6]

Kubernetes doesn’t run containers directly; it runs **pods**, and each pod holds one or more containers that share networking and storage.[7][6]

---

## How Kubernetes Uses Images and Containers

### 1. You Build and Push an Image

Developers build a container image (often via Dockerfile) and push it to a container registry.[3][9][4][7]

### 2. You Describe Desired State

You define a Kubernetes object (Deployment, Job, StatefulSet, etc.) that specifies which image to run and how many replicas.[11][6][7]

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: myorg/api-service:1.0.0
```

### 3. Kubernetes Pulls Images and Creates Containers

- The kubelet on each node pulls the specified image from the registry.[1][9][4][7]
- It creates a **pod**, which includes one or more containers instantiated from that image.
- Those containers run your application inside the pod.[6][7]

If you scale the Deployment, Kubernetes creates more pods, each with containers based on the same image.[7][6]

---

## Image vs Container (Conceptual Difference)

You can think of it like this:[10][2][5][8][4]

- **Image**: blueprint, recipe, or class.
  - Read‑only.
  - Doesn’t consume CPU/RAM when idle (just disk).[2][10]
- **Container**: built house, object, or running process.
  - Created from an image.
  - Contains a writable layer on top of image layers.
  - Consumes CPU/RAM while running.[8][10][2]

Kubernetes cares about both:

- It needs **images** to know what to run.
- It manages **containers** (inside pods) to actually run your workloads.[5][1][6][7]

---

## Why This Matters in Kubernetes Design

Understanding images vs containers is key for:

- **Rolling updates**
  - Change the image tag in a Deployment; Kubernetes gradually replaces pods with new containers using the new image.[1][7]

- **Reproducibility**
  - Images encode all dependencies; any container created from that image should behave consistently across nodes and clusters.[3][4][5][7]

- **Scaling**
  - Scaling up means more containers created from the same image; you don’t rebuild images to scale.[5][6][7]

- **Security and compliance**
  - You scan images for vulnerabilities and control which registries and image versions are allowed.[9][4][3]

---

## Interview-Style Summary

In Kubernetes, a **container image** is an immutable blueprint that packages an application and all its dependencies and is stored in a container registry. Kubernetes pulls these images and uses them to create **containers**, which are the actual running processes inside pods. Images are read‑only templates; containers are runtime instances with a small writable layer on top. Kubernetes orchestrates containers at scale—creating, scheduling, restarting, and replacing them—based on the images and desired state you specify in manifests.[2][4][9][1][3][5][6][7]

Are you more interested in **how Kubernetes decides which node pulls and runs a given image**, or in **best practices for designing images for Kubernetes (tags, size, security)**?

## Sources

[1] Images https://kubernetes.io/docs/concepts/containers/images/
[2] Docker Image vs Container - Difference Between ... https://aws.amazon.com/compare/the-difference-between-docker-images-and-containers/
[3] What is a container image? https://www.ibm.com/think/topics/container-images
[4] What is a Container Image? - ARMO Platform https://www.armosec.io/glossary/container-image/
[5] What's the difference between Kubernetes and Docker? https://www.sysdig.com/learn-cloud-native/whats-the-difference-between-kubernetes-and-docker
[6] Containers in Kubernetes: Concepts, Benefits & Best Practices https://www.aquasec.com/cloud-native-academy/kubernetes-101/managing-containers-in-kubernetes/
[7] Kubernetes vs Docker - Difference Between Container ... https://aws.amazon.com/compare/the-difference-between-kubernetes-and-docker/
[8] Docker image vs container: What are the differences? https://circleci.com/blog/docker-image-vs-container/
[9] What is Kubernetes? https://www.redhat.com/en/topics/containers/what-is-kubernetes
[10] Difference between Docker Image and Container https://www.geeksforgeeks.org/devops/difference-between-docker-image-and-container/
[11] What is the difference between running docker image and ... https://www.reddit.com/r/kubernetes/comments/g2xdaj/what_is_the_difference_between_running_docker/
[12] What is Container Image & why it is essential for Kubernetes ... https://www.youtube.com/watch?v=ylGBcsaozWo
