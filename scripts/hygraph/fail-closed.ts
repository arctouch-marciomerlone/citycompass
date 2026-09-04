import { CITYCOMPASS_MODEL_API_IDS } from "../../hygraph/schema/constants.ts";
import type { LiveModel } from "./management-graphql.ts";

export type FailClosedResult = { ok: true } | { ok: false; message: string };

export function evaluateFailClosed(
  models: readonly LiveModel[],
): FailClosedResult {
  const nonSystem = models.filter((model) => !model.isSystem);
  const citycompass = nonSystem.filter((model) =>
    CITYCOMPASS_MODEL_API_IDS.some((apiId) => apiId === model.apiId),
  );
  const unexpected = nonSystem.filter(
    (model) =>
      !CITYCOMPASS_MODEL_API_IDS.some((apiId) => apiId === model.apiId),
  );

  if (unexpected.length > 0) {
    const names = unexpected.map((model) => model.apiId).join(", ");
    return {
      ok: false,
      message: `hygraph:reset refused: unexpected non-system models exist (${names}). Official Schema as Code import is additive and will conflict.`,
    };
  }

  if (citycompass.length > 0) {
    const names = citycompass.map((model) => model.apiId).join(", ");
    return {
      ok: false,
      message: `hygraph:reset refused: CityCompass models already exist (${names}). Schema is already applied. Do not run reset again on this project.`,
    };
  }

  return { ok: true };
}

export function evaluateContentIntrospection(
  objectNames: readonly string[],
): FailClosedResult {
  const present = CITYCOMPASS_MODEL_API_IDS.filter((apiId) =>
    objectNames.includes(apiId),
  );
  if (present.length > 0) {
    return {
      ok: false,
      message: `hygraph:reset refused: CityCompass models already exist (${present.join(", ")}). Schema is already applied.`,
    };
  }
  return { ok: true };
}
