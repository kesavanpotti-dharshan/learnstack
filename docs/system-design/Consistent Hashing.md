---
title: Consistent Hashing
sidebar_label: Consistent Hashing
sidebar_position: 3
---

---

### 1. Definition

Consistent hashing is a distributed hashing technique that maps keys and servers onto a **hash ring** so that when nodes are added or removed, only a small fraction of keys need to move.[1][2][3][4]

It was designed to avoid the large-scale remapping that happens with simple modulo-based sharding like `hash(key) % N`.[5][6][1]

---

### 2. Core Idea

The core idea is to **minimize data movement when the cluster size changes**.[1][2][7]

Instead of reshuffling everything when a server joins or leaves, consistent hashing only reassigns the keys that were closest to that node on the ring.[3][4][1]

That makes it ideal for systems where nodes come and go often, such as caches, distributed storage, and load balancers for stateful traffic.[2][8][3]

---

### 3. How it Works

### Step-by-Step Flow

1. Hash each **server/node** onto a circular hash space.[1][3][4]
2. Hash each **key** onto the same ring.[3][1]
3. For a given key, move **clockwise** on the ring until you find the first server.[5][1][3]
4. Store or route the key to that server.[6][3]
5. If a server is added:
   - It takes ownership only of keys between itself and its predecessor on the ring.[4][1][3]
6. If a server is removed:
   - Its keys move to the next clockwise server.[1][3][4]

### Simple Example

If servers are on positions 0, 25, 50, and 75:

- A key hashed to 16 goes to server at 25.
- A key hashed to 63 goes to server at 75.
- A key hashed to 89 wraps around to server at 0.[1][4][9]

### Lifecycle

- **Stable cluster**: keys are mapped consistently to the same nodes.
- **Node added**: only a local region of keys moves.
- **Node removed**: only keys owned by that node get reassigned.
- **Rebalancing**: limited, localized, and predictable.[1][2][7]

---

### 4. Internal Architecture

### Hash Ring

- The ring is a logical representation of the hash space.
- Both keys and nodes are mapped using the same hash function.[1][3][4]

### Clockwise Lookup

- The lookup rule is simple:
  - hash the key,
  - then choose the next node clockwise.
- This makes routing deterministic and easy to implement.[1][3][5]

### Virtual Nodes

A common enhancement is **virtual nodes (vnodes)**.[7][9]

- Each physical server is placed on the ring multiple times under different virtual positions.
- Benefits:
  - Better load distribution.
  - Less skew if one server lands in a “hot” region of the ring.
  - More even handling of uneven traffic or uneven node capacity.[9][7]

### Memory and State Behavior

- Only the key-to-node mapping table or ring membership must be maintained.
- You avoid the expensive full rehashing associated with modulo sharding.
- In distributed caches, this means fewer cache invalidations during scaling events.[2][3][4]

### Failure Handling

- If a node fails, only its assigned key range is affected.
- The next node clockwise takes over those keys.
- This keeps failure impact localized.[2][3][4]

---

### 5. When to Use it

Use consistent hashing when:

- You have **frequent node additions/removals**.[1][2][7]
- You want to minimize reshuffling of keys.
- You need stable partitioning for:
  - distributed caches,
  - sharded databases,
  - storage clusters,
  - message routing,
  - load balancing stateful sessions.[3][8]

It is especially useful when the cost of moving data is high.

---

### 6. When Not to Use it

Avoid consistent hashing when:

- Your cluster is tiny and rarely changes.
- You need perfectly even distribution more than minimal movement.
- Your workload is highly skewed and you haven’t designed for virtual nodes.
- A simpler partitioning scheme is sufficient.[2][3][7]

It is also not the best fit if:

- Keys are naturally grouped by fixed partitions already.
- Your system can tolerate full remapping during reconfiguration.

---

### 7. Pros and Cons

**Pros**

- Minimizes remapping when nodes change.[1][2][4]
- Localizes failure impact.
- Great for scalable distributed systems.
- Works well with caches and stateful routing.
- Virtual nodes improve load balancing.[7][9]

**Cons**

- More complex than simple modulo hashing.
- Can still be imbalanced without virtual nodes.
- Requires careful hashing and ring management.
- Hot partitions can still occur if keys are skewed.[2][7]

---

### 8. Trade Offs

- **Minimal movement vs perfect balance**
  - Consistent hashing reduces churn, but may not be perfectly even without vnodes.[2][7]
- **Simplicity vs scalability**
  - Modulo is simpler.
  - Consistent hashing scales better when membership changes often.
- **Determinism vs adaptability**
  - The mapping is deterministic, which is great for routing.
  - But changing the ring requires coordination.

Architect-level insight: consistent hashing is about **operational stability under change**, not just elegant hashing.

---

### 9. Real World Example (Minimum One)

**Example: Distributed Cache Cluster**

Suppose you have a Redis-like cache cluster:

- Keys are session tokens, product data, and user profiles.
- You start with 4 cache nodes.
- If you use `hash(key) % 4`, adding a 5th node remaps most keys and causes a massive cache miss storm.
- With consistent hashing, only the keys near the new node’s ring position move.[1][3][4][10]

That means:

- Less cache churn.
- Faster scaling.
- Lower impact on backend databases.
- Much smoother failover when a node leaves.[2][8]

---

### 10. Architect’s Perspective

If I were designing a large-scale system, I’d use consistent hashing when I need **stable ownership of data with minimal redistribution** during scale-out or node failure.[1][2][8]

I’d especially reach for it in:

- distributed caches,
- sharded storage,
- stateful routing,
- and queue partitioning.

I’d avoid it if I need very tight balance and the cluster rarely changes, because the added complexity may not be worth it. I’d also use virtual nodes if uneven load distribution is a concern.[7][9]

**Cloud angle**  
In cloud systems, consistent hashing helps keep state local to a node or shard while instances are autoscaled or replaced. It’s common in cache clusters, tenant partitioning, and routing workloads where you want to reduce data movement during elastic scaling.

---

### 11. Interview Answer (2-Minute Version)

Consistent hashing is a distributed hashing technique used to minimize key redistribution when nodes are added or removed from a cluster. Instead of using `hash(key) % N`, which causes most keys to remap when N changes, consistent hashing places both nodes and keys on a hash ring. A key is assigned to the first node clockwise from its position on the ring.

The big advantage is that when a node joins or leaves, only a small subset of keys moves, which makes it ideal for distributed caches, sharding, and stateful load balancing. For example, in a cache cluster, adding a new node won’t invalidate the entire cache; only the keys near that node shift ownership. To improve distribution further, we often use virtual nodes so load is spread more evenly.

Architecturally, I use consistent hashing when I care about minimizing churn and making scaling or failure recovery less disruptive. I avoid it if the system is small and simple, or if I need extremely even distribution and can achieve that more directly with fixed partitioning.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Why `hash(key) % N` breaks during scaling.
- The ring, clockwise lookup, and localized remapping.
- Virtual nodes and load balancing.
- Real systems: caches, sharded databases, tenant routing, queues.[1][2][7][8]

**Common red flags**

- Explaining it as “just hashing.”
- Forgetting the problem it solves: **node churn**.
- Not mentioning virtual nodes.
- Confusing it with ordinary load balancing.

**Likely follow-ups**

- “Why not just use modulo hashing?”  
  → Because adding/removing a node causes massive remapping.

- “How do virtual nodes help?”  
  → They spread keys more evenly and reduce hot spots.

- “Where would you use it in a microservices system?”  
  → Cache sharding, session routing, tenant partitioning, queue partitioning, or sticky routing.

Would you like the next topic to be **sharding**, **load balancers**, or **partitioning strategy**?

### 13. Sources

[1] Consistent Hashing for System Design Interviews https://www.hellointerview.com/learn/system-design/core-concepts/consistent-hashing
[2] Consistent hashing - Reducing the Scope of Impact with Cell-Based ... https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/consistent-hashing.html
[3] Consistent Hashing - System Design https://www.geeksforgeeks.org/system-design/consistent-hashing/
[4] Consistent hashing https://en.wikipedia.org/wiki/Consistent_hashing
[5] Design Consistent Hashing https://bytebytego.com/courses/system-design-interview/design-consistent-hashing
[6] System Design: Consistent Hashing https://dev.to/karanpratapsingh/system-design-consistent-hashing-1dbl
[7] Consistent Hashing Explained - by Ashish Pratap Singh https://blog.algomaster.io/p/consistent-hashing-explained
[8] Consistent Hashing | System Design https://algomaster.io/learn/system-design/consistent-hashing
[9] Consistent Hashing: Easy Explanation for System Design ... https://www.youtube.com/watch?v=vccwdhfqIrI
[10] Consistent Hashing: Even Load Distribution & Skewed Load Problem https://www.linkedin.com/pulse/consistent-hashing-even-load-distribution-skewed-problem-prateek
[11] Scalable Load Balancing with Consistent Hashing https://dev.to/_a_m_a_n_pandey/scalable-load-balancing-with-consistent-hashing-d52
[12] Consistent hashing algorithm https://highscalability.com/consistent-hashing-algorithm/
[13] Consistent Hashing | System Design https://www.karanpratapsingh.com/courses/system-design/consistent-hashing
