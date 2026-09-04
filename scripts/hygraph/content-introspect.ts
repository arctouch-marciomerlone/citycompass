import { readHygraphManagementEnv } from "./env.ts";

function readEnv(name: string): string | undefined {
  for (const [key, value] of Object.entries(process.env)) {
    if (key === name) {
      return value;
    }
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export async function fetchContentTypeNames(): Promise<{
  objectNames: readonly string[];
  localeNames: readonly string[];
}> {
  const env = readHygraphManagementEnv();
  const token = readEnv("HYGRAPH_READ_TOKEN") ?? env.managementToken;
  const response = await fetch(env.contentApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        {
          locale: __type(name: "Locale") {
            enumValues { name }
          }
          __schema {
            types {
              kind
              name
            }
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Content API HTTP ${String(response.status)}`);
  }

  const body: unknown = await response.json();
  if (!isRecord(body) || !isRecord(body["data"])) {
    throw new Error("Content API introspection missing data");
  }
  const data = body["data"];
  const schema = data["__schema"];
  if (!isRecord(schema) || !Array.isArray(schema["types"])) {
    throw new Error("Content API introspection missing types");
  }

  const objectNames = schema["types"].flatMap((item) => {
    if (isRecord(item) && item["kind"] === "OBJECT" && isString(item["name"])) {
      return [item["name"]];
    }
    return [];
  });

  const localeType = data["locale"];
  const localeNames: string[] = [];
  if (isRecord(localeType) && Array.isArray(localeType["enumValues"])) {
    for (const value of localeType["enumValues"]) {
      if (isRecord(value) && isString(value["name"])) {
        localeNames.push(value["name"]);
      }
    }
  }

  return { objectNames, localeNames };
}
