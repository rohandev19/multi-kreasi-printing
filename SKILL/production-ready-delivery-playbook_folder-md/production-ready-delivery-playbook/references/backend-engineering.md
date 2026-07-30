# Backend Engineering — API, Data, Scale

Read this during Phase 3-4 (architecture and backend implementation). This covers backend-*specific* strategy; general error handling and code craftsmanship live in the `senior-software-engineer` skill.

---

## API Design as a Contract, Not an Implementation Detail

- Design the API around resources and the caller's actual use cases, not around your database schema or internal function names — the API contract will outlive and diverge from whatever implementation sits behind it, and treating it as a real contract (versioned, documented, deliberately stable) prevents painful breakage later.
- Be consistent about response shape, error format, and pagination style across all endpoints in the same system. A client having to remember "this endpoint 404s on not-found, but that one returns `null` with a 200" is a design defect, not a minor inconsistency.
- Use HTTP status codes and methods for what they actually mean (idempotent `GET`/`PUT`, non-idempotent `POST`, `PATCH` for partial updates, correct 4xx for client error vs 5xx for server error) — this isn't pedantry, it's what lets clients, proxies, and monitoring tools behave correctly automatically (e.g. retry logic that assumes `GET` is safe to retry, but a `POST` might not be).
- Version breaking changes deliberately (URL path version, header, or a documented deprecation window) rather than silently changing a live endpoint's contract.
- Document the API as you build it (OpenAPI/Swagger or equivalent), not as an afterthought — an API without accurate, current documentation effectively doesn't have a stable contract, because every consumer has to reverse-engineer it from behavior.

---

## Data Modeling & Database Design

- Model the schema around the actual domain rules and query patterns, not just "what fields does this form have." A `status` that can only move through a defined set of transitions deserves an enum and validation, not a free-text column any code path can set arbitrarily.
- Normalize to avoid update anomalies, but denormalize deliberately (and document why) when a specific, measured performance need justifies it — don't denormalize preemptively "for speed" before there's evidence it's needed.
- Index based on actual query patterns (`WHERE`, `JOIN`, `ORDER BY` columns on tables that will grow) — and understand the write-cost trade-off of every index added, so indexing isn't a reflexive "add index to everything."
- Plan migrations to be reversible and safe to run against a live, populated database — a migration that locks a large table for a long write operation is a production incident waiting to happen; prefer strategies that add nullable columns first, backfill in batches, then tighten constraints, over a single blocking schema change.
- Decide your consistency model deliberately for anything involving money, inventory, or any value where two concurrent writes could conflict — see the Concurrency section in `senior-software-engineer/references/architecture-and-systems-thinking.md` for the idempotency-key/locking patterns; this file assumes that judgment and focuses on the data-layer mechanics.

---

## Caching Strategy

- Cache invalidation is a genuinely hard problem — before adding a cache, be explicit about what invalidates it (time-based expiry, event-based invalidation on write, or manual purge) rather than adding a cache and hoping staleness "won't matter."
- Cache at the layer that gives the most benefit for the least risk: a CDN/edge cache for static or rarely-changing public content, an application-level cache (Redis/Memcached) for expensive computed or frequently-read data, and be more cautious caching anything user-specific or permission-sensitive (a stale cache serving another user's data is a security bug, not just a UX bug).
- Set a sane default TTL even on "invalidate on write" caches, as a safety net against a missed invalidation path causing indefinitely stale data.

---

## Asynchronous Processing & Queues

- Move genuinely slow or unreliable operations (sending email, calling a third-party API, generating a report, image/video processing) off the synchronous request path and into a background job/queue — a user shouldn't wait on a request thread for something that doesn't need to block their response.
- Design queue consumers to be idempotent by default (see the idempotency-key pattern) since most queue systems provide at-least-once delivery, meaning the same job can and will run more than once eventually.
- Have an explicit strategy for failed jobs: retry with backoff for transient failures, dead-letter queue for jobs that keep failing, and alerting when the dead-letter queue is growing — a silently-failing background job is one of the hardest production issues to notice, because nothing in the user-facing flow indicates anything went wrong.

---

## Rate Limiting & Abuse Protection

- Rate limit at the API layer by default for any public or authenticated endpoint that does meaningful work per request — not just to prevent malicious abuse, but to protect the system from a legitimate client's bug (a retry loop with no backoff) taking the service down.
- Apply different limits appropriate to the endpoint's cost (a search endpoint hitting the database differently than a static content endpoint) rather than one blanket limit for the whole API.
- Return the rate-limit status in response headers (remaining requests, reset time) so well-behaved clients can self-throttle instead of hitting the limit repeatedly.

---

## Service Boundaries: Monolith-First Judgment

- Default to a well-organized monolith (clear internal module boundaries, but one deployable unit) unless there's a concrete, current reason for separate services (a genuinely independent scaling need, a separate team owning a bounded context, a hard technology requirement). Microservices solve organizational and scaling problems at the cost of significant operational complexity (network calls where function calls used to be, distributed tracing, eventual consistency) — that cost isn't worth paying speculatively.
- If/when splitting into services, split along real bounded contexts (a domain boundary with its own data and rules) rather than technical layers (a "database service," a "business logic service") — the latter tends to produce chatty, tightly-coupled services that have most of the downsides of microservices with few of the benefits.
- Whatever the boundary, keep the contract between services (API, message schema) as deliberately designed and versioned as a public API, because internal services have a way of becoming just as hard to change as external ones once other things depend on them.

---

## Observability from the Backend Side

- Emit metrics for the things that actually indicate system health: request latency (p50/p95/p99, not just average — averages hide the slow tail that users actually experience), error rate, queue depth, database connection pool saturation.
- Structured logs should include a correlation/request ID that ties together every log line produced while handling one request or job, so a production issue can be traced end-to-end instead of grepping through interleaved logs from concurrent requests.
- Health check endpoints should verify the things that would actually indicate the service can do its job (can it reach the database, is the queue connection alive) — not just "the process is running and can return 200."

---

## Graceful Degradation

- Identify which dependencies are critical (the request genuinely cannot succeed without them) versus optional (a recommendation engine, an analytics call) — and make sure a failure in an optional dependency doesn't take down the whole request. A product page shouldn't 500 because the "customers also bought" widget's service is down.
- Set explicit timeouts on every external call (database, third-party API, internal service) — a call with no timeout means a slow dependency can exhaust your own service's resources (connection pool, thread pool) and take down something that was otherwise healthy.
