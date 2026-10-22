# Security Review — aether-ai-deployment

**Status:** Threat checklist for design review; no security audit or certification is claimed.

## Assets and boundaries

- Customer data, tenant/resource identifiers, credentials, configuration and audit records.
- Public API, internal service calls, storage/queue/cache boundaries and CI/release pipeline.
- Untrusted user input, event payloads, provider/plugin output and third-party dependencies.

## Threat scenarios

- Cross-tenant access or cache/index leakage.
- Forged or stale identity, authorization or approval context.
- Malformed/oversized payloads, replay, duplicate side effects or resource exhaustion.
- Secrets or protected content leaking through logs, errors, docs, artifacts or CI output.
- Compromised dependency, overprivileged workflow or unsafe deployment configuration.

## Required controls

Deployment pipelines and runtime environments are trust boundaries. Use least-privilege identities, protected environment approvals, runtime secret injection, immutable/reproducible artifacts where feasible, isolated environments, and explicit rollback steps. Never commit secrets, state files, or production credentials.

- Validate every trust-boundary payload and reject unknown security-sensitive fields.
- Use least-privilege workload identities and runtime secret injection.
- Apply authorization at the owning resource boundary; never rely only on a search/cache projection.
- Define retention/deletion and sanitized telemetry rules.
- Review dependency licenses, provenance, vulnerabilities and CI permissions before release.

## Verification checklist

Test secret scanning, least-privilege workflow permissions, environment isolation, config validation, artifact provenance, health checks, rollback and migration order in a non-production environment.

Before release, add unit tests, contract tests for direct dependencies, negative authorization/input tests, and failure/recovery tests for the behavior this component owns. Use synthetic or sanitized data only.

- [ ] Positive and negative contract fixtures run in CI.
- [ ] Tenant isolation and authorization denial are tested.
- [ ] Secret scan and dependency review are recorded.
- [ ] Failure, retry, replay and recovery paths are tested.
- [ ] Residual risks and owners are documented.
