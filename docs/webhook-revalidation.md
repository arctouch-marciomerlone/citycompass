# Webhook revalidation — Story 2 / A7

**Role:** Frontend (handler only)  
Live Hygraph → app HTTPS test is last and still TBD. Do not put `http://localhost` in Studio.

## Handler

`POST /api/revalidate`

1. Read the raw body with `request.text()`.
2. Verify `gcms-signature` against `HYGRAPH_WEBHOOK_SECRET` using the official HMAC (`Body`, `EnvironmentName`, `TimeStamp`). Docs: https://hygraph.com/docs/api-reference/basics/webhooks
3. Parse JSON only after verification.
4. Map `data.__typename` to allowlisted cache tags. Reject unknown types.
5. Call `revalidateTag(tag, "max")` (Next.js 16). Never revalidate a path supplied in the payload.

Allowlisted tags: `city`, `place`, `category`, `neighborhood`, `map`.

| `__typename`   | Tags                      |
| -------------- | ------------------------- |
| `City`         | `city`, `map`             |
| `Place`        | `place`, `map`            |
| `Category`     | `category`                |
| `Neighborhood` | `neighborhood`, `map`     |
| anything else  | HTTP 400, no revalidation |

Missing or empty `HYGRAPH_WEBHOOK_SECRET` → HTTP 401 (fail closed). Invalid signature → HTTP 401.

`@hygraph/utils` is not used (no package approval). HMAC is implemented in `lib/hygraph/webhook-signature.ts`.

## Studio fields (when a public HTTPS URL exists)

See `README.md`. Triggers: stage `PUBLISHED`, actions Publish and Unpublish, models City, Place, Category, Neighborhood. Include payload on. Method POST. Secret = `HYGRAPH_WEBHOOK_SECRET`.

## Local test

`pnpm test` covers signature accept/reject and unknown `__typename`. Do not call Hygraph Cloud from `localhost` HTTP.

Example payload (secrets removed): `docs/webhook-payload.example.json`.
