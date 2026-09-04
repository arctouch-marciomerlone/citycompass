import { readHygraphManagementEnv } from "./env.ts";

export const CONTENT_MUTATION_PERMISSION_HINT =
  "Content API denied a mutation. HYGRAPH_MANAGEMENT_TOKEN needs Content API Draft create/update and publish (and schedule if you want that evidence). Enable those Permanent Auth Token permissions, then re-run pnpm hygraph:seed. Do not use Hygraph MCP write tools.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export class ContentApiError extends Error {
  readonly permissionDenied: boolean;

  constructor(message: string, permissionDenied: boolean) {
    super(message);
    this.name = "ContentApiError";
    this.permissionDenied = permissionDenied;
  }
}

function looksLikePermissionError(message: string, status: number): boolean {
  if (status === 401 || status === 403) {
    return true;
  }
  const lower = message.toLowerCase();
  return (
    lower.includes("permission") ||
    lower.includes("not authorized") ||
    lower.includes("unauthorized") ||
    lower.includes("forbidden") ||
    lower.includes("not allowed") ||
    lower.includes("access denied")
  );
}

function collectErrorMessages(body: unknown): string[] {
  if (!isRecord(body) || !Array.isArray(body["errors"])) {
    return [];
  }
  const messages: string[] = [];
  for (const item of body["errors"]) {
    if (isRecord(item) && isString(item["message"])) {
      messages.push(item["message"]);
    }
  }
  return messages;
}

export function rewriteContentPermissionError(message: string): string {
  if (looksLikePermissionError(message, 0)) {
    return CONTENT_MUTATION_PERMISSION_HINT;
  }
  return message;
}

export async function contentGraphql(
  query: string,
  variables?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const env = readHygraphManagementEnv();
  const response = await fetch(env.contentApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.managementToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body: unknown = await response.json();
  const errorMessages = collectErrorMessages(body);
  if (!response.ok || errorMessages.length > 0) {
    const message =
      errorMessages.length > 0
        ? errorMessages.join("; ")
        : `Content API HTTP ${String(response.status)}`;
    throw new ContentApiError(
      message,
      looksLikePermissionError(message, response.status),
    );
  }

  if (!isRecord(body) || !isRecord(body["data"])) {
    throw new ContentApiError("Content API response missing data", false);
  }
  return body["data"];
}
