# Resilience — Error Handling, Observability, Performance, Testing

Read this before finalizing any code that runs unattended, handles external input, or touches shared state.

---

## Error Handling Philosophy

- **Fail loudly and specifically in development; fail safely and informatively in production.** A bare `catch {}` or `except: pass` that silently swallows an error is one of the most expensive habits in software — it converts a debuggable failure into a mystery that surfaces somewhere else, much later, with no trace back to the cause.
- **Errors should carry context, not just a message.** "Failed to update user" tells you nothing at 3am. "Failed to update user 48213: balance would go negative (current: 500, requested deduction: 800)" tells you exactly what to look at. Include the relevant IDs, the operation being attempted, and the specific reason, wherever the language/framework makes that reasonably possible.
- **Distinguish expected failures from unexpected ones**, and handle them differently. A user submitting invalid input is expected and should produce a clean, specific validation error. A database connection dropping mid-transaction is unexpected and should be logged with full context and surfaced as a generic failure to the end user (don't leak internals like table names or stack traces to a public API response).
- **Don't catch an exception you don't know how to handle.** Catching broadly just to log and re-throw the exact same thing adds noise without adding value — let it propagate to a layer that actually knows what to do about it (retry, fallback, alert, fail the request).
- **Retry only operations that are actually safe to retry** (idempotent operations, or ones explicitly designed with an idempotency key) — blindly retrying a non-idempotent operation (e.g. "charge card" without a dedupe key) can cause the exact bug the retry was meant to protect against.

---

## Observability: Logging & Traceability

- Use the stack's structured/leveled logging facility (not scattered `print`/`console.log`/`var_dump`/`dd()` left in by accident) — leveled logging (`debug`/`info`/`warn`/`error`) lets the right amount of noise show up in each environment.
- Log at meaningful boundaries: when an external call is made and when it returns/fails, when a background job starts and finishes, when a business-significant state change happens (order created, payment processed, account locked) — not every single line of internal logic.
- Structured logs (key-value fields, not just a free-text sentence) are dramatically easier to search and alert on in any real logging system — log `{event: "payment_failed", order_id: 123, reason: "insufficient_funds"}`-shaped data where the tooling supports it, rather than only a formatted string.
- Never log secrets, full credit card numbers, passwords, or raw auth tokens — even at debug level, because debug logs have a way of ending up somewhere they shouldn't.

---

## Performance Judgment

- **Measure before optimizing** — don't spend effort micro-optimizing a code path that isn't actually a bottleneck; profile or reason about where time/resources are actually spent first.
- **But don't default to an obviously bad complexity class just because it's the first thing that comes to mind.** An O(n²) nested loop over a collection that will realistically grow, or an N+1 query pattern, isn't "premature optimization" to avoid — it's usually not meaningfully harder to write the correctly-shaped version (a hash map lookup instead of a nested scan, an eager-loaded query instead of one query per row) than the naive one, so there's no real trade-off being made by doing it right the first time.
- Be specific about *where* an inefficiency matters: a slow one-off admin script run once a week is a non-issue; the same inefficiency inside a hot request path serving thousands of requests per minute is not.
- Consider memory as well as time complexity — loading an entire, potentially-unbounded dataset into memory (e.g. `SELECT *` with no limit, or reading a whole file into a string before processing) is a common source of production incidents that don't show up in local testing with small data.

---

## Failure Mode Checklist

Before considering a piece of code that touches the network, a database, a queue, or shared state "done," explicitly consider (even if you decide not to fully handle all of them — but say which ones you're consciously deferring):

- [ ] What happens if an external call (API, database, queue) times out?
- [ ] What happens if an external call returns an unexpected/malformed response?
- [ ] What happens if this operation is triggered twice (double-click, retry, at-least-once delivery)?
- [ ] What happens if two instances of this run concurrently and touch the same resource?
- [ ] What happens on empty input? Null input? A collection with one item vs. a million?
- [ ] What happens if the disk/queue/rate limit is full or exceeded?
- [ ] If this fails partway through a multi-step operation, is the system left in a consistent state, or a half-completed one?

---

## Testing Philosophy

- **Test behavior, not implementation.** A test that asserts *what* the code does from the outside (given this input, expect this output/side-effect) survives refactoring. A test that asserts *how* it does it internally (mocking every internal function call and checking they were called in order) breaks on every refactor even when behavior is unchanged — this trains people to avoid refactoring, which is the opposite of what tests should encourage.
- **Deliberately test the unhappy path.** Given a function, ask: what's the empty case, the invalid case, the unauthorized case, the "resource doesn't exist" case, the boundary/off-by-one case? Junior test suites cover the happy path exhaustively and stop there; senior test suites spend real effort on the paths where actual bugs live.
- **Tests are documentation.** Someone should be able to read the test names and bodies and understand what the code is supposed to do without reading the implementation. A test named `test_case_1` or `test_it_works` fails this job; `test_transfer_fails_when_balance_is_insufficient` succeeds at it.
- **Don't chase coverage percentage as a goal in itself.** 100% line coverage with tests that don't assert anything meaningful (or that just re-execute the code without checking the right things) is worse than lower coverage with tests that actually catch regressions — coverage is a signal, not the target.
- If you're deliberately not writing tests for a given piece of code (quick prototype, throwaway script, task explicitly scoped to "just get this working"), say so explicitly instead of presenting it in a way indistinguishable from tested, production-intended code.
