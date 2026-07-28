---
title: Kubernetes Architecture
sidebar_label: Architecture
sidebar_position: 1
---

Kubernetes architecture is built around a **cluster** with two main parts: a **control plane** that acts as the “brain,” and **worker nodes** that actually run your containers inside pods.[1][2][3][4][5][6][7]

---

## Cluster Overview

A Kubernetes **cluster** is a set of machines (nodes) running containerized applications under the control of the Kubernetes system.[2][3][7][8]

- **Control plane**: makes global decisions and maintains the desired state of the cluster (what should be running, where, and how many).[3][4][5][6][9][1][2]
- **Worker nodes**: actually run your workloads—pods and containers.[4][6][7][8][2][3]

---

## Control Plane Components

The control plane exposes the Kubernetes API and drives all scheduling and state-management logic.[5][6][9][1][3][4]

Key components:

- **kube-apiserver**
  - Front door of the cluster: HTTP API that `kubectl`, controllers, and clients talk to.[6][9][1][4][5]
  - All changes (creating pods, deployments, services) go through the API server.

- **etcd**
  - Highly available key‑value store that holds cluster state—objects like pods, deployments, services, configmaps, etc.[1][3][4][6]
  - If it’s not in etcd, it doesn’t exist in Kubernetes.[4]

- **kube-scheduler**
  - Watches for pods that don’t have a node yet and assigns them to suitable nodes.[9][3][5][1][4]
  - Considers resources, constraints, affinities, and limits.

- **kube-controller-manager**
  - Runs many controllers that continuously reconcile actual state with desired state (deployments, replicas, nodes, etc.).[3][5][6][9][1][4]
  - Examples:
    - Replication/ReplicaSet controller: ensures the right number of pod replicas.
    - Node controller: monitors node health.[4]

- **cloud-controller-manager** (optional)
  - Integrates Kubernetes with cloud provider features (load balancers, volumes, node lifecycle).[1][3][4]

The control plane is usually replicated across multiple machines for high availability.[5][6][3]

---

## Worker Node Components

Each **worker node** is a machine (VM or physical) that runs pods and provides the runtime environment.[7][2][6][3][4]

On every node you’ll find:

- **kubelet**
  - Agent that talks to the API server.
  - Ensures the containers for each pod are running as specified.
  - Reports status and health back to the control plane.[6][9][3][1][4]

- **kube-proxy**
  - Maintains network rules on the node to implement Kubernetes Services.
  - Handles cluster IPs, routing, and load balancing to pods.[6][1][4]

- **Container runtime**
  - Actually runs containers: `containerd`, CRI‑O, or similar.
  - Pulls images from registries and starts/stops containers.[10][1][4][6]

Pods run on nodes, and each pod wraps one or more containers.[8][2][7][3]

---

## Core Workload Objects

Beyond control-plane and node components, Kubernetes architecture uses a set of objects to represent workloads and networking.[11][12][13][14]

- **Pod**
  - Smallest deployable unit; wraps one or more tightly coupled containers that share network and storage.[13][2][7][11][3]
  - Ephemeral; pods can be killed and recreated at any time.

- **Deployment / ReplicaSet**
  - Higher-level controllers for stateless workloads.
  - You declare the desired replica count; the system creates and maintains pods accordingly.[12][14][11][13][3]

- **Service**
  - Provides a stable virtual IP and DNS name for a set of pods, even though individual pod IPs change over time.[14][11][1]
  - Handles load balancing and discovery inside the cluster.

- **Ingress**
  - Routes external HTTP/HTTPS traffic into Services via rules.[11][12][14]

- **ConfigMap & Secret**
  - Store configuration and sensitive data, mounted into pods or injected as environment variables.[12]

Together, these objects define what should run, how it’s exposed, and how it’s configured.

---

## Desired State and Reconciliation

Kubernetes architecture is fundamentally **declarative**:

- You describe **desired state** (e.g., “3 replicas of this Deployment, Pods labeled `app=api` exposed via a Service”).[3][5][6]
- The control plane continuously reconciles actual state to match that desired state:
  - If a pod dies, the controller manager creates a new one.
  - If replicas are too few, scheduler places new pods on nodes.
  - If a node fails, control plane reschedules pods elsewhere.[8][5][3][4][6]

This reconciliation loop is what gives Kubernetes self‑healing and scalability behavior.[5][8][3][6]

---

## High-Level Data and Control Flows

Putting it together:[7][9][8][1][3][4][6]

1. You apply a manifest (YAML) or use `kubectl` to create resources via the API server.
2. The API server stores the new desired state in etcd.
3. Controllers detect the change and create or modify lower-level objects (pods, replica sets).
4. Scheduler assigns pods to nodes.
5. kubelet on each node pulls images and runs containers to satisfy the pod spec.
6. kube-proxy and Services handle traffic routing.
7. Control plane and controllers continually watch and adjust the system to maintain that state.

---

## Interview-Style Summary

Kubernetes architecture uses a **control plane / worker node** model. The control plane—made up of the API server, etcd, scheduler, and controllers—stores the desired state of the cluster and makes global decisions like scheduling and scaling. Worker nodes run the actual workloads: pods and containers, managed by kubelet, kube-proxy, and a container runtime. Applications are represented by objects like Pods, Deployments, and Services. Users declare desired state via the API, and the control plane continuously reconciles the real cluster state to match it, providing self‑healing, scaling, and a consistent way to run containers at scale.[2][9][14][7][8][1][3][4][5][6]

Would you like a breakdown next of **how Services and Ingress fit into the architecture**, or **how scheduling and rescheduling of pods works in more detail**?

## Sources

[1] Kubernetes Components https://kubernetes.io/docs/concepts/overview/components/
[2] Introduction to Kubernetes architecture https://www.redhat.com/en/topics/containers/kubernetes-architecture
[3] Cluster Architecture https://kubernetes.io/docs/concepts/architecture/
[4] Kubernetes - Architecture https://www.geeksforgeeks.org/devops/kubernetes-architecture/
[5] Kubernetes architecture: a guide to the main components https://www.sparkfabrik.com/en/blog/kubernetes-architecture-guide-to-components/
[6] What is the Kubernetes Control Plane? - ARMO Platform https://www.armosec.io/glossary/kubernetes-control-plane/
[7] Mastering Kubernetes: Clusters, nodes, and pods explained https://newrelic.com/blog/infrastructure-monitoring/kubernetes-clusters-nodes-and-pods
[8] Kubernetes Architecture Breakdown https://blog.gigamon.com/2021/05/04/kubernetes-architecture-breakdown/
[9] Kubernetes Architecture Explained: Control Plane vs Worker ... https://www.youtube.com/watch?v=NfVifspmz9k
[10] Containers in Kubernetes: Concepts, Benefits & Best Practices https://www.aquasec.com/cloud-native-academy/kubernetes-101/managing-containers-in-kubernetes/
[11] Kubernetes architecture explained: enterprise fleet ... https://www.qovery.com/blog/what-is-kubernetes-architecture
[12] Kubernetes Components explained! Pods, Services, Secrets ... https://www.youtube.com/watch?v=Krpb44XR0bk
[13] Demystifying Kubernetes: Pods, Deployments, and Services https://devopscon.io/blog/demystifying-kubernetes-pods-deployments-and-services/
[14] Kubernetes Architecture Explained (With Illustrated ... https://devopscube.com/kubernetes-architecture-explained/
[15] Kubernetes Control Plane: What It Is & How It Works https://spacelift.io/blog/kubernetes-control-plane
[16] Kubernetes architecture: control plane, data plane, and 11 ... https://www.flexera.com/blog/finops/kubernetes-architecture-11-core-components-explained/
