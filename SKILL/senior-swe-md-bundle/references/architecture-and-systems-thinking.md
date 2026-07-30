# Architecture & Systems Thinking

Read this before designing a new module, API, database schema, or any change that other code will depend on.

---

## Separation of Concerns

- Keep three concerns distinguishable, even in a small project: **business logic** (the rules that make this application what it is), **data access** (how state is persisted/retrieved), and **transport/presentation** (HTTP controller, CLI command, queue consumer, UI component). They don't need separate folders in a tiny script, but a controller/handler function should orchestrate, not contain the actual business rules — that way the business logic can be tested without spinning up an HTTP server, and swapped to a new transport (e.g. adding a CLI alongside the API) without rewriting the rules.
- A common smell: a controller/route handler with 80 lines of conditional business logic directly inside it. The fix isn't always a full layered architecture — sometimes it's just extracting the logic into a plain function/class that the handler calls, which alone makes it independently testable.

---

## Designing Interfaces from the Caller's Side

- Before writing a function/class/endpoint, sketch how it will be *called*, not how it will be *implemented*. A signature that's convenient to implement but awkward to call (e.g. requiring the caller to know and pass in five flags in the right order) pushes complexity onto every future caller instead of absorbing it once, at the implementation.
- For APIs specifically: model the URL/endpoint around the resource (`/orders/123/items`), not the internal operation name (`/getOrderItemsByOrderId`). Resource-oriented design tends to compose better as the system grows (you can add `/orders/123/items/456` naturally; procedural names don't extend as cleanly).
- Return types/shapes should be predictable and consistent across similar endpoints/functions in the same system — a caller shouldn't have to remember that this one endpoint returns `null` on not-found while a sibling endpoint throws.

---

## Backward Compatibility & Shared Interfaces

- Treat anything consumed outside the immediate change you're making — a public API, a library's exported function, a database table another service reads directly, a message queue's payload schema — as significantly more expensive to change than a private internal function. Changing a private function's signature is a find-and-replace; changing a public API's response shape can break clients you don't control and may not even know about.
- When you do need to change a shared interface, prefer additive, backward-compatible changes (add a new optional field, add a new endpoint version) over breaking changes, unless the team has an explicit deprecation/migration process.
- If you're not sure whether something is "shared" or "private," treat it as shared and say so, rather than assuming it's safe to change freely.

---

## Data Modeling as a Design Decision

- Encode domain rules into the data model where reasonably possible, rather than only in application code. A `status` field that can logically only move `pending → processing → completed` is better modeled with an enum/constrained type and validated transitions than as a free-text string that any code path could set to anything.
- Normalize relational data to avoid the classic pitfalls (a single `status` column instead of a separate history/audit table when you actually need to know who changed what and when; storing computed/derivable values that then go stale instead of computing them from source data or explicitly caching with an invalidation strategy).
- Be deliberate about nullable vs required fields — a field that's nullable "just in case" often pushes null-checking responsibility onto every piece of code that reads it, forever, instead of being resolved once at the point data is created.

---

## Concurrency & Idempotency by Default

- For anything that mutates shared state — balances, inventory counts, counters, "has this webhook already been processed" — assume by default that the same operation can be triggered twice (network retries, double-clicks, at-least-once delivery queues) and design for that from the start, not as an afterthought once a bug report comes in.
- Two concrete default patterns worth reaching for:
  - **Idempotency keys**: accept a client-supplied unique key for a mutating operation, and short-circuit if that key has already been processed.
  - **Optimistic or pessimistic locking** on the specific row/resource being mutated when two concurrent requests could otherwise interleave incorrectly (classic example: two simultaneous requests both reading a balance of 100, both deducting 80, both succeeding, leaving a balance of -60 instead of correctly rejecting the second).
- Don't reach for a full distributed-lock or event-sourcing architecture by default — match the mechanism to the actual concurrency risk of the specific operation. A single-user preference update doesn't need the same treatment as a payment.

---

## Scalability: Right-Sized, Not Maximal

- Don't design for a scale that hasn't been asked for or reasonably implied (a script that processes a CSV of 200 rows once a month does not need to be architected like a high-throughput streaming pipeline).
- Do notice and flag the specific operations that are *obviously* going to be a problem at realistic scale even if not asked — an unindexed query on a table that will predictably grow to millions of rows, or an endpoint that loads an entire collection into memory when the collection is user-generated and unbounded.
- When flagging a scalability concern you're not fixing right now, be specific about the threshold where it becomes a real problem ("this is fine up to a few thousand rows; past that, the linear scan will start showing up in response times") rather than a vague "this might not scale."

---

## Dependency Direction

- Prefer depending on abstractions (interfaces, ports) at architectural boundaries that are genuinely likely to have multiple implementations or need test doubles (e.g. a payment gateway, an external email provider) — but don't introduce an interface with exactly one implementation and no plausible second one "for cleanliness." That's abstraction without a corresponding benefit, and it adds a layer of indirection every future reader has to navigate through.
- A practical heuristic: introduce the interface/abstraction when you write the *second* real implementation, or when you write the test double for the first one — not speculatively before either exists.
