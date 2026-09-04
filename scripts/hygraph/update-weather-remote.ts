import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyCityWeatherRemotePatch } from "../../hygraph/schema/apply.ts";
import { ModelApiId } from "../../hygraph/schema/constants.ts";
import {
  assertNodeVersion,
  createManagementClient,
  uniqueMigrationName,
} from "./env.ts";
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

async function main(): Promise<void> {
  assertNodeVersion();

  try {
    await writeBackup();
  } catch (error) {
    throw new Error(
      rewriteManagementPermissionError(
        error instanceof Error ? error.message : "backup failed",
      ),
    );
  }

  const live = await fetchLiveSchemaSummary();
  const hasCity = live.models.some((model) => model.apiId === ModelApiId.City);
  if (!hasCity) {
    throw new Error(
      "City model is missing. Run pnpm hygraph:reset on a clean environment first.",
    );
  }

  const client = createManagementClient(
    uniqueMigrationName("citycompass-weather-remote"),
  );
  applyCityWeatherRemotePatch(client);
  const result = await client.run(true);
  if (result.errors) {
    throw new Error(result.errors);
  }
  console.log(`Weather remote migration ${result.id} status ${result.status}`);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "update-weather-remote failed";
  console.error(rewriteManagementPermissionError(message));
  process.exitCode = 1;
});
