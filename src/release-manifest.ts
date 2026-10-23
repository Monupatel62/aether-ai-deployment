export interface ReleaseArtifactV1 {
  readonly componentId: string;
  readonly version: string;
  readonly sourceCommit: string;
  readonly artifactSha256: string;
  readonly sbomSha256: string;
  readonly builtAt: string;
  readonly targetEnvironment: "development" | "staging" | "production";
  readonly migrationIds: readonly string[];
  readonly approvalRef?: string;
}

export type ReleaseManifestIssueCode =
  | "unsupported_schema"
  | "invalid_release_id"
  | "invalid_component_id"
  | "invalid_version"
  | "invalid_source_commit"
  | "invalid_artifact_digest"
  | "invalid_sbom_digest"
  | "invalid_timestamp"
  | "invalid_environment"
  | "duplicate_migration"
  | "invalid_migration_id"
  | "production_approval_missing";

export interface ReleaseManifestIssue {
  readonly code: ReleaseManifestIssueCode;
  readonly path: string;
}

export interface ReleaseManifestV1 {
  readonly schemaVersion: "1";
  readonly releaseId: string;
  readonly artifacts: readonly ReleaseArtifactV1[];
}

/** Validates release metadata only; it does not verify artifacts, attestations, signatures, or deploy. */
export function validateReleaseManifest(manifest: ReleaseManifestV1): readonly ReleaseManifestIssue[] {
  const issues: ReleaseManifestIssue[] = [];
  if (manifest.schemaVersion !== "1") issues.push({ code: "unsupported_schema", path: "/schemaVersion" });
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(manifest.releaseId)) {
    issues.push({ code: "invalid_release_id", path: "/releaseId" });
  }
  if (manifest.artifacts.length === 0 || manifest.artifacts.length > 500) {
    issues.push({ code: "invalid_component_id", path: "/artifacts" });
  }

  const components = new Set<string>();
  manifest.artifacts.forEach((artifact, index) => {
    const path = `/artifacts/${index}`;
    if (!/^[a-z][a-z0-9-]{0,95}$/.test(artifact.componentId) || components.has(artifact.componentId)) {
      issues.push({ code: "invalid_component_id", path: `${path}/componentId` });
    }
    components.add(artifact.componentId);
    if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(artifact.version)) {
      issues.push({ code: "invalid_version", path: `${path}/version` });
    }
    if (!/^[a-f0-9]{40}$/.test(artifact.sourceCommit)) issues.push({ code: "invalid_source_commit", path: `${path}/sourceCommit` });
    if (!/^[a-f0-9]{64}$/.test(artifact.artifactSha256)) issues.push({ code: "invalid_artifact_digest", path: `${path}/artifactSha256` });
    if (!/^[a-f0-9]{64}$/.test(artifact.sbomSha256)) issues.push({ code: "invalid_sbom_digest", path: `${path}/sbomSha256` });
    if (typeof artifact.builtAt !== "string" || !Number.isFinite(Date.parse(artifact.builtAt))) {
      issues.push({ code: "invalid_timestamp", path: `${path}/builtAt` });
    }
    if (!["development", "staging", "production"].includes(artifact.targetEnvironment)) {
      issues.push({ code: "invalid_environment", path: `${path}/targetEnvironment` });
    }
    const migrationIds = new Set<string>();
    artifact.migrationIds.forEach((id, migrationIndex) => {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(id)) {
        issues.push({ code: "invalid_migration_id", path: `${path}/migrationIds/${migrationIndex}` });
      }
      if (migrationIds.has(id)) issues.push({ code: "duplicate_migration", path: `${path}/migrationIds/${migrationIndex}` });
      migrationIds.add(id);
    });
    if (artifact.targetEnvironment === "production" &&
        (typeof artifact.approvalRef !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,255}$/.test(artifact.approvalRef))) {
      issues.push({ code: "production_approval_missing", path: `${path}/approvalRef` });
    }
  });
  return issues;
}
