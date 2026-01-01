---
name: security-first
description: Use as a standing checklist during self-review for ANY endpoint, form, or file-handling code — not just when a task's Security note mentions it explicitly. Condensed from the project's security audit. Covers IDOR, JWT storage, file upload, secrets, and CORS.
---

# Security-First — Standing Checklist

This is the condensed, always-available version of the security decisions already made for this project. Consult it during self-review on every endpoint you write, even if the current `tasks.md` task doesn't explicitly call out a `**Security:**` note for it — some patterns (especially IDOR) apply to every new endpoint by default, not just the ones already flagged.

## 1. Object-Level Authorization (IDOR) — check this on EVERY new endpoint with an `:id` param

```
WRONG:  WHERE id = ?
RIGHT:  WHERE id = ? AND customer_id = ?   (for Customer-scoped resources)
```

RBAC answers "can this role hit this endpoint." It does NOT answer "does this specific record belong to this specific user." Every endpoint that takes a resource ID must independently verify ownership before returning or mutating data — orders, invoices, design files, and anything added later that belongs to a customer.

## 2. JWT / Token Storage

- Refresh token → httpOnly cookie (`Secure`, `SameSite=Strict`) — never in response body JSON
- Access token → response body is fine (used as Bearer token), but frontend must store it in memory (React state), never `localStorage`
- Access token blocklist in Redis on logout — "logout" without this is cosmetic only
- Pin JWT algorithm explicitly in verification config — never accept an algorithm from the token payload itself
- Generic error messages on login failure ("Email or password incorrect") — never reveal whether the email exists

## 3. File Upload

- Validate actual file content (magic bytes), not just the extension
- Sanitize filenames against path traversal (`../`) before storing
- SVG requires a decision: either exclude it from allowed types, or sanitize (strip `<script>`, `<foreignObject>`, `on*` handlers) AND serve from an isolated subdomain / force `Content-Disposition: attachment`
- Never render user-uploaded files directly from the main application domain

## 4. Secrets

- `.env` must be in `.gitignore` before the first commit of any new repo/module
- `gitleaks` pre-commit hook active — if it ever fires on a real secret, rotate that secret immediately, don't just remove it from the latest commit (Git history retains it forever)
- Backup encryption keys live separately from the server storing the backup (password manager, not a config file on the same VPS)

## 5. CORS and Headers

- Never combine wildcard origin (`*`) with `Allow-Credentials: true`
- Explicit origin whitelist from day one of development, not "fixed later for production"
- Security headers present on all responses: `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`, `Strict-Transport-Security`

## 6. Financial / Webhook (forward-looking — relevant once payment gateway integration is added)

- Any incoming webhook (payment gateway, third-party notification) must verify HMAC signature before it's allowed to change state (e.g. mark invoice as paid) — an unverified webhook URL is a forgery vector

## 7. Legal (Indonesia — UU PDP)

- Any field storing customer personal data (NPWP, address, phone, email) falls under UU No. 27/2022 — make sure consent is explicit (checkbox at registration, not implicit), a privacy policy page exists, and there's a way (manual is fine early on) for a customer to request data deletion

## When This Skill Applies Even Without an Explicit Task Note

If you're building a new endpoint, form, or file handler that isn't yet covered by an existing `**Security:**` bullet in `tasks.md` (e.g. a feature added later that wasn't in the original plan), apply sections 1-5 above by default anyway. Security patterns don't only apply to the specific lines they were first written against.
