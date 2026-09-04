import { readPublicMapsApiKey, readPublicMapsMapId } from "@/lib/env";

export interface PublicMapsConfig {
  readonly apiKey: string | undefined;
  readonly mapId: string | undefined;
}

export function readPublicMapsConfig(): PublicMapsConfig {
  return {
    apiKey: readPublicMapsApiKey(),
    mapId: readPublicMapsMapId(),
  };
}
