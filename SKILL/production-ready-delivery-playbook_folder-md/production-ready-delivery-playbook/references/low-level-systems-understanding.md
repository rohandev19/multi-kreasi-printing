# Low-Level Systems Understanding

Senior-level debugging and performance judgment comes from having an actual mental model of what's happening beneath the framework/language abstraction — not just API familiarity. This file is that mental model, at the depth needed to reason about real production bugs, not a full computer architecture course. Read this alongside `debugging-and-root-cause-analysis.md` — each section here directly explains a category of bug covered there.

---

## Memory: Stack vs. Heap

- **The stack** holds fixed-size, short-lived data tied to function calls (local variables, return addresses) — allocation and cleanup are automatic and extremely cheap (just moving a pointer), and memory is reclaimed the instant a function returns.
- **The heap** holds dynamically-sized or longer-lived data (objects, anything that needs to outlive the function that created it) — allocation is more expensive, and cleanup depends on the language: manual (C/C++), reference-counted (Swift, Python's primary mechanism), or a tracing garbage collector (JavaScript, Java, Go, PHP, C#).
- **Why garbage collection pauses happen:** a tracing GC periodically has to walk the object graph to find what's still reachable from active references and reclaim what isn't — this work competes with your actual program for CPU time, which is why GC-heavy languages can have occasional latency spikes under memory pressure, distinct from a genuine performance bug in your code.
- **Common, language-spanning leak causes** (this directly explains the memory-debugging section in the debugging file): event listeners/subscriptions added but never removed keep their captured scope alive indefinitely; unbounded caches/collections that grow without eviction; closures that capture more of their enclosing scope than they actually use, keeping large objects alive via one small reference.

---

## Concurrency: What's Actually Happening

- **Process vs. thread:** a process has its own isolated memory space (safer, but communication between processes is expensive — has to go through the OS); a thread shares memory with other threads in the same process (cheap communication, but that shared access is exactly what creates race conditions if not synchronized).
- **What a race condition actually is, mechanically:** two or more threads/requests read a piece of shared state, each independently compute a new value based on what they read, and both write back — if the operations interleave, one write can silently overwrite the effect of the other, producing a result that reflects neither operation happening atomically. This is *why* "read balance, then write balance minus amount" is unsafe under concurrency without a lock or atomic operation, even though each individual line of code is correct in isolation.
- **Mutex/lock/semaphore, conceptually:** a mutex ensures only one thread can execute a critical section at a time (mutual exclusion); a semaphore generalizes this to allow up to N concurrent accesses. Both trade some concurrency for correctness — holding a lock too broadly hurts performance, too narrowly reintroduces the race.
- **The JavaScript/Node event loop specifically** (since it confuses even experienced developers coming from thread-based languages): JS execution itself is single-threaded — there's exactly one call stack. Asynchronous operations (I/O, timers, promises) are handled by the runtime and their callbacks are queued, not executed immediately. **Microtasks (Promise callbacks, `async/await` continuations) are drained completely before the next macrotask (a `setTimeout` callback, an I/O event) runs** — this ordering is the direct explanation for a huge fraction of "why did this run in an order I didn't expect" confusion in JS debugging.

---

## Networking: What's Actually Happening Under `fetch()`

- **TCP three-way handshake:** before any HTTP data flows, the client and server exchange SYN → SYN-ACK → ACK to establish a connection — this is a full network round-trip spent before your request even starts, which is part of why connection reuse (keep-alive) matters for performance.
- **TLS handshake (for HTTPS):** an additional negotiation on top of TCP to establish an encrypted channel — historically another 1-2 round-trips (modern TLS 1.3 reduced this), which is why the very first HTTPS request to a new host is slower than subsequent ones on the same connection.
- **HTTP/1.1 vs HTTP/2 vs HTTP/3:** HTTP/1.1 traditionally opens multiple parallel connections to work around head-of-line blocking (one slow request blocking others on the same connection); HTTP/2 introduced multiplexing (many requests over one connection, no head-of-line blocking at the HTTP layer); HTTP/3 (QUIC, over UDP instead of TCP) removes head-of-line blocking at the transport layer too, which matters specifically on lossy/mobile networks where a single dropped packet under HTTP/2 can still stall unrelated streams.
- **DNS resolution chain:** browser cache → OS cache → configured resolver (often the ISP's or a public one like a well-known `1.1.1.1`/`8.8.8.8`) → root servers → TLD servers → the domain's authoritative server. A slow or failing step anywhere in this chain produces a connectivity symptom that looks identical to a server-side problem from the application's perspective — which is why debugging network issues checks DNS as a distinct step (see the debugging file).

---

## Database Internals: What Happens When a Query Runs

- **Parse → plan/optimize → execute.** The database parses your SQL into an internal representation, the query planner/optimizer decides *how* to actually retrieve the data (which index, if any, to use; what order to join tables in), and only then does it execute that plan. Two queries that look equally reasonable can have very different plans depending on data distribution and available indexes — which is why reading the actual plan (`EXPLAIN`) beats assuming.
- **What an index actually is:** conceptually, a sorted structure (commonly a B-tree) that lets the database find matching rows without scanning every row in the table — the cost of a lookup goes from proportional to table size (full scan) to roughly logarithmic (tree traversal). The trade-off: every write to an indexed column also has to update the index, so indexes speed up reads at a real cost to writes.
- **Why composite index column order matters:** a composite index on `(status, created_at)` can efficiently serve a query filtering on `status` alone, or on `status` and `created_at` together, but generally cannot efficiently serve a query filtering on `created_at` alone — the index is only usable as a prefix match, the same way a phone book sorted by (last name, first name) doesn't help you find someone by first name alone.
- **Transaction isolation levels, briefly:** they control what concurrent transactions are allowed to see of each other's uncommitted or recently-committed changes — a stricter level (e.g. `SERIALIZABLE`) gives stronger correctness guarantees for concurrent access at the cost of more locking/contention; a looser level (e.g. `READ COMMITTED`) allows more concurrency but permits certain anomalies (like a value changing between two reads in the same transaction). Know which your database defaults to and whether that's actually the right choice for the specific operation.

---

## Browser Rendering & JS Engine Internals

- **Critical rendering path, in more depth than a first-pass overview:** HTML parses into the DOM incrementally as it streams in; CSS parses into the CSSOM (and CSS is render-blocking by default, because the browser can't safely paint without knowing the final styles); DOM + CSSOM combine into a render tree (only visible nodes); layout calculates exact position/size of every element; paint fills in pixels.
- **Reflow vs. repaint, and why the distinction matters for performance:** a **repaint** (a color change, for instance) only requires redrawing pixels. A **reflow/layout** (a size or position change) requires recalculating geometry for the affected element *and potentially everything after it in the document* — this is why animating `width`/`height`/`top`/`left` is expensive and animating `transform`/`opacity` is cheap: the latter can be handled purely by the compositor without triggering layout at all.
- **JS engine execution, briefly:** source is parsed into an AST, initially executed via a fast-to-produce but slower-to-run interpreted bytecode, and "hot" code paths (run many times) get compiled just-in-time into optimized machine code — which is part of why a function's performance can genuinely change partway through a program's execution as the engine's optimizer kicks in.
- **The call stack + event loop model** described in the Concurrency section above applies directly in the browser too — a long-running synchronous JS function blocks the single main thread entirely, which is why a heavy synchronous computation makes the whole page freeze (can't process clicks, can't repaint) until it finishes, directly explaining the INP (Interaction to Next Paint) performance concern covered in `frontend-engineering.md`.

---

## Operating System Basics Worth Having

- **Process scheduling, lightly:** the OS gives each runnable process/thread a slice of CPU time and switches between them (context switching) to create the illusion of parallelism on a limited number of cores — context switching itself has a real, non-zero cost, which is part of why having far more threads than CPU cores doesn't scale linearly and can even slow things down past a point.
- **Blocking vs. non-blocking I/O:** a blocking I/O call (traditional file/network read) ties up the calling thread until the operation completes; a non-blocking model (Node.js's core design) lets a single thread issue an I/O operation and move on to other work, getting notified when it completes — this is *why* Node can handle many concurrent I/O-bound connections efficiently with one thread, but why a single expensive synchronous CPU-bound computation is disproportionately damaging to it (it blocks the one thread everything else depends on).
- **Filesystem I/O basics:** disk I/O (even fast SSD) is orders of magnitude slower than memory access — buffering (accumulating writes and flushing them together) is why writing one large chunk is faster than many small writes, and is the reason behind patterns like batching log writes or database commits rather than flushing after every single operation.

---

## How This Connects Back to Debugging

Each section above is the "why" behind a category of bug in the debugging file: the memory model explains leaks, the concurrency model explains races and unexpected JS execution order, the networking model explains intermittent timeouts and DNS-related flakiness, database internals explain "this query was fast in testing and slow in production," and browser internals explain jank and slow interactivity. When a bug doesn't make sense at the application-code level, the explanation is very often one layer down, here.
