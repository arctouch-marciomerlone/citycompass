# Google Maps setup — Story 2 / A5

**Role:** Maps  
Coordinates come only from Hygraph `location { latitude longitude }`. Do not enable Places or Geocoding as content sources.

## Current project state

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is empty. The map page and `MapBlock` render a labeled placeholder and `MapFallback` (the place list). The Maps JavaScript API script is not requested.

## When a key is added (A9)

1. Enable only the Maps JavaScript API. Official: https://developers.google.com/maps/documentation/javascript/get-api-key
2. Restrict the browser key to HTTP referrers and that API.
3. Optional Map ID for Advanced Markers: https://developers.google.com/maps/documentation/javascript/map-ids/get-map-id
4. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and optionally `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`.

`CityMap` loads `https://maps.googleapis.com/maps/api/js` only when the key is a non-empty string. Marker data is passed from server components (Hygraph places).

## Directions

`lib/maps/directions.ts` builds Google Maps URLs:

- Place ID when `googlePlaceId` is non-empty: `destination=place_id:{id}`
- Otherwise coordinates: `destination={lat},{lng}`

Official URL guide: https://developers.google.com/maps/documentation/urls/get-started

Seeded places have empty `googlePlaceId`, so MVP directions use coordinates.
