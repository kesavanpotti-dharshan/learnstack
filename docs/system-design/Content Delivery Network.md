---
title: Content Delivery Network
sidebar_label: Content Delivery Network
sidebar_position: 3
---

---

### 1. Definition

A Content Delivery Network, or CDN, is a **geographically distributed network of edge servers** that caches and delivers web content from locations closer to users.[1][2][3]

It is used to speed up delivery of assets such as HTML, CSS, JavaScript, images, videos, and sometimes dynamic content, while also reducing load on the origin server.[2][3][4][1]

---

### 2. Core Idea

The core idea is to **move content closer to the user** so requests travel a shorter distance and complete faster.[3][5][2]

CDNs improve:

- Latency.
- Availability.
- Scalability.
- Reliability.
- Origin offload.[1][2][3]

For interview purposes, the simplest line is: **CDN = edge caching + smart routing + origin protection**.[5][6][3]

---

### 3. How it Works

### Basic Request Flow

1. User requests a resource.
2. DNS, anycast routing, or the CDN’s edge selection sends the request to a nearby edge server.[7][2][3]
3. The edge server checks its cache.
4. If the content is cached, it returns it immediately (**cache hit**).[2][3]
5. If not cached, it fetches the object from the **origin server**, stores a copy at the edge, and serves it to the user.[4][3][2]

### Lifecycle

- **First request**: miss at the edge, fetch from origin, cache it.
- **Subsequent requests**: served from edge until TTL expires or content is invalidated.[3][4][2]
- **Content update**: origin changes, and cache is refreshed through TTL expiry, purge, or versioned URLs.[2][3]

### What Gets Cached

Usually:

- Static files: images, JS, CSS.
- Video segments.
- Downloadable assets.
- Sometimes API responses and dynamic content with special rules.[4][1][3]

---

### 4. Internal Architecture

### Main Components

- **Origin server**
  - The authoritative source of content.[3][4][2]
- **Edge servers**
  - Distributed points of presence that store and serve cached content.[1][2][3]
- **Routing layer**
  - Uses DNS, Anycast, or geo-routing to send users to the best edge location.[7][2][3]
- **Cache control**
  - TTLs, cache keys, headers, purges, and invalidation logic.[2][3]

### Routing Behavior

- CDN typically chooses the “best” edge by:
  - Geography.
  - Network proximity.
  - Load.
  - Health.[7][3][2]

### Cache Behavior

- Cache key often includes:
  - URL.
  - Query params.
  - Headers if relevant.
- If the key matches and the object is fresh, the CDN serves it directly.
- If stale, it may:
  - Revalidate with origin.
  - Fetch a new copy.
  - Serve stale content temporarily in some configurations.[3][2]

### Memory and Storage

- Edge nodes keep a bounded cache.
- Hot content stays near users.
- Less popular content is evicted using cache policies.
- The CDN is not a replacement for origin storage; it is an acceleration and protection layer.[3]

### Push vs Pull CDN

- **Pull CDN**
  - CDN fetches content from origin the first time it’s requested.
  - Easier for most applications.[4]
- **Push CDN**
  - You explicitly upload content to CDN storage.
  - Better for managed distribution workflows.[4]

---

### 5. When to Use It

Use a CDN when:

- Your users are globally distributed.
- Your site serves static or semi-static content.
- You want lower latency and better load times.[1][2][3]
- You need to reduce origin traffic.
- You expect traffic spikes and need better resilience.[2][3]

Common use cases:

- E-commerce product images.
- Video streaming.
- Web app assets.
- Software downloads.
- Public APIs with cacheable GET responses.[1][4][2]

---

### 6. When Not to Use It

Avoid or limit CDN use when:

- Content is highly personalized and cannot be cached safely.
- Data changes constantly and caching adds staleness risk.
- The application is small/local and latency is already low.
- You need every response to be fully dynamic and user-specific.[4][3]

A CDN is less useful when the main bottleneck is not network distance but application logic or database performance.

---

### 7. Pros and Cons

**Pros**

- Lower latency for users.[1][2][3]
- Reduced load on origin servers.
- Better global performance.
- Better availability and resilience under traffic spikes.
- Can add security benefits like DDoS absorption and edge filtering.[3]

**Cons**

- Cache invalidation complexity.
- Possible staleness.
- Extra cost.
- Harder debugging when edge and origin diverge.
- Not ideal for highly dynamic personalized content.[2][3]

---

### 8. Trade Offs

- **Freshness vs Speed**
  - CDN improves speed but may serve slightly stale data.
- **Cost vs Scale**
  - Better performance usually means more CDN spend.
- **Complexity vs Simplicity**
  - CDN configuration, cache headers, and invalidation require discipline.
- **Static vs Dynamic**
  - CDNs excel at static and semi-static data, but dynamic content needs careful tuning.

Architect-level insight: CDN design is mostly about **what to cache, for how long, and how to invalidate safely**.

---

### 9. Real World Example (Minimum One)

**Example: Global E-commerce Website**

- Product images, CSS, JS, and landing pages are served through a CDN.
- A user in Europe requests a product image.
- The CDN routes the request to a nearby edge node.
- If the image is already cached, it’s served immediately.
- If not, the edge fetches it from origin, stores it, and serves it.
- The result is lower latency, less origin traffic, and smoother peak-hour performance.[1][2][3]

For video platforms, the CDN often caches video chunks so playback can start quickly and continue smoothly worldwide.

---

### 10. Architect’s Perspective

If I were designing a large-scale system, I’d use a CDN for **globally accessed, cacheable content** where user experience depends on latency and origin protection.[5][2][3]

I’d be careful with:

- Cache key design.
- TTL and invalidation rules.
- Personalized content.
- Versioned asset deployment.
- Observability at the edge.

I’d also consider the content lifecycle:

- Static assets: long TTL + versioned filenames.
- Frequently changing assets: shorter TTL or purge workflow.
- Personalized API responses: usually not CDN-friendly unless carefully segmented.

**Cloud angle**  
In cloud systems, a CDN is often paired with object storage and an origin service:

- Object storage holds the authoritative files.
- CDN serves them from the edge.
- Load balancers and API gateways handle dynamic traffic.
- On Azure, CDN or Front Door is commonly used to edge-cache and accelerate delivery.

---

### 11. Interview Answer (2-Minute Version)

A CDN, or Content Delivery Network, is a geographically distributed network of edge servers that caches and delivers content from locations closer to users. The main goal is to reduce latency, improve availability, and offload traffic from the origin server. It is most commonly used for static and semi-static content like images, JavaScript, CSS, video, and sometimes cacheable API responses.

The way it works is simple: a user requests content, the CDN routes the request to a nearby edge server, and the edge checks its cache. If the content is there, it returns it immediately. If not, it fetches the content from the origin, stores it, and then serves it. That way, future requests are much faster.

Architecturally, I use a CDN when I have globally distributed users or traffic spikes and I want better performance and resilience. I’m careful about cache invalidation, TTLs, and personalized content, because the CDN is only effective when the caching strategy is designed well.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- CDN is not just “a cache”; it is an **edge delivery layer**.[5][3]
- They mention:
  - Edge servers.
  - Origin server.
  - DNS/geo routing.
  - Cache invalidation and TTLs.[4][2][3]
- They connect CDN to:
  - Static assets,
  - global latency,
  - origin protection,
  - and traffic spikes.

**Common red flags**

- Saying CDN is only for images.
- Ignoring cache invalidation and TTLs.
- Confusing CDN with load balancer.
- Using CDN for highly personalized content without caveats.

**Likely follow-ups**

- “How is CDN different from a cache?”  
  → CDN is a distributed edge network that uses caching as one of its main mechanisms.

- “What is pull vs push CDN?”  
  → Pull fetches from origin on demand; push uploads content proactively.[4]

- “How would you cache dynamic content safely?”  
  → Only cache safe segments, use short TTLs, vary by headers/user segment, or avoid caching personalized responses.

Would you like the next topic to be **DNS vs CDN**, **edge computing**, or **cache invalidation**?

### 13. Sources

[1] Designing Content Delivery Network (CDN) in System ... https://www.geeksforgeeks.org/system-design/designing-content-delivery-network-cdn-system-design/
[2] Content Delivery Network(CDN) in System Design https://www.geeksforgeeks.org/system-design/what-is-content-delivery-networkcdn-in-system-design/
[3] What is a CDN? | Learning Center https://www.cloudflare.com/learning/cdn/what-is-a-cdn/
[4] system-design-cdn.md - Content delivery network https://github.com/donnemartin/donnemartin.github.io/blob/master/content/system-design-cdn.md
[5] Content Delivery Network (CDN) | System Design https://algomaster.io/learn/system-design/content-delivery-network-cdn
[6] Content Delivery Networks (CDN) Explained | System ... https://www.linkedin.com/pulse/content-delivery-networks-cdn-explained-system-design-akshay-kumar-ued0c
[7] How CDN Works | System Design https://www.youtube.com/watch?v=bJ9NnLLMQ78
[8] Design a CDN | System Design Walkthrough https://www.youtube.com/watch?v=5fU9yIivtY8
[9] Design a CDN System Design: The Complete Guide (2026) https://www.systemdesignhandbook.com/guides/design-a-cdn-system-design/
[10] Content Delivery Networks (CDN) in System Design https://www.designgurus.io/blog/content-delivery-network-cdn-system-design-basics
