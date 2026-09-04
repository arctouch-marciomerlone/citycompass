import { readHygraphManagementEnv } from "./env.ts";
import { rewriteManagementPermissionError } from "./permissions.ts";

export interface LiveLocale {
  apiId: string;
  displayName: string;
  isDefault: boolean;
}

export interface LiveModel {
  apiId: string;
  isSystem: boolean;
}

export interface LiveSchemaSummary {
  projectId: string;
  environmentId: string;
  environmentName: string;
  models: readonly LiveModel[];
  locales: readonly LiveLocale[];
}

export interface SchemaBackupPayload {
  exportedAt: string;
  environmentName: string;
  schemaDefinition: unknown;
  contentExport: {
    included: false;
    reason: string;
  };
}

const SECRET_KEY =
  /token|secret|authorization|password|apikey|api_key|clientsecret|authtoken/i;

const CONTENT_EXPORT_SKIP_REASON =
  "Management API Mutation type only exposes submitBatchChanges. No content-export field is available.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function graphQlMessages(body: unknown): string[] {
  if (!isRecord(body) || !Array.isArray(body["errors"])) {
    return [];
  }
  return body["errors"].flatMap((error) => {
    if (isRecord(error) && isString(error["message"])) {
      return [error["message"]];
    }
    return [];
  });
}

async function managementGraphql(
  query: string,
  variables?: Record<string, unknown>,
): Promise<unknown> {
  const env = readHygraphManagementEnv();
  const response = await fetch(env.managementApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.managementToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Management API HTTP ${String(response.status)}`);
  }

  const body: unknown = await response.json();
  const messages = graphQlMessages(body);
  if (messages.length > 0) {
    throw new Error(
      rewriteManagementPermissionError(
        `Management API GraphQL error: ${messages.join("; ")}`,
      ),
    );
  }
  if (!isRecord(body) || !("data" in body)) {
    throw new Error("Management API response missing data");
  }
  return body["data"];
}

function environmentsFromViewer(data: unknown): {
  projectId: string;
  environments: readonly Record<string, unknown>[];
}[] {
  if (!isRecord(data) || !isRecord(data["viewer"])) {
    throw new Error("Management API viewer missing");
  }
  const viewer = data["viewer"];
  if (isRecord(viewer["project"]) && isString(viewer["project"]["id"])) {
    const environments = viewer["project"]["environments"];
    if (!Array.isArray(environments)) {
      throw new Error("Management API project environments missing");
    }
    return [
      {
        projectId: viewer["project"]["id"],
        environments: environments.filter((item) => isRecord(item)),
      },
    ];
  }
  if (Array.isArray(viewer["projects"])) {
    return viewer["projects"].flatMap((project) => {
      if (
        !isRecord(project) ||
        !isString(project["id"]) ||
        !Array.isArray(project["environments"])
      ) {
        return [];
      }
      return [
        {
          projectId: project["id"],
          environments: project["environments"].filter((item) =>
            isRecord(item),
          ),
        },
      ];
    });
  }
  throw new Error("Management API viewer has no project");
}

export async function resolveEnvironment(): Promise<{
  projectId: string;
  environmentId: string;
  environmentName: string;
}> {
  const env = readHygraphManagementEnv();
  const data = await managementGraphql(`
    {
      viewer {
        ... on TokenViewer {
          project {
            id
            environments {
              id
              name
              endpoint
              newDeliveryUrl
            }
          }
        }
        ... on UserViewer {
          projects {
            id
            environments {
              id
              name
              endpoint
              newDeliveryUrl
            }
          }
        }
        ... on AppTokenViewer {
          project {
            id
            environments {
              id
              name
              endpoint
              newDeliveryUrl
            }
          }
        }
      }
    }
  `);

  for (const project of environmentsFromViewer(data)) {
    for (const environment of project.environments) {
      const id = environment["id"];
      const name = environment["name"];
      const endpoint = environment["endpoint"];
      const delivery = environment["newDeliveryUrl"];
      if (!isString(id) || !isString(name)) {
        continue;
      }
      if (endpoint === env.contentApiUrl || delivery === env.contentApiUrl) {
        return {
          projectId: project.projectId,
          environmentId: id,
          environmentName: name,
        };
      }
    }
  }

  throw new Error(
    "Could not match HYGRAPH_CONTENT_API_URL to a Management API environment",
  );
}

function parseModels(value: unknown): LiveModel[] {
  if (!Array.isArray(value)) {
    throw new Error("contentModel.models is not a list");
  }
  return value.map((item) => {
    if (
      !isRecord(item) ||
      !isString(item["apiId"]) ||
      typeof item["isSystem"] !== "boolean"
    ) {
      throw new Error("contentModel.models item is invalid");
    }
    return { apiId: item["apiId"], isSystem: item["isSystem"] };
  });
}

function parseLocales(value: unknown): LiveLocale[] {
  if (!Array.isArray(value)) {
    throw new Error("contentModel.locales is not a list");
  }
  return value.map((item) => {
    if (
      !isRecord(item) ||
      !isString(item["apiId"]) ||
      !isString(item["displayName"]) ||
      typeof item["isDefault"] !== "boolean"
    ) {
      throw new Error("contentModel.locales item is invalid");
    }
    return {
      apiId: item["apiId"],
      displayName: item["displayName"],
      isDefault: item["isDefault"],
    };
  });
}

export async function fetchLiveSchemaSummary(): Promise<LiveSchemaSummary> {
  const resolved = await resolveEnvironment();
  const data = await managementGraphql(
    `
      query LiveSchema($projectId: ID!, $environmentName: String!) {
        viewer {
          project(id: $projectId) {
            environment(name: $environmentName) {
              contentModel {
                models(includeSystemModels: true) {
                  apiId
                  isSystem
                }
                locales {
                  apiId
                  displayName
                  isDefault
                }
              }
            }
          }
        }
      }
    `,
    {
      projectId: resolved.projectId,
      environmentName: resolved.environmentName,
    },
  );

  if (
    !isRecord(data) ||
    !isRecord(data["viewer"]) ||
    !isRecord(data["viewer"]["project"])
  ) {
    throw new Error("Live schema project missing");
  }
  const environment = data["viewer"]["project"]["environment"];
  if (!isRecord(environment) || !isRecord(environment["contentModel"])) {
    throw new Error("Live schema contentModel missing");
  }

  return {
    projectId: resolved.projectId,
    environmentId: resolved.environmentId,
    environmentName: resolved.environmentName,
    models: parseModels(environment["contentModel"]["models"]),
    locales: parseLocales(environment["contentModel"]["locales"]),
  };
}

export function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item));
  }
  if (!isRecord(value)) {
    return value;
  }
  const redacted: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    redacted[key] = SECRET_KEY.test(key) ? "[redacted]" : redactSecrets(nested);
  }
  return redacted;
}

export async function fetchSchemaBackup(): Promise<SchemaBackupPayload> {
  const resolved = await resolveEnvironment();
  const data = await managementGraphql(
    `
      query SchemaAsCode($projectId: ID!, $environmentName: String!) {
        viewer {
          project(id: $projectId) {
            environment(name: $environmentName) {
              schemaDefinition
            }
          }
        }
      }
    `,
    {
      projectId: resolved.projectId,
      environmentName: resolved.environmentName,
    },
  );

  if (
    !isRecord(data) ||
    !isRecord(data["viewer"]) ||
    !isRecord(data["viewer"]["project"])
  ) {
    throw new Error("Schema as Code project missing");
  }
  const environment = data["viewer"]["project"]["environment"];
  if (!isRecord(environment) || !("schemaDefinition" in environment)) {
    throw new Error("Environment.schemaDefinition missing");
  }

  return {
    exportedAt: new Date().toISOString(),
    environmentName: resolved.environmentName,
    schemaDefinition: redactSecrets(environment["schemaDefinition"]),
    contentExport: {
      included: false,
      reason: CONTENT_EXPORT_SKIP_REASON,
    },
  };
}

export { CONTENT_EXPORT_SKIP_REASON };
