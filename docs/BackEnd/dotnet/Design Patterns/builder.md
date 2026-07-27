---
title: Builder Design Pattern
sidebar_label: Builder
sidebar_position: 1
---

---

### 1. Definition

The Builder pattern is a **creational design pattern** that lets you construct **complex objects step by step**, separating the construction process from the object’s final representation. [refactoring](https://refactoring.guru/design-patterns/builder)

Instead of a single constructor with many parameters, you:

- Use a **builder object** with methods like `SetX()`, `SetY()`, etc.
- Call only the steps you need.
- Finally call `Build()` to get the constructed object. [dev](https://dev.to/srishtikprasad/builder-design-pattern-3a7j)

---

### 2. Core Idea

The core idea: **object construction can be as complex as the object itself, so it deserves its own structure**. [en.wikipedia](https://en.wikipedia.org/wiki/Builder_pattern)

Builder addresses:

- **Telescoping constructors** (many overloads with different parameter combinations).
- **Too many optional parameters**.
- **Inconsistent object state** when using setters after construction. [digitalocean](https://www.digitalocean.com/community/tutorials/builder-design-pattern-in-java)

It enables:

- The same construction process to create **different representations** of a product.
- Step-by-step construction with **full control** over which steps are executed. [refactoring](https://refactoring.guru/design-patterns/builder)

---

### 3. How it Works

### Key Roles

- **Product**
  - The complex object being built.
- **Builder (interface/abstract class)**
  - Declares the construction steps (e.g., `SetPartA()`, `SetPartB()`).
  - Declares `GetResult()` or `Build()` to return the product. [en.wikipedia](https://en.wikipedia.org/wiki/Builder_pattern)
- **ConcreteBuilder**
  - Implements the steps to build a specific representation.
  - Maintains the internal state of the product under construction.
- **Director (optional)**
  - Defines the **order** of steps (e.g., `ConstructMinimal()`, `ConstructFull()`).
  - Uses a Builder to execute those steps. [refactoring](https://refactoring.guru/design-patterns/builder)
- **Client**
  - Creates a ConcreteBuilder.
  - Optionally passes it to a Director.
  - Calls steps (directly or via Director), then gets the final product. [refactoring](https://refactoring.guru/design-patterns/builder)

### Execution Flow

1. Client creates a **ConcreteBuilder**.
2. Client (or Director) calls a sequence of **build steps** on the builder:
   - `builder.SetPartA(...)`
   - `builder.SetPartB(...)`
   - `builder.SetPartC(...)` (optional)
3. When construction is complete, client calls `Build()` / `GetResult()`.
4. Builder returns the fully constructed **Product**.

### Lifecycle

- **Construction phase**:
  - Builder accumulates configuration and parts.
  - Object state may be mutable internally.
- **Finalization**:
  - `Build()` creates and returns the final object.
  - Often returns an **immutable** product.
- **Reuse**:
  - Builder can be reused to create multiple similar objects with slight variations.

### Fluent Builder Example (pseudocode)

```text
class Product {
    internal PartA;
    internal PartB;
    internal PartC; // optional
}

interface IBuilder {
    IBuilder SetPartA(PartA a);
    IBuilder SetPartB(PartB b);
    IBuilder SetPartC(PartC c); // optional
    Product Build();
}

class ConcreteBuilder : IBuilder {
    private Product _product = new Product();

    IBuilder SetPartA(PartA a) {
        _product.PartA = a;
        return this;
    }

    IBuilder SetPartB(PartB b) {
        _product.PartB = b;
        return this;
    }

    IBuilder SetPartC(PartC c) {
        _product.PartC = c;
        return this;
    }

    Product Build() {
        // optionally validate state
        return _product;
    }
}

// Client usage
var product = new ConcreteBuilder()
    .SetPartA(a)
    .SetPartB(b)
    .SetPartC(c)  // optional
    .Build();
```

---

### 4. Internal Architecture

### What Happens Behind the Scenes

- **Construction state is isolated**:
  - The builder holds all intermediate state.
  - The final product is only exposed once `Build()` is called.

- **Step-by-step accumulation**:
  - Each `SetX()` method:
    - Assigns a value to the internal product (or builder’s fields).
    - Returns the builder itself (fluent interface).

- **Validation and invariants**:
  - `Build()` can:
    - Validate that required parts are set.
    - Enforce invariants before returning the product.
    - Throw exceptions if the configuration is invalid.

- **Immutability**:
  - The final product is often **immutable**:
    - All configuration happens in the builder.
    - After `Build()`, the product’s state cannot change. [baeldung](https://www.baeldung.com/java-builder-pattern)

### Classic vs Fluent Variants

- **Classic Builder (with Director)**:
  - Builder interface + ConcreteBuilders + Director.
  - Director defines reusable construction algorithms.
  - Useful when:
    - You have multiple complex construction algorithms.
    - You want to reuse those algorithms across builders. [refactoring](https://refactoring.guru/design-patterns/builder)

- **Fluent Builder (no Director)**:
  - Builder with chainable methods.
  - Client directly calls the steps it needs.
  - More common in modern codebases (e.g., configuration objects, query builders). [reddit](https://www.reddit.com/r/programming/comments/1nhf754/a_comprehensive_guide_on_builder_design_pattern/)

### Memory & Threading

- Builder instance:
  - Holds mutable state during construction.
  - Typically short-lived, scoped to a single construction.
- Final product:
  - Often immutable, safe for sharing across threads. [baeldung](https://www.baeldung.com/java-builder-pattern)
- Thread safety:
  - Construction is usually single-threaded per builder instance.
  - Immutable products avoid concurrency issues after creation.

---

### 5. When to Use it

Use Builder when:

- The object has:
  - **Many attributes**, especially with a mix of required and optional.
  - Complex validation or construction logic. [reddit](https://www.reddit.com/r/programming/comments/1nhf754/a_comprehensive_guide_on_builder_design_pattern/)
- You want to:
  - Avoid telescoping constructors.
  - Avoid exposing a half-initialized object via setters. [digitalocean](https://www.digitalocean.com/community/tutorials/builder-design-pattern-in-java)
- You need:
  - Different representations of the same product using the same construction steps (e.g., different configurations, formats). [en.wikipedia](https://en.wikipedia.org/wiki/Builder_pattern)
- You care about:
  - **Immutability** and clear construction semantics. [baeldung](https://www.baeldung.com/java-builder-pattern)

Common use cases:

- Configuration objects (e.g., `HttpClientBuilder`, `ConnectionStringBuilder`).
- Complex domain objects with many optional fields.
- Query builders, request builders, message builders.

---

### 6. When Not to Use it

Avoid Builder when:

- The object is simple with:
  - Few properties.
  - No optional parameters.
- Construction is trivial:
  - A single constructor or a few overloads are enough.
- You’re adding Builder just to “look modern”:
  - If a constructor or factory method is clear and concise, prefer that.

Anti-pattern signals:

- Builder with only one or two properties.
- Builder that just wraps a simple constructor without adding value.

---

### 7. Pros and Cons

**Pros**

- Improves **readability**:
  - Named methods (`SetHost()`, `SetPort()`) are clearer than positional constructor parameters. [baeldung](https://www.baeldung.com/java-builder-pattern)
- Handles **many optional parameters** gracefully. [digitalocean](https://www.digitalocean.com/community/tutorials/builder-design-pattern-in-java)
- Enforces **construction order and validation** in `Build()`.
- Supports **immutable products**:
  - All mutation happens in the builder; product is fixed after creation. [baeldung](https://www.baeldung.com/java-builder-pattern)
- Allows **different representations** using the same construction process. [en.wikipedia](https://en.wikipedia.org/wiki/Builder_pattern)

**Cons**

- Adds **extra classes** (Builder, possibly Director).
- Can be **verbose** for simple objects.
- May lead to:
  - Overuse of fluent APIs for trivial cases.
  - “Builder everywhere” even when not needed.

---

### 8. Trade Offs

- **Readability vs Verbosity**
  - Builder makes complex construction very readable.
  - For simple objects, it’s overkill and adds noise.

- **Flexibility vs Simplicity**
  - Builder gives fine-grained control over construction.
  - But introduces more types and indirection.

- **Immutability vs Construction Complexity**
  - Achieving immutability cleanly often needs a builder.
  - That’s worth it for widely shared or long-lived objects, less so for local, short-lived ones.

Architect-level insight:  
Use Builder when **construction complexity and configurability** justify the extra structure. It’s a tool for managing **complex object lifecycles**, not a default for every class.

---

### 9. Real World Example (Minimum One)

**Example: Configuration Object for an HTTP Client**

Scenario:

- You need to configure an HTTP client with:
  - Required: `BaseUrl`
  - Optional: `Timeout`, `MaxRetries`, `DefaultHeaders`, `Proxy`, etc.
- Many combinations of options; you don’t want 10+ constructors.

Without Builder:

```text
var client = new HttpClient(
    "https://api.example.com",
    TimeSpan.FromSeconds(30),
    3,
    null,
    null,
    true,
    false
);
```

Problems:

- Hard to read.
- Easy to mix up parameter order.
- Optional parameters passed as `null`.

With Builder:

```text
interface IHttpClientBuilder {
    IHttpClientBuilder SetBaseUrl(string url);
    IHttpClientBuilder SetTimeout(TimeSpan timeout);
    IHttpClientBuilder SetMaxRetries(int retries);
    IHttpClientBuilder AddHeader(string key, string value);
    IHttpClientBuilder SetProxy(ProxyConfig proxy);
    HttpClient Build();
}

class HttpClientBuilder : IHttpClientBuilder {
    private HttpClientConfig _config = new HttpClientConfig();

    IHttpClientBuilder SetBaseUrl(string url) {
        _config.BaseUrl = url;
        return this;
    }

    IHttpClientBuilder SetTimeout(TimeSpan timeout) {
        _config.Timeout = timeout;
        return this;
    }

    IHttpClientBuilder SetMaxRetries(int retries) {
        _config.MaxRetries = retries;
        return this;
    }

    IHttpClientBuilder AddHeader(string key, string value) {
        _config.Headers[key] = value;
        return this;
    }

    IHttpClientBuilder SetProxy(ProxyConfig proxy) {
        _config.Proxy = proxy;
        return this;
    }

    HttpClient Build() {
        // validate required fields (e.g., BaseUrl)
        return new HttpClient(_config);
    }
}

// Client usage
var client = new HttpClientBuilder()
    .SetBaseUrl("https://api.example.com")
    .SetTimeout(TimeSpan.FromSeconds(10))
    .SetMaxRetries(3)
    .AddHeader("X-Api-Key", "abc123")
    .Build();
```

Benefits:

- Clear, self-documenting configuration.
- Optional settings are truly optional.
- Validation centralized in `Build()`.

---

### 10. Architect’s Perspective

If I’m designing a large-scale system:

**Why I’d choose Builder**

- For **configuration objects** and **complex domain objects** where:
  - There are many optional settings.
  - Immutability is important (e.g., shared config, DTOs).
- When I want:
  - Clear, readable construction semantics.
  - Centralized validation and invariants in `Build()`.
- When I anticipate:
  - More options over time without exploding constructors.

**When I’d avoid it**

- For simple DTOs or internal objects with 2–3 properties.
- When a simple constructor or factory method is already clear and stable.
- When Builder would be used only once and never extended.

**Important architectural considerations**

- Builder pairs well with:
  - **Immutability** (product is read-only after `Build()`).
  - **Fluent APIs** (e.g., query builders, request builders).
- In frameworks and libraries:
  - Builder is often the public API for configuring complex objects.
- In .NET ecosystems:
  - Many libraries use builder-style APIs (e.g., `HttpClientBuilder`, `IHostBuilder`, `DbConnection` builders).

**Cloud angle (optional)**  
In cloud-native apps, builders are common for:

- Connection strings and client configurations (e.g., Cosmos DB, Service Bus clients).
- Infrastructure-as-Code style configurations (e.g., building resource definitions step by step).

They let you express complex, evolving configurations in a readable, composable way.

---

### 11. Interview Answer (2-Minute Version)

The Builder pattern is a creational design pattern that constructs complex objects step by step, separating the construction process from the object’s final representation. Instead of using a single constructor with many parameters, you use a builder object with methods like `SetX()`, `SetY()`, and finally `Build()` to create the object.

I use Builder when an object has many attributes, especially with a mix of required and optional parameters, or when I want to avoid telescoping constructors and ensure the object is always in a valid, often immutable, state. For example, when configuring an HTTP client, a builder lets me clearly specify base URL, timeout, retries, and headers in a readable, chainable way, and then call `Build()` to get a fully configured, immutable client.

The main benefits are improved readability, better handling of optional parameters, and the ability to enforce validation and immutability. I avoid Builder for simple objects with just a few properties, where a straightforward constructor or factory method is clearer and less verbose.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Clear articulation of the problem Builder solves:
  - Telescoping constructors
  - Too many optional parameters
  - Inconsistent state with setters [digitalocean](https://www.digitalocean.com/community/tutorials/builder-design-pattern-in-java)
- Connection to **immutability** and **thread safety**. [baeldung](https://www.baeldung.com/java-builder-pattern)
- Real examples from their codebase (e.g., configuration objects, query builders).

**Common red flags**

- Using Builder for trivial objects with 2–3 properties.
- Not understanding when **Director** is useful vs when a simple fluent builder is enough.
- Confusing Builder with Factory or Abstract Factory.

**Likely follow-ups (and how to steer them)**

- “How is this different from a Factory?”  
  → Emphasize:
  - Factory focuses on **which** type to create.
  - Builder focuses on **how** to construct a complex object step by step. [en.wikipedia](https://en.wikipedia.org/wiki/Builder_pattern)

- “Do you always need a Director?”  
  → Explain:
  - Director is useful when you have reusable construction algorithms.
  - In many modern codebases, a simple fluent builder without Director is enough. [refactoring](https://refactoring.guru/design-patterns/builder)

- “How does this help with immutability?”  
  → Describe:
  - All mutation happens in the builder.
  - `Build()` returns an immutable product, safe for sharing. [baeldung](https://www.baeldung.com/java-builder-pattern)

---
