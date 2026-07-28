---
title: Kubernetes Components
sidebar_label: Components
sidebar_position: 3
---

Kubernetes is built from a set of **core components** that together manage clusters and run your containerized workloads. They fall into two main groups: **control plane components** and **node (worker) components**, plus common workload objects like Pods, Services, Deployments, ConfigMaps, and Secrets.[1][2][3][4][5]

---

## Control Plane Components

These components run on control-plane nodes and act as the “brain” of the cluster, managing desired state and cluster decisions.[2][3][4][5][6][7][1]

- **kube-apiserver**
  - HTTP API front-end for all Kubernetes operations; `kubectl`, controllers, and clients talk to it.[3][4][6][1][2]
  - Validates requests and updates cluster state (stored in etcd).

- **etcd**
  - Distributed, highly available key‑value store that holds all cluster data (objects like Pods, Deployments, Services).[4][1][2][3]
  - If something isn’t in etcd, it doesn’t exist in the cluster.[4]

- **kube-scheduler**
  - Watches for newly created Pods that don’t yet have a node assigned.[7][8][1][2][4]
  - Chooses the best worker node based on resources, constraints, and policies.[4]

- **kube-controller-manager**
  - Runs controller loops that continuously reconcile actual state to desired state.[1][2][3][7][4]
  - Includes controllers like:
    - Node controller (node health).
    - Replication/ReplicaSet controller (correct number of Pod replicas).[4]

- **cloud-controller-manager** (optional)
  - Integrates with cloud provider APIs for nodes, load balancers, volumes, etc.[2][1][4]

Control-plane components themselves often run as Pods on control-plane nodes, managed by kubelet and kube-proxy just like other workloads.[6][1]

---

## Node (Worker) Components

These run on every worker node and are responsible for actually running your containers and wiring up networking.[5][9][3][6][1][2][4]

- **kubelet**
  - Node agent that receives Pod specs from the control plane and ensures containers are running and healthy as described.[3][5][6][1][2][4]
  - Reports node and Pod status back to the API server.[5][4]

- **kube-proxy**
  - Network proxy that maintains iptables/IPVS rules on each node to implement Services and Pod‑to‑Pod traffic.[9][6][1][2][3][5][4]
  - Provides load balancing and service discovery for Pods.

- **Container runtime**
  - Software such as `containerd` or CRI‑O that pulls images and runs containers.[3][5][4]
  - kubelet uses the runtime to start/stop containers inside Pods.

Each node also has a local view of Pods scheduled to it and the resources they use.[10][1][5]

---

## Core Workload Objects

Beyond control-plane and node agents, Kubernetes has core resource types that you define in YAML or via the API.[11][12][13][14]

- **Pods**
  - Smallest deployable unit in Kubernetes; wrap one or more containers that share network and storage.[12][14][15][10]
  - Represent a single instance of an application.[10][12]

- **Deployments**
  - Higher-level controller that manages ReplicaSets and Pods.[13][14][12]
  - Let you specify replica count and handle rolling updates and rollbacks.

- **Services**
  - Abstraction that groups Pods via labels/selectors and exposes them over a stable virtual IP and port.[16][17][12][13]
  - Solve the problem of constantly changing Pod IPs by providing a fixed access point.[17][16]

- **Ingress**
  - Routes external HTTP/HTTPS traffic into Services using host/path rules.[14][11]
  - Implemented by an Ingress controller (like NGINX or Traefik).

- **ConfigMaps**
  - Store non‑confidential configuration as key‑value pairs, injected into Pods via env vars or mounted volumes.[18][12][13][14]
  - Decouple configuration from code.[14][18]

- **Secrets**
  - Store sensitive data like passwords, tokens, or keys.[19][12][13][14]
  - Similar to ConfigMaps but intended for confidential data; can be mounted or injected as env vars.[18][19][14]

- **Namespaces**
  - Logical partitions inside a cluster for isolating resources by environment, team, or project.[14]

These objects are what you typically interact with day‑to‑day when defining applications in Kubernetes.[11][12][14]

---

## How Components Work Together

Putting the components together:[6][1][2][5][10][3][4]

1. You create objects (Deployments, Services, ConfigMaps, Secrets, etc.) via `kubectl` or the API.[2][4]
2. `kube-apiserver` receives the request and stores the desired state in `etcd`.[2][3][4]
3. Controllers (via kube-controller-manager) see changes and create/update Pods, ReplicaSets, etc.[7][1][2][4]
4. `kube-scheduler` assigns unscheduled Pods to suitable nodes.[1][7][2][4]
5. `kubelet` on each node pulls images, starts containers, and reports status.[5][6][1][3][4]
6. `kube-proxy` configures networking so Services route traffic to Pods.[9][6][1][3][4]
7. ConfigMaps and Secrets provide configuration and credentials to Pods.[12][13][19][18][14]

Through continuous reconciliation loops, the control plane ensures the actual cluster state matches the desired state you declared.[7][1][3][4]

---

## Interview-Style Summary

Kubernetes components fall into two main groups. The **control plane**—made up of the API server, etcd, scheduler, controller manager, and optional cloud‑controller—stores desired state and makes cluster‑wide decisions. Each **node** runs kubelet, kube‑proxy, and a container runtime to execute Pods and wire up networking. On top of that, core objects like Pods, Deployments, Services, ConfigMaps, and Secrets represent your workloads and their configuration. Users declare desired state via these objects, and the control plane + node components continuously work together to keep the system in that state.[13][6][12][1][3][5][14][2][4]

Is it more helpful for you next to see **a diagram-style mapping of these components in a typical cluster**, or a focus on **how Pods, Deployments, and Services interact in practice**?

## Sources

[1] Cluster Architecture https://kubernetes.io/docs/concepts/architecture/
[2] Kubernetes Components https://kubernetes.io/docs/concepts/overview/components/
[3] What is the Kubernetes Control Plane? - ARMO Platform https://www.armosec.io/glossary/kubernetes-control-plane/
[4] Kubernetes - Architecture https://www.geeksforgeeks.org/devops/kubernetes-architecture/
[5] Components of Kubernetes https://www.sysdig.com/learn-cloud-native/components-of-kubernetes
[6] Kubernetes Logical Architecture: Control Plane vs Worker ... https://dev.to/jamesli/kubernetes-logical-architecture-control-plane-vs-worker-nodes-why-the-control-plane-runs-kubelet-3nl7
[7] Kubernetes architecture: a guide to the main components https://www.sparkfabrik.com/en/blog/kubernetes-architecture-guide-to-components/
[8] Kubernetes Architecture Explained: Control Plane vs Worker ... https://www.youtube.com/watch?v=NfVifspmz9k
[9] The documentation is misleading that kube-proxy and ... https://github.com/kubernetes/website/issues/47111
[10] Mastering Kubernetes: Clusters, nodes, and pods explained https://newrelic.com/blog/infrastructure-monitoring/kubernetes-clusters-nodes-and-pods
[11] Kubernetes Components explained! Pods, Services, Secrets ... https://www.youtube.com/watch?v=Krpb44XR0bk
[12] Kubernetes: pods, services, deployments, secrets | Padok https://www.theodo.com/blog/basic-components-kubernetes-pods-services-deployments
[13] What is Deployment, Service, Secret and ConfigMap in ... https://dev.to/sagarjadhv23/what-is-deployment-service-secret-and-configmap-in-kubernetes-1pk5
[14] Kubernetes Concepts: Pods, Nodes, Deployments, ConfigMaps https://www.youtube.com/watch?v=eAKkRkg8wAA
[15] Demystifying Kubernetes: Pods, Deployments, and Services https://devopscon.io/blog/demystifying-kubernetes-pods-deployments-and-services/
[16] Kubernetes architecture explained: enterprise fleet ... https://www.qovery.com/blog/what-is-kubernetes-architecture
[17] Kubernetes Architecture Explained (With Illustrated ... https://devopscube.com/kubernetes-architecture-explained/
[18] ConfigMaps and Secrets — How They Actually Work? https://thekubeguy.com/configmaps-and-secrets-how-they-actually-work-81dddde46e6d
[19] Secrets https://kubernetes.io/docs/concepts/configuration/secret/
[20] Kubernetes architecture: control plane, data plane, and 11 ... https://www.flexera.com/blog/finops/kubernetes-architecture-11-core-components-explained/
