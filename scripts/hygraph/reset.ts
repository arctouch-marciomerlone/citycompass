import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyCityCompassSchema } from "../../hygraph/schema/apply.ts";
import { fetchContentTypeNames } from "./content-introspect.ts";
import {
  assertNodeVersion,
  createManagementClient,
  readHygraphManagementEnv,
  uniqueMigrationName,
} from "./env.ts";
import {
  evaluateContentIntrospection,
  evaluateFailClosed,
} from "./fail-closed.ts";
import { ensureLocales } from "./locales.ts";
import {
  fetchLiveSchemaSummary,
  fetchSchemaBackup,
} from "./management-graphql.ts";
import { rewriteManagementPermissionError } from "./permissions.ts";

async function writeBackup(): Promise<void> {
  const backup = await fetchSchemaBackup();
  const backupsDir = path.join(import.meta.dirname, "../../hygraph/backups");
  await mkdir(backupsDir, { recursive: true });
  const fileName = `schema-${backup.exportedAt.replaceAll(":", "-")}.json`;
  await writeFile(
    path.join(backupsDir, fileName),
    `${JSON.stringify(backup, null, 2)}\n`,
    "utf8",
  );
  console.log(`Backup written to hygraph/backups/${fileName}`);
  console.log(`Content export skipped: ${backup.contentExport.reason}`);
}

async function logContentFailClosed(): Promise<void> {
  const content = await fetchContentTypeNames();
  const gate = evaluateContentIntrospection(content.objectNames);
  if (gate.ok) {
    console.log(
      "Content API introspection: City/Place/Category/Neighborhood are not present.",
    );
    return;
  }
  throw new Error(gate.message);
}

async function main(): Promise<void> {
  assertNodeVersion();
  readHygraphManagementEnv();

  try {
    await writeBackup();
  } catch (error) {
    const message = rewriteManagementPermissionError(
      error instanceof Error ? error.message : "backup failed",
    );
    await logContentFailClosed();
    throw new Error(message);
  }

  const live = await fetchLiveSchemaSummary();
  const gate = evaluateFailClosed(live.models);
  if (!gate.ok) {
    throw new Error(gate.message);
  }
  console.log(
    "Fail-closed check passed: only system models (or empty greenfield).",
  );

  const locales = await ensureLocales(live.locales);
  console.log(`Locale path: ${locales.path}`);

  const client = createManagementClient(
    uniqueMigrationName("citycompass-schema"),
  );
  applyCityCompassSchema(client);
  const result = await client.run(true);
  if (result.errors) {
    throw new Error(result.errors);
  }
  console.log(`Schema migration ${result.id} status ${result.status}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "reset failed";
  console.error(rewriteManagementPermissionError(message));
  process.exitCode = 1;
});
