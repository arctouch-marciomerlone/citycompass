import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { cacheTagsFromWebhookPayload } from "../../lib/hygraph/revalidate-tags.ts";
import { verifyWebhookSignature } from "../../lib/hygraph/webhook-signature.ts";

function signedHeader(
  secret: string,
  body: string,
  env = "master",
  timestamp = 1631270481036,
) {
  const payload = JSON.stringify({
    Body: body,
    EnvironmentName: env,
    TimeStamp: timestamp,
  });
  const sign = createHmac("sha256", secret).update(payload).digest("base64");
  return `sign=${sign}, env=${env}, t=${String(timestamp)}`;
}

test("accepts a matching gcms-signature", () => {
  const secret = "test-secret";
  const body = '{"operation":"publish"}';
  const header = signedHeader(secret, body);
  assert.equal(
    verifyWebhookSignature({ secret, rawBody: body, signatureHeader: header }),
    true,
  );
});

test("rejects a missing or wrong signature", () => {
  const secret = "test-secret";
  const body = '{"operation":"publish"}';
  assert.equal(
    verifyWebhookSignature({ secret, rawBody: body, signatureHeader: null }),
    false,
  );
  assert.equal(
    verifyWebhookSignature({
      secret,
      rawBody: body,
      signatureHeader: signedHeader("other", body),
    }),
    false,
  );
});

test("maps known typenames and rejects unknown ones", () => {
  assert.deepEqual(
    cacheTagsFromWebhookPayload({ data: { __typename: "Place" } }),
    ["place", "map"],
  );
  assert.deepEqual(
    cacheTagsFromWebhookPayload({ data: { __typename: "City" } }),
    ["city", "map"],
  );
  assert.equal(
    cacheTagsFromWebhookPayload({ data: { __typename: "Asset" } }),
    undefined,
  );
  assert.equal(cacheTagsFromWebhookPayload({ path: "/evil" }), undefined);
});
