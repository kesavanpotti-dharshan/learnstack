---
title: Kubeconfig, Contexts & Namespaces
sidebar_label: Kubeconfig
sidebar_position: 3
---

Kubeconfig, contexts, and namespaces are three related concepts that control **how you connect to clusters** and **where your Kubernetes resources live**.

---

## Kubeconfig: How kubectl Knows Where to Connect

A **kubeconfig file** is a YAML configuration file that tells `kubectl` (and other tools) how to connect to one or more Kubernetes clusters.[1][2][3][4]

Key points:

- Default location is usually `~/.kube/config`.[2][4]
- It contains three main sections:
  - `clusters`: where the API servers are and TLS details.
  - `users`: how to authenticate (certs, tokens, etc.).
  - `contexts`: named combinations of cluster + user (+ optional namespace).[3][4][2]

You can have multiple clusters, users, and contexts in one kubeconfig, or use multiple kubeconfig files via the `KUBECONFIG` environment variable.[5][1][2]

At a high level, kubeconfig is a **connection profile** for Kubernetes, used by `kubectl` to know:

- Which cluster to talk to.
- Which credentials to use.
- Which namespace to target by default.[4][1][2][3]

---

## Contexts: Cluster + User + Namespace

A **context** in kubeconfig is a named tuple of:[1][2][3][4]

- `cluster` – which cluster/API server.
- `user` – which credentials/identity.
- `namespace` – optional default namespace.

You use contexts to quickly switch between environments (e.g., dev vs prod) or clusters.[6][2][3][4][1]

Examples:

- View current context:
  ```bash
  kubectl config current-context
  ```
- List contexts:
  ```bash
  kubectl config get-contexts
  ```
- Switch context:
  ```bash
  kubectl config use-context my-prod
  ```

By default, `kubectl` uses the **current context** for all commands.[2][3][4][1]

You can override context per command:

```bash
kubectl get pods --context=my-stage
kubectl get pods --context=my-prod -n payments
```

Internally, `kubectl` reads kubeconfig, finds the chosen context, then uses its cluster and user to connect and authenticate.[3][4][1][2]

You can also manage multiple kubeconfig files and select them via the `KUBECONFIG` environment variable, which many tools support.[7][5][1][2]

---

## Namespaces: Logical Partitions Inside a Cluster

A **namespace** is a way to divide a single cluster into multiple logical sub-clusters.[8][9][10][11]

Key properties:

- Namespaces group API resources (pods, services, deployments, configmaps, etc.) into separate logical buckets.[10][11][8]
- They help:
  - Avoid name conflicts.
  - Separate environments (dev, stage, prod).
  - Separate teams or applications.[11][8][10]

From the Kubernetes API’s perspective, namespaces provide **scoping and logical isolation**, but not full runtime isolation by themselves.[9][12][13][14]

You use namespaces like this:

```bash
kubectl get pods -n prod
kubectl create ns payments
kubectl apply -f app.yaml -n payments
```

If a context has a default namespace set, `kubectl` commands without `-n` will operate in that namespace.[4][1][2][3]

Namespaces are also a key building block for:

- Multi-tenancy.
- RBAC permissions.
- Network policies and isolation strategies.[14][8][9][11]

---

## How They Work Together

Putting it all together:[8][10][11][1][2][3][4]

- **Kubeconfig**: holds clusters, users, and contexts.
- **Context**: picks **which cluster**, **which user**, and **which default namespace** you are operating on.
- **Namespace**: within that cluster, defines **where resources are created and managed**.

Workflow:

1. You select or set a context (e.g., `my-prod`).
2. That context points to a prod cluster and a prod user, with a default namespace (e.g., `payments`).[2][3][4]
3. `kubectl apply -f app.yaml` uses:
   - The cluster from that context.
   - The user from that context.
   - The default namespace from that context unless you override with `-n`.[1][3][4][2]

By carefully structuring kubeconfig and contexts, and using namespaces for separation, you can manage multiple clusters and environments safely from one machine.[6][10][11][3][1][2]

---

## Interview-Style Summary

A kubeconfig file is a YAML configuration that tells `kubectl` how to connect to Kubernetes clusters—defining clusters (API endpoints + certificates), users (credentials), and contexts (cluster + user + default namespace). Contexts let you quickly switch between clusters and environments, and `kubectl` uses the current context by default. Namespaces are logical partitions inside a single cluster that scope names and group resources for different apps, teams, or environments. Together, kubeconfig, contexts, and namespaces determine **which cluster you’re talking to** and **where in that cluster your commands apply**.[10][11][3][4][8][1][2]

Would a short example showing **two clusters and two namespaces, and how you switch between them with contexts** be helpful next?

## Sources

[1] Organizing Cluster Access Using kubeconfig Files https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/
[2] Complete Guide to Kubeconfig and Kubernetes Contexts https://dev.to/goenning/complete-guide-to-kubeconfig-and-kubernetes-contexts-5h1l
[3] Authenticate across clusters kubeconfig - Unofficial Kubernetes https://unofficial-kubernetes.readthedocs.io/en/latest/concepts/cluster-administration/authenticate-across-clusters-kubeconfig/
[4] kubeconfig File Explained: Master Kubernetes Cluster ... https://www.youtube.com/watch?v=JjuZbUPKspM
[5] Kubectl how to work with different clusters (contexts) at the same time https://stackoverflow.com/questions/72881413/kubectl-how-to-work-with-different-clusters-contexts-at-the-same-time
[6] Access multiple K8S clusters from a single location https://www.reddit.com/r/kubernetes/comments/1c7t8ra/access_multiple_k8s_clusters_from_a_single/
[7] How do I manage multiple kubeconfig files in my ~/.kube/ ... https://www.reddit.com/r/kubernetes/comments/1dovs69/how_do_i_manage_multiple_kubeconfig_files_in_my/
[8] Multi-tenancy https://kubernetes.io/docs/concepts/security/multi-tenancy/
[9] Kubernetes Namespace Isolation https://www.securview.com/ai-security-essentials/kubernetes-namespace-isolation
[10] The Importance of Kubernetes Namespace Separation https://kubeops.net/blog/the-importance-of-kubernetes-namespace-separation
[11] Advanced Kubernetes Namespaces: Isolation Strategies https://rafay.co/ai-and-cloud-native-blog/mastering-kubernetes-namespaces-advanced-isolation-resource-management-and-multi-tenancy-strategies
[12] Beyond Namespaces: Real Isolation for Kubernetes Security https://edera.dev/stories/beyond-namespaces-real-isolation-for-kubernetes-security
[13] Kubernetes Namespaces Offer No Isolation, and How You ... https://www.youtube.com/watch?v=lKYmVCArxoI
[14] Kubernetes namespaces isolation - what it is, what it isn't, life, https://www.synacktiv.com/en/publications/kubernetes-namespaces-isolation-what-it-is-what-it-isnt-life-universe-and-everything
[15] Use multiple contexts with same user-name in kubectl config https://stackoverflow.com/questions/60655653/use-multiple-contexts-with-same-user-name-in-kubectl-config
