---
name: feature-delivery-workflow
description: Use whenever implementing any task from tasks.md — governs commit granularity, test-before-commit discipline, and push/CI verification. Trigger on any code-writing task, not just when the user says "commit" or "push."
---

# Feature Delivery Workflow

Solo developer, no teammate reviewing pull requests — this skill exists to be the discipline a second developer would normally enforce.

## The Cycle (per sub-task, not per phase)

```
Read task → Implement smallest unit → Test it → Lint/typecheck → Self-review → Commit → Push → Verify CI → Check off in tasks.md
```

One sub-task = one commit. If a task has sub-bullets (e.g. task `4.3` has JWT signing, refresh logic, and rate limiting), it's still one commit if they're implemented together — but never combine `4.3` and `4.4` into one commit just because they're both "auth stuff."

## Commit Message Format

```
<type>(<scope>): <description> (task <task-number>)

[optional body: why, not what]
```

- `type`: `feat`, `fix`, `test`, `refactor`, `chore`, `security`
- `scope`: the module (`auth`, `orders`, `design-files`, `invoices`, `infra`)
- Reference the task number from `tasks.md` so history is traceable back to the plan

Examples:
```
feat(auth): implement JWT login with refresh token rotation (task 4.3)
security(orders): add IDOR ownership scoping to order endpoints (task 11.5)
test(design-files): add upload validation test cases (task 13.6)
```

## Test-Before-Commit Rule

Never commit code for a task where:
- The test for that specific unit hasn't been written or run (for tasks marked `*`, tests are optional for speed — but the manual "does it actually work" check is NOT optional for any task)
- `npm run lint` or `tsc --noEmit` reports errors
- You haven't manually exercised the happy path at least once (curl, Postman, or UI click-through)

## Push and CI Verification

After every push:
1. Confirm GitHub Actions run started
2. Wait for it to pass before starting the next task
3. If it fails: stop, diagnose, fix, re-push, re-verify — don't start new work on top of a red pipeline
4. If a rollback is needed, use the rollback script from `tasks.md` Phase 0 (task 0.5), don't manually improvise a fix under pressure

## Phase Checkpoints

At every "Checkpoint" task in `tasks.md` (there's one at the end of each phase):
- Do a manual end-to-end smoke test of the whole phase's feature, not just the last sub-task
- Deploy to VPS and verify in production-like conditions before telling Rohan the phase is done
- Do not silently skip a checkpoint's verification steps even if individual tasks already passed their own tests — checkpoints catch integration issues that unit-level tests miss

## Anti-Patterns to Refuse

- "I'll commit everything at the end of the phase" — no, commit per sub-task
- "Tests can come later" — no, test immediately or explicitly flag to Rohan that you're deferring and why
- "It builds, so it's probably fine" — build success is not test success; run the actual test
