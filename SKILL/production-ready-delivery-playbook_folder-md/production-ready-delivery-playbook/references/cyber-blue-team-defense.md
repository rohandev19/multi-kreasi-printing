# Cyber Blue Team — Defensive Security Strategy

Read this during Phase 3 (threat modeling, alongside architecture) and Phase 7 (dedicated security hardening pass). This is operational/infrastructure security strategy — secure *coding* specifics (SQL injection, XSS, auth-vs-authz at the code level) live in the `trustworthy-code-generation` skill; this file is about the system and organization around the code.

---

## Threat Modeling (Lightweight, Done Early)

You don't need a heavyweight formal process to threat model — you need to ask a few specific questions before building, not after:

- **What data does this system handle, and what's the realistic impact if each category is exposed, tampered with, or made unavailable?** (Distinguish "embarrassing" from "regulatory/financial/safety incident" — they warrant different levels of investment.)
- **Who are the realistic adversaries?** An opportunistic scanner probing for known vulnerabilities is a different threat than a targeted attacker with knowledge of your system, and a malicious insider is different again — the mitigations differ.
- **What are the trust boundaries?** Every point where data crosses from a less-trusted context to a more-trusted one (user input reaching your backend, a third-party webhook reaching your system, a frontend reaching your API) is a boundary where you validate/authenticate, not assume.
- **STRIDE as a fast checklist** for each significant component: can it be Spoofed (identity), Tampered with, is an action Repudiable (no audit trail), can information be Disclosed, can it be Denied (availability attack), can privilege be Elevated? You don't need a full formal write-up — running through these six questions for a new feature takes minutes and catches real gaps.

**Output of this phase:** a short, explicit list of "here's what could go wrong and here's what we're doing about each" — this is what Phase 7 verifies got actually implemented.

---

## Secrets & Credential Management

- No secret (API key, database credential, signing key, third-party token) is ever hardcoded in source or committed to version control — use environment variables or a proper secrets manager, and verify `.gitignore` actually excludes the files that would contain them.
- Rotate credentials on a real schedule, and immediately whenever someone with access to them leaves the team or a leak is suspected — a credential that's never rotated is a credential that, once leaked (even years ago, even briefly), remains a standing risk indefinitely.
- Different environments (dev/staging/production) use different credentials — a developer's local `.env` should never contain production secrets, both to limit blast radius and because local machines are a realistic leak vector (laptop theft, malware, accidental commit).
- Scan the repository (and its history) for accidentally committed secrets, especially before a private repo is made public or a new team member is onboarded with full history access.

---

## Dependency & Supply Chain Security

- Run automated dependency vulnerability scanning (SCA — Software Composition Analysis) as part of the build pipeline, not as an occasional manual check — new CVEs are disclosed continuously, so a dependency safe last month may not be safe today.
- Pin dependency versions (lockfiles) so builds are reproducible, and update deliberately (reviewing changelogs for security-relevant changes) rather than either never updating (accumulating known vulnerabilities) or auto-updating everything blindly (risking an untested breaking or malicious change slipping in).
- Before adding a new dependency, do a basic trust check: is it actively maintained, reasonably widely used, and does it actually exist under the name you think it does (see the package-hallucination/slopsquatting risk covered in `trustworthy-code-generation`) — a supply-chain compromise through a trusted dependency is one of the highest-leverage attacks against a system that's otherwise well-secured.
- Apply the same scrutiny to CI/CD pipeline dependencies (GitHub Actions, build plugins) as to application dependencies — a compromised build step has access to your secrets and can inject malicious code into every build.

---

## Infrastructure & Configuration Hardening

- **Least privilege by default** for every IAM role, database user, and service account — grant exactly the permissions a component needs to do its job, not broad/admin access "to avoid permission errors while building." Over-broad default permissions are one of the most common and longest-lived misconfigurations, because they don't cause any visible problem until specifically exploited.
- **Network segmentation**: a database should not be directly reachable from the public internet; internal services should only be reachable by the specific other services that need them, not open to the whole internal network by default.
- **Default configurations are often insecure configurations** — a database, admin panel, or management interface with a default port/credential/setting is one of the first things automated scanners check for; change defaults deliberately as part of setup, not as an afterthought.
- Encrypt sensitive data both in transit (TLS everywhere, including internal service-to-service traffic where it crosses a network boundary) and at rest (database/disk encryption for anything sensitive), and don't accept an expired or self-signed certificate in production as "good enough."

---

## Logging & Monitoring for Security Events (Not Just Application Logs)

- Log security-relevant events specifically: authentication successes/failures, authorization denials, permission/role changes, password/credential changes, admin actions — these are the events an incident investigation will need, and they're often not captured by default application logging aimed at debugging functionality.
- Alert on patterns, not just individual events: a spike in failed login attempts, a user account suddenly making requests from a new, distant location, repeated authorization failures against different resources from the same account — these patterns indicate an active attack even when any single event looks unremarkable alone.
- Retain security logs for long enough to support a real investigation (which often starts well after the initial compromise) and protect them from tampering by the same access level that could cause the incident being logged.

---

## Incident Response Readiness

- Have a lightweight runbook *before* an incident, not improvised during one: who gets notified, who has authority to take the system offline if needed, where the relevant logs/dashboards are, what the rollback procedure is.
- Practice the actual mechanics occasionally (can you actually revoke a compromised credential quickly? Does the person on call know where to look?) — a runbook that's never been tried is often missing a step that only becomes obvious under real pressure.
- After a real incident (or a near-miss), do a blunt, blameless retrospective: what happened, why didn't an earlier phase (threat modeling, code review, monitoring) catch it, what specifically changes as a result. This is what closes the loop back to Phase 1-3 of the main playbook.

---

## Secure CI/CD Pipeline

- Treat the deployment pipeline itself as a security-critical system — it typically has broad access (to source code, secrets, production deploy capability), making it a high-value target. A compromised pipeline can inject malicious code into every future build without touching the application's own codebase at all.
- Require review (not self-merge) for changes to the pipeline configuration itself, same as for application code that touches security-sensitive logic.
- Limit which branches/environments can trigger a production deployment, and require the same authentication/authorization rigor for deployment access as for the production systems being deployed to.

---

## Compliance Awareness (Context, Not Legal Advice)

- If the system handles personal data, be aware there is very likely a relevant data-protection regulation (GDPR in the EU, Indonesia's UU PDP — Undang-Undang Pelindungan Data Pribadi — for systems handling Indonesian users' data, and similar laws in most jurisdictions) that has concrete requirements: lawful basis for processing, data minimization, breach notification timelines, user rights to access/delete their data.
- Common security frameworks worth being aware of even informally: OWASP ASVS (a concrete checklist for application security verification) and OWASP Top 10 (the most common web application vulnerability categories) are useful even outside a formal compliance context, simply as a well-vetted checklist.
- This section is context for engineering decisions, not a substitute for a qualified legal/compliance review — flag to the user explicitly when a project's data handling likely triggers real regulatory obligations, rather than silently assuming it's someone else's problem.
