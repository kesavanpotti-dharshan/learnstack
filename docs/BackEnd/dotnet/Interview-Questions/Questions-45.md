# 45 .NET Web API Interview Questions That Actually Get Asked in 2026

I’ve conducted dozens of .NET interviews over the years, and I’ve been on the other side plenty of times too. Here’s what I’ve noticed: the questions that actually separate strong candidates from average ones aren’t “What is dependency injection?” or “Explain the difference between abstract and interface.” Those are textbook questions that anyone can memorize in 30 minutes.

The questions that matter are scenario-based. “Your API endpoint returns 200 products but SQL Profiler shows 201 queries. What happened?” That tells me if someone has actually built and debugged production APIs, or just watched tutorials.

In this article, I put together **45 practical .NET Web API interview questions** - the kind that get asked at product companies, not the generic stuff you find on every other blog. Every question includes how I’d answer it, what answer gets you rejected, and the follow-up question interviewers chain next. Whether you’re preparing for your next interview or you’re the one conducting interviews, this should save you hours. Let’s get into it.

> If you’re preparing because you’re **learning the stack from scratch** or filling specific gaps, every category here maps to a module in my FREE **.NET Web API Zero to Hero course**. When a question reveals a weak spot, that’s the chapter to start with - the full 12-module curriculum is free.

## What Makes These Interview Questions Different?

Most ”.NET interview questions” articles give you a definition and move on. “What is middleware? Middleware is software that sits between the request and response.” That’s useless in an actual interview. Nobody asks for definitions anymore. AI can generate those.

![Top ASP.NET Core interview questions covering middleware, EF Core, authentication, performance, and architecture](https://codewithmukesh.com/_astro/top-aspnet-core-interview-questions.D4OqtYk3_Z1OPxLP.webp "Top 20 ASP.NET Core interview questions")

What interviewers at product companies actually ask are **scenario-based questions** - questions where the answer reveals whether you’ve built real APIs or just read about building them. Every question in this article follows this format:

- **The question** - a real scenario, not a textbook definition
- **Great answer** - how I’d answer it, with code examples and trade-off analysis
- **Red flag answer** - what gets you rejected (and why)
- **Follow-up** - the question the interviewer chains next

The 45 questions are organized into 9 categories covering the full stack of .NET Web API development. Jump straight to the one you want to sharpen:

Jump to a Topic 45 questions · 9 topics

[01 API Design and REST Best Practices 6 questions](#api-design-and-rest-best-practices) [02 ASP.NET Core Internals and Middleware 6 questions](#aspnet-core-internals-and-middleware) [03 Entity Framework Core and Data Access 6 questions](#entity-framework-core-and-data-access) [04 Authentication and Security 5 questions](#authentication-and-security) [05 Performance and Caching 5 questions](#performance-and-caching) [06 Architecture and System Design 4 questions](#architecture-and-system-design) [07 Testing 3 questions](#testing) [08 Production Readiness 4 questions](#production-readiness) [09 Modern .NET and C# Features 6 questions](#modern-net-and-c-features)

> **Want all 100 questions?** I also compiled a free [100-question PDF](https://codewithmukesh.com/resources/dotnet-webapi-interview-questions/) with 55 additional senior-level questions, “What the interviewer is looking for” notes, and per-category cheat sheets.

[

Read next Companion article

## RESTful API Best Practices for .NET Developers

Before diving into interview questions, make sure you know the REST fundamentals. This guide covers resource naming, HTTP methods, status codes, versioning, and pagination.

](https://codewithmukesh.com/blog/restful-api-best-practices-for-dotnet-developers/)

---

Before you read the answers, it is worth finding out which ones you already have. Sit the questions first and the gaps show up in two minutes instead of in the interview:

[

Practice Free interactive tool

## Rehearse these out loud in the free mock interview

Reading the answers below is one thing; recalling them under interview pressure is another. Take a free, auto-scored mock interview built from this exact Web API question bank (plus EF Core and LINQ), pick Junior, Mid, or Senior, and get an instant score with a per-topic breakdown. No signup to start.

](https://codewithmukesh.com/dotnet-mock-interview/)

## API Design and REST Best Practices

These questions test whether you think about API design intentionally or just copy patterns from tutorials.

**Difficulty: Senior**

I’d default to offset-based pagination for simple use cases - `?page=1&pageSize=20`. The response includes metadata so the client isn’t guessing:

```

{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalCount": 487,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

But here’s the thing - `totalCount` requires a `COUNT(*)` query which gets expensive on large tables. I’ve seen APIs slow down just because of that count. For high-volume endpoints, I’d switch to **cursor-based pagination** (keyset pagination) using the last item’s ID: `?cursor=abc123&pageSize=20`. It’s faster because it uses an index seek instead of offset skip.

I’d also set a max page size (say 50) server-side so a client can’t request `pageSize=10000` and kill the database. The [ASP.NET Core docs on pagination](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger) cover the basics, but cursor-based pagination is what separates production APIs from tutorial projects.

**Red flag answer:** “I’d just use `.Skip()` and `.Take()` in EF Core.” - Shows no awareness of performance implications or response design.

**Follow-up:** “What happens to offset pagination when a record is deleted between page requests?”

[

Read next Companion article

## Pagination, Sorting & Searching in ASP.NET Core

I wrote a deep dive on implementing offset and keyset pagination with EF Core, including performance benchmarks. This is the article I'd read before answering this question.

](https://codewithmukesh.com/blog/pagination-sorting-searching-aspnet-core-webapi/)

### Q2. Your POST Endpoint Creates a Resource but Also Triggers an Async Background Job. What Status Code Do You Return?

**Difficulty: Mid**

It depends on what the client cares about. If the resource itself is created synchronously and the email is just a side effect, I’d return `201 Created` with a `Location` header pointing to the new resource. The email is fire-and-forget.

But if the entire operation is async - say the resource creation itself is queued - then `202 Accepted` is correct. It means “I got your request, I’ll process it later.” I’d include a status endpoint URL so the client can poll: `Location: /api/orders/123/status`.

The worst thing you can do is return `200 OK` for a creation endpoint. It tells the client nothing.

**Red flag answer:** “200 OK, because it worked.”

[

Read next Companion article

## Understanding HTTP Status Codes in ASP.NET Core

When to use 200, 201, 204, 400, 401, 403, 404, 409, 422, and 500 with real code examples. This is the reference you want before an interview.

](https://codewithmukesh.com/blog/http-status-codes-aspnet-core-api-responses/)

### Q3. A Client Sends a PATCH Request to Update Only the Email Field. How Do You Implement Partial Updates?

**Difficulty: Senior**

There are a few approaches, and I’ve used different ones depending on the situation:

**Option 1 - JsonPatchDocument:** The client sends JSON Patch operations. It works but the client-side experience is awkward.

**Option 2 - Nullable DTOs with a “fields sent” tracker:** I check `HttpContext.Request` to see which fields were actually in the JSON body. This way `null` means “clear this field” and “missing” means “don’t touch it.”

**Option 3 - Just use PUT with full replacement.** Honestly, for most internal APIs, this is fine. PATCH adds complexity, and if your entities are small, just send the whole thing.

My take: unless you have a strong reason for PATCH (large entities, bandwidth constraints, mobile clients), a well-designed PUT is simpler and less error-prone.

**Red flag answer:** “I’d just use a regular DTO and check for nulls.” - Doesn’t understand the null vs missing distinction.

### Q4. What’s the Difference Between Query String Parameters and Route Parameters?

**Difficulty: Junior**

Route parameters identify a specific resource: `/api/products/42`. They’re required - the endpoint doesn’t make sense without them.

Query string parameters are for optional modifiers: `/api/products?category=electronics&sort=price`. They filter, sort, page, or modify the response but the endpoint still works without them.

My rule of thumb: if removing the parameter makes the URL meaningless, it’s a route parameter. If removing it just gives you the default behavior, it’s a query parameter.

A common mistake I see: `/api/products?id=42`. That `id` should be in the route, not the query string.

**Red flag answer:** “They’re the same thing, just different syntax.”

### Q5. Your API Endpoint Accepts JSON but You Want to Enforce a Max Request Size of 1MB. How?

**Difficulty: Senior**

In ASP.NET Core, Kestrel has a default max request body size of ~28.6 MB. That’s way too high for most APIs. I’d configure it at multiple levels:

```

// Global limit
builder.WebHost.ConfigureKestrel(options =>
    options.Limits.MaxRequestBodySize = 1_048_576); // 1MB
// Per-endpoint override (for file uploads)
app.MapPost("/api/uploads", handler)
   .WithMetadata(new RequestSizeLimitAttribute(10_485_760)); // 10MB
```

When exceeded, Kestrel returns `413 Payload Too Large` automatically. But I’d also add middleware to return a proper `ProblemDetails` response instead of the raw 413.

> **PRO TIP**: Don’t forget your reverse proxy. If you’re behind Nginx or Azure App Gateway, you need to configure the limit there too. I’ve seen cases where Kestrel’s limit was correct but Nginx had a 100MB default and happily forwarded massive payloads.

**Red flag answer:** “I didn’t know there was a limit.”

### Q6. What’s the Difference Between `[FromBody]`, `[FromQuery]`, `[FromRoute]`, and `[FromHeader]`?

**Difficulty: Junior**

These attributes tell ASP.NET Core where to look for a parameter value:

- `[FromRoute]` - URL path segments: `/api/products/{id}`
- `[FromQuery]` - Query string: `?search=phone`
- `[FromBody]` - Request body (JSON usually)
- `[FromHeader]` - HTTP headers: `X-Correlation-Id`

For controllers, ASP.NET Core infers the source: simple types come from route/query, complex types from body. But this inference can go wrong. If you have a complex type as a query parameter (like a filter DTO), you need `[FromQuery]` explicitly.

The real gotcha: you can only have **one** `[FromBody]` parameter per endpoint. If you need multiple body values, wrap them in a single DTO.

**Red flag answer:** “I never use those attributes, it just works automatically.” - Works until it doesn’t.

---

## ASP.NET Core Internals and Middleware

These questions reveal whether someone actually understands the framework or just follows patterns blindly. Middleware order alone trips up a surprising number of candidates.

[

Read next Companion article

## Middlewares in ASP.NET Core - The Complete Guide

I covered middleware execution order, custom middleware, IMiddleware, and the middleware vs filters decision matrix in this article. Worth reviewing before an interview.

](https://codewithmukesh.com/blog/middlewares-in-aspnet-core/)

### Q7. You Need Request Logging, Auth, Rate Limiting, CORS, and Exception Handling. What Order?

**Difficulty: Mid**

Order matters because middleware runs top-to-bottom on the request, bottom-to-top on the response:

```

app.UseExceptionHandler();    // 1. Catch everything - must be first
app.UseHsts();                // 2. Security headers
app.UseCors();                // 3. CORS - before auth so preflight doesn't get 401
app.UseRateLimiter();         // 4. Rate limiting - before auth to block brute force
app.UseAuthentication();      // 5. Who are you?
app.UseAuthorization();       // 6. Are you allowed?
// Request logging here       // 7. Log after auth so you have user identity
app.MapControllers();         // 8. Endpoints
```

**What breaks with wrong order:**

- CORS after auth: preflight `OPTIONS` requests get `401 Unauthorized`
- Exception handler not first: unhandled exceptions crash with no `ProblemDetails`
- Rate limiter after auth: brute force attackers still hit your auth middleware

I’ve seen a production bug where CORS was registered after authentication. The API worked fine in Postman but failed in the browser. Took hours to debug because the error message was misleading.

**Red flag answer:** “I just put them in whatever order and it works.” - Works in dev, fails in production.

### Q8. You Have a Scoped Service Injected into a Singleton. What Happens?

**Difficulty: Senior**

This is the **captive dependency problem** ([documented by Microsoft](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines#scoped-service-as-singleton)). The scoped service gets captured by the singleton and lives forever. It never gets disposed when the scope ends. If that scoped service holds a database connection (like `DbContext`), you now have a connection shared across all requests. You’ll get threading issues, stale data, and eventually connection pool exhaustion.

**Detection:** Add `ValidateScopes` and `ValidateOnBuild` in development:

```

builder.Host.UseDefaultServiceProvider(options =>
{
    options.ValidateScopes = true;
    options.ValidateOnBuild = true;
});
```

**The fix:** If a singleton needs data from a scoped service, inject `IServiceScopeFactory` and create a scope manually:

```

public class MySingleton(IServiceScopeFactory scopeFactory)
{
    public async Task DoWork()
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    }
}
```

**Red flag answer:** “I’d just register everything as singleton to avoid the issue.” - Makes it worse.

[

Read next Companion article

## Dependency Injection in ASP.NET Core Explained

DI fundamentals, service lifetimes, and real-world patterns. This is the foundation for understanding the captive dependency problem.

](https://codewithmukesh.com/blog/dependency-injection-in-aspnet-core-explained/)

### Q9. What’s the Difference Between Middleware and Endpoint Filters?

**Difficulty: Mid**

**Middleware** runs on every request and has access to the raw HTTP pipeline. It sees requests before routing happens. Use it for cross-cutting concerns like logging, CORS, and exception handling.

**Endpoint filters** run only on matched endpoints and have access to the endpoint’s typed parameters and return type:

```

// Middleware - runs on ALL requests
app.Use(async (context, next) => { /* raw HttpContext */ });
// Endpoint filter - runs only on this endpoint, has typed access
app.MapGet("/api/products", GetProducts)
   .AddEndpointFilter(async (context, next) =>
   {
       var id = context.GetArgument<int>(0);
       if (id <= 0) return Results.BadRequest("Invalid ID");
       return await next(context);
   });
```

My rule: if it needs to run on every request or before routing, use middleware. If it’s specific to certain endpoints and needs parameter access, use filters.

**Red flag answer:** “They’re the same thing.”

[

Read next Companion article

## Filters in ASP.NET Core - The Complete Guide

All 6 filter types (authorization, resource, action, exception, result, endpoint) with a decision matrix for choosing between middleware and filters.

](https://codewithmukesh.com/blog/filters-in-aspnet-core/)

### Q10. What Happens When You Call `AddScoped` Twice with Different Implementations?

**Difficulty: Mid**

The second registration wins. When you inject `IProductService`, you get the last registered implementation. But the first registration isn’t removed - both are in the container.

If you inject `IEnumerable<IProductService>`, you get both implementations. This is actually useful for the decorator pattern.

To guarantee only one registration, use `TryAddScoped`:

```

builder.Services.TryAddScoped<IProductService, ProductService>();
```

This is how library authors prevent overriding user registrations.

**Red flag answer:** “It throws an error.” - It doesn’t, which is why it’s a subtle source of bugs.

### Q11. How Would You Implement Rate Limiting in a .NET API?

**Difficulty: Mid**

.NET has [built-in rate limiting](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit) since .NET 7:

```

builder.Services.AddRateLimiter(options =>
{
    options.AddSlidingWindowLimiter("api", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 6;
        opt.PermitLimit = 100;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});
app.UseRateLimiter();
app.MapGet("/api/products", GetProducts).RequireRateLimiting("api");
```

**Algorithm choice depends on the use case:**

- **Fixed window** - simple, good for most APIs. Weakness: burst at window boundaries
- **Sliding window** - smooths out boundary bursts. My default for production
- **Token bucket** - allows controlled bursts. Good for search endpoints
- **Concurrency limiter** - limits simultaneous requests. Good for expensive endpoints

**Red flag answer:** “I’d build my own rate limiter with a dictionary.” - Don’t reinvent thread-safe infrastructure.

### Q12. How Does the Request Pipeline Differ Behind a Reverse Proxy?

**Difficulty: Senior**

Behind a reverse proxy, the client’s real IP, scheme (HTTP/HTTPS), and host are lost. Without configuring forwarded headers, your API thinks every request comes from the proxy’s IP, and `HttpContext.Request.Scheme` is always `http`. This breaks IP-based rate limiting, causes HTTPS redirect loops, and corrupts logging.

```

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor
                             | ForwardedHeaders.XForwardedProto;
    options.KnownProxies.Add(IPAddress.Parse("10.0.0.1"));
});
app.UseForwardedHeaders(); // Must be before UseAuthentication
```

**Red flag answer:** “I just deploy Kestrel directly in production.” - Kestrel shouldn’t be directly exposed to the internet.

---

## Entity Framework Core and Data Access

If you’re building .NET Web APIs, EF Core questions are guaranteed. These test whether you can write performant data access or just `.ToListAsync()` everything.

[

Read next Companion article

## ASP.NET Core Web API CRUD with EF Core

The foundation for every EF Core question below. Setting up DbContext, entities, migrations, and building a complete CRUD API with .NET 10.

](https://codewithmukesh.com/blog/aspnet-core-webapi-crud-with-entity-framework-core-full-course/)

### Q13. Your API Returns 200 Products but SQL Profiler Shows 201 Queries. What Happened?

**Difficulty: Senior**

That’s the **N+1 query problem**. One query fetches 200 products, then EF Core lazily loads a navigation property (like `Category`) for each product individually - 200 extra queries.

**Fixes, in order of preference:**

```

// 1. Eager loading
var products = await db.Products
    .Include(p => p.Category)
    .ToListAsync(); // 1 query with JOIN
// 2. Projection (best performance - only loads what you need)
var products = await db.Products
    .Select(p => new ProductDto
    {
        Name = p.Name,
        CategoryName = p.Category.Name
    })
    .ToListAsync(); // 1 query, minimal data
// 3. Split query (when Include causes cartesian explosion)
var products = await db.Products
    .Include(p => p.Category)
    .Include(p => p.Tags)
    .AsSplitQuery()
    .ToListAsync();
```

I always enable EF Core query logging in development to catch these early.

**Red flag answer:** “I’d disable lazy loading.” - That masks the problem, doesn’t fix it.

### Q14. How Do You Run EF Core Migrations in Production CI/CD?

**Difficulty: Mid**

**Never apply migrations at app startup in production.** If you have multiple instances, they’ll all try to run the migration simultaneously. You’ll get lock contention, timeouts, or duplicate attempts.

My approach:

1.  Generate an idempotent SQL script: `dotnet ef migrations script --idempotent -o migration.sql`
2.  Review the SQL - never blindly apply generated migrations
3.  Apply via CI/CD pipeline as a dedicated step before deployment
4.  Never modify a migration after it’s been applied to any environment

**Red flag answer:** “I call `db.Database.Migrate()` in `Program.cs`.” - Dangerous in multi-instance deployments.

### Q15. Two Users Submit Conflicting Price Updates Simultaneously. How Do You Handle This?

**Difficulty: Senior**

Optimistic concurrency control with a row version token:

```

public class Product
{
    public int Id { get; set; }
    public decimal Price { get; set; }
    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
}
```

EF Core includes `RowVersion` in the `WHERE` clause. If another user changed the row, it throws `DbUpdateConcurrencyException`, and I return `409 Conflict` with a `ProblemDetails` response telling the client to refresh and retry.

**Red flag answer:** “Last write wins.” - That’s data loss.

**Follow-up:** “How does the client know what the current RowVersion is? How do you pass it through the API?”

### Q16. What’s the Difference Between `AsNoTracking()` and Default Tracking?

**Difficulty: Mid**

By default, EF Core tracks every entity it queries, keeping snapshots for change detection on `SaveChangesAsync()`. This has a memory and CPU cost.

Use `AsNoTracking()` for read-only queries (GET endpoints). For read-heavy APIs, I configure `NoTracking` as the default and opt-in to tracking only for write operations:

```

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));
```

**Red flag answer:** “I always use `AsNoTracking()` because it’s faster.” - Then how do you update entities?

### Q17. Your EF Core Query Works with 100 Records but Times Out with 100,000. How Do You Fix It?

**Difficulty: Senior**

Systematic approach: first see the generated SQL with `query.ToQueryString()`, then run it in SSMS/pgAdmin with an execution plan.

**Common fixes:**

- **Missing index:** `builder.HasIndex(p => p.Price);`
- **Loading too much data:** Use `.Select()` projection instead of full entities
- **Cartesian explosion:** `.AsSplitQuery()` when multiple `.Include()` calls create massive JOINs
- **No pagination:** Returning all 100K records? Add pagination.
- **Compiled queries** for hot paths: `EF.CompileAsyncQuery()`

**Red flag answer:** “I’d increase the command timeout.” - That hides the problem.

### Q18. Bulk Update: Set `IsActive = false` for All Products in a Category. Most Efficient Way?

**Difficulty: Mid**

Since EF Core 7, use [`ExecuteUpdateAsync`](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete) - a single SQL statement with no entities loaded:

```

await db.Products
    .Where(p => p.CategoryId == 5)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, false));
```

This generates `UPDATE Products SET IsActive = 0 WHERE CategoryId = 5`. No change tracking overhead.

> **Important caveat**: `ExecuteUpdateAsync` and `ExecuteDeleteAsync` bypass the change tracker. `SaveChanges` interceptors and events won’t fire. If you need audit logging on bulk updates, you’ll need to handle it separately.

**Red flag answer:** “I’d load all entities and update them in a loop.”

[

Read next Companion article

## Soft Deletes in EF Core 10

If bulk deletes came up, interviewers often follow up with soft deletes. This article covers SaveChangesInterceptor, named query filters, and cascade soft delete.

](https://codewithmukesh.com/blog/soft-deletes-efcore/)

---

## Authentication and Security

Security questions reveal whether someone builds APIs that are safe for production. Getting these wrong in an interview is a much bigger red flag than getting an EF Core question wrong.

[

Read next Companion article

## JWT Authentication in ASP.NET Core

Complete JWT implementation with user registration, token generation, and role management. The foundation for most auth interview questions.

](https://codewithmukesh.com/blog/jwt-authentication-in-aspnet-core/)

### Q19. Your JWT Is Valid for 15 Minutes. A User’s Role Changes. The Old Token Still Has the Admin Claim. Now What?

**Difficulty: Senior**

This is the fundamental JWT trade-off: JWTs are self-contained and can’t be revoked once issued. My approach:

1.  **Short-lived access tokens (5-15 min) + refresh tokens.** On refresh, check the database for current roles.
2.  **Re-validate on sensitive operations.** For destructive endpoints, check the database instead of trusting the JWT:

```

app.MapDelete("/api/admin/users/{id}", async (
    int id, ClaimsPrincipal user, UserService users) =>
{
    var currentRoles = await users.GetRolesAsync(user.GetUserId());
    if (!currentRoles.Contains("Admin"))
        return Results.Forbid();
    // proceed
});
```

3.  **Token blocklist in Redis** (last resort). Defeats JWT’s stateless purpose but sometimes needed for compliance.

**Red flag answer:** “JWT tokens can’t be revoked, so there’s nothing you can do.” - True in theory, dangerous in practice.

### Q20. You’re Building an API Called from a React SPA on a Different Domain. What CORS Configuration?

**Difficulty: Mid**

```

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy.WithOrigins("https://app.example.com") // Specific origin, NOT "*"
              .WithMethods("GET", "POST", "PUT", "DELETE")
              .WithHeaders("Content-Type", "Authorization")
              .AllowCredentials();
    });
});
app.UseCors("frontend"); // Before auth middleware!
```

**Critical rules:**

- Never `AllowAnyOrigin()` with `AllowCredentials()` - browser blocks this for good reason
- Never `AllowAnyOrigin()` in production unless it’s a truly public API
- Always test CORS from the actual browser, not Postman (Postman doesn’t enforce CORS)

**Red flag answer:** “I just use `AllowAnyOrigin` and `AllowAnyMethod`.” - Open security hole.

### Q21. How Do You Securely Store Connection Strings Across Environments?

**Difficulty: Senior**

Layer by environment:

- **Development:** `dotnet user-secrets set "Database:ConnectionString" "Server=localhost;..."`
- **Production:** Azure Key Vault, AWS Secrets Manager, or Kubernetes secrets
- **Never** commit secrets to `appsettings.json`, even `appsettings.Development.json`
- **Never** log secrets

My production setup: Azure Key Vault for secrets, environment variables for non-sensitive config, `appsettings.{Environment}.json` for settings that aren’t secrets.

**Red flag answer:** “I put them in `appsettings.json` and add it to `.gitignore`.” - Someone will commit it eventually.

[

Read next Companion article

## Options Pattern in ASP.NET Core - The Complete Guide

IOptions vs IOptionsSnapshot vs IOptionsMonitor, configuration binding, and validation. Interviewers love asking about the three Options interfaces.

](https://codewithmukesh.com/blog/options-pattern-in-aspnet-core/)

**Difficulty: Junior**

**Authentication** = “Who are you?” - proving identity. **Authorization** = “What are you allowed to do?” - checking permissions.

```

POST /api/login { email, password }
-> Server verifies credentials (AUTHENTICATION)
-> Returns JWT with claims: { userId: 42, role: "Editor" }
GET /api/admin/users (with JWT token)
-> Server validates token (AUTHENTICATION OK)
-> Server checks: does "Editor" have access? (AUTHORIZATION FAIL)
-> Returns 403 Forbidden
```

**Status codes tell you which failed:**

- `401 Unauthorized` - actually means unauthenticated (bad or missing token)
- `403 Forbidden` - authenticated but not authorized (valid token, wrong permissions)

Yes, the HTTP status code names are misleading. `401` should really be called “Unauthenticated.”

**Red flag answer:** “They’re the same thing.”

### Q23. How Do You Prevent Mass Assignment (Over-Posting) Attacks?

**Difficulty: Senior**

Mass assignment happens when you bind request data directly to your entity model. A client could send `{"name": "test", "isAdmin": true}` and promote themselves.

**Prevention: always use DTOs:**

```

// DANGEROUS - binding directly to entity
app.MapPost("/api/users", async (User user, AppDbContext db) => { ... });
// SAFE - binding to a DTO with only allowed fields
public record CreateUserRequest(string Name, string Email);
app.MapPost("/api/users", async (CreateUserRequest request, AppDbContext db) =>
{
    var user = new User
    {
        Name = request.Name,
        Email = request.Email,
        IsAdmin = false // Explicitly set, never from client
    };
});
```

**Red flag answer:** “I use `[Bind]` attribute to exclude fields.” - Fragile, easy to forget a field.

---

[

Free resource Companion download

## .NET Interview Questions

300+ real .NET interview questions with answers, red flags, and follow-ups - C#, EF Core, ASP.NET Core, system design

](https://codewithmukesh.com/blog/dotnet-interview-questions/)

## Performance and Caching

Performance questions separate devs who build fast APIs from devs who build APIs that happen to be fast on localhost with one user.

### Q24. Your API Endpoint Takes 800ms. How Do You Diagnose and Fix It?

**Difficulty: Senior**

Find the bottleneck before optimizing. Add timing middleware or OpenTelemetry, then check:

| Suspect            | How to Check                  | Fix                                   |
| ------------------ | ----------------------------- | ------------------------------------- |
| Database queries   | EF Core logging, SQL Profiler | Add indexes, projection, fix N+1      |
| External API calls | HttpClient logging            | Cache, parallelize with Task.WhenAll  |
| Serialization      | Large response payloads       | Paginate, project, compress           |
| Auth middleware    | Token validation hitting DB   | Cache validation, use asymmetric keys |

**Real example:** I once traced an 800ms endpoint to two sequential HTTP calls (300ms each) plus a database query (200ms). Made the HTTP calls parallel with `Task.WhenAll` - dropped to 500ms. Added response caching - dropped to 50ms for repeated requests.

**Red flag answer:** “I’d add caching.” - Caching what? You haven’t found the bottleneck yet.

### Q25. What’s the Difference Between Output Caching, Response Caching, and HybridCache?

**Difficulty: Mid**

| Feature          | Where It Caches               | Best For                                           |
| ---------------- | ----------------------------- | -------------------------------------------------- |
| Response Caching | Client/CDN (HTTP headers)     | Static content, public endpoints                   |
| Output Caching   | Server (in-memory)            | Server-side caching with tag-based invalidation    |
| HybridCache      | Server (memory + distributed) | Application-level caching with stampede protection |

**Output Caching** supports tag-based invalidation - when a product is created, evict the cache by tag:

```

app.MapGet("/api/products", GetProducts).CacheOutput("products");
app.MapPost("/api/products", async (IOutputCacheStore cache) =>
{
    // Create product...
    await cache.EvictByTagAsync("products", default);
});
```

**HybridCache** (.NET 9+) prevents cache stampede - when 1000 concurrent requests ask for the same uncached value, only one query runs:

```

var product = await cache.GetOrCreateAsync($"product-{id}",
    async ct => await db.Products.FindAsync(id, ct),
    new HybridCacheEntryOptions { Expiration = TimeSpan.FromMinutes(10) });
```

**Red flag answer:** “I use `IMemoryCache` for everything.” - No distributed support, no stampede protection.

[

Read next Companion article

## Distributed Caching in ASP.NET Core with Redis

When interviewers ask about caching, they often follow up with distributed scenarios. This covers Redis, multi-instance consistency, and scalability.

](https://codewithmukesh.com/blog/distributed-caching-in-aspnet-core-with-redis/)

### Q26. Three Independent Async Operations, Each 200ms. How Do You Optimize?

**Difficulty: Senior**

Run them in parallel with `Task.WhenAll`:

```

var profileTask = userService.GetProfileAsync(id);
var ordersTask = orderService.GetRecentOrdersAsync(id);
var recsTask = recommendationService.GetAsync(id);
await Task.WhenAll(profileTask, ordersTask, recsTask);
return Results.Ok(new DashboardResponse
{
    Profile = profileTask.Result,
    RecentOrders = ordersTask.Result,
    Recommendations = recsTask.Result
});
```

This takes ~200ms instead of ~600ms. But don’t overdo it: parallel database queries on the same `DbContext` don’t work because `DbContext` is not thread-safe. You’d need separate scopes.

**Red flag answer:** “I’d just await them one by one.” - 3x slower for no reason.

### Q27. What Common Async/Await Mistakes Hurt API Performance?

**Difficulty: Mid**

1.  **Unnecessary wrapping:** `async Task<Product> Get(int id) => await db.Products.FindAsync(id);` - adds state machine overhead. Just return the task.
2.  **`Task.Result` or `.Wait()`** causing deadlocks
3.  **Fire-and-forget without error handling:** `_ = SendEmailAsync(user);` - exception silently swallowed. Use a background service or message queue.
4.  **Sequential awaits** when tasks are independent
5.  **`async void`** - never use in APIs. Exceptions crash the process.

**Red flag answer:** “I don’t use async, it’s complicated.”

### Q28. What Does `async`/`await` Actually Do?

**Difficulty: Junior**

`async`/`await` frees up the thread while waiting for I/O (database queries, HTTP calls). The thread goes back to the pool and handles other requests.

A web server has ~100 threads. If every request blocks a thread for 200ms, you handle ~500 requests/second. With async, those threads handle other requests during the wait - potentially 10,000+ requests/second with the same thread pool.

**Key distinction:** `async` doesn’t make code faster. A single request still takes 200ms. But it makes the server handle MORE concurrent requests.

**Red flag answer:** “Async makes code run faster.” - It improves throughput, not latency.

---

## Architecture and System Design

Architecture questions test whether you can make informed trade-offs, not just recite pattern names from a blog post.

### Q29. Should You Use the Repository Pattern with EF Core?

**Difficulty: Senior**

My take: **you probably don’t need a generic repository over EF Core.** `DbContext` already IS a repository + unit of work. Adding `IRepository<T>` on top often just mirrors `DbSet<T>`.

**When I would use a repository:** complex query logic I want to unit test without a database, DDD aggregate root repositories, or (unlikely) when EF Core might be swapped out.

**What I use instead:** focused query services:

```

public class ProductQueries(AppDbContext db)
{
    public Task<ProductDto?> GetWithReviewsAsync(int id) => db.Products
        .Where(p => p.Id == id)
        .Select(p => new ProductDto { /* projection */ })
        .FirstOrDefaultAsync();
}
```

Testable (mock `ProductQueries`), no generic repository ceremony.

**Red flag answer:** Either extreme without nuance.

[

Read next Companion article

## Repository Pattern in ASP.NET Core

I wrote this guide years ago and my opinion has evolved. This covers the pattern in depth, but I'd recommend reading it alongside the CQRS article below.

](https://codewithmukesh.com/blog/repository-pattern-in-aspnet-core/)

### Q30. Explain CQRS. When Is It Overkill?

**Difficulty: Senior**

CQRS means using different models for reading and writing data. At its simplest: separate handler classes for commands and queries. You don’t need MediatR or separate databases.

**Essential when:** 100:1 read/write ratio, complex domain model with simple read model, different data stores for reads vs writes, or event sourcing.

**Overkill when:** simple CRUD APIs, small teams, read and write models are nearly identical.

My approach: start without CQRS. When read queries fight with the domain model (adding properties just for display, complex projections), that’s the signal to split.

**Red flag answer:** “CQRS requires event sourcing and separate databases.” - That’s the advanced form. Simple CQRS is just separate read/write models.

[

Read next Companion article

## CQRS and MediatR in ASP.NET Core

Full CQRS implementation with MediatR, pipeline behaviors, and when to use (or skip) the mediator pattern.

](https://codewithmukesh.com/blog/cqrs-and-mediatr-in-aspnet-core/)

### Q31. What’s Vertical Slice Architecture vs Clean Architecture?

**Difficulty: Mid**

**Clean Architecture** organizes by technical layer (Domain, Application, Infrastructure, API). Every feature touches all four projects.

**Vertical Slice Architecture** organizes by feature. Each file is self-contained: endpoint, handler, validation, and DTO for one operation.

| Aspect      | Clean Architecture           | Vertical Slice                   |
| ----------- | ---------------------------- | -------------------------------- |
| New feature | Touch 4+ projects            | Touch 1 file                     |
| Coupling    | Low between layers           | Low between features             |
| Best for    | Complex domains, large teams | API-focused, feature-driven work |

My preference: Vertical Slice for Web APIs. Clean Architecture when the domain is genuinely complex. Most CRUD APIs don’t need Clean Architecture.

**Red flag answer:** “Clean Architecture is always better because it separates concerns.” - Separation by layer isn’t always the right separation.

### Q32. How Do You Decide Between a Monolith and Microservices?

**Difficulty: Mid**

**Start with a monolith. Almost always.**

Monolith when: team under 10 developers, domain isn’t well understood, speed matters, no DevOps maturity.

Microservices when: independent teams need independent deployment, very different scaling needs, different tech stacks required.

**The middle ground I recommend:** a modular monolith. Organize code by bounded contexts with clear interfaces. Each module has its own `DbContext`. If you need to extract a microservice later, the boundaries are already clean.

I’ve seen more projects fail from premature microservices than from staying monolithic too long. The operational complexity is massive: distributed transactions, eventual consistency, network failures, deployment orchestration.

**Red flag answer:** “Always microservices because they scale better.” - Netflix needed microservices. Your CRUD API probably doesn’t.

---

## Testing

Testing questions reveal whether someone writes tests that catch real bugs or just tests that make coverage numbers look good.

### Q33. How Do You Write Integration Tests for an API with a Database and External Services?

**Difficulty: Senior**

`WebApplicationFactory` + Testcontainers + WireMock:

```

public class ApiFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder().Build();
    private readonly WireMockServer _pricingApi = WireMockServer.Start();
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.AddDbContext<AppDbContext>(o =>
                o.UseNpgsql(_postgres.GetConnectionString()));
            services.Configure<PricingApiOptions>(o =>
                o.BaseUrl = _pricingApi.Url!);
        });
    }
}
```

Real database (Testcontainers) catches migration and query issues that SQLite/InMemory miss. WireMock gives deterministic external API responses. Tests run in CI without external dependencies.

**Red flag answer:** “I mock the database with InMemory provider.” - InMemory doesn’t support transactions, constraints, or SQL-specific features.

### Q34. What Should You Test with Unit Tests vs Integration Tests?

**Difficulty: Mid**

- Test Type: Unit tests
  - What to Test: Business logic, domain rules, validators
  - What NOT to Test: EF Core queries, endpoint wiring
- Test Type: Integration tests
  - What to Test: Full request-to-response flow, database queries, auth pipeline
  - What NOT to Test: External services (use WireMock)

**My distribution:** 70% integration tests, 20% unit tests, 10% architecture tests.

I don’t unit test EF Core queries. They generate SQL. Unit testing LINQ that doesn’t translate to SQL is testing the wrong thing.

**Red flag answer:** “I unit test everything with the InMemory provider.” - False confidence. InMemory behaves differently than real databases.

### Q35. How Do You Test an Endpoint That Requires Authentication?

**Difficulty: Senior**

Create a test authentication handler that bypasses JWT validation but still sets up claims:

```

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
            new Claim(ClaimTypes.Role, "Admin"),
        };
        var identity = new ClaimsIdentity(claims, "Test");
        return Task.FromResult(AuthenticateResult.Success(
            new AuthenticationTicket(new ClaimsPrincipal(identity), "Test")));
    }
}
```

> **PRO TIP**: Always include tests that verify auth IS enforced. Test that unauthenticated requests return `401` and unauthorized requests return `403`. If you only test the happy path with a test auth handler, you’ll never know if someone accidentally removed `[Authorize]`.

**Red flag answer:** “I remove `[Authorize]` in test environment.” - Then you’re not testing authorization at all.

---

## Production Readiness

These questions test whether someone can operate what they build. Writing code that compiles is table stakes. Keeping it running at 3 AM is the real test.

### Q36. How Do You Implement Structured Logging?

**Difficulty: Senior**

String-based logging is unsearchable. Structured logging stores properties you can query:

```

// BAD - string interpolation, unsearchable
logger.LogInformation($"Order {orderId} created by user {userId}");
// GOOD - message template, each value becomes a queryable property
logger.LogInformation("Order {OrderId} created by {UserId} for {Amount}",
    orderId, userId, amount);
// Stored as: { "OrderId": 42, "UserId": "john", "Amount": 99.99 }
// Now you can query: WHERE UserId = 'john' AND Amount > 50
```

My Serilog setup:

```

builder.Host.UseSerilog((context, config) => config
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.WithProperty("Application", "ProductApi")
    .Enrich.WithCorrelationId()
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5341"));
app.UseSerilogRequestLogging(); // One log per request instead of dozens
```

**Red flag answer:** “I use `Console.WriteLine` for debugging.”

[

Read next Companion article

## Structured Logging with Serilog in ASP.NET Core

Full Serilog setup with sinks, enrichers, OpenTelemetry integration, and correlation IDs. The reference for production logging.

](https://codewithmukesh.com/blog/structured-logging-with-serilog-in-aspnet-core/)

### Q37. How Do You Implement Health Checks?

**Difficulty: Mid**

```

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database")
    .AddRedis(redisConnectionString, "redis");
// Separate liveness vs readiness
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false // Just checks if the app is running
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
```

**Liveness** = “Is the process alive?” If it fails, Kubernetes restarts the pod. **Readiness** = “Can it handle requests?” If it fails, the load balancer stops sending traffic.

**Red flag answer:** “I just check if the app returns 200 on any endpoint.”

### Q38. How Do You Containerize a .NET API?

**Difficulty: Mid**

Multi-stage Dockerfile:

```

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled AS runtime
WORKDIR /app
COPY --from=build /app/publish .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

**Key decisions:** SDK image is ~700MB, chiseled runtime is ~30MB. Non-root user. Layer caching (restore before copy). Port 8080 is the .NET 8+ default in containers.

**Red flag answer:** “I copy the entire solution and run `dotnet run`.”

[

Read next Companion article

## Docker Guide for .NET Developers

Docker fundamentals, multi-stage builds, volumes, networking, and production optimization. Start here if Docker is a weak spot.

](https://codewithmukesh.com/blog/docker-guide-for-dotnet-developers/)

### Q39. How Do You Monitor Your API in Production?

**Difficulty: Senior**

Three pillars: **Logs, Metrics, Traces.** Using OpenTelemetry:

```

builder.Services.AddOpenTelemetry()
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter())
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddEntityFrameworkCoreInstrumentation()
        .AddOtlpExporter());
```

**Alerts I set up on day one:**

- Error rate spike (5xx > 1%) -> PagerDuty
- P95 latency above SLA -> Slack warning
- Health check failure -> PagerDuty
- Memory trending upward (leak detection) -> Slack

**Red flag answer:** “We check the logs when users report issues.” - Reactive, not proactive. You should know about problems before users do.

---

## Modern .NET and C# Features

These questions test whether someone stays current with the platform or is still writing .NET 6 code in 2026.

[

Read next Companion article

## 20+ .NET 10 Tips from a Senior Developer

Battle-tested tips on async/await, EF Core optimization, DI patterns, caching, security, and modern C# features. Great pre-interview refresh.

](https://codewithmukesh.com/blog/20-tips-from-a-senior-dotnet-developer/)

### Q40. What Are Primary Constructors in C# 12+?

**Difficulty: Mid**

Primary constructors declare constructor parameters directly on the class, eliminating boilerplate:

```

// Before - 10 lines of ceremony
public class ProductService
{
    private readonly AppDbContext _db;
    private readonly ILogger<ProductService> _logger;
    public ProductService(AppDbContext db, ILogger<ProductService> logger)
    {
        _db = db;
        _logger = logger;
    }
}
// After - 1 line
public class ProductService(AppDbContext db, ILogger<ProductService> logger)
{
    public async Task<Product?> GetAsync(int id)
    {
        logger.LogInformation("Getting product {Id}", id);
        return await db.Products.FindAsync(id);
    }
}
```

I use primary constructors for all DI-injected services. Less boilerplate, same behavior.

**Red flag answer:** “I haven’t upgraded to C# 12 yet.” - C# 12 shipped with .NET 8 over two years ago.

### Q41. What Are Records and When Would You Use Them for DTOs?

**Difficulty: Mid**

Records provide value-based equality, immutability by default, and concise syntax:

```

public record ProductResponse(int Id, string Name, decimal Price);
// Value equality works out of the box
var expected = new ProductResponse(1, "Widget", 29.99m);
var actual = await GetProductAsync(1);
actual.Should().Be(expected); // Compares by value, not reference
```

I use records for DTOs, events, and value objects. I use classes for EF Core entities (need mutability for change tracking) and services.

**Red flag answer:** “Records are the same as classes but shorter.” - Misses value equality.

### Q42. What Are Minimal APIs and Why Choose Them Over Controllers?

**Difficulty: Mid**

Minimal APIs define endpoints without controller class ceremony:

```

app.MapGet("/api/products/{id}", async (int id, AppDbContext db) =>
    await db.Products.FindAsync(id) is Product p
        ? Results.Ok(p)
        : Results.NotFound());
```

Simpler, faster (no reflection), full AOT support, and `TypedResults` gives compile-time OpenAPI metadata. Controllers still make sense for large teams familiar with MVC patterns.

**Red flag answer:** “Controllers are always better because they organize code.” - Organization comes from file structure, not the controller pattern.

[

Read next Companion article

## Minimal API Endpoints in ASP.NET Core

Route handlers, parameter binding, route groups, endpoint filters, TypedResults, and OpenAPI integration. The complete reference.

](https://codewithmukesh.com/blog/minimal-apis-aspnet-core/)

### Q43. What’s New in .NET 10 for Web API Development?

**Difficulty: Senior**

Key features per the [.NET 10 release notes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-10/overview): HybridCache with stampede protection, built-in OpenAPI (no more Swashbuckle), `ExecuteUpdateAsync` improvements, built-in rate limiting, container publishing without Dockerfile (`dotnet publish /t:PublishContainer`), EF Core 10 with improved LINQ translation, and `TimeProvider` for testable time-dependent code.

**Red flag answer:** “I’m still on .NET 6 LTS.” - .NET 6 is end of life. Staying current matters for security.

### Q44. What Is `CancellationToken` and Why Should Every Async Endpoint Accept One?

**Difficulty: Mid**

The `CancellationToken` signals when a client disconnects or the request is aborted. Without it, your server keeps working on a request nobody is waiting for:

```

app.MapGet("/api/reports", async (AppDbContext db, CancellationToken ct) =>
{
    var report = await db.Reports
        .Where(r => r.IsActive)
        .ToListAsync(ct); // Cancels the DB query if client disconnects
    return Results.Ok(report);
});
```

Propagate it to every EF Core query, HTTP call, and I/O operation.

**Red flag answer:** “I’ve never used `CancellationToken` in my endpoints.” - Wasting server resources on every disconnected request.

### Q45. What’s the `field` Keyword in C# 14?

**Difficulty: Senior**

The `field` keyword gives access to the auto-generated backing field inside a property, without manually declaring it:

```

// Before - manual backing field
private string _name = string.Empty;
public string Name
{
    get => _name;
    set => _name = value ?? throw new ArgumentNullException(nameof(value));
}
// After (C# 14) - field keyword
public string Name
{
    get;
    set => field = value ?? throw new ArgumentNullException(nameof(value));
}
```

Eliminates boilerplate for properties that need custom logic in the getter or setter while keeping auto-property syntax.

**Red flag answer:** “I haven’t heard of the `field` keyword.” - Fair for mid-level, but senior devs should follow language previews.

---

## 5 Interview Mistakes That Get .NET Developers Rejected

After conducting dozens of interviews, here are the patterns I see in candidates who don’t make it:

1.  **Reciting definitions instead of showing experience.** “Middleware is software that sits between…” tells me nothing. “I once had CORS registered after auth and it took 3 hours to debug” tells me everything.
2.  **Saying “it depends” without following up.** Every senior answer starts with “it depends,” but the good ones immediately follow with “here’s my decision framework.” Have a default recommendation, then explain when you’d deviate.
3.  **Not knowing what’s new in .NET 10.** If you’re interviewing for a .NET role in 2026 and you mention Swashbuckle, `IDistributedCache`, or .NET 6 patterns, the interviewer assumes you stopped learning two years ago. Stay current.
4.  **No production experience signals.** Interviewers are listening for phrases like “I’ve seen this in production,” “we had an incident where,” or “I benchmarked this.” If every answer sounds theoretical, you’ll lose to someone with war stories.
5.  **Skipping the “why” behind your choice.** “I’d use output caching” is a C answer. “I’d use output caching because it supports tag-based invalidation, which means I can evict the cache when a product is created without a time-based TTL” is an A answer.

That is 45 answers read. The interview asks for them cold, on a clock, with nothing to scroll back to.

[

Practice Free interactive tool

## Now recall these 45 answers on the clock

Reading an answer and producing it under pressure are different skills, and only one of them gets you hired. The free mock interview runs the same Web API bank (plus EF Core and LINQ) at Junior, Mid, or Senior level, scores you instantly, and breaks the result down by topic so you know which of the 9 categories above to re-read. No signup to start.

](https://codewithmukesh.com/dotnet-mock-interview/)

## Key Takeaways

- **Scenario-based questions** reveal real experience. Practice answering “what would you do when…” not “what is…”
- **Every answer should include a trade-off.** There’s no single right answer to most questions. Show you understand the alternatives.
- **Know the red flags.** If you catch yourself about to say “I’d just use InMemory provider” or “last write wins,” stop and think deeper.
- **Stay current with .NET 10 and C# 14.** HybridCache, built-in OpenAPI, ExecuteUpdateAsync, primary constructors, records, the field keyword. These come up constantly.
- **The follow-up question is where interviews are won or lost.** Prepare not just the answer, but the second-level question the interviewer will chain.

---

## Download the Complete 100-Question PDF

This article covers 45 questions. But I have 55 more that didn’t make the cut because they needed more space to answer properly: multi-tenancy design, the outbox pattern, feature flags, graceful Kubernetes shutdown, memory leak debugging, the mediator pattern debate, and more.

The **free [100-question PDF](https://codewithmukesh.com/resources/dotnet-webapi-interview-questions/)** includes:

- All 45 questions from this article with expanded answers
- **55 bonus questions** not covered here
- **Difficulty badges** (Junior / Mid / Senior) for every question
- **“What the interviewer is looking for”** notes
- **Follow-up questions** interviewers chain next
- **Red flag answers** that get you rejected
- **Per-category cheat sheets** for quick review before your interview

**[Download the free PDF here](https://codewithmukesh.com/resources/dotnet-webapi-interview-questions/)**

---

How many .NET interview questions are in the free PDF?

The PDF contains 100 practical .NET Web API interview questions organized by 9 categories: API Design, ASP.NET Core Internals, Entity Framework Core, Authentication and Security, Performance and Caching, Architecture and System Design, Testing, Production Readiness, and Modern .NET and C# Features. This article covers 45 of them, and the PDF includes 55 additional senior-level questions with expanded answers and per-category cheat sheets.

What .NET version do these interview questions target?

All questions are updated for .NET 10 and C# 14 (2026 edition). They cover ASP.NET Core minimal APIs, EF Core 10, HybridCache, built-in rate limiting, OpenAPI without Swashbuckle, primary constructors, records, collection expressions, the field keyword, and other modern features. The answers reflect current best practices, not .NET 6-era patterns.

Are these generic textbook questions or practical scenario-based questions?

Every question is scenario-based and practical. Instead of asking 'What is dependency injection?', the questions test real production knowledge like 'You have a scoped service injected into a singleton - what happens and how do you detect it before production?' These are the questions that actually get asked at product companies, not generic definitions.

What difficulty levels do the .NET interview questions cover?

The questions span Junior (12 percent), Mid (48 percent), and Senior (40 percent) difficulty levels. Junior questions cover fundamentals like async/await and parameter binding. Mid questions test practical experience like middleware ordering and caching strategies. Senior questions test architecture decisions, production debugging, and system design.

Can I use these questions to prepare for a .NET developer interview?

Yes. Each question includes a great answer showing how to answer in an interview with code examples and trade-off analysis, a red flag answer showing what gets you rejected, and a follow-up question showing what the interviewer asks next. Focus on the categories most relevant to the role you are interviewing for.

Can I use these questions if I am conducting .NET interviews?

Absolutely. The 'Why interviewers ask this' section in the PDF explains what each question actually tests. The red flag answers help identify weak candidates quickly, and the follow-up questions let you probe deeper based on the candidate's initial response. The difficulty badges help you select appropriate questions for junior, mid-level, or senior candidates.

What topics are covered in the .NET Web API interview questions?

The questions cover 9 categories spanning the full stack of .NET Web API development: REST API design and best practices, ASP.NET Core middleware and dependency injection, Entity Framework Core queries and migrations, JWT authentication and security, caching with HybridCache and output caching, architecture patterns like CQRS and Vertical Slice, integration testing with Testcontainers, production monitoring with OpenTelemetry, and modern C# 14 features.

Is the .NET interview questions PDF free to download?

Yes, the 100-question PDF is completely free. Subscribe to the codewithmukesh newsletter to download it instantly. You will also receive weekly .NET tips, benchmarks, and production-tested patterns delivered every Tuesday.

---

If a question in this article surfaced a topic you want to go deeper on, the **FREE .NET Web API Zero to Hero course** covers each one in detail - middleware order, EF Core query optimization, JWT and refresh tokens, caching with HybridCache, Clean Architecture, observability, and Docker deployment. 125+ lessons, no paywall, organized by the same 9 categories you just read.

If you found this helpful, share it with your colleagues who are prepping for .NET interviews, or bookmark it for the next time you’re on the other side of the table.

Happy Coding :)
