# aether-ai-deployment

**Status:** Initial release-manifest validation and readiness checks implemented on a feature branch. No deployment target is configured.

## Implemented

- [Deployment source](src/index.js): immutable container image digest validation, unique service IDs, required environment-variable names, secret references, health-check bounds, and readiness checks that report missing references without exposing secret values.
- [Unit tests](test/deployment.test.js): mutable image rejection, duplicate service names, health checks, missing secrets/environment, and vault lookup failures.
- Dependency-free Node.js package with Node 20/22 CI.

## Limitations

This is a manifest validator, not a deployment engine. It does not build/sign images, deploy services, manage infrastructure, verify provenance, perform rollout/rollback, or run live health probes. The secret-reference callback must consult a trusted secret manager and must not return secret values.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
