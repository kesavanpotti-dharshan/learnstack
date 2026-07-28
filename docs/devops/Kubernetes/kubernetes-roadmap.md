---
title: Kubernetes — Basic to Architect Level
sidebar_position: 1
---

## 1. Core Fundamentals

- Container basics (images, layers, runtime — containerd/CRI-O)
- Pods, ReplicaSets, Deployments, StatefulSets, DaemonSets
- Services (ClusterIP, NodePort, LoadBalancer), Endpoints
- ConfigMaps, Secrets
- Namespaces, Labels, Selectors, Annotations
- kubectl, YAML manifests, API objects

## 2. Networking

- CNI plugins (Calico, Cilium, Flannel)
- kube-proxy, iptables/IPVS
- Ingress vs Gateway API
- Network Policies
- Service Mesh (Istio, Linkerd) — mTLS, traffic shaping, observability
- DNS (CoreDNS), multi-cluster networking

## 3. Storage

- PV/PVC, StorageClasses, CSI drivers
- StatefulSets with persistent storage
- Volume snapshotting, backup (Velero)

## 4. Scheduling & Resource Management

- Requests/Limits, QoS classes
- Node affinity/anti-affinity, taints & tolerations
- Pod topology spread constraints
- HPA, VPA, Cluster Autoscaler, KEDA (event-driven scaling)
- Custom schedulers

## 5. Security

- RBAC, ServiceAccounts, Pod Security Standards/Admission
- Secrets management (Vault, Sealed Secrets, External Secrets Operator)
- Image scanning, supply chain security (SBOM, Sigstore/cosign)
- Network segmentation, OPA/Gatekeeper, Kyverno (policy-as-code)
- Runtime security (Falco)

## 6. Workloads & Extensibility

- Jobs, CronJobs
- Custom Resource Definitions (CRDs)
- Operators & Operator Pattern (Kubebuilder, Operator SDK)
- Admission Controllers (mutating/validating webhooks)
- Helm, Kustomize

## 7. Observability

- Metrics (Prometheus, Grafana)
- Logging (Fluentd/Fluent Bit, Loki, ELK)
- Distributed tracing (OpenTelemetry, Jaeger)
- Health checks (liveness/readiness/startup probes)

## 8. CI/CD & GitOps

- ArgoCD, Flux
- Progressive delivery (canary, blue-green) — Argo Rollouts, Flagger
- Pipeline integration (GitHub Actions, Azure DevOps)

## 9. Cluster Architecture & Operations

- Control plane internals (etcd, API server, scheduler, controller-manager)
- HA control plane design, etcd backup/restore
- Cluster upgrades, node lifecycle management
- Multi-tenancy strategies (namespace isolation, vCluster, hierarchical namespaces)
- Managed K8s nuances (AKS, EKS, GKE) — architect-level tradeoffs

## 10. Architect-Level: Design & Strategy

- Multi-cluster & multi-region architecture (fleet management, failover)
- Cost optimization (bin-packing, spot/preemptible nodes, right-sizing)
- Disaster recovery & business continuity design
- Platform engineering (Internal Developer Platforms, Backstage)
- Compliance & governance at scale (policy enforcement, audit)
- Migration strategy (monolith → microservices on K8s)
- Capacity planning, SLA/SLO design, chaos engineering (Litmus, Chaos Mesh)
- Vendor lock-in tradeoffs, hybrid/on-prem vs cloud-managed decisions
