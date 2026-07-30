---
name: code-quality-maximization
description: Use whenever writing or reviewing backend or frontend code — governs typing strictness, error handling, naming, query efficiency, and self-review before commit. Apply proactively, not just when asked to "clean up" code.
---

# Code Quality Maximization

Standard: write it the way you'd want to inherit it from someone else six months from now, with no one around to ask.

## TypeScript Discipline

- No `any` — if the type is genuinely unknown, use `unknown` and narrow it explicitly
- Strict null checks on — handle `null`/`undefined` explicitly, don't suppress with `!`
- No magic numbers or strings — extract to named constants or enums (`OrderStatus.IN_PRODUCTION`, not the string `"In_Production"` scattered across files)
- Prefer explicit return types on exported functions and use-case classes — don't rely on inference for public APIs

## Error Handling

- Every use-case throws typed, specific exceptions (`OrderNotFoundException`, `InsufficientPermissionException`) — never a generic `Error("something went wrong")`
- One global exception filter (NestJS) translates domain exceptions to HTTP responses — don't scatter `try/catch → res.status(500)` across controllers
- Error responses to the client: sanitized, no stack traces, no internal file paths, no raw database error messages in production
- Log the full error server-side (with Sentry, per infra setup) even when the client response is generic

## Input Validation

- Every endpoint has a DTO with `class-validator` decorators — no endpoint trusts raw `req.body`
- Validate at the boundary, not deep inside use-case logic — fail fast with 400 before business logic runs

## Database Query Discipline

- Check every list endpoint for N+1 queries — use Prisma `include`/`select` deliberately, verify with query logging in dev
- Every `WHERE id = ?` on a resource with an owner MUST also scope by owner (see `security-first` skill for the IDOR pattern) — this is a code-quality issue as much as a security one, because leaving it out means the query is wrong, not just insecure
- Index columns used in `WHERE`/`ORDER BY` on tables expected to grow (orders, invoices, audit_logs)

## Naming and Structure

- Use-case classes: one responsibility, named as a verb phrase (`CreateOrderUseCase`, not `OrderService` doing five things)
- No abbreviations that aren't domain-standard (`qty` is fine, `ordr` is not)
- File/folder structure mirrors Clean Architecture layers exactly as defined in `design.md` — don't improvise a different structure mid-project

## Dead Code and Comments

- No commented-out code left in commits — delete it, git history remembers it
- Comments explain **why**, not **what** (the code already says what; explain the non-obvious reasoning, trade-off, or gotcha)
- Remove `console.log` debugging statements before commit — use the `LoggerService` if logging is actually needed

## Self-Review Checklist (run before every commit)

- [ ] No `any` types introduced
- [ ] No magic strings/numbers
- [ ] Errors are typed and go through the global filter
- [ ] Every new endpoint has DTO validation
- [ ] Every owner-scoped query actually filters by owner
- [ ] No N+1 query introduced (check with query logging)
- [ ] No leftover `console.log` or commented-out code
- [ ] Lint and typecheck pass clean

## Anti-Patterns to Refuse

- "It works, ship it" without running the self-review checklist above
- Copy-pasting a similar use-case and only changing the entity name without checking if validation/ownership logic was copied correctly too
- Adding a new abstraction/interface for something used only once "in case we need it later" — wait for the third occurrence (rule of three) before abstracting
