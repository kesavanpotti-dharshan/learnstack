---
title: Exception Handling & Global Exception Handling in ASP.NET Core
sidebar_label: Exception Handling
sidebar_position: 4
---

---

### 1. Definition

**Exception handling** in ASP.NET Core refers to the mechanisms for catching, processing, and responding to exceptions that occur during request processing. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-10.0)

**Global exception handling** is a centralized approach where **all unhandled exceptions** across the application are caught in one place (typically middleware or exception handlers), logged, and transformed into consistent, user-friendly error responses instead of exposing raw stack traces. [c-sharpcorner](https://www.c-sharpcorner.com/article/global-exception-handling-in-asp-net-core-web-api/)

---

### 2. Core Idea

The core idea: **separate error handling logic from business logic and enforce a consistent error response format across the entire application**. [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)

This enables:

- **Centralized control** over how errors are logged and presented.
- **Consistent error responses** (e.g., RFC 7807 Problem Details format). [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-from-middleware-to-modern-handlers)
- **Cleaner controllers** without repetitive try-catch blocks. [blog.georgekosmidis](https://blog.georgekosmidis.net/error-handling-in-asp-net-core-web-api.html)
- **Better security** by avoiding exposure of internal details to clients. [oneuptime](https://oneuptime.com/blog/post/2026-01-26-global-exception-handler-aspnet-core/view)

Think of it as a **safety net** that catches anything your code doesn’t explicitly handle.

---

### 3. How it Works

### Execution Flow

1. **Incoming request** enters the pipeline.
2. Middleware and endpoints process the request.
3. If an exception is thrown and not caught:
   - It propagates up the call stack.
   - Eventually reaches the **exception handling middleware** or **exception handlers**.
4. Exception handler:
   - Catches the exception.
   - Logs details (stack trace, inner exceptions, context).
   - Generates a standardized error response (e.g., Problem Details).
   - Sets appropriate status code (400, 404, 500, etc.).
5. Response is sent to the client. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling-api?view=aspnetcore-10.0)

### Built-in Middleware: `UseExceptionHandler`

ASP.NET Core ships with built-in exception handling middleware:

```csharp
var app = builder.Build();

if (!app.Environment.IsDevelopment()) {
    app.UseExceptionHandler("/error");  // production
} else {
    app.UseDeveloperExceptionPage();     // development
}

app.UseRouting();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

- **Development**: `UseDeveloperExceptionPage()` shows detailed stack traces.
- **Production**: `UseExceptionHandler()` returns generic error responses or redirects to an error page. [winwire](https://www.winwire.com/blog/global-exception-handling-asp-net-core-web-apis/)

### Custom Middleware Approach

```csharp
public class GlobalExceptionMiddleware {
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger) {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context) {
        try {
            await _next(context);
        } catch (Exception ex) {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex) {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var error = new {
            error = "An unexpected error occurred",
            message = ex.Message
        };

        return context.Response.WriteAsJsonAsync(error);
    }
}
```

Registration:

```csharp
app.UseMiddleware<GlobalExceptionMiddleware>();
```

- Catches all unhandled exceptions.
- Logs them.
- Returns consistent JSON error response. [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)

### Modern Approach: `IExceptionHandler` (.NET 8+)

ASP.NET Core 8+ introduces `IExceptionHandler` for more granular, composable exception handling:

```csharp
public class GlobalExceptionHandler : IExceptionHandler {
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken) {

        // Log exception
        // Build Problem Details response
        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        await httpContext.Response.WriteAsJsonAsync(
            new {
                type = "https://httpstatuses.com/500",
                title = "Internal Server Error",
                status = 500,
                detail = exception.Message
            },
            cancellationToken
        );

        return true;  // handled
    }
}
```

Registration:

```csharp
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();
app.UseExceptionHandler();  // built-in middleware
app.Run();
```

- Multiple handlers can be chained.
- Each handler returns `true` if it handled the exception, `false` to let the next handler try.
- Framework tries handlers in registration order (most specific first). [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)

---

### 4. Internal Architecture

### Built-in Exception Handling Middleware

- `UseExceptionHandler()`:
  - Wraps the rest of the pipeline in a try-catch.
  - On exception:
    - Clears the response.
    - Re-execute the request in an alternate pipeline (if response hasn’t started).
    - Or write a custom error response. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-10.0)

- **Developer Exception Page**:
  - Shows detailed stack traces, request info, and query strings.
  - Only safe in development environments. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling-api?view=aspnetcore-10.0)

### Custom Middleware

- Wraps `_next(context)` in try-catch.
- On exception:
  - Logs details.
  - Sets status code.
  - Writes error response (JSON, Problem Details, etc.).
- Runs for **every request**, so performance matters. [c-sharpcorner](https://www.c-sharpcorner.com/article/global-exception-handling-in-asp-net-core-web-api/)

### `IExceptionHandler` Pipeline

- Multiple handlers registered via DI.
- Exception handling middleware iterates through handlers in order.
- First handler that returns `true` from `TryHandleAsync` wins.
- Allows:
  - Specific handlers for known exception types (e.g., `ValidationException`, `NotFoundException`).
  - Catch-all handler as fallback. [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-from-middleware-to-modern-handlers)

### Problem Details (RFC 7807)

Standardized error format:

```json
{
  "type": "https://example.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "The requested resource does not exist",
  "instance": "/api/products/123"
}
```

- Machine-readable.
- Consistent across APIs.
- Built-in support in ASP.NET Core via `ProblemDetails` class. [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)

---

### 5. When to Use It

Use global exception handling when:

- You want **consistent error responses** across all endpoints. [oneuptime](https://oneuptime.com/blog/post/2026-01-26-global-exception-handler-aspnet-core/view)
- You want to avoid try-catch in every controller/action. [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)
- You need to:
  - Log all unhandled exceptions centrally.
  - Hide internal details from clients.
  - Enforce a standard error format (e.g., Problem Details). [c-sharpcorner](https://www.c-sharpcorner.com/article/global-exception-handling-in-asp-net-core-web-api/)
- You’re building:
  - Web APIs
  - Microservices
  - Any production system where reliability and consistency matter. [oneuptime](https://oneuptime.com/blog/post/2026-01-26-global-exception-handler-aspnet-core/view)

---

### 6. When Not to Use It

Avoid relying solely on global exception handling when:

- You need to handle **expected exceptions** locally:
  - Validation errors
  - Business rule violations
  - Known failure scenarios
- You want to provide **specific responses** for certain cases:
  - Use local try-catch or specific exception handlers.
- You’re using exceptions for **control flow**:
  - Better to validate upfront and avoid exceptions. [reddit](https://www.reddit.com/r/csharp/comments/1eh1fer/how_to_correctly_provide_custom_error_message_in/)

Anti-pattern signals:

- Throwing exceptions for every validation error.
- Using global handler as an excuse not to validate input.

---

### 7. Pros and Cons

**Pros**

- **Centralized** error handling: one place to manage all unhandled exceptions. [blog.georgekosmidis](https://blog.georgekosmidis.net/error-handling-in-asp-net-core-web-api.html)
- **Consistent error responses** across the application. [c-sharpcorner](https://www.c-sharpcorner.com/article/error-handling-in-net-core-web-api-with-custom-middleware/)
- **Cleaner controllers** without repetitive try-catch blocks. [blog.georgekosmidis](https://blog.georgekosmidis.net/error-handling-in-asp-net-core-web-api.html)
- **Better security** by avoiding exposure of stack traces and internal details. [c-sharpcorner](https://www.c-sharpcorner.com/article/global-exception-handling-in-asp-net-core-web-api/)
- Works with **logging frameworks** (Serilog, NLog) for monitoring. [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)

**Cons**

- Can hide **expected errors** if overused.
- May lead to catching exceptions that should be handled locally.
- Performance overhead if exception handling is on hot paths (exceptions are expensive).
- Risk of **one-size-fits-all** responses that don’t fit all scenarios. [code-maze](https://code-maze.com/global-error-handling-aspnetcore/)

---

### 8. Trade Offs

- **Global vs Local Handling**
  - Global: great for unexpected, unhandled exceptions.
  - Local: better for expected, domain-specific errors.

- **Consistency vs Specificity**
  - Global handlers enforce consistency.
  - But may not provide enough detail for specific error types.

- **Simplicity vs Control**
  - Simple: one catch-all handler.
  - More control: multiple handlers for different exception types with `IExceptionHandler`. [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)

Architect-level insight:  
Use global exception handling as a **safety net**, not as a replacement for proper validation and local error handling.

---

### 9. Real World Example (Minimum One)

**Example: Production-Ready Global Exception Handler with `IExceptionHandler`**

Scenario:

- You want:
  - Consistent Problem Details responses.
  - Different handling for known exception types.
  - Centralized logging.

```csharp
public class ValidationExceptionHandler : IExceptionHandler {
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken) {

        if (exception is not ValidationException validationEx)
            return false;

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

        var problemDetails = new {
            type = "https://example.com/errors/validation-error",
            title = "Validation Error",
            status = 400,
            detail = validationEx.Message,
            errors = validationEx.Errors  // list of validation errors
        };

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}

public class GlobalExceptionHandler : IExceptionHandler {
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken) {

        _logger.LogError(exception, "Unhandled exception occurred");

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var problemDetails = new {
            type = "https://httpstatuses.com/500",
            title = "Internal Server Error",
            status = 500,
            detail = "An unexpected error occurred. Please try again later."
        };

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}
```

Registration:

```csharp
builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();
app.UseExceptionHandler();  // built-in middleware
app.Run();
```

Behavior:

- `ValidationException` → 400 with detailed validation errors.
- Other exceptions → 500 with generic message.
- All exceptions logged centrally. [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-from-middleware-to-modern-handlers)

---

### 10. Architect’s Perspective

If I’m designing a large-scale system:

**Why I’d use global exception handling**

- To enforce **consistent error responses** across all APIs.
- To centralize **logging and monitoring** of unhandled exceptions.
- To keep controllers **clean** and focused on business logic. [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)
- To ensure **security** by not exposing internal details. [oneuptime](https://oneuptime.com/blog/post/2026-01-26-global-exception-handler-aspnet-core/view)

**When I’d avoid over-reliance**

- For **expected exceptions** (validation, business rules):
  - Handle locally or with specific exception handlers.
- When exceptions are used for **control flow**:
  - Better to validate upfront and avoid exceptions. [stackoverflow](https://stackoverflow.com/questions/10732644/best-practice-to-return-errors-in-asp-net-web-api)

**Important architectural considerations**

- **Layering**:
  - Local handling for expected errors.
  - Global handler as a safety net for unexpected errors.
- **Error format**:
  - Use RFC 7807 Problem Details for APIs.
  - Consistent structure helps clients parse errors. [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling-api?view=aspnetcore-10.0)
- **Logging**:
  - Integrate with Serilog, NLog, or Application Insights.
  - Include correlation IDs for distributed tracing. [c-sharpcorner](https://www.c-sharpcorner.com/article/global-exception-handling-in-asp-net-core-web-api/)

**Cloud angle (optional)**  
In cloud-native apps:

- Global exception handlers integrate with:
  - Distributed tracing (OpenTelemetry, App Insights).
  - Centralized logging (ELK, Splunk, CloudWatch).
- This makes error handling critical for **observability** in production.

---

### 11. Interview Answer (2-Minute Version)

Exception handling in ASP.NET Core can be done locally with try-catch, but for production systems, I prefer global exception handling to centralize error responses and logging. ASP.NET Core provides built-in middleware like `UseExceptionHandler`, and in .NET 8+, there’s `IExceptionHandler` for more granular, composable handling.

I typically implement a global exception handler that catches all unhandled exceptions, logs them with details, and returns a consistent error format like RFC 7807 Problem Details. For known exception types like validation errors, I use specific handlers that return 400 with detailed validation messages, and a catch-all handler for unexpected errors that returns 500 with a generic message.

This approach keeps controllers clean, enforces consistent error responses across the API, and ensures we don’t expose internal details to clients. I still handle expected exceptions locally when needed, but use global handling as a safety net for anything unhandled.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Clear distinction between:
  - **Local exception handling** (try-catch in controllers/services).
  - **Global exception handling** (middleware, `IExceptionHandler`). [learn.microsoft](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-10.0)
- Understanding of:
  - Built-in `UseExceptionHandler` middleware.
  - `IExceptionHandler` in .NET 8+ for composable handlers. [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)
- Real examples:
  - Problem Details format.
  - Different handlers for different exception types. [milanjovanovic](https://milanjovanovic.tech/blog/global-error-handling-in-aspnetcore-from-middleware-to-modern-handlers)

**Common red flags**

- Using exceptions for **control flow** (e.g., validation). [reddit](https://www.reddit.com/r/csharp/comments/1eh1fer/how_to_correctly_provide_custom_error_message_in/)
- No awareness of **Problem Details** (RFC 7807).
- Exposing **stack traces** in production.
- One-size-fits-all handler with no differentiation between exception types.

**Likely follow-ups (and how to steer them)**

- “How do you handle validation errors?”  
  → Explain:
  - Validate upfront when possible.
  - Use specific exception handlers or return validation results instead of throwing. [stackoverflow](https://stackoverflow.com/questions/10732644/best-practice-to-return-errors-in-asp-net-web-api)

- “What’s the difference between middleware and `IExceptionHandler`?”  
  → Middleware: single catch-all component.  
  `IExceptionHandler`: multiple composable handlers, each can handle specific exception types. [codewithmukesh](https://codewithmukesh.com/blog/global-exception-handling-in-aspnet-core/)

- “How do you ensure errors are logged properly?”  
  → Integrate with Serilog/NLog, include correlation IDs, and log exception details (stack trace, inner exceptions). [dev](https://dev.to/dotnetfullstackdev/centralized-exception-handling-in-aspnet-core-custom-middleware-j36)

---
