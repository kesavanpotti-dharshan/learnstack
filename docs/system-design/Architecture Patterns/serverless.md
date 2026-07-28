---
title: Serverless Software Architecture
sidebar_label: Serverless
sidebar_position: 1
---

Serverless software architecture is a cloud execution model where you **deploy code without managing servers**, and the cloud provider handles provisioning, scaling, patching, and runtime management for you.[1][2][3][4][5]

---

## Core Idea

“Serverless” does **not** mean there are no servers. It means the server management is hidden from the developer, so you focus on code and business logic instead of infrastructure operations.[3][4][5][1]

Most serverless systems are event-driven: code runs only when triggered by an HTTP request, file upload, queue message, database change, or schedule.[2][5][6][7][8][1]

---

## Main Building Blocks

### Functions

The most common form is **Function as a Service (FaaS)**, where you write small, single-purpose functions that execute on demand.[4][5][6][9][2]

Typical functions:

- HTTP handlers.
- Queue consumers.
- Scheduled jobs.
- Event processors.[5][6][7][2]

### Managed Services

Serverless architectures often pair functions with managed cloud services like:

- Databases.
- Object storage.
- Message queues.
- Event buses.
- Authentication services.[1][2][3][4][5]

### Triggers

A trigger starts the function:

- API request.
- File upload.
- Cron schedule.
- Database update.
- Stream or event message.[6][7][8][5][1]

---

## How It Works

1. An event arrives, such as an HTTP call or queue message.[7][8][6][1]
2. The cloud provider invokes the relevant function.[8][2][4][5][1]
3. The function runs, usually in a stateless way.[9][10][11][8]
4. The provider automatically scales the number of running instances based on demand.[2][3][4][5][7][8]
5. When traffic drops, instances are reduced or shut down, and you stop paying for idle compute.[11][12][5][7]

---

## Why People Use It

Serverless is attractive because it reduces operational overhead and lets teams move faster.[12][3][4][5][1][2]

Benefits:

- No server provisioning or patching.
- Automatic scaling.
- Pay for actual usage instead of idle capacity.
- Faster delivery for small, modular features.
- Good fit for bursty or unpredictable workloads.[3][4][5][7][12][1][2]

---

## Trade-Offs

Serverless is not a free lunch.[13][4][9][12][1][2]

Common trade-offs:

- **Cold starts**
  - First invocation after idle can be slower.[10][12][2]
- **Statelessness**
  - Functions should not rely on local memory or disk for long-term state.[8][9][10][11]
- **Execution limits**
  - Functions often have time, memory, or concurrency limits.[5][12][2]
- **Vendor lock-in**
  - You may depend heavily on provider-specific services and triggers.[4][12][3][5]
- **Observability complexity**
  - Tracing many small functions can be harder than tracing a monolith.[12][1]

---

## When to Use It

Serverless is a good fit when:

- Traffic is variable or spiky.
- You want to minimize ops work.
- You have event-driven workflows.
- You’re building small APIs, background jobs, automation, or glue code.[7][9][1][2][5][12]

It is often less ideal when:

- You need long-running processes.
- You require very low and predictable latency.
- You need fine-grained control over runtime behavior.
- Your workload is steady and high-volume enough that dedicated infrastructure is cheaper.[10][2][4][8][12]

---

## Simple Example

Imagine an image upload system:

- A user uploads a file to object storage.
- That upload triggers a serverless function.
- The function resizes the image and stores thumbnails.
- Another function updates metadata in a managed database.
- A notification function sends a message to the user.[6][1][2][5][7][8]

No VM management is required, and each step scales independently.

---

## Relation to Microservices

Serverless and microservices are related but not the same.[14][15][9][8][10]

- **Microservices** describe how your application is **structured** into separate services.
- **Serverless** describes how code is **executed and operated** without server management.[15][11][8][10]

You can build microservices on serverless platforms, but you can also use serverless functions without adopting a full microservices architecture.[9][14][15][10]

---

## Interview Answer

Serverless architecture is a cloud model where developers deploy code without managing the underlying servers, scaling, or runtime infrastructure. Applications are usually built from small functions that run in response to events like HTTP requests, queue messages, or file uploads. The cloud provider handles provisioning, autoscaling, and maintenance, and you typically pay only when code runs. The trade-off is more reliance on managed services, possible cold starts, and more complexity around state, observability, and vendor lock-in.[1][2][3][4][5][7][8][12]

Would you like the next topic to be **serverless vs microservices** or **cold starts and how to mitigate them**?

## Sources

[1] What is Serverless Architecture? https://www.datadoghq.com/knowledge-center/serverless-architecture/
[2] Serverless Architecture https://www.geeksforgeeks.org/system-design/serverless-architectures/
[3] Building Applications with Serverless Architectures https://aws.amazon.com/lambda/serverless-architectures-learn-more/
[4] What is Serverless Architecture? https://cloud.google.com/discover/what-is-serverless-architecture
[5] What is Serverless Architecture? https://www.twilio.com/docs/glossary/what-is-serverless-architecture
[6] What Is Function as a Service (FaaS)? https://www.cloudflare.com/learning/serverless/glossary/function-as-a-service-faas/
[7] Serverless Architecture | The Art of System Design https://www.youtube.com/watch?v=s8wq3YWWVmk
[8] Serverless vs. Microservices: 4 Differences and Potential ... https://www.dash0.com/knowledge/serverless-vs-microservices-4-differences-and-potential-synergies
[9] What are Serverless Microservices? https://www.datadoghq.com/knowledge-center/serverless-architecture/serverless-microservices/
[10] Difference Microservices vs. Lambda vs. Serverless-Functions https://stackoverflow.com/questions/66070926/difference-microservices-vs-lambda-vs-serverless-functions
[11] Serverless vs Microservices: Know the Real Difference https://www.youtube.com/watch?v=pWDkxrnDk6Q
[12] Serverless Architecture & Computing: Pros, Cons, Best Fits ... https://www.splunk.com/en_us/blog/learn/serverless-architecture.html
[13] Software Architecture Design of a Serverless System https://dl.acm.org/doi/10.1145/3593434.3593471
[14] Serverless and microservices: A tale of two architectures https://www.contentful.com/blog/serverless-vs-microservices/
[15] Serverless vs. microservices: Which architecture is best for ... https://www.ibm.com/think/topics/serverless-vs-microservices
