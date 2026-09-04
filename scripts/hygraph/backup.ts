import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertNodeVersion, readHygraphManagementEnv } from "./env.ts";
import { fetchSchemaBackup } from "./management-graphql.ts";
import { rewriteManagementPermissionError } from "./permissions.ts";

async function main(): Promise<void> {
  assertNodeVersion();
  readHygraphManagementEnv();

  const backup = await fetchSchemaBackup();
  const backupsDir = path.join(import.meta.dirname, "../../hygraph/backups");
  await mkdir(backupsDir, { recursive: true });

  const fileName = `schema-${backup.exportedAt.replaceAll(":", "-")}.json`;
  const filePath = path.join(backupsDir, fileName);
  await writeFile(filePath, `${JSON.stringify(backup, null, 2)}\n`, "utf8");

  console.log(`Wrote schema backup to hygraph/backups/${fileName}`);
  console.log(`Content export skipped: ${backup.contentExport.reason}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "backup failed";
  console.error(rewriteManagementPermissionError(message));
  process.exitCode = 1;
});
