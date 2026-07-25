---
title: Argo CD — Architect-Level Learning Path
sidebar_position: 10
---

## 1. Core Concepts

- GitOps principles (declarative, git as source of truth, pull-based)
- Application CRD, sync status, health status
- Repo types (Helm, Kustomize, plain YAML, Jsonnet)
- Manual vs automated sync, sync waves/hooks

## 2. Building Blocks

- Projects (AppProjects) — scoping repos/clusters/namespaces
- Sync policies (prune, self-heal, retry)
- Resource hooks (PreSync/Sync/PostSync/SyncFail)
- Diffing & drift detection, ignoreDifferences
- Health checks (built-in + custom Lua scripts)

## 3. Application Patterns

- App-of-Apps pattern
- ApplicationSets (generators: list, cluster, git, matrix, pull request)
- Multi-source applications (Helm chart + values repo separation)
- Helm/Kustomize overlays for env-specific config
- Monorepo vs multi-repo GitOps structuring

## 4. Multi-Cluster & Multi-Tenancy

- Hub-and-spoke cluster management (single control plane, many targets)
- Cluster registration & credential management
- Multi-tenancy via Projects, RBAC, namespace isolation
- ApplicationSet cluster generator for fleet-wide rollout
- Cluster bootstrapping strategy (cluster-as-code)

## 5. Security & Governance

- RBAC (built-in policy.csv, SSO group mapping)
- SSO integration (OIDC/Dex, Entra ID, Okta)
- Secrets management (Sealed Secrets, External Secrets Operator, SOPS, Vault)
- Repo/cluster credential scoping per project
- Audit logging & compliance trails

## 6. Deployment Strategies

- Progressive delivery with Argo Rollouts (canary, blue-green)
- Automated rollback on failed health checks
- Integration with Flagger/service mesh (Istio/Linkerd traffic shifting)
- Notification integration (Argo CD Notifications — Slack/Teams/webhook)
- Image update automation (Argo CD Image Updater)

## 7. Scalability & Reliability

- Controller sharding & scaling for large fleets
- Performance tuning (repo-server caching, resource limits)
- High availability setup (HA manifests, Redis HA)
- Disaster recovery (declarative recovery from Git)
- Resource pruning strategy at scale

## 8. Org-Level Architecture (Architect Focus)

- GitOps repo architecture (env-per-branch vs env-per-folder vs env-per-repo)
- Platform engineering: self-service app onboarding via ApplicationSets + IDP (Backstage)
- Standardizing deployment patterns across hundreds of teams
- Migration strategy from CI-push deployments (Jenkins/Actions) to GitOps pull model
- Multi-cloud/hybrid cluster fleet management
- Policy enforcement at scale (Kyverno/OPA Gatekeeper integration pre-sync)
- Build vs buy: Argo CD vs Flux vs managed GitOps (Amazon EKS Anywhere, Azure Arc)
- Cost/ownership model: platform team vs app team responsibilities
