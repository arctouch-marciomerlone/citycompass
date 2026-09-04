import { defineConstObject, type ValueOf } from "@/lib/types/const-object";

/**
 * Next.js runtime env. Reads:
 * `HYGRAPH_CONTENT_API_URL`, `HYGRAPH_READ_TOKEN`, `HYGRAPH_WEBHOOK_SECRET`,
 * `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
 * `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`.
 *
 * Script-only (not read here): `HYGRAPH_MANAGEMENT_API_URL`,
 * `HYGRAPH_MANAGEMENT_TOKEN`. Unused: `HYGRAPH_PREVIEW_TOKEN`,
 * `DEFAULT_LOCALE`, `SUPPORTED_LOCALES` (locales live in `lib/locale.ts`).
 */
const DEFAULT_SITE_URL = "http://localhost:3000";
const GRAPHQL_TIMEOUT_MS = 8_000;
const WEATHER_TIMEOUT_MS = 6_000;
const WEATHER_REVALIDATE_SECONDS = 600;
const CONTENT_REVALIDATE_SECONDS = 3_600;

function readEnv(name: string): string | undefined {
  for (const [key, value] of Object.entries(process.env)) {
    if (key === name) {
      return value;
    }
  }
  return undefined;
}

export function sanitizeEnvValue(value: string): string {
  let next = value.replace(/^\uFEFF/, "").trim();
  const pairs = [
    ['"', '"'],
    ["'", "'"],
    ["`", "`"],
    ["<", ">"],
  ] as const;
  for (const [open, close] of pairs) {
    if (next.startsWith(open) && next.endsWith(close) && next.length >= 2) {
      next = next.slice(open.length, -close.length).trim();
    }
  }
  return next;
}

export const HygraphFrontendEnvKey = defineConstObject({
  ContentApiUrl: "HYGRAPH_CONTENT_API_URL",
  ReadToken: "HYGRAPH_READ_TOKEN",
  WebhookSecret: "HYGRAPH_WEBHOOK_SECRET",
});

export type HygraphFrontendEnvKey = ValueOf<typeof HygraphFrontendEnvKey>;

export interface EnvKeySummary {
  readonly name: string;
  readonly set: boolean;
  readonly chars: number;
  readonly scheme?: string;
  readonly contentPath?: boolean;
}

export function summarizeEnvValue(
  name: string,
  raw: string | undefined,
): EnvKeySummary {
  if (raw === undefined) {
    return { name, set: false, chars: 0 };
  }
  const value = sanitizeEnvValue(raw);
  if (value === "") {
    return { name, set: false, chars: 0 };
  }
  if (name !== "HYGRAPH_CONTENT_API_URL") {
    return { name, set: true, chars: value.length };
  }
  try {
    const parsed = new URL(value);
    return {
      name,
      set: true,
      chars: value.length,
      scheme: parsed.protocol.replace(":", ""),
      contentPath:
        parsed.pathname.includes("/content/") ||
        parsed.pathname.includes("/v2/"),
    };
  } catch {
    return { name, set: true, chars: value.length, scheme: "invalid" };
  }
}

export function formatEnvKeySummary(summary: EnvKeySummary): string {
  if (!summary.set) {
    return `${summary.name} set=false`;
  }
  const parts = [`${summary.name} set=true`, `chars=${String(summary.chars)}`];
  if (summary.scheme !== undefined) {
    parts.push(`scheme=${summary.scheme}`);
  }
  if (summary.contentPath !== undefined) {
    parts.push(`contentPath=${String(summary.contentPath)}`);
  }
  return parts.join(" ");
}

let hygraphFrontendEnvLogged = false;

export function logHygraphFrontendEnv(): void {
  if (hygraphFrontendEnvLogged) {
    return;
  }
  hygraphFrontendEnvLogged = true;
  for (const name of Object.values(HygraphFrontendEnvKey)) {
    console.info(formatEnvKeySummary(summarizeEnvValue(name, readEnv(name))));
  }
}

function readTrimmed(name: string): string | undefined {
  const value = readEnv(name);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = sanitizeEnvValue(value);
  return trimmed === "" ? undefined : trimmed;
}

export function readSiteUrl(): string {
  return readTrimmed("NEXT_PUBLIC_SITE_URL") ?? DEFAULT_SITE_URL;
}

/**
 * High Performance Content API:
 * `https://<region>.cdn.hygraph.com/content/<projectId>/<environment>`
 * https://hygraph.com/docs/api-reference/basics/authorization
 *
 * Regular Content API still uses `/v2/`. Management API is
 * `https://management-<region>.hygraph.com/graphql` and must not be used here.
 */
export function assertHygraphContentApiUrl(value: string): string {
  const candidate = sanitizeEnvValue(value);
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("HYGRAPH_CONTENT_API_URL must be a valid https URL");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("HYGRAPH_CONTENT_API_URL must be an https URL");
  }
  const host = parsed.hostname.toLowerCase();
  if (host.startsWith("management-") || host === "management.hygraph.com") {
    throw new Error(
      "HYGRAPH_CONTENT_API_URL is set to the Management API. Use the High Performance Content API from Project Settings → Access → Endpoints (https://<region>.cdn.hygraph.com/content/<projectId>/<environment>).",
    );
  }
  const path = parsed.pathname;
  const isContentPath = path.includes("/content/");
  const isLegacyV2Path = path.includes("/v2/");
  if (!isContentPath && !isLegacyV2Path) {
    throw new Error(
      "HYGRAPH_CONTENT_API_URL must be a Content API URL (/content/ or /v2/), not the Management API (/graphql).",
    );
  }
  return parsed.href;
}

export function readHygraphContentApiUrl(): string {
  const value = readTrimmed("HYGRAPH_CONTENT_API_URL");
  if (value === undefined) {
    throw new Error(
      "Missing required environment variable HYGRAPH_CONTENT_API_URL",
    );
  }
  return assertHygraphContentApiUrl(value);
}

export function readHygraphReadToken(): string {
  const value = readTrimmed("HYGRAPH_READ_TOKEN");
  if (value === undefined) {
    throw new Error("Missing required environment variable HYGRAPH_READ_TOKEN");
  }
  return value;
}

export function readWebhookSecret(): string | undefined {
  return readTrimmed("HYGRAPH_WEBHOOK_SECRET");
}

export function readPublicMapsApiKey(): string | undefined {
  return readTrimmed("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
}

export function readPublicMapsMapId(): string | undefined {
  return readTrimmed("NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID");
}

export function graphqlTimeoutMs(): number {
  return GRAPHQL_TIMEOUT_MS;
}

export function weatherTimeoutMs(): number {
  return WEATHER_TIMEOUT_MS;
}

export function weatherRevalidateSeconds(): number {
  return WEATHER_REVALIDATE_SECONDS;
}

export function contentRevalidateSeconds(): number {
  return CONTENT_REVALIDATE_SECONDS;
}
