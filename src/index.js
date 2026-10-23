const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
export class DeploymentManifestError extends Error {
  constructor(code, message = "Deployment manifest is invalid") { super(message); this.name = "DeploymentManifestError"; this.code = code; }
}
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function validId(value) { return typeof value === "string" && ID.test(value) && value.trim() === value; }

export function validateReleaseManifest(input) {
  if (!isRecord(input) || input.schemaVersion !== 1 || !validId(input.releaseId)) throw new DeploymentManifestError("invalid_manifest");
  if (!Array.isArray(input.services) || input.services.length === 0 || input.services.length > 100) throw new DeploymentManifestError("invalid_services");
  const seen = new Set();
  const services = input.services.map((service) => {
    if (!isRecord(service) || !validId(service.name) || seen.has(service.name)) throw new DeploymentManifestError("invalid_service");
    seen.add(service.name);
    if (typeof service.image !== "string" || !service.image.includes("@") || !DIGEST.test(service.image.split("@").at(-1))) throw new DeploymentManifestError("image_not_immutable");
    if (!Array.isArray(service.requiredEnv) || service.requiredEnv.some((v) => typeof v !== "string" || !/^[A-Z][A-Z0-9_]{0,127}$/.test(v)) || new Set(service.requiredEnv).size !== service.requiredEnv.length) throw new DeploymentManifestError("invalid_required_env");
    if (!Array.isArray(service.secretRefs) || service.secretRefs.some((v) => typeof v !== "string" || !/^secretref:[A-Za-z0-9._/-]{1,200}$/.test(v))) throw new DeploymentManifestError("invalid_secret_refs");
    if (!isRecord(service.healthCheck) || typeof service.healthCheck.path !== "string" || !service.healthCheck.path.startsWith("/") || service.healthCheck.path.startsWith("//")
      || !Number.isSafeInteger(service.healthCheck.timeoutMs) || service.healthCheck.timeoutMs < 100 || service.healthCheck.timeoutMs > 120_000) throw new DeploymentManifestError("invalid_health_check");
    return Object.freeze({ name: service.name, image: service.image, requiredEnv: Object.freeze([...service.requiredEnv]), secretRefs: Object.freeze([...service.secretRefs]), healthCheck: Object.freeze({ path: service.healthCheck.path, timeoutMs: service.healthCheck.timeoutMs }) });
  });
  return Object.freeze({ schemaVersion: 1, releaseId: input.releaseId, services: Object.freeze(services) });
}

/** Checks presence only. Never accepts or returns actual secret values. */
export function checkEnvironmentRequirements(manifest, environment, secretReferenceExists) {
  if (!manifest || !Array.isArray(manifest.services) || !isRecord(environment) || typeof secretReferenceExists !== "function") throw new DeploymentManifestError("invalid_readiness_input");
  const findings = [];
  for (const service of manifest.services) {
    for (const name of service.requiredEnv) {
      if (!(name in environment) || environment[name] === undefined || environment[name] === null || environment[name] === "") findings.push({ service: service.name, kind: "environment", name, ready: false });
    }
    for (const reference of service.secretRefs) {
      let exists = false;
      try { exists = secretReferenceExists(reference) === true; } catch { exists = false; }
      if (!exists) findings.push({ service: service.name, kind: "secret_reference", name: reference, ready: false });
    }
  }
  return Object.freeze({ ready: findings.length === 0, findings: Object.freeze(findings.map(Object.freeze)) });
}
