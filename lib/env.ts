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

function readTrimmed(name: string): string | undefined {
  const value = readEnv(name);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function readSiteUrl(): string {
  return readTrimmed("NEXT_PUBLIC_SITE_URL") ?? DEFAULT_SITE_URL;
}

export function readHygraphContentApiUrl(): string {
  const value = readTrimmed("HYGRAPH_CONTENT_API_URL");
  if (value === undefined) {
    throw new Error(
      "Missing required environment variable HYGRAPH_CONTENT_API_URL",
    );
  }
  return value;
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
