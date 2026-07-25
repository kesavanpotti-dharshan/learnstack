---
title: GitHub Actions — Architect-Level Learning Path
sidebar_position: 10
---

## 1. Core Concepts

- Workflows, events, jobs, steps, runners (hosted vs self-hosted)
- YAML syntax, workflow triggers (push, PR, schedule, workflow_dispatch, repository_dispatch)
- Contexts & expressions (github, env, secrets, needs, matrix)
- Actions types: composite, JavaScript, Docker container actions

## 2. Building Blocks

- Job dependencies (`needs`), conditional execution (`if`)
- Matrix builds & strategy (fail-fast, max-parallel)
- Artifacts & caching (actions/cache, actions/upload-artifact)
- Environment variables & secrets scoping
- Reusable workflows (`workflow_call`) vs composite actions

## 3. Security & Governance

- OIDC federation (cloud auth without long-lived secrets)
- Secrets management (repo/org/environment level), secret scanning
- GITHUB_TOKEN permissions model (least privilege)
- Third-party action pinning (SHA vs tag), Dependabot for actions
- Environments: protection rules, required reviewers, deployment branches
- Supply-chain security (SLSA, provenance attestations, artifact signing/Sigstore)

## 4. Runner Architecture

- GitHub-hosted vs self-hosted runner tradeoffs
- Self-hosted runner scaling (ARC - Actions Runner Controller on K8s)
- Runner groups, labels, autoscaling strategies
- Ephemeral runners & security isolation
- Cost/performance tuning (larger runners, concurrency limits)

## 5. Advanced Workflow Design

- Monorepo strategies (path filters, dynamic matrix generation)
- Reusable workflow libraries across org (centralized CI/CD templates)
- Custom actions development & publishing (versioning, marketplace)
- Workflow orchestration patterns (fan-out/fan-in, conditional pipelines)
- Concurrency groups & cancellation strategies

## 6. CI/CD & Deployment Patterns

- Multi-environment promotion (dev→stage→prod) with gates
- GitOps integration (ArgoCD/Flux triggers)
- Blue-green / canary deployment workflows
- Rollback strategies & release automation (semantic-release)
- Container build/push pipelines (Docker layer caching, multi-arch builds)

## 7. Observability & Reliability

- Workflow monitoring, job summaries, annotations
- Failure notification patterns (Slack/Teams/PagerDuty integration)
- Debugging (step debug logging, re-run with SSH)
- SLA/SLO thinking for pipeline performance
- Cost observability (billing API, usage reports)

## 8. Org-Level Architecture (Architect Focus)

- Org/enterprise policy enforcement (required workflows, ruleset policies)
- Governance at scale: standardizing pipelines across hundreds of repos
- Migration strategy from Jenkins/GitLab CI/Azure DevOps
- Platform engineering: internal developer platform (IDP) built on Actions
- Multi-cloud/hybrid CI strategy, vendor lock-in mitigation
- Compliance (SOC2/audit trails), change management via workflows
- Build vs buy decisions (self-hosted infra vs GitHub-hosted at scale)
