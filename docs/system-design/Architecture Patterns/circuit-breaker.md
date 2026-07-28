---
title: Circuit Breaker software architecture
sidebar_label: Circuit Breaker
sidebar_position: 1
---

The circuit breaker pattern is a **fault-tolerance mechanism** that stops your service from repeatedly calling a broken dependency, fails fast instead of hanging, and lets that dependency recover before you try again.[1][2][3][4][5]

---

## Core Idea

A circuit breaker wraps a call to a downstream service (database, API, microservice) and **monitors failures and latency over time**.[1][2][3][5][6]

When failures cross a threshold, it “trips” and **opens the circuit**, immediately short‑circuiting future calls rather than letting them time out or retry endlessly.[2][3][4][5][6][1]

This prevents:

- Cascading failures across microservices.
- Overloading a struggling dependency.
- Long timeouts that hurt user experience.[3][6][7][8][1]

---

## States and Transitions

Circuit breakers typically have **three states**.[1][2][3][4][6]

### Closed

- Default, healthy state.
- All requests pass through to the downstream service.[1][2][3][6]
- Breaker tracks:
  - Errors.
  - Timeouts.
  - Latency.[9][1]

If error/timeout rate stays below threshold, it stays closed.

### Open

- Triggered when failures exceed a threshold in a rolling window.[1][2][3][4][5][6]
- All new calls are **blocked immediately**:
  - The breaker returns an error or a fallback without calling the dependency.[2][3][4][5][6]
- Goal:
  - Protect the failing service from further load.
  - Fail fast so callers don’t hang.[3][4][6][7][1]

### Half‑Open

- After a **cool‑off period**, the breaker allows a limited number of test calls through.[1][2][4][6]
- If test calls succeed:
  - Breaker moves back to **Closed** and normal traffic resumes.[2][4][6]
- If they fail:
  - Breaker goes back to **Open** and waits longer.[4][6][2]

---

## How It Works in Practice

### Basic Flow

1. Wrap the dependency call in a circuit breaker component.[2][3][5]
2. Define thresholds:
   - Max error rate or timeout count.
   - Time window.
   - Cool‑down duration.[1][3][4][6]
3. On each call, the breaker:
   - Checks current state (Closed/Open/Half‑Open).
   - Either forwards the call, short‑circuits, or runs a test call.
   - Updates metrics and decides whether to change state.[4][6][9][1][2]

### Typical Behavior

- In normal operation:
  - Calls flow as usual; breaker just watches.[1][2][6]
- When a dependency starts failing:
  - Error/timeout counter climbs.
  - Once above threshold, breaker opens.[2][4][5][6][1]
- While open:
  - Caller gets an immediate error or fallback.
  - Dependency gets breathing room.[3][4][6][7]
- After cool‑off:
  - Half‑open state probes recovery.
  - Either resumes normal traffic or stays open.[4][6][2]

---

## Why It’s Used

The circuit breaker pattern is used to **increase resilience** in distributed systems and microservices.[1][2][6][7][8]

It helps to:

- Prevent cascading failures when one dependency is slow or down.
- Avoid “retry storms” that accidentally DoS a struggling service.[3][4][10]
- Improve user experience by failing fast and providing graceful fallbacks.[2][6][9][1]
- Allow services to recover before sending full traffic again.[4][6][7][3]

---

## Where to Put It

Circuit breakers are typically placed:

- In clients calling external services (e.g., payment, search, auth).[1][3][4]
- In microservices calling other microservices.[6][7][8][1]
- In gateways/API layers that aggregate multiple backends.[4][7][6]

They work well alongside:

- Timeouts (so failures are detected promptly).
- Retries (but capped to avoid storms).
- Fallbacks (default response, cached data, queued work).[2][10][6]

---

## Example Scenario (Payment Service)

Imagine an order service that calls a payment service.[1][4]

- Normal:
  - Circuit breaker is **Closed**; all payment calls go through.
- Payment service starts timing out:
  - Failures exceed threshold.
  - Breaker goes **Open**; order service gets fast failure or fallback.[2][4][6][1]
- After some time:
  - Breaker enters **Half‑Open**; sends a few test payments.
  - If they succeed, breaker **closes** and traffic resumes.
  - If they fail, breaker **opens** again and waits longer.[4][6][2]

This prevents the payment service’s issues from crashing the whole ordering workflow.

---

## Interview‑Style Summary

A circuit breaker is a resilience pattern that wraps calls to a downstream service, monitors failures, and stops calling the service when it’s likely to keep failing. It has three states: **closed** (calls pass through), **open** (calls are blocked and fail fast), and **half‑open** (a few test calls probe recovery). It’s used in microservices to prevent cascading failures, avoid overloading unhealthy dependencies, and enable graceful fallbacks while services recover.[1][2][3][4][6]

Would you like next a quick contrast with **retry + timeout**, or examples of implementing circuit breakers in a specific stack (e.g., Spring Boot/Resilience4j or Node.js)?

### Sources

[1] Circuit Breaker Pattern in Microservices https://www.geeksforgeeks.org/system-design/what-is-circuit-breaker-pattern-in-microservices/
[2] Circuit breaker design pattern https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern
[3] Circuit Breaker Pattern - Azure Architecture Center https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker
[4] Circuit breaker pattern - AWS Prescriptive Guidance https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/circuit-breaker.html
[5] Circuit Breaker https://martinfowler.com/bliki/CircuitBreaker.html
[6] Circuit Breaker Pattern in Microservices https://www.baeldung.com/cs/microservices-circuit-breaker-pattern
[7] Microservices: Circuit Breaker pattern for improving resilience https://docs.digibee.com/documentation/resources/use-cases/microservices-circuit-breaker
[8] Efficient Fault Tolerance with Circuit Breaker Pattern https://aerospike.com/blog/circuit-breaker-pattern/
[9] Circuit Breaker Pattern in Microservices https://www.youtube.com/watch?v=dJI2saoM5_k
[10] Resilience Design Patterns: Retry, Fallback, Timeout https://www.codecentric.de/en/knowledge-hub/blog/resilience-design-patterns-retry-fallback-timeout-circuit-breaker
[11] How to Use Circuit Breakers in Spring Boot Microservices https://www.linkedin.com/posts/diego-fialho_springboot-microservices-resilience4j-activity-7323645473485914112-8ChG
[12] Circuit Breaker: A Resilience Mechanism for Cloud Native ... https://ieeexplore.ieee.org/document/10426195/
