import test from "node:test";
import assert from "node:assert/strict";
import { checkEnvironmentRequirements, DeploymentManifestError, validateReleaseManifest } from "../src/index.js";

const manifest = { schemaVersion: 1, releaseId: "release-2026-10-23", services: [
  { name: "api", image: "registry.example.test/aether/api@sha256:" + "a".repeat(64), requiredEnv: ["DATABASE_URL"], secretRefs: ["secretref:prod/api-key"], healthCheck: { path: "/health", timeoutMs: 5000 } },
] };

test("validates immutable image references and freezes release manifest", () => {
  const result = validateReleaseManifest(manifest);
  assert.equal(result.services[0].name, "api");
  assert.equal(Object.isFrozen(result.services), true);
});

test("rejects mutable tags, duplicate service names, and invalid probes", () => {
  assert.throws(() => validateReleaseManifest({ ...manifest, services: [{ ...manifest.services[0], image: "registry/api:latest" }] }), (e) => e.code === "image_not_immutable");
  assert.throws(() => validateReleaseManifest({ ...manifest, services: [manifest.services[0], manifest.services[0]] }), DeploymentManifestError);
  assert.throws(() => validateReleaseManifest({ ...manifest, services: [{ ...manifest.services[0], healthCheck: { path: "//external", timeoutMs: 1 } }] }), DeploymentManifestError);
});

test("reports missing environment keys and secret references without exposing values", () => {
  const valid = validateReleaseManifest(manifest);
  const result = checkEnvironmentRequirements(valid, { DATABASE_URL: "private-db-url" }, () => false);
  assert.equal(result.ready, false);
  assert.deepEqual(result.findings.map((f) => f.kind), ["secret_reference"]);
  assert.equal(JSON.stringify(result).includes("private-db-url"), false);
});

test("fails readiness closed if secret lookup throws", () => {
  const valid = validateReleaseManifest(manifest);
  const result = checkEnvironmentRequirements(valid, {}, () => { throw new Error("vault unavailable"); });
  assert.equal(result.ready, false);
  assert.equal(result.findings.length, 2);
});


test("rejects command-like image references and unsafe health paths", () => {
  assert.throws(() => validateReleaseManifest({ ...manifest, services: [{ ...manifest.services[0], image: "registry.example.test/aether/api;echo@sha256:" + "a".repeat(64) }] }), (e) => e.code === "image_not_immutable");
  assert.throws(() => validateReleaseManifest({ ...manifest, services: [{ ...manifest.services[0], healthCheck: { path: "/health?next=//external", timeoutMs: 1000 } }] }), (e) => e.code === "invalid_health_check");
});

test("does not count inherited environment properties as configured", () => {
  const valid = validateReleaseManifest(manifest);
  const environment = Object.create({ DATABASE_URL: "inherited-value" });
  const result = checkEnvironmentRequirements(valid, environment, () => true);
  assert.equal(result.ready, false);
  assert.equal(result.findings[0].name, "DATABASE_URL");
});
