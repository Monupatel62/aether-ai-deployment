# Dependencies and Contracts — aether-ai-deployment

**Status:** Proposed; versions and runtime integrations are not selected.

## Direct dependencies

aether-ai-infrastructure modules and versioned release artifacts/manifests from components being deployed. The platform repository is documentation/control plane only and must not be a runtime dependency. Deployment consumes service artifacts and infrastructure interfaces; it must not import application domain logic.

## Owned interfaces

Build provenance, image/version policy, environment matrix, secrets injected at runtime, health checks, rollback and migration order.

## Contract rules

- Version public schemas and message envelopes.
- Document limits, timeouts, retry behavior, idempotency, cancellation, and error handling where relevant.
- Preserve correlation IDs across API, agent, tool, queue, and provider operations.
- Document operational signals and failure recovery, not only the happy path.
- Use versioned, typed schemas and stable safe error categories.
- Set explicit payload, time, concurrency and retry bounds for every external boundary.
- Document idempotency and duplicate-delivery semantics before enabling side effects.
- Keep secrets out of source control; inject them at runtime through an approved secret mechanism.
- Never assume a repository boundary implies a separately deployed service.

## Compatibility and change policy

Changes to public schemas require a consumer inventory, compatibility review, migration note and positive/negative fixtures. Breaking changes require an explicit versioning/deprecation decision.

## Related docs

- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
- [Master architecture](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/MASTER_ARCHITECTURE.md)
- [Security threat model](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/SECURITY_THREAT_MODEL.md)
- [Open decisions](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/OPEN_DECISIONS_RESEARCH.md)
- [Repository specification](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/repositories/aether-ai-deployment.md)
