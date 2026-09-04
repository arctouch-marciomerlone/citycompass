import assert from "node:assert/strict";
import test from "node:test";

import {
  assertHygraphContentApiUrl,
  formatEnvKeySummary,
  summarizeEnvValue,
} from "../../lib/env.ts";

test("strips wrapping quotes used in the Vercel dashboard", () => {
  const url = "https://us-west-2.cdn.hygraph.com/content/projectid/master";
  assert.equal(assertHygraphContentApiUrl(`"${url}"`), url);
});

test("accepts a High Performance Content API /content/ URL", () => {
  const url = "https://us-west-2.cdn.hygraph.com/content/projectid/master";
  assert.equal(assertHygraphContentApiUrl(url), url);
});

test("accepts a legacy Content API /v2/ URL", () => {
  const url = "https://us-west-2.cdn.hygraph.com/v2/projectid/master";
  assert.equal(assertHygraphContentApiUrl(url), url);
});

test("rejects the Management API URL", () => {
  assert.throws(
    () =>
      assertHygraphContentApiUrl(
        "https://management-us-west-2.hygraph.com/graphql",
      ),
    /Management API/,
  );
});

test("rejects a URL that is neither /content/ nor /v2/", () => {
  assert.throws(
    () =>
      assertHygraphContentApiUrl("https://api-us-west-2.hygraph.com/graphql"),
    /Content API URL/,
  );
});

test("summarizes frontend env keys without the secret value", () => {
  const url = summarizeEnvValue(
    "HYGRAPH_CONTENT_API_URL",
    '"https://us-west-2.cdn.hygraph.com/content/projectid/master"',
  );
  assert.equal(url.set, true);
  assert.equal(url.scheme, "https");
  assert.equal(url.contentPath, true);
  assert.equal(formatEnvKeySummary(url).includes("projectid"), false);

  const missing = summarizeEnvValue("HYGRAPH_WEBHOOK_SECRET", undefined);
  assert.equal(
    formatEnvKeySummary(missing),
    "HYGRAPH_WEBHOOK_SECRET set=false",
  );

  const token = summarizeEnvValue("HYGRAPH_READ_TOKEN", "secret-value");
  assert.equal(token.set, true);
  assert.equal(token.chars, 12);
  assert.equal(formatEnvKeySummary(token).includes("secret-value"), false);
});
