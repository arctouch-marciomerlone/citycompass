import { isHttpUrl } from "@/lib/url";

export interface DirectionsInput {
  readonly latitude: number;
  readonly longitude: number;
  readonly googlePlaceId?: string;
}

function isFiniteCoordinate(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value) <= 90;
}

export function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export function mapsViewUrl(input: {
  readonly latitude: number;
  readonly longitude: number;
  readonly zoom?: number;
}): string | undefined {
  if (!isValidLatitude(input.latitude) || !isValidLongitude(input.longitude)) {
    return undefined;
  }
  const zoom = input.zoom ?? 12;
  const url = `https://www.google.com/maps/@?api=1&map_action=map&center=${String(input.latitude)},${String(input.longitude)}&zoom=${String(zoom)}`;
  return isHttpUrl(url) ? url : undefined;
}

export function directionsUrl(input: DirectionsInput): string | undefined {
  if (!isValidLatitude(input.latitude) || !isValidLongitude(input.longitude)) {
    return undefined;
  }

  const placeId = input.googlePlaceId?.trim();
  if (placeId !== undefined && placeId.length > 0) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=place_id:${encodeURIComponent(placeId)}`;
    return isHttpUrl(url) ? url : undefined;
  }

  const url = `https://www.google.com/maps/dir/?api=1&destination=${String(input.latitude)},${String(input.longitude)}`;
  return isHttpUrl(url) ? url : undefined;
}

export function hasUsableCoordinates(input: {
  readonly latitude: number;
  readonly longitude: number;
}): boolean {
  return (
    isValidLatitude(input.latitude) &&
    isValidLongitude(input.longitude) &&
    isFiniteCoordinate(input.latitude)
  );
}
