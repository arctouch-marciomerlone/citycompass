import { revalidateTag } from "next/cache";

import { readWebhookSecret } from "@/lib/env";
import { cacheTagsFromWebhookPayload } from "@/lib/hygraph/revalidate-tags";
import { verifyWebhookSignature } from "@/lib/hygraph/webhook-signature";

export async function POST(request: Request) {
  const secret = readWebhookSecret();
  if (secret === undefined) {
    return NextResponseJson({ error: "unauthorized" }, 401);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("gcms-signature");
  if (
    !verifyWebhookSignature({ secret, rawBody, signatureHeader: signature })
  ) {
    return NextResponseJson({ error: "unauthorized" }, 401);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponseJson({ error: "invalid payload" }, 400);
  }

  const tags = cacheTagsFromWebhookPayload(payload);
  if (tags === undefined) {
    return NextResponseJson({ error: "unknown type" }, 400);
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponseJson({ revalidated: tags }, 200);
}

function NextResponseJson(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
