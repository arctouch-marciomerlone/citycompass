import { createHmac, timingSafeEqual } from "node:crypto";

export interface ParsedWebhookSignature {
  readonly sign: string;
  readonly environmentName: string;
  readonly timestamp: number;
}

export function parseGcmsSignature(
  header: string | null,
): ParsedWebhookSignature | undefined {
  if (header === null || header.trim() === "") {
    return undefined;
  }
  const parts = header.split(", ");
  const rawSign = parts[0];
  const rawEnv = parts[1];
  const rawTimestamp = parts[2];
  if (
    rawSign === undefined ||
    rawEnv === undefined ||
    rawTimestamp === undefined
  ) {
    return undefined;
  }
  if (
    !rawSign.startsWith("sign=") ||
    !rawEnv.startsWith("env=") ||
    !rawTimestamp.startsWith("t=")
  ) {
    return undefined;
  }
  const sign = rawSign.slice("sign=".length);
  const environmentName = rawEnv.slice("env=".length);
  const timestamp = Number.parseInt(rawTimestamp.slice("t=".length), 10);
  if (
    sign.length === 0 ||
    environmentName.length === 0 ||
    !Number.isFinite(timestamp)
  ) {
    return undefined;
  }
  return { sign, environmentName, timestamp };
}

export function verifyWebhookSignature(options: {
  readonly secret: string;
  readonly rawBody: string;
  readonly signatureHeader: string | null;
}): boolean {
  const parsed = parseGcmsSignature(options.signatureHeader);
  if (parsed === undefined) {
    return false;
  }

  const payload = JSON.stringify({
    Body: options.rawBody,
    EnvironmentName: parsed.environmentName,
    TimeStamp: parsed.timestamp,
  });
  const hash = createHmac("sha256", options.secret)
    .update(payload)
    .digest("base64");
  const expected = Buffer.from(hash);
  const received = Buffer.from(parsed.sign);
  if (expected.length !== received.length) {
    return false;
  }
  return timingSafeEqual(expected, received);
}
