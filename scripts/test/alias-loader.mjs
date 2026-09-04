import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");

function resolveAlias(specifier) {
  if (!specifier.startsWith("@/")) {
    return undefined;
  }
  const withoutAlias = specifier.slice(2);
  const candidates = [
    path.join(root, withoutAlias),
    path.join(root, `${withoutAlias}.ts`),
    path.join(root, `${withoutAlias}.tsx`),
    path.join(root, withoutAlias, "index.ts"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }
  return undefined;
}

export async function resolve(specifier, context, nextResolve) {
  const aliased = resolveAlias(specifier);
  if (aliased !== undefined) {
    return { url: aliased, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
