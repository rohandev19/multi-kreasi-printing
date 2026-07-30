# Debugging & Root Cause Analysis

Systematic debugging is a distinct, learnable skill — not a talent some people have and others don't. This file is the methodology; apply it whenever something is broken and the fix isn't immediately obvious.

---

## The Scientific Method, Applied to Debugging

The core discipline that separates efficient debugging from flailing:

1. **Reproduce reliably first.** If you can't reliably make the bug happen, you can't reliably confirm it's fixed — you'll just be guessing. Find the minimal, consistent steps that trigger it before attempting any fix.
2. **Form a specific, falsifiable hypothesis** about the cause — not "something's wrong with the auth code" but "I think the token is expiring before the refresh logic runs because of a timezone mismatch between server and client."
3. **Design a test that would prove or disprove that specific hypothesis** — add a log statement that would confirm or deny the timezone theory, or a breakpoint at the exact comparison being made.
4. **Change one variable at a time.** If you change three things at once and the bug goes away, you don't actually know which change fixed it — which means you don't understand the bug, you got lucky.
5. **Verify the fix addresses the hypothesis, not just that the symptom disappeared.** A symptom disappearing is necessary but not sufficient evidence — confirm your understanding of *why* it disappeared matches what you predicted.

**The trap to avoid:** making a plausible-looking change, seeing the error go away, and moving on without confirming *why* it worked. This routinely either masks the real bug (which resurfaces later, differently) or coincidentally "fixes" it while leaving the actual root cause in place elsewhere in the code.

---

## Reading Stack Traces Properly

- Read from where **your own code** is first mentioned, not necessarily the very top of the trace — the top few frames are often deep inside a framework or library, and the actionable information is usually at the boundary where your code called into it.
- Distinguish the **throw site** (where the exception was raised) from the **root cause site** (where the actual mistake was made) — these are frequently different places. A null pointer exception on line 40 might be caused by a function on line 10 that should have validated its input and didn't.
- Async stack traces are frequently incomplete or misleading in many languages/runtimes, because the trace reflects the call stack *at the point the async operation was scheduled*, not the full causal chain that led to it — when debugging async code, add explicit context (a request ID, an operation name) rather than relying on the stack trace alone to tell the whole story.

---

## Binary Search Debugging

- **"When did this break?"** — use `git bisect` (or manually checking out commits at ever-narrower intervals) to find the exact commit that introduced a regression, rather than guessing based on what changes "seem related." This is dramatically faster than reasoning about a large diff, especially when the actual cause is unrelated to what you assumed.
- **"Where in this pipeline did it break?"** — for a long sequential process (a data pipeline, a multi-step request), comment out or bypass half the steps and confirm whether the bug still occurs; repeat on the remaining half. This narrows the search space logarithmically instead of linearly.

---

## Use a Real Debugger, Not Just Print Statements

Print/log-statement debugging (`console.log`, `dd()`, `print()`) is fine for a quick, cheap check — but shouldn't be the only tool reached for, especially for a non-trivial bug:

- **Breakpoints** let you pause execution and inspect the actual state of every variable at that exact moment, instead of guessing which values to print in advance.
- **Conditional breakpoints** (pause only when a specific condition is true, e.g. `userId === 4821`) are essential for bugs that only manifest for specific data, deep inside a loop over many iterations.
- **Watch expressions** let you track how a specific value changes across many steps without re-adding print statements repeatedly.
- **Step over / step into / step out** lets you control precisely how deep you follow execution — stepping into every function indiscriminately wastes time; stepping over what you already trust and into what you're suspicious of is the efficient path.
- Learning your language/IDE's actual debugger is a real time investment that pays for itself the first time it turns a 45-minute print-statement hunt into a 3-minute breakpoint session.

---

## Debugging Concurrency & Race Conditions

The hardest category, because the bug often won't reproduce reliably or reproduces differently under a debugger (which changes timing) than in production:

- Add **high-resolution, timestamped logs including a thread/request/correlation ID** at every point that touches the shared state in question — the goal is to reconstruct the actual interleaving of operations after the fact, since you often can't observe it live.
- Deliberately **reduce concurrency to isolate whether it's actually a race** — if forcing single-threaded/sequential execution makes the bug disappear, that's strong confirmation it's concurrency-related, narrowing where to look.
- Use language/runtime-specific tools built for this when available (race detectors, thread sanitizers) rather than only manual reasoning — some categories of race are genuinely very hard to spot by code review alone.
- Review **every** place that touches the shared state, not just the code path that happened to be running when the bug was observed — a race condition bug is a property of the interaction between two or more code paths, and the "obviously guilty" one you found first may not be the only contributor.

---

## Debugging Memory Issues

- For a suspected leak, use a memory profiler / heap snapshot comparison over time (take a snapshot, perform the suspected-leaking operation repeatedly, take another snapshot, diff them) rather than guessing based on code review alone — memory leaks are frequently counter-intuitive about which reference is actually the one preventing garbage collection.
- Common, language-spanning leak causes worth checking first: event listeners or subscriptions that are added but never removed, caches or collections that grow without any eviction policy, and closures that unintentionally capture a much larger scope than needed (holding a reference to an entire large object just to use one small field from it).

---

## Debugging Performance Issues

- **Profile before optimizing** — use a CPU profiler / flame graph to see where time is actually being spent, rather than optimizing the function that *seems* like it should be slow. The actual bottleneck is very often somewhere unexpected (a serialization step, a logging call, an N+1 query invisible from the application code alone).
- Distinguish algorithmic problems (wrong complexity class — fixable by changing the approach) from constant-factor problems (right approach, just needs a faster implementation of a specific step) — profiling data tells you which category you're in; guessing usually doesn't.

---

## Debugging in Production Safely

- Tag every request/job with a **correlation ID** that propagates through every service/log line it touches, so a single production issue can be traced end-to-end instead of manually correlating timestamps across separate log streams.
- Use **distributed tracing** where the system spans multiple services, to see the actual timing breakdown of a slow request across service boundaries, not just its total time.
- Isolate a suspected change with a **feature flag** or a **canary rollout** rather than toggling things directly in production and observing what happens — production debugging should be observation-driven, not experiment-in-place.
- Never make an untested, unreviewed change directly in a production environment "just to check" — the same discipline that applies to normal changes applies doubly under incident pressure, when mistakes are both more likely and more costly.

---

## Debugging Network Issues

- Use `curl -v` (or equivalent) to see the raw request/response, including headers and the TLS handshake, when an HTTP-level issue is suspected — this strips away any client library's abstraction and shows exactly what's actually being sent and received.
- Use the browser DevTools Network tab's timing waterfall to distinguish where time is actually going in a slow request: DNS lookup, TCP connect, TLS handshake, time-to-first-byte (server processing time), content download — each points to a different category of fix.
- Check DNS resolution as a separate step from application-level connectivity — an intermittent "can't connect" issue is sometimes actually a DNS resolution problem, not a network or application issue at all.

---

## Debugging Database Issues

- Use `EXPLAIN` / `EXPLAIN ANALYZE` (or the equivalent for your database) to see the **actual** query execution plan, rather than assuming an index is being used because it exists — a query can silently fail to use an available index for reasons that aren't obvious from the query text alone (a type mismatch, a function applied to the indexed column, the planner deciding a full scan is cheaper for the current data distribution).
- Check the slow query log for queries that are actually expensive in production, rather than only the ones that seem slow during local development with a small dataset — a query's performance characteristics can change substantially as data volume grows.

---

## The Rubber Duck Technique

Explaining the problem out loud, in detail, from the beginning — to a colleague, or literally to an inanimate object — routinely surfaces the flawed assumption you've been unconsciously skipping over. The value isn't in the listener; it's in the discipline of articulating the problem precisely enough that the gap in your own reasoning becomes visible to you.

---

## Root Cause vs. Symptom — Before Calling a Bug "Fixed"

A change that makes an error message go away is not the same as a fix, unless you can state *why* the original behavior was wrong and *why* this specific change corrects that reason. Before closing out a bug:

- [ ] Can you state, in one or two sentences, the actual mechanism that caused the bug (not just what the symptom was)?
- [ ] Does the fix address that mechanism, or does it just prevent the specific symptom you happened to observe?
- [ ] Could the same underlying mechanism cause a different symptom elsewhere in the codebase? If so, that's worth checking now, not after it resurfaces.
- [ ] Is there a test that would have caught this, and does one exist now? (Ties to the regression-strategy guidance in `qa-test-strategy.md`.)
