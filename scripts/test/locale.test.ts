import assert from "node:assert/strict";
import test from "node:test";

import {
  localeFromAcceptLanguage,
  replaceLocaleInPathname,
} from "../../lib/locale.ts";

test("maps Accept-Language tags onto Hygraph locale ids", () => {
  assert.equal(localeFromAcceptLanguage("pt-BR,pt;q=0.9"), "pt_BR");
  assert.equal(localeFromAcceptLanguage("zh-CN"), "zh_CN");
  assert.equal(localeFromAcceptLanguage("en-US,en;q=0.8"), "en_US");
  assert.equal(localeFromAcceptLanguage(undefined), "en_US");
});

test("replaces the locale prefix and keeps the rest of the path", () => {
  assert.equal(
    replaceLocaleInPathname("/en_US/places", "pt_BR"),
    "/pt_BR/places",
  );
  assert.equal(replaceLocaleInPathname("/en_US", "zh_CN"), "/zh_CN");
  assert.equal(
    replaceLocaleInPathname("/en_US/florianopolis/places", "pt_BR"),
    "/pt_BR/florianopolis/places",
  );
});
