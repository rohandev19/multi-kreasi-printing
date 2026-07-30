# DevOps & Deployment — Shipping and Operating Safely

Read this during Phase 8 (deployment) and Phase 9 (post-launch operations). This is where "it works" becomes "it works reliably, in front of real users, and we'll know if it stops."

---

## CI/CD Pipeline Design

- Every change to the main branch should run an automated pipeline: build, lint, test, security/dependency scan — a failing check should block merge/deploy by default, not be a warning someone can ignore under deadline pressure.
- Keep the pipeline fast enough that people don't route around it — a CI pipeline that takes 45 minutes trains people to skip it or batch changes riskily; invest in parallelizing/caching before adding more checks that make it slower.
- Build once, deploy the same artifact to every environment (dev → staging → production) rather than rebuilding per-environment — rebuilding introduces the possibility that what actually reaches production differs subtly from what was tested in staging.

---

## Environment Parity

- Staging should mirror production as closely as is practical (same infrastructure shape, same versions of dependencies/services, realistic-enough data) — the value of a staging environment is directly proportional to how much it actually resembles production; a staging environment that differs significantly gives false confidence.
- Configuration (not code) should differ between environments — the same build artifact, pointed at different config/secrets per environment, not a different code path that only runs in production and is therefore untested until it matters most.
- If perfect parity isn't achievable (common for cost reasons — a smaller staging database, no real third-party payment processor), know explicitly what the gaps are and account for them in the test/release strategy rather than assuming staging validation fully covers production behavior.

---

## Deployment Strategies

Pick a strategy proportional to the actual risk and blast radius of a bad deploy:

- **Rolling deployment**: replace instances gradually; simple, works for most cases without special traffic-routing infrastructure.
- **Blue-green deployment**: run the new version fully alongside the old, then switch traffic — enables a near-instant rollback (switch back) if something's wrong, at the cost of running double infrastructure briefly.
- **Canary deployment**: route a small percentage of real traffic to the new version first, monitor, then ramp up — catches issues that only show up under real production traffic/data patterns before they affect everyone, at the cost of more deployment complexity.
- **Feature flags**: decouple *deploying* code from *releasing* a feature to users — lets you deploy continuously and turn a feature on for a small percentage of users (or turn it off instantly without a redeploy) independent of the deployment pipeline. Especially valuable for risky or highly visible features.
- Match the strategy to the actual stakes: a low-traffic internal tool doesn't need canary deployment; a payment flow probably shouldn't ship via a simple rolling deploy with no gradual rollout.

---

## Rollback Strategy (Decide Before You Need It)

- Know, in advance and in writing, how a bad deploy gets undone: revert to the previous known-good artifact, and separately, how a bad database migration gets undone (migrations are often the part that's hardest to roll back — see the reversible-migration guidance in `backend-engineering.md`).
- A rollback plan that's only ever been theoretical is a risk in itself — if a deployment strategy claims instant rollback capability, that claim should have been exercised at least once outside of a real incident.
- Distinguish "roll back the code" from "roll back the data" — code rollback is often fast and safe; if the new code already wrote data in a new shape/format before the rollback happened, the rollback may need a corresponding data migration too, which is easy to forget under incident pressure.

---

## Monitoring, Alerting, and SLOs

- Define what "healthy" looks like in concrete, measurable terms (error rate below X%, p95 latency below Y ms, queue depth below Z) — an SLO (Service Level Objective) turns "is this working" from a vague feeling into something you can alert on and report against.
- Alert on symptoms that indicate real user impact (error rate, latency, availability) as the primary alerts, and use lower-level infrastructure metrics (CPU, memory) mainly for diagnosis once a symptom-level alert has already fired — alerting purely on infrastructure metrics tends to produce noisy alerts that don't clearly map to "is this actually a problem for users right now."
- Tune alert thresholds deliberately to avoid both extremes: alerts so sensitive they're constantly firing (which trains people to ignore them — alert fatigue) and alerts so loose that real problems don't trigger them until users are already reporting issues.
- Make sure whoever's on call actually has access to the dashboards/logs referenced in the runbook, and that the runbook is findable at 3am under stress, not buried in a wiki nobody remembers the structure of.

---

## Infrastructure as Code

- Define infrastructure (servers, networking, permissions, managed services) in version-controlled configuration rather than manual console changes — this makes infrastructure changes reviewable (the same way code changes are), reproducible across environments, and recoverable if something is accidentally deleted or misconfigured.
- Manual, undocumented changes made directly in a cloud console ("just this once, to fix it quickly") tend to accumulate into infrastructure that no longer matches what's in code, which is its own source of future incidents when someone trusts the code-as-documentation and it's wrong.

---

## Backup & Disaster Recovery

- Back up anything that can't be regenerated (primarily: the database) on a real, automated schedule, and — this is the step most often skipped — **actually test restoring from a backup periodically**. A backup that's never been restored is unverified and should not be trusted as a real safety net.
- Know your actual Recovery Point Objective (how much data loss is acceptable — the gap since the last backup) and Recovery Time Objective (how long restoring is acceptable to take) explicitly, rather than discovering what they actually are during a real disaster.
- Store backups somewhere that a single incident (compromised production credentials, a regional outage) can't take out along with the primary data.

---

## Cost Awareness

- Infrastructure choices have ongoing cost implications, not just technical ones — a managed service that's fast to set up may have a materially different cost curve at scale than a self-hosted equivalent; this is a real trade-off to surface (see `senior-software-engineer/references/collaboration-and-communication.md`), not something to decide purely on technical merits.
- Watch for cost patterns that grow silently with usage/scale (per-request pricing, data egress charges, log/metric storage retention) — these are easy to overlook during initial development at low volume and become a real budget concern only once usage grows, often surprising whoever's responsible for the bill.
