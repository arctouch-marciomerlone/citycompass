import { isRecord, readRecord, readString } from "@/lib/guards";
import { CacheTag } from "@/lib/hygraph/enumerations";

const TYPENAME_TAGS: Record<string, readonly CacheTag[]> = {
  City: [CacheTag.City, CacheTag.Map],
  Place: [CacheTag.Place, CacheTag.Map],
  Category: [CacheTag.Category],
  Neighborhood: [CacheTag.Neighborhood, CacheTag.Map],
};

function typenameFromPayload(body: unknown): string | undefined {
  if (!isRecord(body)) {
    return undefined;
  }
  const data = readRecord(body, "data");
  if (data !== undefined) {
    const fromData = readString(data, "__typename");
    if (fromData !== undefined) {
      return fromData;
    }
  }
  return readString(body, "__typename");
}

export function cacheTagsFromWebhookPayload(
  body: unknown,
): readonly CacheTag[] | undefined {
  const typename = typenameFromPayload(body);
  if (typename === undefined) {
    return undefined;
  }
  const tags = TYPENAME_TAGS[typename];
  return tags;
}
