# AI Governance Policy

Date: 2025-12-14

This AI Governance Policy describes how the Mardi Gras Parade Simulator project evaluates, selects, uses, and monitors AI and ML components. It is adapted from governance patterns used in similarly-sized projects ("Adventure Project" style) and tailored to this repository's responsibilities.

Scope
- Applies to all code, services, and documentation that uses or exposes AI/ML models, including third-party hosted models and local inference.
- Includes training data, prompts, model outputs, and any automated decision-making used in the project (for bots, audio classification, analytics, or personalization).

High-level Principles
1. Safety first: avoid deploying models that can produce harmful or illegal content, or that place player privacy at risk.
2. Transparency: surface when model-generated content is used and provide maintainers with provenance information (model name, version, prompt, and dataset origin where applicable).
3. Human oversight: maintain a human-in-the-loop for any decision that impacts users materially (e.g., bans, monetization choices, or data exports).
4. Privacy & minimal data retention: collect and retain the minimum data necessary; avoid sending personal data to third-party providers unless explicitly approved.
5. Auditability: log model inputs and outputs for troubleshooting and post-incident review, subject to privacy constraints.

Roles & Responsibilities
- Contributors: Propose model usage via RFCs and follow the testing checklist before deployment.
- Maintainers: Review and approve model integration RFCs, run safety reviews, and monitor model behavior in production.
- Owners: Sign off on high-risk model usage (external paid APIs, models that generate free-form text or images, or models that infer sensitive attributes).

Model Lifecycle
1. Proposal (RFC): Any new model integration must start as an RFC under `docs/rfcs/` describing purpose, risk, data flow, model source (vendor, license), and rollback plan.
2. Evaluation: Test offline with curated inputs; measure performance, failure modes, and safety metrics. Include adversarial test cases if the model generates free-form content.
3. Privacy Review: Confirm that input data does not include personal data or that appropriate lawful basis exists; document data retention policy and storage location.
4. Staging Deployment: Deploy to a staging environment with feature flags and verbose logging.
5. Monitoring: Add runtime telemetry and alerts for anomalous behavior. Schedule periodic reviews (30/90 day) depending on risk level.
6. Production Approval: After monitoring and review, a maintainer and an owner must approve production rollout.

Third-Party Models & Vendors
- Prefer open-source, auditable models where possible.
- For hosted providers, record vendor, model version, endpoint, SLAs, and cost estimates in the RFC.
- Avoid sending PII (personal identifiable information) to third-party APIs. If absolutely required, document consent and retention.
- Maintain API keys in secure secrets storage (do NOT commit API keys to the repo). Use environment variables and CI secrets.

Data Management and Logging
- Log only what is necessary for debugging and monitoring. Redact or avoid storing user PII, session tokens, or sensitive identifiers.
- Retention: default 30 days for model input/output logs unless extended by an approved reason (documented in RFC).
- Provide a process for users to request deletion of their data where applicable.

Prompting & Content Controls
- For any model that generates visible content (bot dialog, narrative, or moderation suggestions), maintain a prompt template under `/config/prompts/` and version it.
- Sanitize model outputs before showing to players (length limits, profanity filters, link stripping) when appropriate.

Security & Secrets
- API keys must be stored in environment variables and CI secrets; never commit secrets to the repo.
- Limit access to keys by role; rotate keys on suspected compromise.

Testing & Quality Assurance
- Unit tests for wrapper functions (deterministic parts) and integration tests that mock model responses.
- Staging/playtest with real users (opt-in) before wide release.
- Add Playwright or E2E checks that ensure the application fails gracefully when model APIs are unreachable.

Incident Response
- If a deployed model produces harmful content or breaches privacy, immediately disable the model via feature flag, notify maintainers/owners, and begin postmortem.
- Keep a running incident log under `docs/incidents/` for transparency.

Auditing & Review
- Quarterly review of model usage and risk classification.
- Keep a short, date-stamped summary in `docs/GOVERNANCE-LOG.md` when major model decisions are made.

Contribution Process
- Use an RFC for new model usage. Include tests, monitoring plan, and privacy assessment.
- For minor changes (prompt tweaks, model hyperparameters), maintain a changelog entry in `/config/prompts/CHANGELOG.md` and require at least one maintainer review.

Examples and Checklist (for RFC authors)
- Purpose: Why do we need a model? (e.g., dynamic bot dialogue, procedural music)
- Alternatives considered: (none / simple heuristics / small rule-based systems)
- Data flow diagram: input sources, storage, external APIs
- Privacy/PII: Are we sending user data? If yes, justify and document safeguards
- Metrics: latency, error-rate, harmful-content rate
- Rollback plan: feature flag + quick kill switch

References
- "Adventure Project" AI governance (inspired patterns)
- OWASP Top 10 for ML
- Model vendor documentation (document vendor-specific guidance in RFC)

---

If you'd like, I can:
- Add an `docs/rfcs/` template for AI model proposals.
- Add a short checklist file `docs/ai/ai-checklist.md` used by reviewers.
- Scan the codebase for existing references to third-party model usage and surface candidate integrations.

