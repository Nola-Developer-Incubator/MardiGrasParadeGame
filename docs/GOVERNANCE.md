# Project Governance

Date: 2025-12-14

This document describes the governance model for the Mardi Gras Parade Simulator project ("the Project"). It is intended to be pragmatic, lightweight, and community-friendly while providing clear decision-making and escalation paths.

## Goals
- Keep decision-making transparent and documented.
- Make it easy for contributors to participate and take on responsibilities.
- Protect project health with a small group of maintainers for fast decisions.

## Roles
- Contributors: Anyone who files issues or PRs. Contributors are welcome to propose changes.
- Maintainers (Core Team): People with merge access responsible for reviewing and merging PRs, managing releases, and making operational decisions.
- Owners: One or two senior maintainers (project leads) who have final say in contentious or emergency decisions.

See `docs/MAINTAINERS.md` for who currently holds these roles and how to contact them.

## Decision Model
1. Routine development decisions are made by maintainers via code review and normal PR workflow.
2. Non-routine or project-wide changes (architecture, major dependency upgrades, CI changes, governance changes, monetization strategy) should be proposed via an RFC (pull request labeled `RFC`) and discussed on the PR and issues. Maintain a short summary in the PR body with motivations and alternatives.
3. For RFCs the maintainers will aim for consensus within 7 days. If consensus can't be reached, a 2/3 majority of active maintainers can approve.
4. Emergency fixes (security, data loss, CI outages) may be applied by any owner/maintainer and must be retroactively documented in the RFC/issue tracker.

## RFC Process
- Create an RFC as a Markdown file under `docs/rfcs/` (or as a PR description linked to an issue). Title should start with `RFC: `.
- Include a short problem statement, proposed solution, alternatives considered, migration plan, and rollout strategy.
- Tag the PR with `RFC` label and request review from at least two maintainers.
- After approval, merge the RFC and update the governance log with a short summary and date.

## Releases and CI
- Releases are done via GitHub Releases and should include a changelog summary that references merged PRs and notable fixes.
- Playwright CI and other test runners are required to pass for PRs affecting runtime code or CI configs.
- For long-running public service deployments, follow the documented deployment checklist in `docs/TECHNICAL_DOCUMENTATION.md`.

## Code Reviews and Merging
- Aim for at least one approving review from a maintainer for non-trivial changes; two approvals recommended for UX, audio, or architecture changes.
- Maintain test coverage for critical systems (audio, bots, scoring) when possible.

## Conflict Resolution
- Try to reach consensus in discussion first.
- If not possible, maintainers vote. Owners break ties in urgent situations.
- Escalation: open an issue titled `Governance Escalation:` describing the conflict and proposed resolution path.

## Accepting New Maintainers
- Demonstrated, repeated contributions over time, a willingness to review and mentor others, and occasional participation in maintenance tasks are required.
- Nomination can be made by any maintainer or contributor. Approval requires agreement from two existing maintainers.
- New maintainers should be added to `docs/MAINTAINERS.md` and given repository access as appropriate.

## Transparency and Logs
- Keep a short, date-stamped summary (one paragraph) of major decisions in `docs/GOVERNANCE.md` or `docs/GOVERNANCE-LOG.md` when decisions are finalized.

## Code of Conduct
All contributors must follow the project Code of Conduct: see `CODE_OF_CONDUCT.md`.

---

If you'd like a different governance style (e.g., meritocratic, consensus-only, or committee-based), I can adapt this file to that model. This model is intentionally concise so it is easy to read and apply.

