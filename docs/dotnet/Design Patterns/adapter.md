---
title: Adapter Design Pattern
sidebar_label: Adapter
sidebar_position: 1
---

---

### 1. Definition

The Adapter pattern is a **structural design pattern** that allows objects with **incompatible interfaces** to collaborate by converting the interface of one object into another that the client expects. [refactoring](https://refactoring.guru/design-patterns/adapter)

Also known as a **Wrapper**, it acts as a middle layer between:

- A **client** that expects a certain interface (Target).
- An existing **service** (Adaptee) with a different or incompatible interface. [geeksforgeeks](https://www.geeksforgeeks.org/system-design/adapter-pattern/)

---

### 2. Core Idea

The core idea: **you can’t (or don’t want to) change an existing class, but you need it to work with your system’s interface**. [reddit](https://www.reddit.com/r/csharp/comments/afj8h3/the_adapter_design_pattern_is_one_of_the_most/)

Adapter:

- Implements the **Target interface** that the client expects.
- Holds a reference to the **Adaptee**.
- Translates client calls into calls the Adaptee understands. [codesignal](https://codesignal.com/learn/courses/structural-patterns-in-python/lessons/introduction-to-the-adapter-pattern-in-python)

It’s like a plug adapter: your device (client) has one plug shape; the wall socket (Adaptee) has another; the adapter lets them work together without changing either. [codesignal](https://codesignal.com/learn/courses/structural-patterns-in-python/lessons/introduction-to-the-adapter-pattern-in-python)

---

### 3. How it Works

### Key Roles

- **Target Interface**
  - The interface the client expects and uses.
- **Adaptee**
  - The existing class with an incompatible interface (often legacy, 3rd-party, or heavily used).
- **Adapter**
  - Implements the Target interface.
  - Wraps the Adaptee.
  - Translates calls between client and Adaptee. [refactoring](https://refactoring.guru/design-patterns/adapter)
- **Client**
  - Uses the Target interface, unaware of the Adaptee or Adapter details. [geeksforgeeks](https://www.geeksforgeeks.org/system-design/adapter-pattern/)

### Execution Flow

1. Client calls a method on the **Adapter** via the Target interface.
2. Adapter receives the call.
3. Adapter:
   - Converts parameters (if needed).
   - Calls the appropriate method(s) on the **Adaptee**.
4. Adaptee performs the actual work.
5. Adapter may transform the result and return it to the client. [refactoring](https://refactoring.guru/design-patterns/adapter)

### Lifecycle

- **Adapter creation**:
  - Client (or DI container) creates the Adapter, passing in the Adaptee (object adapter).
- **Usage**:
  - Client interacts only with the Target interface.
- **Replacement**:
  - You can swap the Adaptee or Adapter implementation without changing client code.

### Simple Pseudocode

```text
// Target interface expected by client
interface IPaymentProcessor {
    void ProcessPayment(decimal amount);
}

// Adaptee: existing 3rd-party class
class LegacyPaymentGateway {
    public void Charge(decimal value) {
        // legacy logic
    }
}

// Adapter
class LegacyPaymentAdapter : IPaymentProcessor {
    private readonly LegacyPaymentGateway _gateway;

    public LegacyPaymentAdapter(LegacyPaymentGateway gateway) {
        _gateway = gateway;
    }

    public void ProcessPayment(decimal amount) {
        // translate interface
        _gateway.Charge(amount);
    }
}

// Client
class CheckoutService {
    private readonly IPaymentProcessor _processor;

    public CheckoutService(IPaymentProcessor processor) {
        _processor = processor;
    }

    public void CompleteOrder(decimal total) {
        _processor.ProcessPayment(total);
    }
}
```

Client uses `IPaymentProcessor`; the adapter bridges to `LegacyPaymentGateway.Charge()`.

---

### 4. Internal Architecture

### What Happens Behind the Scenes

- **Interface translation**:
  - Adapter implements the Target interface.
  - Internally, it delegates to the Adaptee, possibly:
    - Renaming methods.
    - Reordering parameters.
    - Converting data types or units. [geeksforgeeks](https://www.geeksforgeeks.org/system-design/adapter-pattern/)

- **Object composition (Object Adapter)**:
  - Adapter **wraps** an instance of the Adaptee.
  - Uses **composition** to reuse existing functionality.
  - Most common in modern languages (C#, Java, etc.). [refactoring](https://refactoring.guru/design-patterns/adapter)

- **Inheritance (Class Adapter)**:
  - Adapter inherits from both Target and Adaptee (requires multiple inheritance).
  - Overrides methods to adapt behavior.
  - Less common in single-inheritance languages. [geeksforgeeks](https://www.geeksforgeeks.org/system-design/adapter-pattern/)

- **Decoupling**:
  - Client depends only on Target.
  - Adaptee remains unchanged.
  - Adapter centralizes all compatibility logic. [reddit](https://www.reddit.com/r/csharp/comments/afj8h3/the_adapter_design_pattern_is_one_of_the_most/)

### Variants

- **Object Adapter** (composition-based):
  - Adapter holds an Adaptee instance.
  - Preferred in C#/.NET, Java, etc. [reddit](https://www.reddit.com/r/csharp/comments/afj8h3/the_adapter_design_pattern_is_one_of_the_most/)

- **Class Adapter** (inheritance-based):
  - Adapter inherits from both Target and Adaptee.
  - Only feasible in languages with multiple inheritance (e.g., C++). [refactoring](https://refactoring.guru/design-patterns/adapter)

---

### 5. When to Use it

Use Adapter when:

- You need to integrate:
  - **Legacy code**
  - **3rd-party libraries**
  - Existing services with incompatible interfaces [reddit](https://www.reddit.com/r/csharp/comments/afj8h3/the_adapter_design_pattern_is_one_of_the_most/)
- You **cannot or should not change** the Adaptee:
  - It’s 3rd-party, widely used, or legacy.
- You want to:
  - Reuse existing functionality without rewriting.
  - Centralize compatibility logic in one place. [geeksforgeeks](https://www.geeksforgeeks.org/system-design/adapter-pattern/)
- You have:
  - Multiple subsystems that must work together but have mismatched interfaces.

Common scenarios:

- Wrapping old payment gateways, logging frameworks, or data access layers.
- Integrating 3rd-party SDKs with your domain’s interfaces.
- Making platform-specific APIs conform to a cross-platform abstraction.

---

### 6. When Not to Use it

Avoid Adapter when:

- You control both sides and can simply **change the interface** directly.
- The incompatibility is trivial and can be handled with a small inline conversion.
- You’re designing a **new system from scratch** with no legacy constraints.
- You’d be creating:
  - Adapters for nearly every class (sign of deeper design issues).

Anti-pattern signals:

- Deep chains of adapters wrapping adapters.
- Using Adapter to hide poor interface design instead of fixing it.

---

### 7. Pros and Cons

**Pros**

- Enables **reuse of existing code** without modification. [reddit](https://www.reddit.com/r/csharp/comments/afj8h3/the_adapter_design_pattern_is_one_of_the_most/)
- Allows incompatible interfaces to **collaborate cleanly**. [refactoring](https://refactoring.guru/design-patterns/adapter)
- Centralizes compatibility logic:
  - Easier to maintain and test.
- Supports **Open/Closed Principle**:
  - Add new adapters without changing client code.

**Cons**

- Adds **extra layer of indirection**:
  - Slightly more complex call chain.
- Can lead to:
  - “Adapter sprawl” if overused.
  - Hard-to-follow mappings if not well-named.
- May hide:
  - Significant interface mismatches that could be better addressed by redesign.

---

### 8. Trade Offs

- **Compatibility vs Directness**
  - Adapter gives compatibility at the cost of an extra layer.
  - For stable integrations, this is usually worth it.

- **Reusability vs Clarity**
  - Adapter lets you reuse legacy/3rd-party code.
  - But if the original interface is too strange, the adapter itself may become complex.

- **Short-term integration vs Long-term design**
  - Adapter is excellent for incremental evolution.
  - Over time, you may refactor to remove the need for some adapters.

Architect-level insight:  
Use Adapter as a **bridge during evolution**, not as a permanent excuse for bad interfaces. It’s a tactical pattern that supports strategic architecture.

---

### 9. Real World Example (Minimum One)

**Example: Integrating a Legacy Payment Gateway**

Scenario:

- Your system defines a clean interface: `IPaymentProcessor.ProcessPayment(amount)`.
- You must integrate a legacy gateway that exposes `LegacyPaymentGateway.Charge(value)` with different semantics.

Without Adapter:

```text
// Client coupled directly to legacy API
class CheckoutService {
    private readonly LegacyPaymentGateway _gateway;

    public void CompleteOrder(decimal total) {
        _gateway.Charge(total);  // direct dependency on legacy API
    }
}
```

Problems:

- Client tightly coupled to legacy interface.
- Hard to swap providers or test.

With Adapter:

```text
interface IPaymentProcessor {
    void ProcessPayment(decimal amount);
}

class LegacyPaymentGateway {
    public void Charge(decimal value) {
        // legacy logic
    }
}

class LegacyPaymentAdapter : IPaymentProcessor {
    private readonly LegacyPaymentGateway _gateway;

    public LegacyPaymentAdapter(LegacyPaymentGateway gateway) {
        _gateway = gateway;
    }

    public void ProcessPayment(decimal amount) {
        // possibly add logging, error handling, conversion
        _gateway.Charge(amount);
    }
}

class CheckoutService {
    private readonly IPaymentProcessor _processor;

    public CheckoutService(IPaymentProcessor processor) {
        _processor = processor;
    }

    public void CompleteOrder(decimal total) {
        _processor.ProcessPayment(total);
    }
}
```

Benefits:

- `CheckoutService` depends only on `IPaymentProcessor`.
- You can add new providers by implementing `IPaymentProcessor` or adding new adapters.
- Legacy logic is isolated and can be replaced later.

---

### 10. Architect’s Perspective

If I’m designing a large-scale system:

**Why I’d choose Adapter**

- To integrate:
  - **Legacy systems** (banking, industrial, government platforms).
  - **3rd-party SDKs** with their own APIs.
- To define a **stable, domain-centric interface** (Target) and wrap everything else behind it.
- To:
  - Keep client code clean and decoupled.
  - Centralize compatibility and translation logic. [geeksforgeeks](https://www.geeksforgeeks.org/system-design/adapter-pattern/)

**When I’d avoid it**

- In greenfield systems where you can design interfaces properly from the start.
- When the “adaptation” is so heavy that it indicates a **fundamental mismatch** better solved by redesign.
- When you’re just hiding complexity instead of managing it.

**Important architectural considerations**

- Use Adapter to:
  - Protect your **domain layer** from external API changes.
  - Create a **stable abstraction** over volatile dependencies.
- Combine with:
  - **Dependency Injection** (inject adapters via interfaces).
  - **Facade** (for simplifying complex subsystems).
- In microservices:
  - Adapters are common at the edges:
    - Database adapters
    - Message bus adapters
    - External API adapters

**Cloud angle (optional)**  
In cloud-native apps (e.g., on Azure):

- You might define `IStorageProvider` and implement adapters for:
  - Azure Blob Storage
  - Azure Files
  - Local disk (for dev/test)
- This lets your core logic stay unchanged while swapping infrastructure providers.

---

### 11. Interview Answer (2-Minute Version)

The Adapter pattern is a structural design pattern that allows objects with incompatible interfaces to work together. It acts as a wrapper that implements the interface the client expects (the Target) and internally delegates to an existing class (the Adaptee), translating calls and data as needed.

I use Adapter primarily when integrating legacy systems or third-party libraries where I can’t or don’t want to change the existing code. For example, if my system defines an `IPaymentProcessor` interface but I have a legacy payment gateway with a different method signature, I create an adapter that implements `IPaymentProcessor` and internally calls the legacy gateway’s method. This keeps my client code clean and decoupled from the legacy API.

The main benefits are reusability of existing code, centralized compatibility logic, and the ability to evolve systems incrementally. I avoid Adapter when I control both sides and can simply align the interfaces directly, or when it would just hide a deeper design problem instead of solving it.

---

### 12. Interview Mode Enhancement

**What strong candidates emphasize**

- Clear identification of:
  - **Target**, **Adaptee**, **Adapter**, **Client**. [geeksforgeeks](https://www.geeksforgeeks.org/system-design/adapter-pattern/)
- Real examples:
  - Legacy system integration
  - Third-party SDK wrappers
- Awareness of:
  - Object vs Class Adapter
  - When Adapter is a **temporary bridge** vs a long-term abstraction. [refactoring](https://refactoring.guru/design-patterns/adapter)

**Common red flags**

- Confusing Adapter with:
  - Facade (simplifies an interface, doesn’t necessarily adapt an incompatible one).
  - Proxy (controls access, adds behavior, not primarily for interface mismatch).
- Using Adapter when they could just **change the interface**.
- No sense of when **not** to use it.

**Likely follow-ups (and how to steer them)**

- “How is this different from Facade?”  
  → Emphasize:
  - Facade: simplifies a complex subsystem with a new, simpler interface.
  - Adapter: makes an **existing incompatible interface** compatible with an expected one. [refactoring](https://refactoring.guru/design-patterns/adapter)

- “Do you prefer object or class adapters, and why?”  
  → Explain:
  - Object adapter (composition) is more flexible and works in single-inheritance languages.
  - Class adapter is limited to languages with multiple inheritance. [geeksforgeeks](https://www.geeksforgeeks.org/system-design/adapter-pattern/)

- “How do you test code that uses adapters?”  
  → Describe:
  - Test client code against the Target interface using mocks.
  - Test adapter separately to ensure it correctly translates to the Adaptee.

---
