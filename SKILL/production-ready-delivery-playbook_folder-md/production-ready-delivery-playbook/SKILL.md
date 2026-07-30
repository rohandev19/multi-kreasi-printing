---
name: production-ready-delivery-playbook
description: 'Orchestrate how a full engineering org -- fullstack architecture, frontend, backend, UI/UX design, QA/test strategy, cyber blue team defense, security/vulnerability testing, systematic debugging, low-level systems understanding, and DevOps/deployment -- builds a project to genuine production-ready standard: security assured by design and verified through systematic testing, root-cause-driven debugging grounded in low-level mental models, and a deliberate delivery strategy over ad-hoc work. Use for any non-trivial project build, feature, architecture decision, bug investigation, or pre-launch security review -- not only when asked to "make this production ready" or "secure." Supplies the end-to-end lifecycle (discovery, design, architecture, threat-modeling, implementation, QA, hardening, deployment, operations) and points to a discipline-specific reference file for deep guidance, including a checklist-driven vulnerability assessment and a debugging/low-level-systems pairing for hard bugs.'
---

# Production-Ready Delivery Playbook

Most software fails to reach genuine production quality not because any single piece of code is bad, but because the disciplines that should inform each other never talk to each other: security gets reviewed after launch, QA gets involved after the feature is "done," design gets handed a UI to build rather than a problem to solve, and deployment strategy gets figured out the night before ship. This skill exists to prevent that pattern.

**The core operating principle: security, quality, and operability are gates built into every phase of the work — not audits performed after the fact.** This is often called "shifting left." Everything below is a concrete expression of that principle across disciplines.

---

## What "Production-Ready" Actually Means

Not "it runs on my machine" or even "it passed the demo." A feature/project is production-ready when it satisfies **all** of these simultaneously — this is the bar this whole skill folder is built to reach:

1. **Correct** under both expected and adversarial/malformed input
2. **Secure** against the realistic threat model for what it handles (see `references/cyber-blue-team-defense.md`)
3. **Usable** by the actual people who'll use it, not just functional in the abstract (see `references/ui-ux-design.md`)
4. **Verified** by a deliberate test strategy proportional to its risk, not just "I tried it once" (see `references/qa-test-strategy.md`)
5. **Observable** in production — you'll know it broke before a user tells you (see `references/devops-and-deployment.md`)
6. **Reversible** — there's a way to roll back or mitigate if it goes wrong, because it will eventually go wrong
7. **Maintainable** by someone who isn't you, six months from now (covered by the `senior-software-engineer` skill — use alongside this one)

---

## The Delivery Lifecycle

Work through these phases in roughly this order. Skipping a phase is sometimes the right call for a low-stakes task — but skip it *consciously and say so*, not by default.

### Phase 1 — Discovery & Requirements
Understand the actual problem, the real users, and the real constraints (timeline, team size, compliance obligations, existing systems this has to integrate with) before designing anything. Distinguish stated requirements from silently-filled assumptions (see the `senior-software-engineer` skill's Mindset section — it applies here first).
**Exit criteria:** you can state the problem, the target user, and the success criteria in a few sentences someone else would agree with.

### Phase 2 — UX & Interaction Design
Before writing UI code, think through the user's actual workflow, not just the screens. → `references/ui-ux-design.md`
**Exit criteria:** the core user flows are mapped (even roughly), key usability risks are identified, and accessibility isn't an afterthought.

### Phase 3 — Architecture & Threat Modeling (Together, Not Sequentially)
Architecture decisions and security threat modeling should happen **in the same conversation**, not security-review-after-the-fact. Before backend/frontend implementation starts: what data does this handle, who should be able to access what, what's the worst realistic misuse case, what are the trust boundaries. → `references/cyber-blue-team-defense.md` (threat modeling section) alongside `references/backend-engineering.md` (architecture section).
**Exit criteria:** you can name the top 3 realistic threats to this system and how the architecture accounts for each.

### Phase 4 — Backend Implementation
→ `references/backend-engineering.md` for API design, data modeling, scaling judgment, caching, async processing.
Apply `trustworthy-code-generation` and `senior-software-engineer` skills throughout — this skill's reference file covers backend-*specific* concerns those don't.

### Phase 5 — Frontend Implementation
→ `references/frontend-engineering.md` for component architecture, state management, performance, accessibility implementation.
Runs in parallel with Phase 4 where possible, informed by the same architecture/threat-modeling decisions from Phase 3.

### Phase 6 — QA & Test Strategy
Should have been *planned* alongside Phase 2-3 (what needs the heaviest testing is a risk question, answerable early), but *executed* here. → `references/qa-test-strategy.md` for strategy, `references/debugging-and-root-cause-analysis.md` when something found in testing needs to be diagnosed rather than just reported.
**Exit criteria:** the test strategy matches the actual risk profile — critical paths (auth, payments, data mutation) have deliberate coverage, not just whatever was easiest to test.

### Phase 7 — Security Hardening & Blue Team Review
A dedicated pass, even if brief: dependency/vulnerability scan, secrets check, permission/IAM review, logging/monitoring for security events, confirm the threat model from Phase 3 was actually addressed in the implementation. → `references/cyber-blue-team-defense.md` for the operational/infrastructure side, `references/security-testing-and-vulnerability-assessment.md` for a systematic, checklist-driven pass against the actual running application (injection, access control, auth, CSRF/SSRF, business logic — run this against your own system before anyone else does).
**Exit criteria:** every threat named in Phase 3 has a corresponding, verifiable mitigation in the shipped system, and the vulnerability-assessment checklist has been run and its findings resolved or explicitly accepted.

### Phase 8 — Deployment & Observability
→ `references/devops-and-deployment.md` for CI/CD, deployment strategy, environment parity, monitoring/alerting, rollback plan.
**Exit criteria:** you know how you'll find out this broke, and how you'll undo it if it does, *before* it ships — not improvised during an incident.

### Phase 9 — Post-Launch Operations
Monitoring is watched, not just wired up. Incidents get a lightweight retrospective (what happened, why the earlier phases didn't catch it, what changes). This closes the loop back into Phase 1-3 for the next iteration.

---

## Cross-Discipline Interaction Rules

These are the failure points where disciplines silo instead of informing each other — watch for them specifically:

- **Security informs architecture, not the reverse.** If a threat model surfaces late and forces a redesign, that's a process failure, not bad luck — Phase 3 exists to prevent it.
- **Design and frontend performance trade-offs need to be negotiated together, explicitly**, not discovered when a beautiful design turns out to load slowly on a real device. A senior UI/UX approach already accounts for this (see the Performance-Aware Design section in the design reference file).
- **QA's risk assessment should shape what gets built more carefully, not just what gets tested harder.** If QA would flag a feature as high-risk, that's a signal the architecture/security phases should have given it more attention too.
- **DevOps/observability requirements (what needs to be logged/measured) should be decided during backend design, not retrofitted after an incident** where the one piece of data you needed wasn't being captured.
- **Blue team thinking applies to the build pipeline itself, not just the running application** — a compromised CI/CD pipeline or a leaked deploy credential is as real a threat as an application-layer vulnerability.

---

## Master "Production-Ready" Definition of Done

Before calling something done, this should be true — treat any unchecked box as a decision to make consciously and disclose, not an oversight to leave silent:

**Security**
- [ ] Threat model exists for this feature/system, even informally, and its top risks have named mitigations
- [ ] No hardcoded secrets; least-privilege permissions/IAM by default
- [ ] Dependencies checked against known vulnerabilities; no unverified/hallucinated packages
- [ ] Authorization checked per-resource, not just authentication (no IDOR-class gaps)
- [ ] The systematic vulnerability-assessment checklist (`references/security-testing-and-vulnerability-assessment.md`) has actually been run against the running application, not just reasoned about in the abstract

**Quality & Correctness**
- [ ] Test strategy matches actual risk — critical paths have real coverage, not just happy-path checks
- [ ] Known failure modes (timeout, retry, concurrent access, malformed input) were deliberately considered
- [ ] Any bug fixed during this work has a stated root cause, not just a symptom that stopped reproducing (see `references/debugging-and-root-cause-analysis.md`)

**Usability**
- [ ] Core flows were designed around actual user tasks, not just technical convenience
- [ ] Baseline accessibility met (contrast, keyboard navigation, screen-reader labels)

**Operability**
- [ ] You'll be alerted to a real failure before a user has to report it
- [ ] There's a known rollback/mitigation path if this causes an incident
- [ ] Logs/metrics capture what you'd actually need to debug a 3am incident

**Maintainability**
- [ ] A stranger could understand this system from its code, docs, and commit history without you in the room

---

## How to Use This Skill Folder

Read this file first for the overall lifecycle and to identify which phase the current task is in, then open the specific reference file(s) that phase points to:

| File | Use for |
|---|---|
| `references/ui-ux-design.md` | User flows, usability, design systems, accessibility-by-design |
| `references/backend-engineering.md` | API design, data modeling, scaling, caching, async, service boundaries |
| `references/frontend-engineering.md` | Component architecture, state management, performance, a11y implementation |
| `references/qa-test-strategy.md` | Test planning, risk-based coverage, release readiness, bug quality, mutation/fuzz/contract/chaos testing |
| `references/cyber-blue-team-defense.md` | Threat modeling, hardening, monitoring, incident readiness, pipeline security |
| `references/security-testing-and-vulnerability-assessment.md` | Systematic, checklist-driven vulnerability testing of your own running application (OWASP-style: injection, access control, auth, CSRF/SSRF, business logic) |
| `references/devops-and-deployment.md` | CI/CD, deployment strategy, environment parity, observability, rollback |
| `references/debugging-and-root-cause-analysis.md` | Systematic debugging methodology — reproduction, bisection, concurrency/memory/performance/production debugging, root-cause discipline |
| `references/low-level-systems-understanding.md` | The underlying mental models (memory, concurrency, networking, database internals, browser/JS engine internals, OS basics) that make the debugging file actually usable on real bugs |

This skill assumes you're also applying `senior-software-engineer` (code-level craftsmanship and judgment) and `trustworthy-code-generation` (anti-hallucination and secure-coding specifics) throughout — this folder covers project- and discipline-level strategy that sits a layer above individual functions and files.

---

## Honest Scope Note

This playbook covers the disciplines most relevant to building and shipping a web/application product end-to-end. It does **not** deeply cover: mobile-native platform specifics (iOS/Android idioms beyond what's in `frontend-engineering.md`), data engineering/ML pipeline design, formal legal/regulatory compliance (GDPR/UU PDP/SOC2/PCI-DSS are mentioned where directly relevant to security posture, but this is not legal advice and a real compliance review needs a qualified person), or organizational/product management process. Treat gaps in those areas as gaps, not as "not needed."
