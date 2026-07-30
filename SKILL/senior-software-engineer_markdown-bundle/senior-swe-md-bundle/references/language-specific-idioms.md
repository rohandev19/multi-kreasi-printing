# Language & Framework Idioms

The principles in the main SKILL.md and the other reference files are language-agnostic. This file covers the *idiomatic expression* of those principles per language/framework — write code the way an experienced engineer working daily in that specific language would, not a direct translation of patterns from a different language.

---

## JavaScript / TypeScript

- Prefer `const`/`let` over `var` always; prefer strict equality (`===`/`!==`) over loose.
- In TypeScript, avoid `any` as an escape hatch — if the type is genuinely unknown, use `unknown` and narrow it, which forces an explicit check instead of silently allowing anything through.
- Prefer `async/await` over raw `.then()` chains for anything beyond a single call — it reads closer to synchronous logic and makes error handling with `try/catch` natural.
- Destructure function parameters for objects with more than 2-3 properties rather than accessing `props.x`, `props.y` repeatedly.
- In React specifically: keep components small and composed; derive state from props/other state where possible instead of duplicating it into `useState` (duplicated state is a common source of "why isn't this updating" bugs); always include the real dependency array for `useEffect` rather than suppressing the linter warning.
- Avoid mutating arrays/objects in place when working with React state (`state.push(...)`) — always produce a new reference so React's change detection works correctly.
- Use optional chaining (`?.`) and nullish coalescing (`??`) instead of verbose manual null checks, but don't let a long chain of `?.` silently swallow a bug that should actually be surfaced.

---

## PHP / Laravel

- Use Eloquent's query builder or the ORM for anything reasonably expressible in it — reach for raw `DB::` queries only when the ORM genuinely can't express the query efficiently, and parameterize even raw queries (`DB::select('... where id = ?', [$id])`), never string-interpolate.
- Use Form Requests for validation rather than validating manually inside controllers — keeps validation rules discoverable and reusable.
- Use Eloquent relationships and eager loading (`with()`) deliberately; watch for N+1 patterns especially inside Blade views or API Resource transformations that access relationships in a loop.
- Prefer typed properties and return types (PHP 8+) over relying on docblocks alone — the type system catches mistakes docblocks can't.
- Keep business logic out of Controllers and out of Eloquent Model classes once a model accumulates non-trivial logic beyond relationships/scopes/casts — extract to a Service or Action class, testable independent of the framework's request lifecycle.
- Use Laravel's built-in features (Form Requests, API Resources, Policies for authorization, Jobs/Queues for async work) rather than hand-rolling equivalents — idiomatic Laravel leans on the framework, not around it.

---

## Python

- Follow PEP 8 for formatting (or defer to the project's `black`/`ruff` config); use `snake_case` for functions/variables, `PascalCase` for classes.
- Prefer list/dict comprehensions over manual loops for simple transformations, but drop back to an explicit loop once the comprehension needs more than one condition or becomes hard to read on one line — clever nested comprehensions are a readability tax.
- Use context managers (`with open(...) as f:`) for anything with a resource that needs cleanup (files, connections, locks) rather than manual open/close with a `try/finally`.
- Use type hints for function signatures on anything non-trivial — they double as documentation and catch real bugs with a type checker (`mypy`/`pyright`).
- Prefer explicit exception types over bare `except:` — a bare except catches `KeyboardInterrupt` and `SystemExit` too, which is almost never intended.
- Use dataclasses or Pydantic models for structured data instead of passing around raw dicts with string keys, once a "shape" of data is used in more than one place.

---

## Go

- Handle errors explicitly at each call site (`if err != nil { ... }`) — this is idiomatic Go, not boilerplate to work around; don't try to introduce exception-style control flow that fights the language.
- Keep interfaces small and defined at the point of use (consumer-defined interfaces), not large interfaces defined alongside the implementation — Go's implicit interface satisfaction is designed for this.
- Use named return values sparingly, only when they genuinely improve readability (e.g. documenting what a function returns), not as a way to avoid writing `return`.
- Prefer composition over embedding-as-inheritance when the goal isn't literally "is-a" semantics.
- Use goroutines and channels deliberately for actual concurrency needs, not as a default — a goroutine without a clear plan for how it terminates and how errors propagate back is a common source of leaks and silent failures.

---

## Java

- Favor composition over deep inheritance hierarchies; prefer interfaces over abstract classes when there's no shared implementation to provide.
- Use `Optional<T>` for return types where "might not have a value" is a real, expected case — don't return `null` for that case and don't use `Optional` for fields or parameters (it's designed for return types).
- Keep classes focused (Single Responsibility) — a class named `...Manager` or `...Helper` with a large, unrelated set of public methods is a sign responsibilities have been dumped together rather than designed.
- Use the standard collection interfaces (`List`, `Map`, `Set`) in signatures rather than concrete implementations (`ArrayList`, `HashMap`), so callers aren't coupled to an implementation detail.
- Prefer immutable objects (final fields, no setters) for value-like data — reduces an entire class of bugs from shared mutable state.

---

## SQL (Any Dialect)

- Never build a query by string-concatenating user input — always parameterized queries/prepared statements, regardless of the language driving the query.
- Select only the columns actually needed, not `SELECT *`, both for performance and to avoid accidentally exposing columns that get added later without anyone reviewing whether they should be in this result set.
- Add indexes deliberately based on actual query patterns (columns in `WHERE`, `JOIN`, and `ORDER BY` clauses on large tables), and be aware indexes have a write-cost trade-off — don't index everything by default either.
- Wrap multi-statement operations that must succeed or fail together in an explicit transaction, and understand your database's isolation level default rather than assuming.
- Prefer `EXISTS` over `COUNT(*) > 0` when you only need to know whether any matching row exists — it can short-circuit on the first match instead of counting all of them.

---

## Rust

- Prefer `Result<T, E>` and `?` for propagating errors over `unwrap()`/`expect()` in anything beyond a quick prototype or test — a panic in production is a much worse failure mode than a handled `Err`.
- Lean on the ownership/borrow checker rather than reaching for `Rc<RefCell<...>>` or `.clone()` everywhere as a default way to make the compiler happy — that pattern often signals the underlying data ownership design needs rethinking, not just a workaround.
- Use iterators and combinators (`.map()`, `.filter()`, `.fold()`) over manual index-based loops where it improves clarity — this is idiomatic Rust and often has zero runtime cost due to iterator fusion.
- Keep `unsafe` blocks as small as possible and comment exactly what invariant justifies the unsafety — an `unsafe` block without a comment explaining why it's sound is a red flag in review.

---

## General Rule When a Language Isn't Listed Here

If you're writing in a language/framework not covered above: identify and follow the community-standard style guide and idioms for that specific language (most mainstream languages have one — PEP 8 for Python, Effective Go, Rustonomicon/API guidelines for Rust, etc.) rather than defaulting to patterns from whichever language you're most familiar with. Say explicitly if you're not confident about current idiomatic conventions for a less-familiar language rather than presenting an unfamiliar-language solution with the same confidence as a well-known one.
