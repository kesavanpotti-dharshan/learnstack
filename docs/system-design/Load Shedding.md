---
title: Load Shedding
sidebar_label: Load Shedding
sidebar_position: 3
---

---

### 1. Definition

Load shedding is the deliberate decision to **drop, delay, or reject some incoming work** when a system is under heavy load so the system can keep serving the most important requests instead of collapsing.[1][2][3][4]

In simple terms: when demand exceeds safe capacity, the system intentionally gives up less important work to protect critical functionality.[2][3][5][6]

---

### 2. Core Idea

The core idea is to **fail fast on non-critical work** rather than let everything slow down or fail together.[3][5][1][2]

Load shedding is closely related to backpressure, but it is more aggressive:

- **Backpressure** tells upstream systems to slow down.
- **Load shedding** actively rejects or drops work when the system is already overloaded.[4][5][1][2]

This protects:

- Latency for critical requests.
- Availability of core services.
- System stability under spikes.[6][1][2][3]

---

### 3. How it Works

### Basic Flow

1. The system monitors load signals like CPU, memory, queue depth, latency, or connection count.[5][7][1][2][6]
2. It compares current load to thresholds or policies.
3. If load is too high, it decides which work to shed.
4. Non-critical requests are rejected, delayed, or downgraded.
5. Critical requests continue to be served.[7][1][2][3][4]

### Lifecycle

- **Normal state**: all requests are processed.
- **Pressure state**: queue depth or latency starts rising.
- **Shedding state**: low-priority work is rejected or deferred.
- **Recovery state**: once load drops, normal processing resumes.[1][2][3][6]

### What Gets Shed

Common candidates:

- Analytics events.
- Search suggestions.
- Non-essential notifications.
- Expensive report generation.
- Non-premium or lower-priority traffic.[2][3][4][7]

### Example Behavior

A system might:

- Keep login, checkout, and payment alive.
- Reject background exports.
- Delay non-critical notifications.
- Return a 429 or 503 for overflow traffic.[4][6][1][2]

---

### 4. Internal Architecture

### Trigger Signals

Load shedding is usually triggered by:

- Queue depth.
- CPU saturation.
- Memory pressure.
- Thread pool exhaustion.
- Connection pool exhaustion.
- Tail latency thresholds.[5][6][7][1][2]

### Decision Layer

A policy engine decides:

- What is critical.
- What can be delayed.
- What can be dropped.
- Whether to shed by user tier, endpoint, region, or request type.[8][3][7][2]

### Enforcement Layer

Load shedding can happen at:

- API gateway.
- Load balancer.
- Application middleware.
- Queue consumer.
- Worker service.
- Downstream service.[6][1][2][4]

### Strategies

#### Reject

- Return 429, 503, or a custom overload response.
- Best when the work is safe to retry later.[1][2][4]

#### Delay

- Queue or defer low-priority work.
- Useful for tasks that can wait briefly.

#### Drop

- Silently discard or sample non-critical work.
- Common for telemetry or logs.

#### Degrade

- Return partial results.
- Skip expensive subfeatures, such as recommendations or image generation.

### Memory and Failure Behavior

- Load shedding prevents unbounded queue growth.
- It protects memory and thread pools from exhaustion.
- It reduces the chance of cascading failures by keeping the system within safe operating limits.[3][5][6][1]

---

### 5. When to Use It

Use load shedding when:

- The system can’t serve everything during spikes.
- Some requests are more important than others.
- You want the system to **degrade gracefully** instead of failing completely.[2][3][6][1]

Common use cases:

- Real-time APIs.
- Messaging systems.
- Search services.
- Logging/metrics pipelines.
- Multi-tenant systems with priority tiers.[7][3][4][2]

---

### 6. When Not to Use It

Avoid load shedding when:

- Every request is equally critical.
- Dropping work would violate correctness or compliance.
- You have enough buffering and backpressure to absorb the spike safely.
- The business cost of rejecting requests is too high.[3][7][1]

Load shedding is a last-resort control mechanism, not the first tool you reach for.

---

### 7. Pros and Cons

**Pros**

- Prevents total overload and collapse.[6][1][2][3]
- Preserves latency for critical traffic.
- Avoids cascading failures.
- Helps the system fail fast instead of failing slowly.
- Can be tuned by priority.[8][7][2]

**Cons**

- Some requests are intentionally lost or delayed.
- Requires good prioritization logic.
- Can frustrate users if overused.
- May hide demand problems if not monitored well.[4][1][2][3]

---

### 8. Trade Offs

- **Availability vs completeness**
  - Load shedding keeps the system alive by giving up some work.
- **Latency vs fairness**
  - Critical requests stay fast, but lower-priority users may be rejected.
- **Simplicity vs intelligence**
  - Simple shedding is easy.
  - Prioritized shedding is better but more complex.
- **User experience vs system survival**
  - It is better to say “try again later” than to let the whole service fail.

Architect-level insight: load shedding is about choosing **which failures you want**. It deliberately turns an uncontrolled failure into a controlled one.

---

### 9. Real World Example (Minimum One)

**Example: E-commerce during a sale**

- Checkout, cart, and payment are critical.
- Recommendations, email receipt generation, and analytics are less critical.
- When traffic spikes:
  - The system keeps checkout alive.
  - It rejects recommendation refreshes.
  - It delays non-essential background jobs.
  - It may return 429 for low-priority API calls.[7][1][2][6]

This ensures customers can still buy products even if secondary features are temporarily unavailable.

---

### 10. Architect’s Perspective

If I were designing a large-scale system, I’d use load shedding when **stability matters more than completeness** under extreme load.[1][2][3][6]

I’d define:

- Critical vs non-critical requests.
- A clear overload signal.
- Explicit shedding policies.
- User-visible retry behavior.
- Good dashboards for overload events.

I’d also combine load shedding with:

- Backpressure,
- Rate limiting,
- Circuit breakers,
- Autoscaling,
- Priority queues.

**Cloud angle**  
In cloud systems, load shedding is often implemented at the edge or gateway so the platform can reject excess work before it burns CPU, memory, or database capacity deeper in the stack.

---

### 11. Interview Answer (2-Minute Version)

Load shedding is a resilience technique where a system deliberately drops, rejects, or delays lower-priority requests when it is overloaded so that critical requests can still succeed. It’s used to prevent the whole system from collapsing under traffic spikes or resource exhaustion.

The key idea is to fail fast on non-essential work rather than let everything slow down and time out. For example, in an e-commerce system during a flash sale, I’d preserve checkout and payment requests but shed recommendation refreshes, analytics events, or other background tasks. Load shedding can happen at the gateway, load balancer, application layer, or queue consumer.

Architecturally, I use load shedding when I need graceful degradation under overload. I combine it with backpressure, rate limiting, and priority-based routing, and I make sure the system clearly signals retries or partial failure to users and upstream services.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Load shedding is a **controlled failure mechanism**.[2][3][1]
- They distinguish it from backpressure and rate limiting.
- They talk about prioritization and graceful degradation.
- They give realistic examples like checkout vs analytics.[6][7][2]

**Common red flags**

- Treating load shedding as the same as load balancing.
- Dropping critical requests without policy.
- Not monitoring overload triggers.
- Confusing it with backpressure alone.

**Likely follow-ups**

- “How is it different from backpressure?”  
  → Backpressure slows producers; load shedding rejects or drops work when overloaded.

- “Where would you implement it?”  
  → Gateway, middleware, queue consumer, or service layer.

- “What metrics tell you to shed?”  
  → Queue depth, CPU, latency, thread pool saturation, and connection pool exhaustion.

Would you like the next topic to be **rate limiting**, **backpressure vs load shedding**, or **circuit breaker**?

### 13. Sources

[1] Using load shedding to avoid overload https://builder.aws.com/content/3Eun1EEyX6p2e3VYNyRLSJzLuMV/using-load-shedding-to-avoid-overload
[2] Understanding Load Shedding https://dev.to/johneliud/understanding-load-shedding-41md
[3] Load Shedding in Distributed Systems https://blog.sofwancoder.com/load-shedding-in-distributed-systems
[4] Load Shedding in Distributed Systems https://www.linkedin.com/pulse/load-shedding-distributed-systems-munish-gupta-bco6c
[5] How do you folks implement load shedding? https://www.reddit.com/r/devops/comments/euu7rw/how_do_you_folks_implement_load_shedding/
[6] Load Shedding: Five Reasons it Matters for Your Applications https://www.datacenterknowledge.com/energy-power-supply/load-shedding-five-reasons-it-matters-for-your-applications
[7] What is Prioritized Load Shedding? https://www.geeksforgeeks.org/system-design/what-is-prioritized-load-shedding/
[8] Intelligent Load Shedding |Optimal Load Preservation https://etap.com/solutions/load-shedding-system
[9] What is load shedding in electrical distribution? https://community.se.com/t5/Power-Distribution-and-Digital/What-is-load-shedding-in-electrical-distribution/td-p/492532
[10] Intelligent Load Shedding https://emaconsultancy.com/wp-content/uploads/2017/09/LS_DOC_003.pdf
[11] Load shedding | Automation & Control Engineering Forum https://control.com/forums/threads/load-shedding.36406/
