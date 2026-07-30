# QA & Test Strategy — Organizational Level

Read this during Phase 6 (and ideally referenced as early as Phase 2-3, since risk assessment should inform design). This covers test *strategy* — planning what to test and why; specific unit-testing craft (writing a good individual test) lives in `senior-software-engineer/references/resilience-and-operations.md`.

---

## Risk-Based Test Planning

Not everything deserves the same testing investment — the senior QA skill is allocating effort where it actually matters:

- Identify the highest-risk areas first: anything touching money, permissions/access control, data deletion, or irreversible actions gets the most rigorous coverage. A cosmetic settings page that's annoying-but-recoverable if broken gets proportionally less.
- Ask "what's the blast radius if this breaks?" for each feature — a bug in a rarely-used admin report is bad; a bug in the checkout flow affecting every customer is a different order of severity, and test investment should reflect that difference, not be uniform.
- Revisit risk assessment when a feature's usage pattern changes — a feature built as "internal tool, low risk" that later gets exposed to end users needs its test coverage re-evaluated, not left at its original assumptions.

---

## The Test Pyramid, Applied Practically

- **Unit tests** (many, fast, cheap): verify individual functions/components in isolation. Fast enough to run on every save/commit; should form the bulk of the suite.
- **Integration tests** (fewer, slower): verify that pieces work together correctly (an API endpoint through to the database, a component with its real data-fetching hook) — catch the bugs that unit tests, which mock their dependencies, structurally cannot catch (a wrong SQL join, a mismatched API contract between frontend and backend).
- **End-to-end tests** (fewest, slowest, most brittle): verify a real user flow through the actual, deployed-like system. Reserve these for the most critical flows (signup, checkout, core feature) — an E2E suite that tries to cover everything becomes slow, flaky, and eventually ignored when it fails, which defeats its purpose.
- A common anti-pattern worth actively avoiding: an "ice cream cone" shape (mostly E2E tests, few unit tests) is slow to run, flaky, and painful to maintain — if you inherit a test suite shaped like this, treat rebalancing it toward the pyramid as a real priority, not a nice-to-have.

---

## What to Automate vs. What to Test Manually/Exploratorily

- Automate anything that's run repeatedly, has a clear pass/fail criterion, and covers a stable (not constantly-changing) part of the system — this is where automation pays for itself many times over.
- Reserve manual/exploratory testing for: new features where the "right" behavior is still being discovered, subjective quality (does this actually feel good to use), and edge cases a scripted test wouldn't think to check.
- **Exploratory testing is a real skill, not just "clicking around."** Time-box a session with a specific charter ("try to break the checkout flow using unusual input and rapid actions") and take notes on what was tried and found — undirected exploratory testing tends to just re-cover the same happy paths automated tests already check.

---

## Bug Report Quality

A bug report that can't be acted on wastes more time than it saves. A good report includes:

- **Exact steps to reproduce**, starting from a known state (not "sometimes when I use search it breaks" — the specific search term, the specific account/data state, the specific sequence of actions).
- **Expected vs. actual behavior**, stated explicitly and separately — "I expected X to happen, but Y happened instead" removes ambiguity about what's actually being reported as wrong.
- **Environment/context**: browser/OS/device, account/role used, whether it's reproducible consistently or intermittently.
- **Severity assessed honestly**: distinguish "this crashes checkout for everyone" from "this label is misaligned on a rarely-visited page" — both are real bugs, but conflating their urgency wastes the team's prioritization effort.
- If a bug can't be reliably reproduced, say so explicitly rather than closing it or reporting it as if it were consistent — intermittent bugs (often concurrency-related) are frequently the most important ones, precisely because they're hard to catch.

---

## Regression Strategy

- Every confirmed bug that gets fixed should get a corresponding test that would have caught it — this is what actually prevents the same bug from resurfacing after a future refactor, rather than relying on manual memory of "oh right, we need to check that."
- Maintain a regression suite for critical flows that runs on every change (via CI), not just before a release — catching a regression the day it's introduced is dramatically cheaper than catching it during a pre-release test pass, when it could be tangled up with many other changes.
- Periodically review and prune the regression suite — tests for features that no longer exist, or duplicate coverage that doesn't add real signal, add maintenance cost without adding protection.

---

## Non-Functional Testing (Often Skipped, Often Where Real Incidents Come From)

- **Performance/load testing**: verify the system behaves acceptably under realistic (and somewhat above realistic) load, not just with one test user in a quiet environment — many production incidents are "it worked in every test, then broke under real traffic."
- **Security testing coordination**: QA doesn't need to be a security specialist, but should coordinate with the threat model from `cyber-blue-team-defense.md` to make sure the negative/adversarial cases (invalid auth, attempting to access another user's resource, malformed/oversized input) are part of the test plan, not just positive-case testing.
- **Accessibility testing**: verify with an actual keyboard-only pass and a screen reader spot-check, not just an automated accessibility linter — automated tools catch maybe a third of real accessibility issues; the rest need a human actually trying to use the interface that way.
- **Data integrity testing**: for anything involving migrations or bulk data operations, verify the data itself afterward (row counts, spot-checked values, constraint integrity), not just that the operation "completed without error."

---

## Advanced Test Techniques (Reach for These on High-Stakes Code)

- **Mutation testing**: a tool deliberately introduces small changes ("mutants") into your code — flips a `<` to `<=`, changes a `+` to `-` — and checks whether your test suite actually fails. A test suite with high line coverage but low mutation-kill-rate means the tests execute the code without actually asserting the right things — this is the most rigorous way to answer "are my tests actually checking anything?" rather than just "do my tests run every line?"
- **Property-based testing**: instead of writing individual example inputs, you state a property that should hold for *all* valid inputs (e.g. "sorting a list, then sorting it again, should give the same result as sorting it once" — idempotency; "decoding what you just encoded should give back the original value"), and the tool generates many random/edge-case inputs to try to find a counterexample. Excellent at finding edge cases a human wouldn't think to write by hand.
- **Fuzz testing**: feed large volumes of automatically generated, malformed, or random input into a function/parser/endpoint and watch for crashes, hangs, or memory issues — a standard, defensive QA technique for finding robustness bugs in your own input-handling code before they're found in production (or by an attacker). Especially valuable for anything that parses untrusted input (file uploads, API request bodies, user-supplied URLs).
- **Contract testing**: for a frontend/backend split (or any two services with an API boundary), a contract test verifies that both sides agree on the shape of requests/responses independent of a full end-to-end test — catches a backend change that breaks the frontend's assumptions (or vice versa) without needing both running together, and runs much faster than a full E2E suite.
- **Chaos engineering** (for systems mature enough to warrant it): deliberately inject failure (kill a service instance, add artificial network latency, simulate a dependency timeout) in a controlled way to verify the system's resilience assumptions actually hold, rather than only being tested in the postmortem of a real incident.

---

## Diagnosing Flaky Tests (Don't Just Retry Until Green)

A test that intermittently fails without a code change is usually not "flaky" in a meaningless sense — it's revealing something real, often a race condition, a test-order dependency, or reliance on unmocked real time/network:

- Resist the instinct to add a retry and move on — that hides the signal instead of investigating it, and the same underlying issue (frequently a genuine concurrency bug) may exist in production too, just harder to notice there.
- Common real causes: shared mutable state between tests that aren't properly isolated/reset, reliance on wall-clock time without mocking it, asynchronous operations not properly awaited before assertions run, and tests that depend on a specific execution order that isn't guaranteed.
- Track flaky tests explicitly (don't just let them accumulate as "known flaky, ignore") — a growing set of ignored-because-flaky tests is a test suite quietly losing its ability to catch real regressions.

---

## Release Readiness / Go-No-Go Criteria

Define explicit, agreed-upon criteria before a release, not judgment calls made under deadline pressure in the moment:

- What severity of known, open bug blocks a release vs. can ship with a documented workaround?
- Has the regression suite passed, and has anything genuinely new/risky gotten a dedicated exploratory pass?
- Is there a rollback plan and has someone explicitly confirmed it's ready, tying back to `devops-and-deployment.md`?
- Has UAT (user acceptance testing) happened where relevant stakeholders confirm the built feature actually solves the Phase 1 problem, not just that it technically works as specced?

A release readiness checklist that's agreed on in advance protects the team from the common failure mode of quietly lowering the bar under deadline pressure without anyone explicitly deciding to.
