Modern .NET garbage collection (GC) is an automatic, **generational tracing collector**. It allocates managed objects on the heap, finds which objects are still reachable from application roots, reclaims unreachable ones, and usually compacts memory so future allocations remain fast.[1][2]

## Core idea

You allocate objects normally:

```csharp
var order = new Order();
```

When no live code can reach `order` anymore, it becomes eligible for collection. “Out of scope” alone is not the rule—the real rule is **reachability from GC roots**.[1][3]

Typical GC roots include:

- Local variables still live on thread stacks
- Static fields
- CPU registers
- Active handles and runtime references
- References held by native interop/runtime infrastructure[3]

```text
GC roots
  |
  +--> static cache --> Order --> Customer
  |
  +--> local variable --> Session

Reachable object: retained
No path from any root: eligible for collection
```

A static cache that keeps growing is a common source of a **managed memory leak**: the GC is working correctly, but application code continues to keep objects reachable.

## Allocation mechanics

Most small managed allocations are extremely fast. The runtime reserves heap segments from the operating system, then typically allocates new objects by advancing a pointer in the current allocation region.[1][4]

```text
Managed heap segment

[ live object ][ live object ][ next free allocation space ........ ]
                              ^
                        allocation pointer
```

The GC runs when heap usage crosses a dynamically adjusted threshold, when the OS signals low memory, or when code explicitly calls `GC.Collect()`. Explicit collection is almost never appropriate in ordinary application code; the runtime has much better global knowledge of memory pressure and collection cost.[1]

## Generations

.NET is generational because most objects die young. New small objects begin in **Generation 0**, and objects that survive collections are promoted to older generations.[1][3][5]

| Area         | Typical contents                       |                       Collection frequency |                Cost |
| ------------ | -------------------------------------- | -----------------------------------------: | ------------------: |
| Generation 0 | Newly allocated, short-lived objects   |                              Most frequent |              Lowest |
| Generation 1 | Objects that survived Gen 0            |                              Less frequent |            Moderate |
| Generation 2 | Long-lived objects and older survivors |                             Least frequent |             Highest |
| LOH          | Large objects, normally 85,000 bytes   |                       Collected with Gen 2 |                High |
| POH          | Pinned objects                         | Managed separately to reduce fragmentation | Depends on pressure |

The 85,000-byte threshold for large objects is the default runtime threshold.[4][6]

### Promotion

```text
New object
   ↓
Gen 0 ──survives a collection──> Gen 1
   ↓                                  ↓
collected                    survives another collection
                                      ↓
                                    Gen 2
```

A Gen 0 collection is fast because it only examines the young generation plus references into it. A Gen 2 collection is more expensive because it involves the long-lived heap and is also the collection generation associated with the LOH.[1][3][5]

A common performance issue is accidental promotion: if you keep many temporary objects alive across collections—such as buffering huge request payloads or retaining objects in a cache—they move into Gen 2, increasing long-term memory and pause costs.

## What happens during a collection

At a high level, the collector does this:[1]

1. **Suspend managed execution briefly** when required to establish a safe view of references.
2. **Mark** reachable objects by tracing from GC roots.
3. Treat unmarked objects as garbage.
4. **Relocate and compact** surviving objects in compacted heaps.
5. Update all references to moved objects.
6. Resume normal execution.

```text
Before collection
[ live A ][ dead ][ live B ][ dead ][ live C ]

After mark + compact
[ live A ][ live B ][ live C ][ free space .... ]
```

Compaction removes holes, improves locality, and makes allocation cheap again. Objects can move, which is why managed code generally uses references rather than raw addresses.

## Small Object Heap, LOH, and POH

### Small Object Heap (SOH)

The **SOH** holds normal-size objects and is organized into Gen 0, Gen 1, and Gen 2. It is normally compacted during collection.[1][6]

### Large Object Heap (LOH)

Objects of 85,000 bytes or more are allocated on the **Large Object Heap**. Large allocations are expensive to move, so LOH behavior differs from ordinary small-object allocation; LOH is collected with Gen 2.[4][6]

Large temporary arrays, strings, byte buffers, JSON payloads, images, and large collections can cause LOH pressure:

```csharp
var buffer = new byte[200_000]; // Likely allocated on LOH.
```

Frequent large transient allocations can cause heap expansion and LOH fragmentation. The LOH is not compacted during normal collections by default, though .NET provides `GCSettings.LargeObjectHeapCompactionMode` to request compaction for the next **full blocking** collection. This is a targeted remediation, not a routine optimization.[4][7][8]

### Pinned Object Heap (POH)

A **pinned** object cannot move because unmanaged code or I/O needs a stable memory address. Excessive pinning prevents normal compaction and increases fragmentation. Modern .NET exposes the **Pinned Object Heap (POH)** as a separate heap area for pinned objects, helping reduce disruption to normal compacting heaps.[6][7]

Use pinning sparingly and for as short a time as possible.

## Background GC and pauses

GC requires some pauses, especially to safely inspect and update references. But modern .NET uses **background GC** by default for Gen 2 work, allowing managed application threads to continue running for much of the expensive old-generation collection. Gen 0 and Gen 1 collections can still occur as needed while background Gen 2 collection is in progress.[6][9]

This improves throughput and responsiveness, but it does not eliminate all pauses. High allocation rates, large Gen 2 heaps, LOH pressure, or pinning can still worsen tail latency.

## Workstation vs Server GC

.NET supports two main GC flavors:[6][10][11]

| Mode           | Optimized for                                                    | Typical use             |
| -------------- | ---------------------------------------------------------------- | ----------------------- |
| Workstation GC | Interactive responsiveness and client apps                       | Desktop/standalone apps |
| Server GC      | Throughput and scalability, often with multiple heaps/GC threads | ASP.NET Core services   |

ASP.NET Core applications normally use Server GC, while standalone applications default to Workstation GC; hosts can influence the effective default.[10][11]

You can configure Server GC, but treat it as a measured deployment setting, not a default tuning ritual:

```xml
<PropertyGroup>
  <ServerGarbageCollection>true</ServerGarbageCollection>
</PropertyGroup>
```

## Finalizers and `IDisposable`

GC reclaims **managed memory**, but it does not deterministically release scarce external resources such as file handles, sockets, database connections, or native handles.

Use `using` / `await using` for deterministic cleanup:

```csharp
await using var stream = File.OpenWrite("report.csv");
await stream.WriteAsync(data, ct);
```

A finalizer is a runtime fallback for a type that directly owns unmanaged resources, but finalizable objects require extra lifecycle work and can survive longer before memory is reclaimed. Prefer `SafeHandle`-based APIs and the dispose pattern rather than writing finalizers casually. The runtime’s performance guidance specifically includes diagnosing objects waiting for finalization when analyzing GC issues.[7]

## Practical performance rules

- **Do not call `GC.Collect()` routinely.** It can force costly collections and hurt throughput.[1]
- Reduce unnecessary allocations in hot paths: avoid repeated large strings, LINQ allocations in critical loops, and short-lived arrays when reusable buffers are appropriate.
- Use `ArrayPool<T>` / `MemoryPool<T>` for large or frequent temporary buffers, but return rented buffers promptly and do not retain them.
- Avoid materializing huge result sets—page, stream, or process data in chunks.
- Keep caches bounded and expire entries; reachable objects are not garbage.
- Avoid unnecessary pinning; it can fragment the heap.[7]
- Measure with runtime counters, traces, heap dumps, and an APM tool before changing GC settings. Inspect allocation rate, Gen 0/1/2 collection counts, Gen 2 pause time, LOH size, and retained-object paths.[7]

## Interview answer

> Modern .NET GC is a generational tracing collector. New small objects go to Gen 0; survivors are promoted to Gen 1 and then Gen 2 because most objects die young. During collection, the runtime traces from GC roots, marks reachable objects, reclaims unreachable objects, and generally compacts the small-object heap while updating references. Objects of 85 KB or more go to the Large Object Heap, which is collected with Gen 2 and can become a source of fragmentation if large temporary allocations are frequent. Background GC performs much of Gen 2 collection concurrently to reduce pauses. GC manages memory, not deterministic cleanup of external resources, so I still use `IDisposable` and `using` for files, sockets, and similar handles.[1][4][6][9]

## Sources

[1] Fundamentals of garbage collection - .NET | Microsoft Learn https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals
[2] Understanding Garbage Collection (Computer Science) https://aerospike.com/blog/understanding-garbage-collection/
[3] Garbage Collection Internals in .NET: How Memory ... https://www.c-sharpcorner.com/article/garbage-collection-internals-in-net-how-memory-management-really-works/
[4] Large object heap (LOH) on Windows - .NET | Microsoft Learn https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap
[5] Understanding .NET Garbage Collection https://www.telerik.com/blogs/understanding-net-garbage-collection
[6] Garbage collector config settings - .NET - Microsoft Learn https://learn.microsoft.com/en-us/dotnet/core/runtime-config/garbage-collector
[7] Garbage Collection and Performance - .NET | Microsoft Learn https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/performance
[8] GCSettings.LargeObjectHeapCompactionMode Property https://learn.microsoft.com/en-us/dotnet/api/system.runtime.gcsettings.largeobjectheapcompactionmode?view=net-10.0
[9] Background garbage collection - .NET | Microsoft Learn https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/background-gc
[10] Workstation vs. server garbage collection (GC) - .NET | Microsoft Learn https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/workstation-server-gc
[11] Memory management and patterns in ASP.NET Core | Microsoft Learn https://learn.microsoft.com/en-us/aspnet/core/performance/memory?view=aspnetcore-10.0
[12] Is a garbage collector (.net/java) an issue for real-time ... https://stackoverflow.com/questions/3559878/is-a-garbage-collector-net-java-an-issue-for-real-time-systems
[13] The Nerdy Magic of .NET Garbage Collection (That You ... https://vslive.com/blogs/news-and-tips/2025/12/the-nerdy-magic-of-net-garbage-collection-that-you-probably-dont-know.aspx
[14] What is garbage collection in .NET core? https://www.c-metric.com/blog/net-core-garbage-collection/
[15] Garbage Collection in .NET Explained Generations & ... https://www.youtube.com/watch?v=x8olNsMWT4w
[16] NET garbage collection - Microsoft Learn https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/
[17] CLR Inside Out: Large Object Heap Uncovered | Microsoft Learn https://learn.microsoft.com/en-us/archive/msdn-magazine/2008/june/clr-inside-out-large-object-heap-uncovered
