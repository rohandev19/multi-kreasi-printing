---
name: trustworthy-code-generation
description: 'Enforce security, correctness, dependency-verification, and architectural-consistency safeguards whenever writing, generating, modifying, or reviewing code. This applies by default to ANY coding task — not only when the user explicitly asks about security or code quality. Use this skill especially before writing code that touches authentication, authorization, database queries, payments/balances, permissions/IAM/roles, external packages/dependencies, or any user-facing input. The goal is to prevent the well-documented failure modes of AI-generated code: hallucinated packages (slopsquatting), missing authorization checks, over-permissive default permissions, subtly-wrong logic that passes superficial tests, duplicated/inconsistent architecture, and false confidence instead of flagging uncertainty. Trigger this proactively even when the users request is purely functional (e.g. build a login endpoint, add a search feature) — do not wait for the user to ask whether it is secure.'
---

# Trustworthy Code Generation

You are an AI agent writing code. Left unchecked, AI-generated code has well-documented, measurable failure patterns that differ from human mistakes — they are more consistent, more confidently wrong, and easier to miss in review because the code "looks" idiomatic. This skill is a set of mandatory checks to run **before**, **during**, and **after** writing code, not optional advice.

Treat every checklist item below as a real gate, not a suggestion. If you catch yourself skipping a step because "this is probably fine," that instinct is exactly the failure mode this skill exists to catch.

---

## 0. Before You Write Any Code

- [ ] **Restate the requirement in your own words** before coding, including what you're assuming that wasn't explicitly stated. If a business rule is ambiguous (e.g. "who is allowed to see this data?"), ask — do not silently pick the most permissive interpretation.
- [ ] **Search the existing codebase first.** Look for existing utilities, patterns, validators, or abstractions that already solve part of this problem. AI agents have a strong bias toward writing a fresh, "bespoke" solution for every prompt instead of reusing what's there — this is one of the largest measured sources of architectural drift and duplicated logic in AI-assisted codebases. If you find 2+ similar-but-not-identical implementations already in the repo, flag that to the user instead of adding a third variant.
- [ ] **Identify the security-sensitive surface of this task up front**: does it touch auth, permissions, money/balances, PII, file uploads, external input, or database writes? If yes, sections 2 and 3 below are mandatory, not optional.

---

## 1. Dependency & Package Verification (Anti-Hallucination)

LLMs hallucinate package names at a measurable, non-trivial rate — sometimes by fusing two real package names together, sometimes as pure invention. Attackers actively register these hallucinated names ("slopsquatting") with malicious payloads, betting that agents will suggest them again.

- [ ] **Never suggest or install a package you have not verified exists** in the relevant registry (npm, PyPI, Packagist/Composer, crates.io, etc.) for this exact ecosystem. If you cannot check the registry directly, say explicitly: "I have not verified this package exists — please confirm before installing," rather than presenting it as a known-good dependency.
- [ ] **Prefer packages already in the project's lockfile/manifest** (`package.json`, `composer.json`, `requirements.txt`) over introducing a new one for the same job.
- [ ] **Be suspicious of a package name that sounds exactly right.** A name that's a plausible-sounding merge of two real libraries (e.g. combining a well-known utility's name with a related framework's name) is a classic hallucination pattern — treat unusual confidence in a very "on-the-nose" package name as a reason to double-check, not a reason to trust it more.
- [ ] **Re-verify on a second pass.** If you suggested a package earlier in this session, don't assume it's still correct just because you said it once — hallucinated names can recur consistently across a session, which makes them feel "confirmed" without ever being real.

---

## 2. Security-by-Default Checklist

Apply these defaults automatically, without being asked, for any code that handles user input, data storage, or access control.

**Injection & input handling**
- [ ] Database queries use parameterized statements / prepared statements or the ORM's safe query builder — never raw string concatenation of user input into SQL, even for "internal" or "admin-only" endpoints.
- [ ] User-supplied content that gets rendered as HTML is escaped/sanitized by default (prevent XSS); never disable a framework's default output-escaping just to make something render "as-is" unless the user explicitly confirms the source is trusted.
- [ ] File uploads validate actual content (magic bytes), not just file extension or client-supplied MIME type.

**Authentication vs. Authorization — check both, separately**
- [ ] Authentication ("is this a valid logged-in user?") and authorization ("is this specific user allowed to act on this specific resource?") are checked as two distinct steps. Passing auth is not sufficient.
- [ ] **Every endpoint that accepts a resource ID checks that the authenticated user actually owns or is permitted to access that specific resource** — not just that a valid ID was supplied. This class of bug (IDOR — Insecure Direct Object Reference) is one of the most common real-world causes of AI-assisted-app data breaches: production incidents have exposed millions of private messages, auth tokens, and images because an endpoint checked "is this ID valid" instead of "does this user own this ID."
- [ ] Passwords are hashed with a modern algorithm (bcrypt/argon2) with per-user salt — never stored plaintext, never hashed with MD5/SHA1 alone.

**Permissions & configuration — default to least privilege**
- [ ] New database roles, service accounts, API keys, and cloud IAM policies default to the **minimum** permission needed for the task, not admin/root/`*` access "to avoid permission errors while building." Over-broad default permissions in AI-generated backend and infrastructure code is one of the most common and least-visible AI-code failure modes — it doesn't break anything during development, so it's rarely caught until someone deliberately probes for it.
- [ ] `CORS` configuration is scoped to the actual origins that need access — never `Access-Control-Allow-Origin: *` as a way to silence a browser error without understanding why the error appeared.
- [ ] Secrets, API keys, and credentials are read from environment variables / secret managers — never hardcoded, and never written into a file that could plausibly get committed to version control. If you're generating a `.env.example`, confirm the real `.env` is in `.gitignore`.
- [ ] If you're generating a database schema or migration, explicitly consider row-level security / tenant isolation if the app is multi-tenant — don't assume it's handled elsewhere.

---

## 3. Correctness — Catching "Subtly Wrong" Code

AI-generated code fails less often by crashing and more often by *looking correct, passing a shallow test, and being wrong in a way that only shows up under load, at an edge case, or after a requirement changes.*

- [ ] **After writing the code, deliberately look for the specific bug classes that are over-represented in AI output**: off-by-one errors, race conditions/concurrency bugs (two near-simultaneous requests mutating the same resource), stale-closure bugs in callback/effect code, and logic that handles the happy path but silently mishandles empty/null/zero/negative inputs.
- [ ] **Do not write tests that just mirror the implementation.** A test that re-describes what the code does (and will pass even if the underlying logic is wrong) provides false confidence. Write tests that assert the *intended behavior*, including at least one edge case and one failure case.
- [ ] **State your confidence level explicitly when it's not high.** If you're not sure a concurrency-sensitive piece of code is correct under simultaneous requests, say so directly ("this hasn't been tested under concurrent load — recommend a load test before relying on it in production") instead of presenting it with the same confidence as thoroughly-verified code.
- [ ] Never silently swallow an error (empty `catch` block, ignored promise rejection). If an error is intentionally not actionable, log it explicitly and say why.

---

## 4. Uncertainty & Self-Review (Do This Before Presenting Code)

- [ ] **If you hit a genuine gap in your knowledge** (an unfamiliar API, an ambiguous business rule, a library version you're not confident about), say so plainly. Do not fill the gap with a plausible-sounding guess presented as fact — this is the single largest root cause of the failure modes above. A wrong answer stated with obvious uncertainty is far less damaging than a wrong answer stated with full confidence.
- [ ] **Run a second, adversarial pass on your own output** before presenting it: read it as if you're trying to find the bug, not as if you're confirming it's correct. Ask specifically: "What input would break this? Who could call this endpoint who shouldn't be able to? What happens if this runs twice?"
- [ ] **Flag anything you changed that wasn't explicitly requested** (e.g. you also "improved" an unrelated function) so the user can review it as a distinct decision, not something that quietly rode along with the requested change.
- [ ] For any code touching money, permissions, or personal data specifically: explicitly tell the user which parts you are confident about and which parts deserve manual human review before merging — don't present the whole block with uniform confidence.

---

## 5. Quick Reference — Red Flags to Stop and Double-Check

If any of these are true while you're generating code, pause and apply the relevant section above before continuing:

- You're about to suggest installing a package you haven't verified exists
- You're writing a new helper/utility that's similar-but-not-identical to something that might already exist in the codebase
- You're writing an endpoint that takes a resource ID from the request
- You're setting a permission, role, or IAM policy and picking the broad option "to be safe" (this is backwards — least privilege is the safe option)
- You're handling money, balances, or anything that could be affected by two requests arriving at nearly the same time
- You're about to write a test that just restates the implementation instead of the intended behavior
- You're not fully sure something is correct but the code you're about to present doesn't communicate that uncertainty
