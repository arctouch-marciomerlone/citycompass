import assert from "node:assert/strict";
import test from "node:test";

import { directionsUrl, mapsViewUrl } from "../../lib/maps/directions.ts";

test("builds a coordinate directions URL", () => {
  const url = directionsUrl({ latitude: -27.5954, longitude: -48.548 });
  assert.equal(
    url,
    "https://www.google.com/maps/dir/?api=1&destination=-27.5954,-48.548",
  );
});

test("prefers a Place ID when present", () => {
  const url = directionsUrl({
    latitude: -27.5954,
    longitude: -48.548,
    googlePlaceId: "ChIJtest",
  });
  assert.equal(
    url,
    "https://www.google.com/maps/dir/?api=1&destination=place_id:ChIJtest",
  );
});

test("rejects invalid coordinates", () => {
  assert.equal(directionsUrl({ latitude: 99, longitude: 0 }), undefined);
  assert.equal(directionsUrl({ latitude: 0, longitude: 200 }), undefined);
  assert.equal(mapsViewUrl({ latitude: 99, longitude: 0 }), undefined);
});

test("builds a Maps view URL from coordinates", () => {
  assert.equal(
    mapsViewUrl({ latitude: -27.5954, longitude: -48.548 }),
    "https://www.google.com/maps/@?api=1&map_action=map&center=-27.5954,-48.548&zoom=12",
  );
  assert.equal(
    mapsViewUrl({ latitude: -27.5954, longitude: -48.548, zoom: 14 }),
    "https://www.google.com/maps/@?api=1&map_action=map&center=-27.5954,-48.548&zoom=14",
  );
});
