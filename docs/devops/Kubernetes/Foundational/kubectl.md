---
title: Kubernetes CLI Commands (KubeCTL)
sidebar_label: Kubectl
sidebar_position: 3
---

`kubectl` is the **command‑line tool for talking to the Kubernetes API**; you use it to create, inspect, debug, and delete almost all resources in a cluster.[1][2][3][4][5]

---

## What kubectl Does

kubectl:

- Translates your commands into API calls to the Kubernetes API server.[3][5]
- Lets you manage resources (Pods, Deployments, Services, ConfigMaps, Secrets, etc.).[2][4][1]
- Is the primary way to deploy apps, view cluster state, and troubleshoot.[4][1][2][3]

Every command follows this pattern:[5][2]

```bash
kubectl [command] [TYPE] [NAME] [flags]
```

- `command`: action (get, describe, apply, delete, logs, exec, scale, …).[2][5]
- `TYPE`: resource kind (pods, deploy, svc, cm, secret, ns, node, …).[1][4][2]
- `NAME`: specific resource name (optional).[5][2]
- `flags`: options (e.g., `-n`, `-o yaml`, `--dry-run`, `-f file.yaml`).[6][1][2]

---

## Most Important Commands

If you’re starting out, these are the “big five” you’ll use constantly.[7][8][1][2]

### 1. `kubectl get`

List resources.[9][4][1][2]

Examples:

```bash
kubectl get pods
kubectl get pods -n production
kubectl get svc
kubectl get deploy
kubectl get all --all-namespaces
```

Use `-o wide` for more details (node, IP, etc.).[4][9]

### 2. `kubectl describe`

Show detailed info, events, and conditions.[8][1][2]

```bash
kubectl describe pod my-pod
kubectl describe svc my-service
kubectl describe deploy my-app
```

Very helpful for debugging scheduling issues, failures, or why a pod won’t start.[8][1][2]

### 3. `kubectl apply`

Create or update resources **declaratively** from YAML.[9][1][2][4]

```bash
kubectl apply -f app.yaml
kubectl apply -f k8s/   # apply all manifests in a folder
```

This is the preferred way to manage real clusters, instead of many imperative `kubectl create` commands.[1][2][4]

### 4. `kubectl delete`

Remove resources.[2][4][9]

```bash
kubectl delete pod my-pod
kubectl delete -f app.yaml
kubectl delete deploy my-app
```

You can also delete by label or type.[4]

### 5. `kubectl logs`

View container logs from a Pod.[10][8][1][2][4]

```bash
kubectl logs my-pod
kubectl logs -f my-pod           # follow logs
kubectl logs -f deploy/my-app    # logs from a Deployment’s pod(s)
```

Essential for debugging crashes and runtime errors.[8][1][2]

### 6. `kubectl exec`

Run a command inside a running Pod (like SSH into a container).[11][10][2][8]

```bash
kubectl exec -it my-pod -- /bin/sh
kubectl exec -it my-pod -- ls /app
```

Used for troubleshooting and one‑off checks.[11][2][8]

---

## Other Very Useful Commands

- **Context & config**
  - `kubectl config view` – show kubeconfig.[11]
  - `kubectl config get-contexts` / `use-context` – switch clusters/environments.[11]

- **Cluster info**
  - `kubectl cluster-info` – overview endpoints.[11]
  - `kubectl get nodes` – list worker nodes.[9][4][11]

- **Scaling & rollout**
  - `kubectl scale deploy my-app --replicas=5` – change replica count.[2]
  - `kubectl rollout status deploy/my-app` – watch deployment roll out.[9][2]
  - `kubectl rollout undo deploy/my-app` – rollback.[2][9]

- **Port forwarding**
  - `kubectl port-forward svc/api 8080:80` – access a Service locally.[2]

- **Top / metrics**
  - `kubectl top pods` / `top node` – see CPU/RAM usage (if metrics server installed).[4][2]

---

## Common Flags

A few flags you’ll use all the time:[6][1][4][2]

- `-n` or `--namespace` – select namespace:
  - `kubectl get pods -n prod`
- `-o yaml` / `-o json` – full YAML/JSON manifest:
  - `kubectl get pod my-pod -o yaml`
- `-o wide` – extra columns (node, IP):
  - `kubectl get pods -o wide`
- `--dry-run=client` – show what would happen without applying:
  - `kubectl apply -f app.yaml --dry-run=client`
- `-f` – specify manifest file or directory:
  - `kubectl apply -f k8s/`

---

## Typical Debug Workflow

A very common pattern is: **get → describe → logs → exec**.[1][8][2]

For a failing app:

1. `kubectl get pods` – see status.[1][2]
2. `kubectl describe pod my-pod` – see events, image, probes.[8][2]
3. `kubectl logs my-pod` – inspect stack traces or errors.[10][8][1][2]
4. `kubectl exec -it my-pod -- /bin/sh` – poke around inside, check files/config.[8][2]

That sequence solves a huge percentage of day‑to‑day issues.

---

## Interview-Style Summary

kubectl is the official CLI for Kubernetes. Every command follows `kubectl [command] [TYPE] [NAME] [flags]`. The key commands are `get` (list resources), `describe` (details and events), `apply` (create/update from YAML), `delete` (remove resources), `logs` (view container logs), and `exec` (run commands inside pods). You use flags like `-n` (namespace) and `-o yaml` (output format) to refine what you see or do. kubectl is effectively your main interface to the Kubernetes API and is central to deploying, inspecting, and debugging workloads.[3][5][4][1][2]

Do you want next a **small, realistic kubectl walkthrough** (e.g., deploy nginx, inspect it, then delete it), or a **cheat-sheet style list of commands grouped by task (deploy, debug, scale)**?

## Sources

[1] The Ultimate Kubernetes Cheat Sheet: Essential kubectl ... https://www.splunk.com/en_us/blog/learn/kubernetes-commands-cheat-sheet.html
[2] kubectl: Essential Commands for Beginners https://institute.sfeir.com/en/kubernetes-training/kubectl-commands-essential-beginners/
[3] The Complete kubectl Cheat Sheet https://controlplane.com/blog/post/the-complete-kubectl-cheat-sheet
[4] Kubernetes - Kubectl Commands https://www.geeksforgeeks.org/devops/kubernetes-kubectl-commands/
[5] Command line tool (kubectl) https://kubernetes.io/docs/reference/kubectl/
[6] Kubectl Cheat Sheet – 16 Kubernetes Commands & Objects https://spacelift.io/blog/kubernetes-cheat-sheet
[7] kubectl Basic Commands: Master Your First Kubernetes ... https://www.youtube.com/watch?v=h3OTkmuKS3o
[8] 4 Kubernetes Kubectl Commands for Every Beginner https://www.youtube.com/watch?v=15AxRXTJyaI
[9] kubectl.md - bitrise-io/cheat-sheets https://github.com/bitrise-io/cheat-sheets/blob/master/kubectl.md
[10] The Only Kubectl Cheat Sheet You'll Ever Need https://trilio.io/kubernetes-best-practices/kubectl-cheat-sheet/
[11] Kubernetes Cheat Sheet https://www.mirantis.com/blog/kubernetes-cheat-sheet/
[12] kubectl Quick Reference https://kubernetes.io/docs/reference/kubectl/quick-reference/
[13] I created this printable PDF cheat sheet with kubectl ... https://www.reddit.com/r/kubernetes/comments/15gaows/i_created_this_printable_pdf_cheat_sheet_with/
[14] Chapter 9: Kubectl Cheat Sheet - Kubernetes Guides https://www.apptio.com/topics/kubernetes/devops-tools/kubectl-cheat-sheet/
