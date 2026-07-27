---
title: Caching Strategies
sidebar_label: Caching Strategies
sidebar_position: 3
---

---

### 1. Definition

Caching is the practice of storing frequently accessed data in a **faster temporary storage layer** so future requests can be served more quickly and with less load on the primary data source.[1][2][3]

In system design, caching strategies define **how data moves between the cache and the source of truth** for reads and writes.[4][5][1]

---

### 2. Core Idea

The core idea is to **trade memory for speed** and reduce expensive calls to databases, services, or disks.[2][3]

A good caching strategy improves:

- Latency.
- Throughput.
- Backend cost.
- System resilience under load.[3][6][2]

But caching only works well if you manage:

- **Staleness**
- **Invalidation**
- **Eviction**
- **Consistency**[2][3]

---

### 3. How it Works

### Read Path

1. Request comes in.
2. System checks the cache first.
3. If data exists, it returns immediately from cache (**cache hit**).
4. If not, it fetches from the primary store (**cache miss**), stores it in cache, and returns it.[1][2]

This is the classic **cache-aside** flow.

### Write Path

Different caching strategies define how writes flow:

#### Cache-Aside

- Application writes to the primary store directly.
- Cache is updated or invalidated separately.[5][3][1]

#### Read-Through

- Application reads from cache.
- Cache fetches from the primary store on miss and populates itself.[7][3]

#### Write-Through

- Application writes to cache.
- Cache synchronously writes to the primary store before confirming completion.[8][4][1]

#### Write-Behind / Write-Back

- Application writes to cache first.
- Cache writes to the primary store asynchronously later.[9][10][5][8]

#### Write-Around

- Writes go directly to the primary store.
- Cache is bypassed on write; data is cached only when later read.[8][9]

---

### 4. Internal Architecture

### Cache-Aside

- **Most common strategy** for application-driven caching.[3][1]
- Read flow:
  - Check cache.
  - Miss → query database.
  - Store result in cache.
- Write flow:
  - Update database.
  - Invalidate or refresh cache entry.
- Pros:
  - Simple.
  - Flexible.
  - Application controls what gets cached.
- Cons:
  - Cache misses can still be expensive.
  - Cache invalidation is tricky.[1][2]

### Read-Through

- Cache provider owns the load-from-source behavior.
- App asks cache only.
- Cache populates itself on miss.
- Useful when you want to hide caching logic from application code.[7][3]

### Write-Through

- Write completes only after both cache and source of truth are updated.[4][8][1]
- Pros:
  - Cache is always fresh.
  - Reads after write are fast.
- Cons:
  - Writes are slower.
  - Every write pays cache + store latency.

### Write-Behind / Write-Back

- Cache acknowledges write quickly and persists later in background.[10][9][8]
- Pros:
  - Very fast writes.
  - Great for write-heavy workloads.
- Cons:
  - Risk of data loss if cache fails before flush.
  - More complex durability handling.

### Write-Around

- Avoids polluting cache with write-only data.[9][8]
- Best when written data is unlikely to be read soon.
- Downside: first read after write will miss cache.

### Eviction Policies

When cache is full, something must be removed:

- **LRU**: evict least recently used.
- **LFU**: evict least frequently used.
- **FIFO**: evict oldest first.
- **Random**: simplest, usually least optimal.[6][2]

### Expiration and Invalidation

- **TTL / time-based expiration**
  - Remove entries after a fixed time.[2]
- **Event-driven invalidation**
  - Delete or refresh when source data changes.[2]
- **Refresh-ahead**
  - Proactively refresh hot keys before they expire.[3]

### Memory Behavior

- Cache is intentionally bounded.
- Too large a cache increases memory cost and can hurt GC/locality.
- Too small a cache causes more misses and more backend load.

---

### 5. When to Use it

Use caching when:

- Data is read much more often than written.
- Backend calls are expensive or slow.
- You need to reduce database pressure.
- You want better latency or higher throughput.[6][3][2]

Common use cases:

- Product catalogs.
- User profiles.
- Reference data.
- Session state.
- Computed results.
- API responses.[6][3]

---

### 6. When Not to Use it

Avoid caching when:

- Data changes too frequently.
- Staleness is unacceptable.
- The dataset is too small for caching to matter.
- Cache invalidation is more complex than the performance gain is worth.[3][2]

Also avoid caching:

- Highly transactional data requiring strict consistency.
- Sensitive data that must never be stored in shared memory without proper controls.
- Very cheap computations where caching adds more complexity than value.

---

### 7. Pros and Cons

**Pros**

- Much lower latency on repeated reads.[2][3]
- Reduced database and service load.
- Better scalability under burst traffic.
- Cost savings by shifting work away from primary systems.
- Can smooth spikes and improve availability.

**Cons**

- Stale data risk.
- Invalidation complexity.
- Additional memory and operational overhead.
- Harder debugging when cache and source diverge.
- Write strategies like write-back can risk durability.[10][8][2]

---

### 8. Trade Offs

- **Freshness vs Speed**
  - Cached data is faster but may be stale.
- **Complexity vs Performance**
  - More advanced strategies improve performance but add logic.
- **Consistency vs Availability**
  - Write-through is more consistent.
  - Write-behind is faster but riskier.
- **Memory vs Backend Load**
  - Larger cache reduces misses but consumes memory.

Architect-level insight: choose the strategy based on the data’s **read/write ratio**, freshness requirement, and tolerance for failure or staleness.

---

### 9. Real World Example (Minimum One)

**Example: Product Catalog API**

- Product list is read constantly but updated rarely.
- Use **cache-aside**:
  - On request, check Redis.
  - Cache hit → return immediately.
  - Cache miss → fetch from SQL Server, store in Redis, return.
- On product update:
  - Update database.
  - Evict or refresh affected cache entries.

This gives:

- Fast reads.
- Lower DB load.
- Acceptable staleness window if TTL is short.

For a different workload, like user session data, you might prefer **write-through** so the cache stays in sync with the source of truth.

---

### 10. Architect’s Perspective

If I’m designing a large-scale system, I start by asking:

- Is the data read-heavy?
- How fresh does it need to be?
- What is the failure tolerance?
- Can I tolerate stale reads?

Then I choose accordingly:

- **Cache-aside** for general-purpose app caching.
- **Read-through** when I want cache abstraction.
- **Write-through** when consistency matters.
- **Write-behind** when write speed matters most.
- **Write-around** when writes are frequent but reads are sparse.

I’d also insist on:

- TTLs on nearly all cache entries.
- Metrics for hit rate, miss rate, eviction rate.
- Clear invalidation rules.
- Fallback behavior when the cache is unavailable.

**Cloud angle**  
In cloud systems, caching is often layered:

- Browser cache.
- CDN.
- API response cache.
- Distributed cache like Redis.
- In-process cache for ultra-hot data.

On Azure, Azure Cache for Redis is the common distributed cache layer, often paired with CDN and application-level cache-aside logic.

---

### 11. Interview Answer (2-Minute Version)

Caching strategies in system design define how data moves between a fast temporary store and the primary source of truth. The main goal is to reduce latency, reduce backend load, and improve scalability. The most common strategy is cache-aside, where the application checks the cache first, loads from the database on a miss, and then stores the result in cache.

Other important strategies are read-through, write-through, write-around, and write-behind. Read-through lets the cache handle misses automatically. Write-through updates cache and database together, which keeps data fresh but makes writes slower. Write-behind writes to cache first and flushes to the database later, which is fast but less durable. Write-around writes directly to the database and only caches on later reads.

In practice, I choose based on the data’s read/write ratio and freshness requirements. For example, product catalogs usually work well with cache-aside, while write-heavy systems may benefit from write-behind or write-around. I always use TTLs, invalidation rules, and metrics like cache hit rate to make sure the cache is helping instead of hurting.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- They distinguish **cache-aside**, **read-through**, **write-through**, **write-behind**, and **write-around** clearly.[4][9][1][3]
- They talk about **staleness, invalidation, and eviction** as first-class design concerns.
- They tie the strategy to workload shape:
  - read-heavy,
  - write-heavy,
  - freshness-sensitive,
  - or bursty traffic.[3][2]

**Common red flags**

- Saying “cache solves performance” without mentioning invalidation.
- Choosing write-behind for everything without discussing durability risk.
- Ignoring eviction policy and TTL.
- Not monitoring hit rate or miss rate.

**Likely follow-ups**

- “How do you invalidate cache safely?”  
  → Use TTLs, event-driven invalidation, and write/update flows that clear or refresh affected keys.

- “When would you use Redis vs in-memory cache?”  
  → Redis for distributed/multi-instance scenarios; in-memory for single-instance or ultra-low latency local data.

- “How do you handle cache stampede?”  
  → Use locking, request coalescing, stale-while-revalidate, or refresh-ahead.

Would you like the next topic to be **Redis caching**, **cache invalidation**, or **cache stampede**?

### 13. Sources

[1] Caching patterns - Database Caching Strategies Using Redis https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html
[2] Caching - System Design Concept https://www.geeksforgeeks.org/system-design/caching-system-design-concept-for-beginners/
[3] A Hitchhiker's Guide to Caching Patterns https://hazelcast.com/blog/a-hitchhikers-guide-to-caching-patterns/
[4] Caching for System Design Interviews https://www.hellointerview.com/learn/system-design/core-concepts/caching
[5] Cache Aside, Read/Write Through, and Write Behind ... https://www.linkedin.com/pulse/decoding-cache-chronicles-understanding-strategies-aside-gopal-kb9kf
[6] 9 Caching Strategies for System Design Interviews https://dev.to/somadevtoo/9-caching-strategies-for-system-design-interviews-369g
[7] Caching Strategies Summary | System Design https://algomaster.io/learn/system-design/caching-strategies
[8] Write-through, write-around, write-back: cache explained https://www.computerweekly.com/feature/Write-through-write-around-write-back-Cache-explained
[9] Understanding write-through, write-around and write-back ... https://shahriar.svbtle.com/Understanding-writethrough-writearound-and-writeback-caching-with-python
[10] What are write-through and write-behind caching? - Redisson https://redisson.pro/glossary/write-through-and-write-behind-caching.html
[11] How to Leverage Caches in System Design https://www.linkedin.com/pulse/caching-strategies-101-how-leverage-caches-system-design-qjhac
[12] 4 Caching Strategies for System Design https://levelop.dev/blog/caching-strategies-system-design-four-patterns-failure-modes
[13] The System Design Cheat Sheet: Cache https://hackernoon.com/the-system-design-cheat-sheet-cache
