---
title: Throttling
sidebar_label: Throttling
sidebar_position: 3
---

---

### 1. Definition

Throttling is the practice of **controlling how fast requests, operations, or resource usage are allowed to proceed** so a system does not get overloaded.[1][2][3][4]

In system design, throttling is used to protect stability, preserve fairness, and keep service quality acceptable during spikes or heavy usage.[2][3][4][1]

---

### 2. Core Idea

The core idea is to **slow down or limit excessive traffic before it harms the system**.[3][4][5][1]

Throttling is closely related to rate limiting, but the emphasis is often on:

- Controlling throughput.
- Preventing overload.
- Applying temporary limits or reduced service levels.[4][5][1][3]

In practice, throttling may mean:

- Rejecting excess requests.
- Delaying requests.
- Lowering bandwidth or priority.
- Temporarily blocking abusive clients.[5][1][3][4]

---

### 3. How it Works

### Basic Flow

1. A request arrives at the gateway, API, or service.[6][7][3][4]
2. The system identifies the client using user ID, API key, IP address, account tier, or another key.[7][4][5]
3. It checks the client against a policy or quota.
4. If usage is within limits, the request is allowed.
5. If usage exceeds limits, the system throttles by rejecting, delaying, or degrading the request.[1][2][3][4][5]

### Lifecycle

- **Normal state**: requests flow normally.
- **Pressure state**: usage rises above expected levels.
- **Throttling state**: excess traffic is slowed, delayed, or blocked.
- **Recovery state**: the client is allowed normal access again when usage drops or the window resets.[2][3][4][5][1]

### Common Behaviors

- Return a 429 or similar error.
- Add backoff or retry-after guidance.
- Reduce throughput for a busy client.
- Temporarily suspend abusive traffic.[3][4][5][1]

### Throttling Signals

Common signals include:

- Request count per time window.
- Burst rate.
- CPU, memory, or queue pressure.
- Bandwidth usage.
- Per-tenant or per-user quota consumption.[4][5][1][2][3]

---

### 4. Internal Architecture

### Enforcement Points

Throttling can happen at:

- API gateway.
- Load balancer.
- Edge proxy.
- Application service.
- Background worker.
- Storage or messaging layer.[6][7][3][4]

### Tracking State

A throttling system usually stores:

- Client identifier.
- Request counters or tokens.
- Time window or refill time.
- Policy tier or quota.[8][5][7][4]

### Common Algorithms

#### Fixed Window

- Count requests in a fixed time period.
- Simple, but can allow bursts at window boundaries.[7][8][2][4]

#### Sliding Window

- Uses a rolling time span.
- Fairer than fixed window, but more complex.[9][7]

#### Token Bucket

- Tokens refill at a steady rate.
- Allows bursts up to bucket capacity.
- Good for balancing burst tolerance and long-term limits.[5][7]

#### Leaky Bucket

- Smooths traffic at a fixed output rate.
- Useful for controlling burstiness.[9][7]

### Memory and Failure Behavior

- Distributed throttling needs shared state or coordination so different instances enforce the same limit.[8][4][7]
- Systems often use Redis, caches, or counters to keep throttling state consistent across nodes.[7][8]
- If the throttling layer fails open, traffic may spike; if it fails closed, legitimate users may be blocked. That trade-off matters in production.

---

### 5. When to Use It

Use throttling when:

- You need to protect backend services from overload.
- You want fair usage across users or tenants.
- You need to enforce API quotas or subscription tiers.
- You want to manage abusive or accidental traffic spikes.[1][2][3][4]

Common use cases:

- Public APIs.
- SaaS multi-tenant platforms.
- Login and password reset endpoints.
- File uploads.
- Messaging or notification systems.
- Third-party integration endpoints.[2][3][5][1]

---

### 6. When Not to Use It

Avoid throttling when:

- The request volume is low and stable.
- Every request is equally critical and cannot be slowed.
- A simpler backlog, queue, or autoscaling solution is enough.
- You would harm correctness by delaying or blocking the work.[3][4][2]

Throttling is a control mechanism, not a substitute for fixing a slow database or broken architecture.

---

### 7. Pros and Cons

**Pros**

- Prevents overload.[1][2][3]
- Protects critical services.
- Improves fairness across clients.
- Helps enforce quotas and policy.
- Can be applied at multiple layers.[4][5][3][1]

**Cons**

- Can frustrate users if too aggressive.
- Requires careful tuning.
- Adds state and coordination overhead.
- Can accidentally block valid bursts.
- Distributed enforcement is harder than local enforcement.[8][9][4][7]

---

### 8. Trade Offs

- **Protection vs user experience**
  - Throttling protects the system but may reject legitimate traffic.
- **Burst tolerance vs fairness**
  - Token bucket allows bursts.
  - Fixed window is simpler but less precise.
- **Simplicity vs accuracy**
  - Simple counters are easy.
  - Sliding windows are more accurate.
- **Centralized vs distributed enforcement**
  - Centralized logic is easier to reason about.
  - Distributed logic scales better but needs shared state.

Architect-level insight: throttling is a **safety valve**. It keeps one noisy client, tenant, or endpoint from harming the rest of the system.

---

### 9. Real World Example (Minimum One)

**Example: Public API**

- The API allows 100 requests per minute per API key.
- A client sends 500 requests in a minute.
- The throttling layer allows the first 100 and rejects or slows the rest.
- The response may include a retry suggestion or a temporary block.[5][2][3][4][1]

This prevents one client from consuming all shared resources and degrading service for everyone else.

---

### 10. Architect’s Perspective

If I were designing a large-scale system, I’d use throttling to **enforce fairness and shield critical infrastructure from overload**.[2][3][4][1]

I’d define:

- What key identifies a client.
- What metric is being limited.
- What the time window or burst policy is.
- What happens when the limit is exceeded.
- Whether the system should reject, delay, or degrade.

I’d also combine throttling with:

- Rate limiting.
- Load shedding.
- Backpressure.
- Autoscaling.
- Circuit breakers.

**Cloud angle**  
In cloud architectures, throttling is often applied at the edge or gateway so bad traffic is stopped before it reaches expensive backend services. Managed API gateways and load balancers often expose throttling controls directly.

---

### 11. Interview Answer (2-Minute Version)

Throttling is a mechanism that controls the rate at which a client, service, or request stream is allowed to consume system resources. When traffic exceeds a defined policy, the system slows it down, rejects it, or reduces the service level so the backend stays healthy.

It is commonly used for APIs, multi-tenant platforms, and overload protection. A throttling system usually identifies clients by API key, user ID, or IP address and tracks usage in a time window. Common implementations include fixed window counters, sliding windows, token bucket, and leaky bucket.

Architecturally, I use throttling when I want to preserve fairness and protect the system from spikes or abuse. I would place it at the gateway or edge when possible, and I’d tune it carefully so it protects infrastructure without hurting normal users too much.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Throttling is about **controlling throughput** and protecting stability.[3][4][1][2]
- They know it’s related to, but not identical to, rate limiting.
- They can explain token bucket vs fixed window.
- They mention where throttling is enforced.[7][8]

**Common red flags**

- Confusing throttling with load balancing.
- Saying throttling only means rejecting requests.
- Not mentioning state, quotas, or windows.
- Ignoring distributed coordination.

**Likely follow-ups**

- “How is throttling different from rate limiting?”  
  → Throttling is the control mechanism; rate limiting is the policy of how much is allowed.

- “Which algorithm would you use?”  
  → Token bucket for bursts, sliding window for fairness, fixed window for simplicity.

- “Where do you enforce it?”  
  → Usually at the gateway, edge, or API layer first.

Would you like the next topic to be **throttling vs rate limiting**, **token bucket algorithm**, or **circuit breaker**?

### 13. Sources

[1] API Throttling Vs API Rate Limiting - System Design https://www.geeksforgeeks.org/system-design/api-throttling-vs-api-rate-limiting-system-design/
[2] Rate Limiting in System Design https://www.geeksforgeeks.org/system-design/rate-limiting-in-system-design/
[3] Throttling in Distributed Systems https://www.geeksforgeeks.org/system-design/throttling-in-distributed-systems/
[4] Throttling and Rate Limiting https://www.enjoyalgorithms.com/blog/throttling-and-rate-limiting/
[5] Rate limiting and Throttling - System Design (Explained) https://dev.to/dalelantowork/rate-limiting-and-throttling-system-design-indepth-explained-3jpo
[6] Design A Rate Limiter https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter
[7] Design a Distributed Rate Limiter w/ a Ex-Meta Staff Engineer ... https://www.youtube.com/watch?v=MIJFyUPG4Z4
[8] Design a Distributed Rate Limiter https://systemdesignschool.io/problems/rate-limiter/solution
[9] Rate Limiting System Design: Algorithms, Trade-offs and ... https://www.reddit.com/r/softwarearchitecture/comments/1s7i2pr/rate_limiting_system_design_algorithms_tradeoffs/
[10] Design a Distributed Rate Limiter https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter
[11] THROTTLING Deep Dive (System Design for Beginners ... https://www.youtube.com/watch?v=j3QxVO91tBc&vl=en
