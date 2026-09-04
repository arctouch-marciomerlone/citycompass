import type { Client } from "@hygraph/management-sdk";
import {
  LocaleApiId,
  REQUIRED_LOCALES,
} from "../../hygraph/schema/constants.ts";
import { createManagementClient, uniqueMigrationName } from "./env.ts";
import type { LiveLocale } from "./management-graphql.ts";

export interface LocaleSetupResult {
  path: "already-present" | "renamed-en" | "created-en-us-deleted-en";
}

function hasRequiredLocales(locales: readonly LiveLocale[]): boolean {
  const ids = new Set(locales.map((locale) => locale.apiId));
  const defaultLocale = locales.find((locale) => locale.isDefault);
  return (
    REQUIRED_LOCALES.every((apiId) => ids.has(apiId)) &&
    defaultLocale?.apiId === LocaleApiId.EnUs &&
    !ids.has(LocaleApiId.En)
  );
}

async function runMigration(
  namePrefix: string,
  schedule: (client: Client) => void,
): Promise<void> {
  const client = createManagementClient(uniqueMigrationName(namePrefix));
  schedule(client);
  const result = await client.run(true);
  if (result.errors) {
    throw new Error(result.errors);
  }
  console.log(`Migration ${result.id} status ${result.status}`);
}

export async function ensureLocales(
  locales: readonly LiveLocale[],
): Promise<LocaleSetupResult> {
  if (hasRequiredLocales(locales)) {
    console.log("Locales already en_US (default), pt_BR, zh_CN");
    return { path: "already-present" };
  }

  const ids = new Set(locales.map((locale) => locale.apiId));
  if (ids.has(LocaleApiId.En) && !ids.has(LocaleApiId.EnUs)) {
    try {
      await runMigration("citycompass-locale-rename", (client) => {
        client.updateLocale({
          apiId: LocaleApiId.En,
          newApiId: LocaleApiId.EnUs,
          displayName: "English (United States)",
          isDefault: true,
        });
      });
      await runMigration("citycompass-locale-add", (client) => {
        client.createLocale({
          apiId: LocaleApiId.PtBr,
          displayName: "Português (Brasil)",
        });
        client.createLocale({
          apiId: LocaleApiId.ZhCn,
          displayName: "中文 (简体)",
        });
      });
      return { path: "renamed-en" };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "unknown locale rename error";
      console.log(
        `Locale rename en → en_US failed (${message}). Trying create en_US, set default, delete en.`,
      );
    }

    await runMigration("citycompass-locale-create-en-us", (client) => {
      client.createLocale({
        apiId: LocaleApiId.EnUs,
        displayName: "English (United States)",
      });
    });
    await runMigration("citycompass-locale-default-en-us", (client) => {
      client.updateLocale({
        apiId: LocaleApiId.EnUs,
        isDefault: true,
      });
    });
    await runMigration("citycompass-locale-delete-en", (client) => {
      client.deleteLocale({
        apiId: LocaleApiId.En,
      });
    });
    await runMigration("citycompass-locale-add", (client) => {
      client.createLocale({
        apiId: LocaleApiId.PtBr,
        displayName: "Português (Brasil)",
      });
      client.createLocale({
        apiId: LocaleApiId.ZhCn,
        displayName: "中文 (简体)",
      });
    });
    return { path: "created-en-us-deleted-en" };
  }

  throw new Error(
    "Live locales are not the Growth-safe set (en only, or en_US/pt_BR/zh_CN). Stop and record in docs/decisions.md.",
  );
}
