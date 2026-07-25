---
title: Terraform — Architect-Level Learning Path
sidebar_position: 10
---

## 1. Core Concepts

- IaC principles, declarative vs imperative
- HCL syntax, providers, resources, data sources
- State file: purpose, local vs remote state
- Plan/apply/destroy lifecycle, drift detection

## 2. Building Blocks

- Variables, outputs, locals
- Meta-arguments (count, for_each, depends_on, lifecycle)
- Provisioners (and why to avoid them)
- Functions & expressions, dynamic blocks
- Modules: structure, inputs/outputs, versioning

## 3. State Management

- Remote backends (S3+DynamoDB, Azure Storage, Terraform Cloud)
- State locking & concurrency
- Workspaces vs directory-per-env strategies
- State manipulation (import, mv, rm) & drift remediation
- Splitting state (blast radius reduction)

## 4. Module & Code Architecture

- Module design patterns (root, composed, registry modules)
- Versioning & semantic release for modules
- DRY vs explicitness tradeoffs
- Multi-layer architecture (network/platform/app layers)
- Testing: terraform validate, plan diffing, Terratest, OPA/Conftest

## 5. Multi-Environment & Multi-Cloud

- Environment promotion strategy (dev/stage/prod)
- Multi-account/multi-subscription patterns (AWS Organizations, Azure mgmt groups)
- Multi-region & multi-cloud abstraction strategies
- Workspaces vs Terragrunt for env management
- Secrets handling (Vault, SSM, Key Vault integration)

## 6. Security & Governance

- Least-privilege IAM for CI/CD execution roles
- Policy as Code (Sentinel, OPA/Conftest, Checkov, tfsec)
- Compliance scanning in pipeline (pre-apply gates)
- Secret scanning & preventing state file leakage
- RBAC for Terraform Cloud/Enterprise workspaces

## 7. CI/CD Integration

- Automated plan/apply pipelines (GitHub Actions/GitLab/Jenkins)
- PR-based plan review workflows, apply approval gates
- Atlantis / Terraform Cloud / Spacelift orchestration
- Rollback strategy (state is not git revert — plan-based recovery)
- Drift detection automation & scheduled reconciliation

## 8. Org-Level Architecture (Architect Focus)

- Landing zone design (account/subscription vaulting, guardrails)
- Module registry strategy & platform team ownership model
- Standardizing patterns across hundreds of teams/repos
- Terraform vs Pulumi/CDK/Crossplane — build vs buy tradeoffs
- Cost governance (Infracost, tagging strategy, budget alerts)
- Migration strategy (CloudFormation/ARM → Terraform, brownfield import)
- Disaster recovery for state & infra reproducibility
- Platform engineering: self-service infra via Terraform + IDP (Backstage)
