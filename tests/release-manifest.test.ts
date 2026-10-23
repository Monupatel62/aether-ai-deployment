import { describe, expect, it } from "vitest";
import { validateReleaseManifest } from "../src/index.js";
import type { ReleaseManifestV1 } from "../src/index.js";

const valid: ReleaseManifestV1 = {
  schemaVersion: "1",
  releaseId: "release-2026-10-23",
  artifacts: [{
    componentId: "gateway",
    version: "1.2.3",
    sourceCommit: "a".repeat(40),
    artifactSha256: "b".repeat(64),
    sbomSha256: "c".repeat(64),
    builtAt: "2026-10-23T12:00:00.000Z",
    targetEnvironment: "staging",
    migrationIds: ["001-add-index"]
  }]
};

describe("release manifest validation", () => {
  it("accepts a complete staging release manifest", () => {
    expect(validateReleaseManifest(valid)).toEqual([]);
  });

  it("requires a reference to production approval", () => {
    const production: ReleaseManifestV1 = {
      ...valid,
      artifacts: [{ ...valid.artifacts[0]!, targetEnvironment: "production" }]
    };
    expect(validateReleaseManifest(production).map(issue => issue.code)).toContain("production_approval_missing");
    expect(validateReleaseManifest({ ...production, artifacts: [{ ...production.artifacts[0]!, approvalRef: "change/123" }] })).toEqual([]);
  });

  it("rejects malformed digests, duplicate components, and duplicate migrations", () => {
    const artifact = { ...valid.artifacts[0]!, artifactSha256: "bad", migrationIds: ["001", "001"] };
    const invalid: ReleaseManifestV1 = { ...valid, artifacts: [artifact, artifact] };
    const codes = validateReleaseManifest(invalid).map(issue => issue.code);
    expect(codes).toContain("invalid_artifact_digest");
    expect(codes).toContain("invalid_component_id");
    expect(codes).toContain("duplicate_migration");
  });
});
