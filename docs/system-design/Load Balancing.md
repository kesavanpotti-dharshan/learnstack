---
title: Load Balancing
sidebar_label: Load Balancing
sidebar_position: 3
---

---

### 1. Definition

Load balancing is the process of **distributing incoming network traffic or workloads across multiple servers** so no single server becomes overloaded.[1][2][3][4][5]

A load balancer sits in front of a pool of servers and routes each request to the most suitable healthy server, improving performance, availability, and scalability.[2][3][4][5]

---

### 2. Core Idea

The core idea is to **spread work evenly and keep the system responsive under load**.[4][6][1][2]

Instead of sending all requests to one machine, the load balancer:

- Prevents overload.
- Uses servers more efficiently.
- Keeps the service available when one server fails.
- Enables horizontal scaling.[3][5][2][4]

---

### 3. How it Works

### Basic Flow

1. Client sends a request to the load balancer.[7][4]
2. The load balancer checks which servers are healthy.[5][2][3]
3. It applies a routing algorithm to choose a server.[8][4]
4. The request is forwarded to that server.
5. The server processes the request and returns the response through the load balancer.[4][7]

### Lifecycle

- **Normal state**: traffic is distributed across the pool.
- **Health check failure**: unhealthy servers are removed from rotation.
- **Traffic spike**: requests are spread to avoid overload.
- **Server failure**: traffic is redirected to remaining healthy nodes.[2][3][5]

### Server Selection Behavior

The load balancer may choose a server based on:

- Current connection count.
- Round-robin order.
- Server health.
- Response latency.
- Server capacity.[9][8]

---

### 4. Internal Architecture

### Core Components

- **Clients**
  - Browsers, mobile apps, API consumers.
- **Load balancer**
  - The traffic router.
- **Server pool**
  - Multiple app servers or services.
- **Health checks**
  - Continuous checks to remove failed instances.[3][5][2]

### Load Balancing Layers

- **Layer 4 (transport)**
  - Routes based on IP/port and TCP/UDP information.
  - Faster and simpler.
- **Layer 7 (application)**
  - Routes based on HTTP content like path, headers, cookies, or host.
  - More flexible and intelligent.[10][8][9]

### Algorithms

#### Static Algorithms

These do not look at current server state.

- Round robin.
- Random.
- Weighted round robin.[8][9]

#### Dynamic Algorithms

These use live system state.

- Least connections.
- Least response time.
- Load-based routing.[9][8]

### Session Handling

- If the app is **stateless**, any server can handle any request.
- If the app is **stateful**, you may need:
  - Sticky sessions,
  - Shared session store,
  - Or consistent hashing.[6][10]

### Memory and Failure Behavior

- Load balancers improve availability by rerouting around failed nodes.
- They also help prevent hotspots that can create memory, CPU, or connection exhaustion on one server.
- In dynamic balancing, the balancer may observe current server metrics to make better routing decisions.[5][2][8][9]

---

### 5. When to Use It

Use load balancing when:

- Traffic is too much for one server.
- You need high availability.
- You want to scale horizontally.
- You need to survive server failures without downtime.[2][3][4][5]

Common use cases:

- Web applications.
- APIs.
- Microservices.
- Databases behind read replicas.
- Streaming or stateful services with many clients.[6][10][4]

---

### 6. When Not to Use It

Avoid a load balancer when:

- The system is tiny and a single server is enough.
- You have no redundancy to distribute across.
- The added complexity is not worth it.
- The application is fully local or offline.[3][5][2]

A load balancer also doesn’t fix:

- Slow database queries.
- Bad application code.
- Inefficient architecture.
  It only distributes traffic.

---

### 7. Pros and Cons

**Pros**

- Better availability and fault tolerance.[4][5][2][3]
- Better throughput and response times.
- Horizontal scaling.
- Health-based routing away from failed nodes.
- Can support regional and layer-based routing.

**Cons**

- Additional infrastructure cost.
- Extra complexity.
- Can become a bottleneck if poorly designed.
- Session affinity can reduce flexibility.
- Some algorithms require more monitoring and computation.[10][8][9]

---

### 8. Trade Offs

- **Simplicity vs intelligence**
  - Round robin is simple.
  - Least-connections is smarter but needs live state.
- **Performance vs observability**
  - Layer 4 is faster.
  - Layer 7 is more flexible but heavier.
- **Stateless vs sticky**
  - Stateless services scale more easily.
  - Sticky sessions make routing easier for stateful apps but can create imbalance.
- **Cost vs resilience**
  - Load balancing adds cost.
  - But it greatly improves uptime and scaling.

Architect-level insight: load balancing is most effective when paired with **stateless services, health checks, and horizontal scaling**.

---

### 9. Real World Example (Minimum One)

**Example: E-commerce checkout system**

- Users hit a load balancer.
- The balancer spreads traffic across 10 API servers.
- During a sale, traffic spikes.
- Two servers fail health checks.
- The load balancer removes them from rotation and routes requests to the remaining healthy servers.
- Users still complete checkout with no visible outage.[5][2][3][4]

This is the classic use case for load balancing: handling high traffic while preserving availability.

---

### 10. Architect’s Perspective

If I were designing a large-scale system, I’d use load balancing whenever I need **horizontal scaling, failure isolation, and high availability**.[1][2][4]

I’d choose the type based on the workload:

- **Layer 4** for speed and simplicity.
- **Layer 7** for HTTP-aware routing.
- **Stateless routing** for easy scaling.
- **Sticky sessions** only when the application truly requires affinity.[8][9][10]

I’d also make sure:

- Health checks are strict and fast.
- Routing algorithms match the traffic pattern.
- The load balancer itself is redundant.
- Metrics are in place for saturation, latency, and error rate.

**Cloud angle**  
In cloud systems, load balancing is often managed by the platform:

- AWS ALB/NLB,
- Azure Load Balancer / Application Gateway,
- GCP Cloud Load Balancing.

These services help distribute traffic across zones, regions, and application tiers with built-in health checks and autoscaling integration.

---

### 11. Interview Answer (2-Minute Version)

Load balancing is the practice of distributing incoming traffic across multiple servers so that no single server becomes overloaded. A load balancer sits in front of a server pool, checks health, and routes each request to an appropriate healthy server. This improves availability, scalability, and performance.

There are different types of load balancing. Layer 4 load balancers route based on network information like IP and port, while Layer 7 load balancers inspect application-level data like HTTP paths and headers. Common algorithms include round robin, least connections, and weighted routing. If the application is stateless, load balancing is straightforward; if it is stateful, you may need sticky sessions or shared session storage.

Architecturally, I use load balancing whenever I need horizontal scaling and resilience. It doesn’t fix slow code or bad database design, but it does make a distributed system much more robust under traffic spikes and server failures.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Load balancer as a traffic router, not just a “server splitter.”[2][4]
- Health checks and failure handling.
- Layer 4 vs Layer 7 differences.
- Stateless vs stateful routing.
- Algorithm choice based on workload.[9][10][8]

**Common red flags**

- Confusing load balancing with caching.
- Thinking it solves application bottlenecks by itself.
- Ignoring health checks.
- Not mentioning session affinity in stateful systems.

**Likely follow-ups**

- “What is the difference between Layer 4 and Layer 7 load balancing?”  
  → Layer 4 works at transport level; Layer 7 can inspect HTTP details.

- “Which algorithm would you use and why?”  
  → Round robin for simplicity, least connections for uneven request duration, weighted for heterogeneous servers.

- “How do you handle sticky sessions?”  
  → Use session affinity only when needed, or move session state to a shared store.

Would you like the next topic to be **round robin vs least connections**, **Layer 4 vs Layer 7 load balancing**, or **sticky sessions**?

### 13. Sources

[1] Design Load Balancer | System Design Interview https://algomaster.io/learn/system-design-interviews/design-load-balancer
[2] Load Balancer https://www.geeksforgeeks.org/system-design/what-is-load-balancer-system-design/
[3] Load Balancer - System Design Interview Question https://www.geeksforgeeks.org/system-design/load-balancer-system-design-interview-question/
[4] Load Balancing Algorithm Explained - AWS - Amazon.com https://aws.amazon.com/what-is/load-balancing/
[5] Load Balancers in System Design https://www.enjoyalgorithms.com/blog/load-balancers-in-system-design/
[6] System design: Load Balancing https://dev.to/jayaprasanna_roddam/system-design-load-balancing-823
[7] The Ultimate Guide to Load Balancers (System Design ... https://www.youtube.com/watch?v=xg7Dj2AXLyk
[8] Types of load balancing algorithms https://www.cloudflare.com/learning/performance/types-of-load-balancing-algorithms/
[9] System Design: Load Balancer https://towardsdatascience.com/system-design-load-balancer-9a3582176f9b/
[10] Load Balancer in System Design – Part 2: Types of ... https://dev.to/zeeshanali0704/load-balancing-series-part-2-types-of-load-balancers-42jl
[11] Types of Load Balancer https://www.geeksforgeeks.org/system-design/types-of-load-balancer/
