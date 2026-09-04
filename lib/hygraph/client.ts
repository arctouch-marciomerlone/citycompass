import { isRecord, isString, readUnknownArray } from "@/lib/guards";
import {
  contentRevalidateSeconds,
  graphqlTimeoutMs,
  readHygraphContentApiUrl,
  readHygraphReadToken,
} from "@/lib/env";
import type { CacheTag } from "@/lib/hygraph/enumerations";

export class HygraphQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HygraphQueryError";
  }
}

function collectErrorMessages(body: unknown): string[] {
  if (!isRecord(body)) {
    return [];
  }
  const errors = readUnknownArray(body, "errors");
  if (errors === undefined) {
    return [];
  }
  const messages: string[] = [];
  for (const item of errors) {
    if (isRecord(item) && isString(item["message"])) {
      messages.push(item["message"]);
    }
  }
  return messages;
}

export async function contentGraphql(
  query: string,
  options: {
    readonly variables?: Record<string, unknown>;
    readonly tags: readonly CacheTag[];
    readonly revalidateSeconds?: number;
    readonly timeoutMs?: number;
  },
): Promise<Record<string, unknown>> {
  const url = readHygraphContentApiUrl();
  const token = readHygraphReadToken();
  const timeoutMs = options.timeoutMs ?? graphqlTimeoutMs();
  const revalidateSeconds =
    options.revalidateSeconds ?? contentRevalidateSeconds();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables: options.variables ?? {},
    }),
    cache: "force-cache",
    next: {
      revalidate: revalidateSeconds,
      tags: [...options.tags],
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  const body: unknown = await response.json();
  const errorMessages = collectErrorMessages(body);
  if (!response.ok || errorMessages.length > 0) {
    const message =
      errorMessages.length > 0
        ? errorMessages.join("; ")
        : `Content API HTTP ${String(response.status)}`;
    throw new HygraphQueryError(message);
  }
  if (!isRecord(body) || !isRecord(body["data"])) {
    throw new HygraphQueryError("Content API returned no data");
  }
  return body["data"];
}
