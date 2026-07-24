---
title: .NET Core Request Processing Pipeline
sidebar_label: .NET Core Request Processing
sidebar_position: 1
---

---

### 1. Definition

The .NET Core (ASP.NET Core) request processing pipeline is a **sequence of middleware components** that process each incoming HTTP request and outgoing HTTP response in a defined order. [dotnettutorials](https://dotnettutorials.net/lesson/asp-net-core-request-processing-pipeline/)

Each middleware:

- Can inspect, modify, or short-circuit the request.
- Can perform work before and after calling the next component.
- Ultimately produces (or contributes to) the HTTP response. [linkedin](https://www.linkedin.com/posts/mostafamonib_common-middlewares-in-aspnet-core-activity-7388982083487973379-fg5b)

---

### 2. Core Idea

The core idea: **treat request handling as a chain of small, composable components instead of a monolithic controller**. [linkedin](https://www.linkedin.com/posts/sagar-saini-a36590243_aspnetcore-dotnet-middleware-activity-7407260848416624640-cZ3I)

This enables:

- **Separation of concerns**: authentication, logging, routing, etc., are isolated.
- **Reusability**: same middleware can be used across apps.
- **Flexibility**: you control the exact order and behavior. [dotnettutorials](https://dotnettutorials.net/lesson/asp-net-core-request-processing-pipeline/)

Think of it as an assembly line:

- The **request** is the item moving down the line.
- Each **middleware** is a worker that performs a specific task.
- The **response** comes back up the line in reverse order. [dev](https://dev.to/rasheedmozaffar/the-request-pipeline-in-aspnet-explained-for-novices-how-a-request-becomes-a-response-jim)

---

### 3. How it Works

### Key Concepts

- **Request Pipeline**
  - The ordered sequence of middleware components.
- **Middleware**
  - A component that:
    - Receives an `HttpContext`.
    - Can do work before calling `next()`.
    - Calls `next()` to pass control to the next middleware.
    - Can do work after `next()` returns. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-10.0)
- **`HttpContext`**
  - Carries:
    - Request info (headers, body, query, route data).
    - Response info (status, headers, body).
    - Features (user, session, etc.). [dotnettutorials](https://dotnettutorials.net/lesson/asp-net-core-request-processing-pipeline/)
- **Endpoint**
  - The final destination (e.g., controller action, minimal API handler, Razor page). [dotnettutorials](https://dotnettutorials.net/lesson/asp-net-core-request-processing-pipeline/)

### Execution Flow

1. **Incoming HTTP request** arrives at the app.
2. It enters the pipeline at the **first registered middleware**.
3. Each middleware:
   - Inspects/modifies the request.
   - Optionally performs logic (logging, auth checks, etc.).
   - Calls `await next()` to pass to the next component.
4. The request eventually reaches the **endpoint** (e.g., controller).
5. The endpoint generates a response.
6. The response flows **back through the pipeline in reverse order**:
   - Each middleware can inspect/modify the response.
   - Finally, it’s sent to the client. [linkedin](https://www.linkedin.com/posts/mostafamonib_common-middlewares-in-aspnet-core-activity-7388982083487973379-fg5b)

### Request Pipeline Lifecycle

- **Request phase (inbound)**:
  - Exception handling
  - Security (HSTS, HTTPS redirection)
  - Static files
  - Routing
  - CORS
  - Authentication
  - Authorization
  - Custom middleware
  - Endpoint
- **Response phase (outbound)**:
  - Endpoint result
  - Custom middleware (post-processing)
  - CORS (response headers)
  - Exception handling (if needed)
  - Final response to client [linkedin](https://www.linkedin.com/posts/mostafamonib_common-middlewares-in-aspnet-core-activity-7388982083487973379-fg5b)

### Typical Order (high-level)

A common production order looks like:

1. Exception Handler / Developer Exception Page
2. HSTS (if HTTPS-only)
3. HTTPS Redirection
4. Static Files
5. Routing
6. CORS
7. Authentication
8. Authorization
9. Custom middleware (logging, telemetry, etc.)
10. Endpoints (controllers, minimal APIs, Razor pages) [linkedin](https://www.linkedin.com/posts/mostafamonib_common-middlewares-in-aspnet-core-activity-7388982083487973379-fg5b)

Order matters:  
Authentication must come **after** routing (so it knows which endpoint is hit) but **before** authorization and endpoints.

---

### 4. Internal Architecture

### What Happens Behind the Scenes

- **Pipeline construction**:
  - In `Program.cs`, you call extension methods like:
    - `app.UseExceptionHandler()`
    - `app.UseHttpsRedirection()`
    - `app.UseRouting()`
    - `app.UseAuthentication()`
    - `app.UseAuthorization()`
    - `app.MapControllers()` / `app.MapEndpoints()`
  - Each call adds a middleware delegate to an internal list. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-10.0)

- **Middleware delegate structure**:
  - Conceptually:
    ```text
    RequestDelegate middleware = async (HttpContext context) => {
        // before next
        await next(context);
        // after next
    };
    ```
  - The framework composes these into a single combined delegate. [linkedin](https://www.linkedin.com/posts/sagar-saini-a36590243_aspnetcore-dotnet-middleware-activity-7407260848416624640-cZ3I)

- **Execution model**:
  - For each request:
    - The composed delegate is invoked with the `HttpContext`.
    - Control passes through each middleware in order.
    - Each `await next()` call invokes the next middleware in the chain. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-10.0)

- **Short-circuiting**:
  - A middleware can choose **not** to call `next()`:
    - Authentication failure → return 401 immediately.
    - Static file found → serve file and stop.
    - Custom validation fails → return 400.
  - This prevents later middleware and endpoints from running. [linkedin](https://www.linkedin.com/posts/sagar-saini-a36590243_aspnetcore-dotnet-middleware-activity-7407260848416624640-cZ3I)

### Middleware Types

- **Convention-based (inline)**:
  ```csharp
  app.Use(async (context, next) => {
      // before
      await next();
      // after
  });
  ```
- **Factory-based (`IMiddleware`)**:
  - Implement `IMiddleware.InvokeAsync(HttpContext, RequestDelegate)`.
  - Registered via DI (`services.AddTransient<MyMiddleware>()`).
  - Resolved per request. [c-sharpcorner](https://www.c-sharpcorner.com/article/mastering-middleware-in-asp-net-co-the-complete-guide-to-request-pipeline/)

- **Terminal middleware**:
  - Uses `Run()` instead of `Use()`.
  - Does **not** call `next()`.
  - Ends the pipeline. [linkedin](https://www.linkedin.com/posts/sagar-saini-a36590243_aspnetcore-dotnet-middleware-activity-7407260848416624640-cZ3I)

### Memory & Threading

- Middleware is:
  - Typically registered as **singleton** (pipeline is built once at startup).
  - Executed per request with a new `HttpContext`.
- Stateless middleware is preferred:
  - Avoid storing request-specific state in fields.
  - Use `HttpContext.Items` for per-request data. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-10.0)
- Thread safety:
  - Middleware may be invoked concurrently for multiple requests.
  - Any shared state must be thread-safe.

---

### 5. When to Use It

Use the pipeline (via built-in and custom middleware) when:

- You need **cross-cutting concerns**:
  - Logging
  - Error handling
  - Security (auth, CORS, HSTS)
  - Telemetry / tracing [dotnettutorials](https://dotnettutorials.net/lesson/asp-net-core-request-processing-pipeline/)
- You want to:
  - Inspect or modify requests/responses globally.
  - Implement **global validation**, rate limiting, or request/response transformation.
- You’re building:
  - APIs
  - Web apps
  - Microservices where consistent behavior across endpoints is critical.

Essentially: **every ASP.NET Core app uses this pipeline**; you decide what middleware to include and in what order. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-10.0)

---

### 6. When Not to Use It

Avoid using middleware for:

- **Business logic specific to one endpoint**:
  - That belongs in the handler/service layer, not in global middleware.
- Heavy, complex logic that should be in:
  - Controllers/handlers
  - Domain services
- Per-endpoint behavior that doesn’t apply globally:
  - Use filters, attributes, or handler-specific logic instead. [c-sharpcorner](https://www.c-sharpcorner.com/article/mastering-middleware-in-asp-net-co-the-complete-guide-to-request-pipeline/)

Anti-pattern signals:

- Middleware that knows about specific domain rules.
- Giant “god middleware” doing logging, auth, validation, and business rules.

---

### 7. Pros and Cons

**Pros**

- Clean separation of **cross-cutting concerns**. [linkedin](https://www.linkedin.com/posts/mostafamonib_common-middlewares-in-aspnet-core-activity-7388982083487973379-fg5b)
- Highly **composable** and configurable.
- Order-based control gives fine-grained power over behavior.
- Built-in middleware covers most common needs (auth, routing, CORS, static files, etc.). [dotnettutorials](https://dotnettutorials.net/lesson/asp-net-core-request-processing-pipeline/)
- Easy to add **custom middleware** for logging, telemetry, security, etc. [dev](https://dev.to/rasheedmozaffar/the-request-pipeline-in-aspnet-explained-for-novices-how-a-request-becomes-a-response-jim)

**Cons**

- Order is critical and can be subtle:
  - Wrong order = broken auth, missing CORS headers, incorrect error handling. [linkedin](https://www.linkedin.com/posts/mostafamonib_common-middlewares-in-aspnet-core-activity-7388982083487973379-fg5b)
- Middleware runs for **every request** unless you add conditions:
  - Can impact performance if heavy logic is added naively.
- Overuse can lead to:
  - Hard-to-debug pipelines.
  - Logic scattered across many middleware components. [c-sharpcorner](https://www.c-sharpcorner.com/article/mastering-middleware-in-asp-net-co-the-complete-guide-to-request-pipeline/)

---

### 8. Trade Offs

- **Global vs Local Logic**
  - Middleware is great for global concerns.
  - But misplaced business logic makes the system harder to understand.

- **Performance vs Functionality**
  - Each middleware adds overhead.
  - Must balance richness of features with latency/throughput needs.

- **Simplicity vs Flexibility**
  - Simple pipeline: easy to understand, less flexible.
  - Complex pipeline: powerful, but harder to reason about.

Architect-level insight:  
Design the pipeline like an **explicit contract**: document what each middleware does, why it’s in that position, and what it expects from earlier/later components.

---

### 9. Real World Example (Minimum One)

**Example: Global Logging and Error Handling Middleware**

Scenario:

- You want to:
  - Log every request (method, path, duration).
  - Catch unhandled exceptions and return a standard error response.

Custom logging middleware:

```text
public class RequestLoggingMiddleware {
    private readonly RequestDelegate _next;

    public RequestLoggingMiddleware(RequestDelegate next) {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context) {
        var start = DateTimeOffset.UtcNow;

        try {
            await _next(context);  // call next middleware
        }
        finally {
            var duration = DateTimeOffset.UtcNow - start;
            Log($"{context.Request.Method} {context.Request.Path} took {duration}");
        }
    }
}
```

Registration in `Program.cs`:

```csharp
app.UseExceptionHandler();          // global error handling
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<RequestLoggingMiddleware>();

app.MapControllers();
```

Behavior:

- Every request is logged with method, path, and duration.
- If an exception occurs, `UseExceptionHandler` catches it and returns a consistent error format instead of leaking stack traces. [dotnettutorials](https://dotnettutorials.net/lesson/asp-net-core-request-processing-pipeline/)

---

### 10. Architect’s Perspective

If I’m designing a large-scale system:

**Why I’d rely heavily on the pipeline**

- It’s the **backbone of request handling** in ASP.NET Core.
- It lets me enforce:
  - Consistent security (auth, authorization, CORS).
  - Consistent error handling and logging.
  - Observability (tracing, metrics, correlation IDs). [linkedin](https://www.linkedin.com/posts/mostafamonib_common-middlewares-in-aspnet-core-activity-7388982083487973379-fg5b)
- I can:
  - Introduce **global behaviors** (rate limiting, request validation) without touching controllers.

**When I’d avoid overusing middleware**

- For endpoint-specific logic:
  - Use filters, attributes, or handler logic.
- For complex domain rules:
  - Keep them in services/domain layers.
- When middleware becomes a dumping ground:
  - That’s a sign to refactor and clarify responsibilities. [c-sharpcorner](https://www.c-sharpcorner.com/article/mastering-middleware-in-asp-net-co-the-complete-guide-to-request-pipeline/)

**Important architectural considerations**

- **Ordering discipline**:
  - Document and enforce a standard order across services.
  - Common pattern:
    - Exception handling → HTTPS → Static files → Routing → Auth → CORS → Custom → Endpoints. [dotnettutorials](https://dotnettutorials.net/lesson/asp-net-core-request-processing-pipeline/)
- **Performance**:
  - Keep middleware lightweight and async-friendly.
  - Avoid heavy I/O or blocking calls in hot paths.
- **Testability**:
  - Middleware can be unit-tested with fake `HttpContext`.
  - Integration tests can verify pipeline behavior end-to-end.

**Cloud angle (optional)**  
In cloud-native .NET services (e.g., on Azure):

- Middleware is used for:
  - Correlation ID propagation (for distributed tracing).
  - Injecting cloud-specific headers.
  - Integrating with telemetry systems (OpenTelemetry, App Insights).
- This makes the pipeline central to **observability and reliability** in distributed systems.

---

### 11. Interview Answer (2-Minute Version)

In ASP.NET Core, the request processing pipeline is a sequence of middleware components that handle each HTTP request and response. Each middleware can inspect or modify the request, decide whether to pass it to the next component by calling `next()`, and then do additional work on the way back with the response. The pipeline is configured in `Program.cs` using methods like `UseRouting()`, `UseAuthentication()`, `UseAuthorization()`, and `MapControllers()`.

I use the pipeline for cross-cutting concerns like exception handling, logging, authentication, authorization, CORS, and telemetry. The order is critical: for example, exception handling typically comes early, routing before authentication, and authorization before endpoints. Middleware can also short-circuit the pipeline, for example returning a 401 when authentication fails without hitting the controller.

Architecturally, I treat the pipeline as the backbone of request handling in ASP.NET Core. It’s where I enforce consistent security, error handling, and observability across the entire application, while keeping business logic out of middleware and in controllers or services.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Clear explanation of:
  - **Request → middleware chain → endpoint → response**.
  - Symmetric behavior: work before and after `next()`. [linkedin](https://www.linkedin.com/posts/sagar-saini-a36590243_aspnetcore-dotnet-middleware-activity-7407260848416624640-cZ3I)
- Importance of **order** with concrete examples:
  - Auth before authorization.
  - Exception handling early.
  - Static files before routing for performance. [linkedin](https://www.linkedin.com/posts/mostafamonib_common-middlewares-in-aspnet-core-activity-7388982083487973379-fg5b)
- Awareness of:
  - Short-circuiting.
  - Terminal vs non-terminal middleware (`Run` vs `Use`). [linkedin](https://www.linkedin.com/posts/sagar-saini-a36590243_aspnetcore-dotnet-middleware-activity-7407260848416624640-cZ3I)

**Common red flags**

- Saying “middleware is just for logging” and missing auth, routing, etc.
- No sense of **order sensitivity**.
- Confusing middleware with:
  - Filters (MVC-specific).
  - HTTP modules/handlers from classic ASP.NET.

**Likely follow-ups (and how to steer them)**

- “How would you implement global error handling?”  
  → Describe `UseExceptionHandler`, custom error middleware, and returning standardized error responses. [dotnettutorials](https://dotnettutorials.net/lesson/asp-net-core-request-processing-pipeline/)

- “What’s the difference between middleware and filters?”  
  → Middleware: pipeline-level, runs for all requests.  
  Filters: MVC-specific, tied to controller/action execution.

- “How do you ensure middleware doesn’t hurt performance?”  
  → Emphasize:
  - Keep logic lightweight.
  - Avoid blocking calls.
  - Conditionally run only where needed.

---
