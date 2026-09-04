import { Client } from "@hygraph/management-sdk";

export interface HygraphManagementEnv {
  contentApiUrl: string;
  managementApiUrl: string;
  managementToken: string;
}

function readEnv(name: string): string | undefined {
  for (const [key, value] of Object.entries(process.env)) {
    if (key === name) {
      return value;
    }
  }
  return undefined;
}

function readRequired(name: string): string {
  const value = readEnv(name);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value.trim();
}

export function assertNodeVersion(): void {
  const version = process.versions.node;
  const parts = version.split(".");
  const major = Number(parts[0]);
  const minor = Number(parts[1]);
  if (!Number.isFinite(major) || !Number.isFinite(minor)) {
    throw new Error(`Could not parse Node version ${version}`);
  }
  if (major < 22 || (major === 22 && minor < 6)) {
    throw new Error(
      `hygraph scripts require Node 22.6+ (nvm use from .nvmrc). Current: ${version}`,
    );
  }
}

/** Script-only. Reads `HYGRAPH_CONTENT_API_URL`, `HYGRAPH_MANAGEMENT_API_URL`, `HYGRAPH_MANAGEMENT_TOKEN`. Not used by the Next.js app. */
export function readHygraphManagementEnv(): HygraphManagementEnv {
  return {
    contentApiUrl: readRequired("HYGRAPH_CONTENT_API_URL"),
    managementApiUrl: readRequired("HYGRAPH_MANAGEMENT_API_URL"),
    managementToken: readRequired("HYGRAPH_MANAGEMENT_TOKEN"),
  };
}

export function createManagementClient(name: string): Client {
  const env = readHygraphManagementEnv();
  return new Client({
    authToken: env.managementToken,
    endpoint: env.contentApiUrl,
    managementEndpoint: env.managementApiUrl,
    name,
  });
}

export function uniqueMigrationName(prefix: string): string {
  return `${prefix}-${String(Date.now())}`;
}
