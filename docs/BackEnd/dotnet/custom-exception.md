---
title: Custom Exception Middleware/Handling in ASP.NET Core
sidebar_label: Custom Exception
sidebar_position: 5
---

---

### 1. Definition

**Custom exception handling** refers to building your own mechanism (typically middleware or `IExceptionHandler` implementations) to catch, log, and transform unhandled exceptions into consistent, production-safe error responses. [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)

**Custom exception middleware** is a specific implementation approach where you create a middleware component that wraps the rest of the pipeline in a try-catch, intercepts all unhandled exceptions, and returns a standardized error response (often using RFC 7807 Problem Details format). [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)

---

### 2. Core Idea

The core idea: **take full control over how exceptions are handled, logged, and presented to clients, beyond what built-in middleware provides**. [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)

This enables:

- **Custom error formats** tailored to your API contracts.
- **Fine-grained control** over which exceptions map to which status codes.
- **Integration with your logging/telemetry stack** (e.g., Serilog, Application Insights).
- **Consistent behavior** across all endpoints without repeating try-catch in controllers. [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-8)

Think of it as building a **custom safety net** that matches your application’s specific needs.

---

### 3. How it Works

### Approach 1: Custom Exception Middleware (Convention-Based)

**Step 1: Create the Middleware Class**

```csharp
public class CustomExceptionMiddleware {
    private readonly RequestDelegate _next;
    private readonly ILogger<CustomExceptionMiddleware> _logger;

    public CustomExceptionMiddleware(RequestDelegate next, ILogger<CustomExceptionMiddleware> logger) {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context) {
        try {
            await _next(context);  // proceed to next middleware
        } catch (Exception ex) {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex) {
        _logger.LogError(ex, "Unhandled exception occurred");

        var statusCode = ex switch {
            ArgumentException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            _ => StatusCodes.Status500InternalServerError
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var problemDetails = new {
            type = $"https://httpstatuses.com/{statusCode}",
            title = GetTitle(statusCode),
            status = statusCode,
            detail = ex.Message,
            traceId = context.TraceIdentifier
        };

        await context.Response.WriteAsJsonAsync(problemDetails);
    }

    private static string GetTitle(int statusCode) =>
        statusCode switch {
            400 => "Bad Request",
            401 => "Unauthorized",
            404 => "Not Found",
            500 => "Internal Server Error",
            _ => "Error"
        };
}
```

**Step 2: Create Extension Method (Best Practice)**

```csharp
public static class CustomExceptionMiddlewareExtensions {
    public static IApplicationBuilder UseCustomExceptionHandler(
        this IApplicationBuilder builder
    ) {
        return builder.UseMiddleware<CustomExceptionMiddleware>();
    }
}
```

**Step 3: Register in Pipeline**

```csharp
var app = builder.Build();

// Development: detailed errors
if (app.Environment.IsDevelopment()) {
    app.UseDeveloperExceptionPage();
}
else {
    // Production: custom middleware
    app.UseCustomExceptionHandler();
}

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

**Execution Flow**:

1. Request enters pipeline.
2. Middleware wraps `await _next(context)` in try-catch.
3. If exception occurs:
   - Logged via `ILogger`.
   - Status code determined based on exception type.
   - Problem Details JSON response written.
   - Pipeline short-circuited (no further middleware/endpoints run).
4. Response sent to client. [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)

---

### Approach 2: `IMiddleware` Interface Approach

```csharp
public class GlobalExceptionHandlerMiddleware : IMiddleware {
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(
        ILogger<GlobalExceptionHandlerMiddleware> logger
    ) {
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next) {
        try {
            await next(context);
        } catch (Exception ex) {
            _logger.LogError(ex, "Unhandled exception");

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var error = new {
                error = "An unexpected error occurred",
                message = ex.Message,
                traceId = context.TraceIdentifier
            };

            await context.Response.WriteAsJsonAsync(error);
        }
    }
}
```

**Registration**:

```csharp
builder.Services.AddTransient<GlobalExceptionHandlerMiddleware>();

var app = builder.Build();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
app.Run();
```

- Resolved from DI per request.
- Allows **scoped service injection** directly in constructor. [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)

---

### Approach 3: `IExceptionHandler` (.NET 8+)

```csharp
public class CustomExceptionHandler : IExceptionHandler {
    private readonly ILogger<CustomExceptionHandler> _logger;

    public CustomExceptionHandler(ILogger<CustomExceptionHandler> logger) {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken
    ) {
        _logger.LogError(exception, "Unhandled exception");

        var statusCode = exception switch {
            ArgumentException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            _ => StatusCodes.Status500InternalServerError
        };

        httpContext.Response.StatusCode = statusCode;

        var problemDetails = new {
            type = $"https://httpstatuses.com/{statusCode}",
            title = GetTitle(statusCode),
            status = statusCode,
            detail = exception.Message,
            instance = httpContext.Request.Path
        };

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;  // handled
    }

    private static string GetTitle(int statusCode) =>
        statusCode switch {
            400 => "Bad Request",
            401 => "Unauthorized",
            404 => "Not Found",
            500 => "Internal Server Error",
            _ => "Error"
        };
}
```

**Registration**:

```csharp
builder.Services.AddExceptionHandler<CustomExceptionHandler>();

var app = builder.Build();
app.UseExceptionHandler();  // built-in middleware
app.Run();
```

- Multiple handlers can be chained.
- Each returns `true` if handled, `false` to let next handler try.
- More composable than single middleware. [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)

---

### 4. Internal Architecture

### Middleware Approach

- **Wraps the pipeline**:
  - `await _next(context)` is wrapped in try-catch.
  - Any exception from downstream middleware/endpoints is caught.
- **Exception mapping**:
  - `switch` expression or `if-else` determines status code.
  - Different exception types → different HTTP status codes.
- **Response generation**:
  - Problem Details format (RFC 7807).
  - Includes:
    - `type` (URI for error type)
    - `title` (short description)
    - `status` (HTTP code)
    - `detail` (human-readable message)
    - `traceId` (for correlation) [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)
- **Logging integration**:
  - `ILogger` captures stack trace, inner exceptions.
  - Can include:
    - Correlation IDs
    - User context
    - Request details (path, method) [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)

### `IExceptionHandler` Approach

- **Handler chain**:
  - Multiple handlers registered via DI.
  - Exception handling middleware iterates through handlers.
  - First handler that returns `true` from `TryHandleAsync` wins.
- **Composability**:
  - Specific handlers for known exception types.
  - Catch-all handler as fallback.
- **Integration with built-in middleware**:
  - Works with `UseExceptionHandler()`.
  - Leverages framework’s error handling pipeline. [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-8)

### Memory & Threading

- Middleware instance:
  - Typically **singleton** (created once at startup).
  - Must be **thread-safe**.
- Exception handling code:
  - Runs per request when exceptions occur.
  - Should be **async** to avoid blocking threads.
- Response:
  - Once `context.Response` is written, pipeline is effectively short-circuited.

---

### 5. When to Use It

Use custom exception handling/middleware when:

- Built-in `UseExceptionHandler` doesn’t meet your needs:
  - You need **custom error formats**.
  - You want **exception-type-specific handling**.
  - You need **tight integration with your logging stack**. [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)
- You want **full control** over:
  - Which exceptions map to which status codes.
  - What information is exposed to clients.
  - How errors are logged and correlated. [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-8)
- You’re building:
  - Public APIs with strict error contracts.
  - Microservices requiring consistent error formats.
  - Systems with complex error handling requirements. [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-8)

---

### 6. When Not to Use It

Avoid custom exception handling when:

- Built-in `UseExceptionHandler` already meets your needs:
  - Simple error pages.
  - Standard Problem Details responses.
- You’re duplicating what `IExceptionHandler` already provides:
  - Consider using `IExceptionHandler` instead of custom middleware.
- You’re handling **expected exceptions** that should be handled locally:
  - Validation errors
  - Business rule violations [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)

Anti-pattern signals:

- Custom middleware that just wraps `UseExceptionHandler` without adding value.
- Catching exceptions that should be handled upstream.

---

### 7. Pros and Cons

**Pros**

- **Full control** over error responses and logging. [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)
- Can implement **exception-type-specific handling** (e.g., 400 for `ArgumentException`, 404 for `KeyNotFoundException`).
- **Consistent error format** across all endpoints.
- Integrates with **custom logging/telemetry** (Serilog, App Insights, etc.).
- Keeps controllers **clean** without repetitive try-catch. [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)

**Cons**

- More code to maintain vs. built-in middleware.
- Risk of **catching exceptions that should be handled locally**.
- Can hide **expected errors** if overused.
- Performance overhead if exception handling is on hot paths (exceptions are expensive). [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-8)

---

### 8. Trade Offs

- **Control vs Complexity**
  - Custom middleware gives full control but adds complexity.
  - Built-in middleware is simpler but less flexible.

- **Global vs Local Handling**
  - Global: great for unexpected, unhandled exceptions.
  - Local: better for expected, domain-specific errors.

- **Consistency vs Flexibility**
  - Custom handlers enforce consistency.
  - But may not fit all scenarios (e.g., some endpoints need special handling).

Architect-level insight:  
Use custom exception handling when you need **more than what built-in provides**, but avoid over-engineering for simple scenarios.

---

### 9. Real World Example (Minimum One)

**Example: Production API with Custom Exception Middleware**

Scenario:

- You want:
  - Different status codes for different exception types.
  - Consistent Problem Details format.
  - Centralized logging with correlation IDs.

```csharp
public class ApiException {
    public string Type { get; set; }
    public string Title { get; set; }
    public int Status { get; set; }
    public string Detail { get; set; }
    public string Instance { get; set; }
}

public class CustomExceptionMiddleware {
    private readonly RequestDelegate _next;
    private readonly ILogger<CustomExceptionMiddleware> _logger;

    public CustomExceptionMiddleware(RequestDelegate next, ILogger<CustomExceptionMiddleware> logger) {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context) {
        try {
            await _next(context);
        } catch (Exception ex) {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex) {
        _logger.LogError(ex, "Unhandled exception: {Path}", context.Request.Path);

        var (statusCode, title) = ex switch {
            ArgumentException => (StatusCodes.Status400BadRequest, "Bad Request"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Not Found"),
            _ => (StatusCodes.Status500InternalServerError, "Internal Server Error")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var apiException = new ApiException {
            Type = $"https://httpstatuses.com/{statusCode}",
            Title = title,
            Status = statusCode,
            Detail = ex.Message,
            Instance = context.Request.Path
        };

        await context.Response.WriteAsJsonAsync(apiException);
    }
}
```

**Registration**:

```csharp
var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.UseDeveloperExceptionPage();
}
else {
    app.UseMiddleware<CustomExceptionMiddleware>();
}

app.UseRouting();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

Behavior:

- `ArgumentException` → 400 with "Bad Request".
- `UnauthorizedAccessException` → 401 with "Unauthorized".
- `KeyNotFoundException` → 404 with "Not Found".
- Other exceptions → 500 with "Internal Server Error".
- All exceptions logged with request path and correlation ID. [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)

---

### 10. Architect’s Perspective

If I’m designing a large-scale system:

**Why I’d use custom exception handling**

- To enforce **consistent error contracts** across all APIs.
- To integrate with **custom logging/telemetry** stacks.
- To implement **exception-type-specific handling** (e.g., 400 for validation, 404 for not found).
- To keep controllers **clean** and focused on business logic. [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)

**When I’d avoid it**

- When built-in `UseExceptionHandler` or `IExceptionHandler` already meets my needs.
- For **expected exceptions** that should be handled locally (e.g., validation).
- When the added complexity isn’t justified by the requirements. [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)

**Important architectural considerations**

- **Layering**:
  - Local handling for expected errors.
  - Global handler as a safety net for unexpected errors.
- **Error format**:
  - Use RFC 7807 Problem Details for APIs.
  - Consistent structure helps clients parse errors.
- **Logging**:
  - Integrate with Serilog, NLog, or Application Insights.
  - Include correlation IDs for distributed tracing. [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)

**Cloud angle (optional)**  
In cloud-native apps:

- Custom exception handlers integrate with:
  - Distributed tracing (OpenTelemetry, App Insights).
  - Centralized logging (ELK, Splunk, CloudWatch).
- This makes error handling critical for **observability** in production.

---

### 11. Interview Answer (2-Minute Version)

Custom exception handling in ASP.NET Core is when you build your own middleware or `IExceptionHandler` implementation to catch, log, and transform unhandled exceptions into consistent error responses. I typically create a middleware that wraps the rest of the pipeline in a try-catch, intercepts all unhandled exceptions, maps them to appropriate HTTP status codes based on exception type, and returns a standardized Problem Details JSON response.

For example, I might map `ArgumentException` to 400, `KeyNotFoundException` to 404, and everything else to 500, with consistent error format including type, title, status, detail, and trace ID. I integrate this with my logging stack (e.g., Serilog) to capture stack traces and correlation IDs for debugging.

I use this approach when I need more control than built-in `UseExceptionHandler` provides, especially for public APIs with strict error contracts. However, I still handle expected exceptions (like validation) locally and use global handling as a safety net for unexpected errors.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Clear explanation of:
  - **Middleware approach** vs. `IExceptionHandler` approach.
  - Exception-type-specific handling (e.g., 400 for `ArgumentException`, 404 for `KeyNotFoundException`). [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-8)
- Understanding of:
  - Problem Details format (RFC 7807).
  - Integration with logging/telemetry.
  - When to use custom vs. built-in handling. [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)
- Real examples:
  - Mapping exceptions to status codes.
  - Including correlation IDs in error responses.

**Common red flags**

- Using exceptions for **control flow** (e.g., validation).
- No awareness of **Problem Details** (RFC 7807).
- Exposing **stack traces** in production responses.
- One-size-fits-all handler with no differentiation between exception types.

**Likely follow-ups (and how to steer them)**

- “How do you decide which exception maps to which status code?”  
  → Explain mapping strategy:
  - Validation exceptions → 400
  - Not found → 404
  - Unauthorized → 401
  - Unexpected → 500

- “When would you use `IExceptionHandler` vs. custom middleware?”  
  → `IExceptionHandler` for composable, chainable handlers; custom middleware for full control over the entire error handling flow. [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)

- “How do you ensure errors are logged properly?”  
  → Integrate with Serilog/NLog, include correlation IDs, and log exception details (stack trace, inner exceptions, request context). [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)

---
