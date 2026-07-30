# Code Craftsmanship — Naming, Functions, Readability

Read this before writing or reviewing any non-trivial function, class, or module, in any language.

---

## Naming

Names are the primary interface between your intent and everyone else's understanding. Bad names cost more, cumulatively, than almost any other code quality issue, because every reader pays the tax every time.

- **Intention-revealing over short.** `daysUntilSubscriptionExpires` beats `d` or `days`. The extra characters cost nothing; the ambiguity costs real debugging time later.
- **Booleans read as a yes/no question.** `isActive`, `hasPermission`, `canRetry` — not `active`, `permission`, `retry` (which read as nouns/verbs, not conditions).
- **Functions are verbs, describing what they do, at the level of abstraction the caller cares about.** `calculateTotalPrice()`, not `total()` or `doStuff()`. If a function name needs "and" to describe it honestly (`validateAndSave`), it's very likely two functions pretending to be one.
- **Avoid encoding type or scope into the name** (Hungarian notation like `strName`, `arrItems`) — the type system or the language's tooling already tells you that; the name should carry semantic meaning instead.
- **Be consistent with the vocabulary already used in the codebase.** If existing code calls something a "customer," don't introduce "client" for the same concept in a new file — inconsistent vocabulary makes readers wonder if they're different things.
- **Avoid abbreviations unless they're domain-standard and universally understood in context** (`id`, `url`, `http` are fine; `usrCnt` or `calcTtl` are not).

---

## Function & Module Design

- **Single Responsibility, applied practically:** a function should have one reason to change. If you can describe what it does only using "and," or if testing it requires mocking five unrelated things, it's doing too much.
- **Prefer small functions composed together over one large function with internal sections marked by comments** (`// --- step 1 ---`, `// --- step 2 ---`) — those comment dividers are usually a sign the function should be split into named functions instead, which then serve as self-documenting steps.
- **Guard clauses over nested conditionals.** Instead of:
  ```javascript
  function processOrder(order) {
    if (order) {
      if (order.isValid) {
        if (order.items.length > 0) {
          // actual logic, 4 levels deep
        }
      }
    }
  }
  ```
  prefer:
  ```javascript
  function processOrder(order) {
    if (!order) return;
    if (!order.isValid) return;
    if (order.items.length === 0) return;
    // actual logic, 0 levels deep, and each precondition is independently readable
  }
  ```
- **Limit function parameters.** More than 3-4 positional parameters is a sign the function wants an options object/struct/DTO instead — it also protects against the classic bug of passing arguments in the wrong order when two parameters share a type (two strings, two booleans).
- **Pure functions where reasonably possible.** A function that only depends on its inputs and only affects its return value is trivially testable and reasoned about; side effects (mutating shared state, writing to disk, calling out to a database) should be visible at the call site, not hidden inside a function that looks pure from its name.

---

## Avoiding Premature or Wrong Abstraction

- **The Rule of Three:** don't extract a shared abstraction the first time you see similar code. Wait until you have three real instances of the duplication. Two similar-looking pieces of code are often coincidentally similar, not conceptually the same — abstracting them together couples things that should be allowed to evolve independently, which is more expensive to unwind later than the original duplication was.
- **Duplication is cheaper than the wrong abstraction.** A wrong abstraction forces every future change to either fight the abstraction or add a parameter/flag to special-case around it, which compounds over time into what's sometimes called a "kitchen sink" function nobody fully understands.
- **YAGNI (You Aren't Gonna Need It):** don't build a plugin system, a generic configuration layer, or a strategy pattern for a case that has exactly one implementation today and no confirmed second one coming. Build the thing that's needed; make it easy to extend later rather than extending it preemptively.

---

## Magic Numbers, Magic Strings

- Any literal number or string whose meaning isn't obvious from its immediate context should be a named constant — even if it's used only once.
  ```python
  # Junior
  if user.age >= 17:
      allow_signup()

  # Senior
  MINIMUM_SIGNUP_AGE = 17
  if user.age >= MINIMUM_SIGNUP_AGE:
      allow_signup()
  ```
  This isn't about DRY (it's used once either way) — it's about making the *meaning* of `17` explicit instead of forcing the reader to infer it from a domain rule they may not know.

---

## Comments

- **Comment the why, never the what.** The code already says what it does (that's the code's job); a comment should explain something the code cannot: why this approach was chosen over an obvious alternative, why a workaround exists, what business rule this encodes.
  ```javascript
  // Bad — restates the code
  // increment counter by 1
  counter += 1;

  // Good — explains the non-obvious why
  // Retry count starts at 1, not 0, because the first attempt
  // is not itself a "retry" per the vendor's rate-limit docs.
  retryCount += 1;
  ```
- **Delete commented-out code before presenting work as finished.** Version control already preserves history — commented-out code left in the file is noise that future readers have to figure out is safe to ignore.
- **Don't leave a TODO without an owner or a ticket/issue reference.** An unattributed TODO is a promise nobody made and nobody will keep.

---

## Formatting & Style Consistency

- Defer to the project's existing linter/formatter configuration (ESLint/Prettier, PHP-CS-Fixer, Black, gofmt, rustfmt, etc.) rather than personal preference — consistency across a codebase matters more than any individual stylistic choice being "better."
- If no formatter/linter config exists and the task is non-trivial, flag that as a gap worth fixing rather than silently picking your own style, which just adds a third or fourth style to a codebase that already lacks one.
- Match the indentation, quote style, and bracket placement already dominant in the file you're editing, even if it's not your personal preference — a file with two competing styles is worse than a file consistently using a style you wouldn't have picked.

---

## Quick Smell List (Signals Worth a Second Look)

- A function longer than roughly one screen without a very good reason
- More than 2-3 levels of nested conditionals or loops
- A boolean parameter that changes what a function does internally (`save(user, true)` — true for what?) — prefer two named functions or a named parameter/enum
- A function or class name containing "Manager," "Helper," "Util," or "Processor" with no more specific noun — often a sign the responsibility hasn't actually been thought through
- Copy-pasted blocks with only minor variable-name differences
- Catch blocks that are empty or just log-and-continue without a clear reason why swallowing the error is safe here
