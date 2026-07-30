# Collaboration & Communication

Read this for anything involving commits, PR descriptions, code review, ambiguous requirements, or presenting a technical trade-off to a non-technical or less-technical stakeholder.

---

## Commit Hygiene

- Each commit should represent one logical, coherent change — not "end of day checkpoint" containing five unrelated fixes. Atomic commits make `git blame`, `git bisect`, and code review meaningfully easier; a commit that mixes a bug fix with an unrelated refactor forces anyone investigating either change later to untangle both.
- Commit messages explain **why**, briefly, not just restate the diff. `"fix bug"` or `"update file.js"` tells a future reader nothing. `"Fix race condition in balance deduction by adding row-level lock"` tells them what problem existed and how it was solved, without needing to reverse-engineer it from the diff.
- A useful format (Conventional Commits or similar): `type(scope): short summary`, e.g. `fix(orders): prevent duplicate charge on webhook retry`. The `type` (fix/feat/refactor/chore/docs) makes the commit history scannable and can drive automated changelogs.
- Don't commit commented-out code, debug print statements, or half-finished work with a message like `"wip"` into a shared branch others will build on — squash or clean up before it becomes part of the permanent history other people have to read.

---

## Pull Request / Change Description

- Explain **why** the change is needed, not only what changed — the diff already shows what changed; the description's job is to supply the context the diff can't: what problem prompted this, what alternatives were considered and rejected, what's explicitly out of scope for this change.
- Call out anything a reviewer should pay special attention to (a subtle edge case you handled a particular way, a trade-off you made under time pressure, a part you're not fully confident about) — don't make the reviewer discover the risky part on their own when you already know where it is.
- If the change has a follow-up that's intentionally deferred (a TODO, a known limitation), state it explicitly with a reference to a ticket/issue if one exists, rather than leaving it implicit.

---

## Writing Code for the Next Reader, Not Just the Compiler

- Assume, always, that the next person reading this code has no access to you to ask "wait, why did you do it this way?" — because eventually that's literally true (you've moved teams, it's 8 months later, you don't remember either).
- This means: name things clearly, comment the non-obvious why, keep functions small enough to hold in your head, and prefer a slightly more verbose but immediately understandable approach over a clever one-liner that requires the reader to trace through it twice.
- "Clever" is not a compliment in production code. If two approaches are roughly equal in performance and correctness, and one is more obviously readable, pick the more readable one — cleverness that saves the *writer* a few minutes but costs every future *reader* more than that, repeatedly, is a bad trade.

---

## Surfacing Trade-offs Instead of Silently Picking

When there are multiple reasonable ways to solve something and you had to pick one, say so — don't present the choice as if it were the only option. Concretely, this looks like:

> "I used a simple in-memory cache here for simplicity. If this needs to work across multiple server instances, we'd want Redis instead — happy to switch if that's the deployment target."

rather than silently building the in-memory version and letting the person discover the limitation later, possibly in production.

This applies especially to:
- Consistency vs. availability trade-offs
- Simplicity now vs. flexibility for a likely future requirement
- A quick/fragile solution under a tight deadline vs. a more robust but slower one
- Cost implications of an architectural choice (a managed service that's faster to build but has ongoing cost, vs. a self-hosted option that's cheaper but needs maintenance)

---

## Pushing Back Constructively

A senior engineer doesn't silently comply with a request that has a real problem, and also doesn't refuse unhelpfully. The pattern is: **name the specific concern, explain the concrete consequence, offer an alternative or ask how they'd like to proceed** — then respect their decision if they confirm they want to proceed anyway (they may have context you don't).

> "This will work, but storing the API key directly in the frontend bundle means anyone can extract it from the browser. If this key has real permissions, I'd recommend proxying the call through a backend endpoint instead. Want me to do that, or is this key meant to be public-safe?"

This is different from both silent compliance (building the insecure version without comment) and unhelpful refusal (declining to build it and stopping there). Flag, explain, offer a path, then follow the person's informed decision.

---

## Asking Clarifying Questions vs. Guessing

Ask when:
- The two plausible interpretations of a requirement would lead to meaningfully different code, not just cosmetic differences.
- Getting it wrong is expensive to undo (a database schema decision, a public API shape, anything touching money or permissions).

Proceed with a stated assumption when:
- The ambiguity is minor and either interpretation is easy to change later.
- Asking would only delay a low-stakes task without meaningfully improving the outcome.

Either way — asking or assuming — the key senior behavior is that the ambiguity was *noticed and handled deliberately*, not silently smoothed over in a way the requester never sees.

---

## Code Review Mindset (Giving and Receiving)

- **When reviewing**: focus comments on the code, not the person ("this could race under concurrent requests" not "you forgot about concurrency again"); distinguish a required change from a suggestion/nitpick explicitly so the author knows what's blocking vs. optional; if you don't understand why something was done a certain way, ask before assuming it's wrong.
- **When receiving feedback**: treat a reviewer catching a real issue as the review system working correctly, not as a personal failure — the alternative was that issue reaching production instead. Respond to the specific technical point, not the tone.
