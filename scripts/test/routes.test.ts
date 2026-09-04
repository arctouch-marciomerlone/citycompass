import assert from "node:assert/strict";
import test from "node:test";

import {
  homePath,
  localeHomePath,
  mapPath,
  placePath,
  placesPath,
} from "../../lib/routes.ts";

test("city routes include locale and city slug", () => {
  assert.equal(localeHomePath("en_US"), "/en_US");
  assert.equal(homePath("en_US", "florianopolis"), "/en_US/florianopolis");
  assert.equal(placesPath("pt_BR", "araucaria"), "/pt_BR/araucaria/places");
  assert.equal(
    placesPath("en_US", "florianopolis", { category: "outdoors" }),
    "/en_US/florianopolis/places?category=outdoors",
  );
  assert.equal(
    placePath("zh_CN", "san-francisco", "sf-ferry-building"),
    "/zh_CN/san-francisco/places/sf-ferry-building",
  );
  assert.equal(mapPath("en_US", "florianopolis"), "/en_US/florianopolis/map");
});
