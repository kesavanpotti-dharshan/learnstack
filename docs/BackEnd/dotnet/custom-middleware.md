---
title: Custom Middleware in ASP.NET Core
sidebar_label: Custom Middleware
sidebar_position: 3
---

---

### 1. Definition

Custom middleware is a **user-defined middleware component** that you create to add specific behavior to the ASP.NET Core request pipeline. It follows the same contract as built-in middleware: it receives an `HttpContext`, can perform work before and after calling `next()`, and can optionally short-circuit the pipeline. [mindstick](https://www.mindstick.com/interview/34485/how-to-write-custom-middleware-in-asp-dot-net-core)

Custom middleware enables you to implement **application-specific cross-cutting concerns** like custom logging, request validation, rate limiting, or domain-specific headers. [c-sharpcorner](https://www.c-sharpcorner.com/article/create-a-custom-middleware-in-an-asp-net-core-application/)

---

### 2. Core Idea

The core idea: **extend the request pipeline with your own components to handle behaviors that aren’t covered by built-in middleware**. [reddit](https://www.reddit.com/r/dotnet/comments/1cm9du8/how_to_create_custom_middlewares_in_aspnet_core/)

Custom middleware allows you to:

- Implement **global behaviors** without touching controllers.
- Centralize logic that applies to many or all endpoints.
- Keep controllers focused on **business logic**, not infrastructure concerns. [oneuptime](https://oneuptime.com/blog/post/2026-01-25-custom-middleware-aspnet-core/view)

It’s the primary mechanism for adding **application-specific cross-cutting concerns** in a clean, reusable way.

---

### 3. How it Works

### Approaches to Create Custom Middleware

There are three main approaches:

1. **Inline Delegate Middleware** (simplest)
   - Defined directly in `Program.cs` using `app.Use()`.
   - Good for simple, one-off logic. [oneuptime](https://oneuptime.com/blog/post/2026-01-25-custom-middleware-aspnet-core/view)

2. **Convention-Based Middleware Class** (most common)
   - A class with:
     - Constructor taking `RequestDelegate next`.
     - `InvokeAsync(HttpContext context)` method.
   - Registered via `app.UseMiddleware<YourMiddleware>()`. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-10.0)

3. **Factory-Based Middleware (`IMiddleware`)**
   - Implements `IMiddleware` interface.
   - Resolved from DI per request.
   - Better for middleware that needs **scoped services**. [dotnettutorials](https://dotnettutorials.net/lesson/custom-middleware-in-asp-net-core/)

### Execution Flow (Convention-Based Example)

1. Middleware class is instantiated (typically once at startup).
2. For each request:
   - `InvokeAsync(HttpContext context)` is called.
   - Middleware can:
     - Inspect/modify the request.
     - Perform logic (logging, validation, etc.).
     - Call `await next(context)` to continue the pipeline.
     - Perform logic after `next()` returns (response phase).
3. Response is sent to the client.

### Lifecycle

- **Middleware instance**:
  - Typically **singleton** (created once at startup).
  - Must be **thread-safe**.
- **Per-request invocation**:
  - `InvokeAsync` is called once per request.
  - A new `HttpContext` is provided each time.
- **Completion**:
  - After `InvokeAsync` completes, the request is done.

---

### 4. Internal Architecture

### 1. Inline Delegate Middleware

```csharp
app.Use(async (context, next) => {
    // BEFORE request processing
    Console.WriteLine($"Request: {context.Request.Path}");

    await next();  // call next middleware

    // AFTER response processing
    Console.WriteLine($"Response: {context.Response.StatusCode}");
});
```

- Simple, no class needed.
- Best for **quick, local logic**.
- Not easily reusable across apps. [oneuptime](https://oneuptime.com/blog/post/2026-01-25-custom-middleware-aspnet-core/view)

---

### 2. Convention-Based Middleware Class

```csharp
public class CustomMiddleware {
    private readonly RequestDelegate _next;

    public CustomMiddleware(RequestDelegate next) {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context) {
        // BEFORE request processing
        Console.WriteLine($"Request Incoming: {context.Request.Path}");

        // Call next middleware
        await _next(context);

        // AFTER response processing
        Console.WriteLine($"Response Outgoing: {context.Response.StatusCode}");
    }
}
```

**Extension Method (Best Practice)**:

```csharp
public static class CustomMiddlewareExtensions {
    public static IApplicationBuilder UseCustomMiddleware(
        this IApplicationBuilder builder
    ) {
        return builder.UseMiddleware<CustomMiddleware>();
    }
}
```

**Registration in `Program.cs`**:

```csharp
var app = builder.Build();

app.UseCustomMiddleware();  // clean, readable
app.MapControllers();
app.Run();
```

- Reusable across projects.
- Easy to test.
- Most common approach for production code. [mindstick](https://www.mindstick.com/interview/34485/how-to-write-custom-middleware-in-asp-dot-net-core)

---

### 3. Factory-Based Middleware (`IMiddleware`)

```csharp
public class CustomImiddleware : IMiddleware {
    public async Task InvokeAsync(HttpContext context, RequestDelegate next) {
        // BEFORE
        Console.WriteLine($"Request: {context.Request.Path}");

        await next(context);

        // AFTER
        Console.WriteLine($"Response: {context.Response.StatusCode}");
    }
}
```

**Registration**:

```csharp
// In Program.cs
builder.Services.AddTransient<CustomImiddleware>();

var app = builder.Build();
app.UseMiddleware<CustomImiddleware>();
app.Run();
```

- Resolved from DI **per request**.
- Allows **scoped service injection** directly in constructor.
- Slightly more overhead (per-request activation). [youtube](https://www.youtube.com/watch?v=cu4CUJAcJ-4&vl=en)

---

### Dependency Injection in Custom Middleware

**Important distinction**:

- **Convention-based middleware**:
  - Constructor dependencies must be **singleton** (middleware is singleton).
  - To use **scoped services**, inject them in `InvokeAsync` via `context.RequestServices`.

```csharp
public async Task InvokeAsync(HttpContext context) {
    var scopedService = context.RequestServices
        .GetRequiredService<IMyScopedService>();

    await next(context);
}
```

- **`IMiddleware` approach**:
  - Can inject **scoped services** directly in constructor.
  - Resolved per request, so scope is correct. [dotnettutorials](https://dotnettutorials.net/lesson/custom-middleware-in-asp-net-core/)

---

### 5. When to Use It

Use custom middleware when:

- You need **application-specific cross-cutting concerns**:
  - Custom logging (request/response, duration, correlation IDs).
  - Global error handling with custom error formats.
  - Request validation (e.g., custom headers, API key checks).
  - Rate limiting.
  - Custom security headers (e.g., X-Frame-Options, CSP). [mindstick](https://www.mindstick.com/interview/34485/how-to-write-custom-middleware-in-asp-dot-net-core)

- You want to:
  - Keep controllers focused on business logic.
  - Centralize logic that applies to many endpoints.
  - Make behavior **reusable** across multiple apps. [c-sharpcorner](https://www.c-sharpcorner.com/article/create-a-custom-middleware-in-an-asp-net-core-application/)

---

### 6. When Not to Use It

Avoid custom middleware when:

- The logic is **endpoint-specific**:
  - Use filters, attributes, or handler logic instead.
- The behavior is **domain logic**:
  - That belongs in services/domain layer.
- You’re duplicating built-in middleware:
  - Check if there’s already a built-in or nuget package solution.

Anti-pattern signals:

- Middleware that knows about specific controllers or routes.
- Middleware doing heavy business logic instead of cross-cutting concerns. [oneuptime](https://oneuptime.com/blog/post/2026-01-25-custom-middleware-aspnet-core/view)

---

### 7. Pros and Cons

**Pros**

- Clean separation of **cross-cutting concerns** from business logic. [oneuptime](https://oneuptime.com/blog/post/2026-01-25-custom-middleware-aspnet-core/view)
- Reusable across endpoints and applications.
- Centralized logic:
  - Easier to maintain and test.
- Flexible:
  - Can inspect/modify requests and responses.
  - Can short-circuit the pipeline. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-10.0)

**Cons**

- Runs for **every request** (unless you add conditions):
  - Can impact performance if logic is heavy.
- Order sensitivity:
  - Wrong position in pipeline can break behavior.
- Can lead to:
  - Logic scattered across many middleware components.
  - Hard-to-debug pipelines if overused. [oneuptime](https://oneuptime.com/blog/post/2026-01-25-custom-middleware-aspnet-core/view)

---

### 8. Trade Offs

- **Reusability vs Complexity**
  - Custom middleware is reusable but adds another layer to understand.
- **Global vs Local Logic**
  - Great for global concerns, bad for endpoint-specific logic.
- **Performance vs Functionality**
  - Each middleware adds overhead.
  - Must balance richness of features with latency/throughput needs.

Architect-level insight:  
Use custom middleware when the behavior is **truly cross-cutting** and applies to many or all endpoints. For endpoint-specific logic, prefer filters, attributes, or handler-level code.

---

### 9. Real World Example (Minimum One)

**Example: Custom Request Validation Middleware**

Scenario:

- All API requests must include a custom header `X-Api-Key`.
- If missing or invalid, return 401 immediately.

```csharp
public class ApiKeyValidationMiddleware {
    private readonly RequestDelegate _next;

    public ApiKeyValidationMiddleware(RequestDelegate next) {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context) {
        // Check for X-Api-Key header
        if (!context.Request.Headers.TryGetValue("X-Api-Key", out var apiKey)
            || !IsValidApiKey(apiKey)) {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new {
                error = "Invalid or missing API key"
            });
            return;  // short-circuit pipeline
        }

        // Valid key, continue pipeline
        await _next(context);
    }

    private bool IsValidApiKey(string apiKey) {
        // Implement validation logic (e.g., check against DB, config)
        return !string.IsNullOrEmpty(apiKey) && apiKey.Length == 32;
    }
}
```

**Extension Method**:

```csharp
public static class ApiKeyMiddlewareExtensions {
    public static IApplicationBuilder UseApiKeyValidation(
        this IApplicationBuilder builder
    ) {
        return builder.UseMiddleware<ApiKeyValidationMiddleware>();
    }
}
```

**Registration in `Program.cs`**:

```csharp
var app = builder.Build();

app.UseApiKeyValidation();  // early in pipeline
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

Behavior:

- Every request is checked for `X-Api-Key`.
- Invalid/missing key → 401 response, pipeline stops.
- Valid key → request continues to authentication, authorization, and controllers. [stackoverflow](https://stackoverflow.com/questions/52635744/how-to-use-custom-middleware-in-asp-net-core-only-when-request-is-authorized)

---

### 10. Architect’s Perspective

If I’m designing a large-scale system:

**Why I’d use custom middleware**

- To enforce **global policies**:
  - Security headers
  - API key validation
  - Rate limiting
  - Custom logging/telemetry
- To keep controllers **clean and focused** on business logic.
- To centralize behaviors that would otherwise be duplicated across endpoints. [oneuptime](https://oneuptime.com/blog/post/2026-01-25-custom-middleware-aspnet-core/view)

**When I’d avoid it**

- For logic that’s specific to certain endpoints or controllers.
- For domain logic that belongs in services.
- When the behavior is better expressed as:
  - Filters (MVC-specific)
  - Policy-based authorization
  - Endpoint-level attributes

**Important architectural considerations**

- **Ordering**:
  - Security-related middleware (API key, auth) should come **early**.
  - Logging can be early or late depending on whether you want to log before/after auth.
- **Performance**:
  - Keep middleware lightweight.
  - Avoid heavy I/O or DB calls in hot paths.
- **Testability**:
  - Middleware can be unit-tested with fake `HttpContext`.
  - Integration tests can verify pipeline behavior end-to-end.

**Cloud angle (optional)**  
In cloud-native apps:

- Custom middleware is often used for:
  - Correlation ID propagation.
  - Integrating with distributed tracing systems.
  - Injecting cloud-specific headers (e.g., for load balancers, API gateways).

---

### 11. Interview Answer (2-Minute Version)

Custom middleware in ASP.NET Core is a user-defined component that you add to the request pipeline to implement application-specific cross-cutting concerns. You can create it as an inline delegate, a convention-based class with a constructor taking `RequestDelegate` and an `InvokeAsync` method, or by implementing `IMiddleware` for DI-friendly, per-request activation.

I use custom middleware for global behaviors like custom logging, request validation, rate limiting, or adding security headers. For example, I might create middleware that checks for an `X-Api-Key` header on every request and returns a 401 if it’s missing or invalid, short-circuiting the pipeline before it reaches authentication or controllers.

I’m careful to keep middleware focused on cross-cutting concerns, not business logic, and to place it in the correct order in the pipeline. For endpoint-specific logic, I prefer filters or attributes instead of middleware.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Clear explanation of:
  - Three approaches (inline, convention-based, `IMiddleware`).
  - When to use each. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-10.0)
- Understanding of:
  - Middleware lifecycle (singleton instance, per-request invocation).
  - DI considerations (singleton vs scoped services). [youtube](https://www.youtube.com/watch?v=cu4CUJAcJ-4&vl=en)
- Real examples from their codebase:
  - Logging, validation, security headers, rate limiting. [mindstick](https://www.mindstick.com/interview/34485/how-to-write-custom-middleware-in-asp-dot-net-core)

**Common red flags**

- Creating middleware for **endpoint-specific logic**.
- Injecting **scoped services** into convention-based middleware constructors.
- No awareness of **order sensitivity** in the pipeline.
- Overusing middleware instead of filters or attributes where appropriate.

**Likely follow-ups (and how to steer them)**

- “How do you inject scoped services into middleware?”  
  → Explain:
  - Convention-based: use `context.RequestServices` in `InvokeAsync`.
  - `IMiddleware`: can inject scoped services in constructor. [dotnettutorials](https://dotnettutorials.net/lesson/custom-middleware-in-asp-net-core/)

- “When would you use `IMiddleware` vs convention-based?”  
  → `IMiddleware` when you need scoped services directly; convention-based for simpler, singleton middleware.

- “How do you test custom middleware?”  
  → Unit test with fake `HttpContext` and `RequestDelegate`; integration test with full pipeline.

---
