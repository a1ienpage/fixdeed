// Server-only boundary: imported exclusively by route handlers, never client components.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import pricing from "@/content/pricing.json";
import { RequestError } from "@/lib/api";
export const checkoutCookieName = (attemptId: string) =>
  `fixdeed_test_checkout_${z.uuid().parse(attemptId)}`;
export const checkoutVerifyPath = (attemptId: string) =>
  `/api/checkout/verify/${z.uuid().parse(attemptId)}`;
export const CheckoutInputSchema = z
  .object({
    billing: z.enum(["annual", "monthly"]),
    scopeHash: z.string().regex(/^[a-f0-9]{64}$/),
    homeMode: z.enum(["personal", "demo"]),
    requestId: z.uuid(),
  })
  .strict();
// Best-effort warm-instance guard only; deployments with multiple instances need a shared/WAF limit.
let budgetWindow = -1;
let budgetCount = 0;
export function assertCheckoutBudget(now = Date.now()) {
  if (now < budgetWindow || now - budgetWindow >= 60_000 || budgetWindow < 0) {
    budgetWindow = now;
    budgetCount = 0;
  }
  if (++budgetCount > 60)
    throw new RequestError(
      "Too many test checkout requests. Please try again in a minute.",
      429,
    );
}
type Input = z.infer<typeof CheckoutInputSchema>;
const BindingSchema = z.object({
  sessionId: z.string().regex(/^cs_test_[A-Za-z0-9_]+$/),
  attemptId: z.uuid(),
  billing: z.enum(["annual", "monthly"]),
  homeMode: z.enum(["personal", "demo"]),
  scopeHash: z.string(),
  nonce: z.string(),
  expiresAt: z.number(),
});
function config() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key.startsWith("sk_test_"))
    throw new RequestError(
      "Stripe Sandbox is not configured. A test secret key is required; live keys are refused.",
      503,
    );
  const base = new URL(
    process.env.APP_BASE_URL || "https://fixdeed.vercel.app",
  );
  if (
    base.protocol !== "https:" &&
    base.hostname !== "localhost" &&
    base.hostname !== "127.0.0.1"
  )
    throw new RequestError("Invalid checkout origin configuration.", 503);
  return { key, origin: base.origin };
}
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const sign = (value: string, key: string) =>
  createHmac("sha256", key)
    .update(`fixdeed-checkout:${value}`)
    .digest("base64url");
function encodeBinding(binding: z.infer<typeof BindingSchema>[], key: string) {
  const payload = Buffer.from(JSON.stringify(binding)).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}
function readBindings(
  value: string | undefined,
  now = Date.now(),
): z.infer<typeof BindingSchema>[] {
  try {
    if (!value || value.length > 4000) return [];
    const { key } = config();
    const [payload, signature, extra] = value.split(".");
    if (!payload || !signature || extra) return [];
    const expected = Buffer.from(sign(payload, key)),
      actual = Buffer.from(signature);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return [];
    const parsed = z
      .array(BindingSchema)
      .max(3)
      .safeParse(JSON.parse(Buffer.from(payload, "base64url").toString()));
    return parsed.success
      ? parsed.data.filter((binding) => binding.expiresAt >= now)
      : [];
  } catch {
    return [];
  }
}
export function readCheckoutBinding(
  value: string | undefined,
  now = Date.now(),
  sessionId?: string,
) {
  const bindings = readBindings(value, now);
  return (
    (sessionId
      ? bindings.find((binding) => binding.sessionId === sessionId)
      : bindings.at(-1)) ?? null
  );
}

async function stripeRequest(path: string, init?: RequestInit) {
  const { key } = config();
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${key}`,
      "Stripe-Version": "2026-10-28.endive",
      ...init?.headers,
    },
  });
  if (!response.ok)
    throw new RequestError(
      `Stripe Sandbox could not complete this request (HTTP ${response.status}). Check the test key and sandbox setup.`,
      502,
    );
  return response.json();
}
export async function createTestCheckout(
  raw: Input,
  requestOrigin: string,
  now = Date.now(),
) {
  const input = CheckoutInputSchema.parse(raw);
  const { key, origin } = config();
  if (requestOrigin !== origin)
    throw new RequestError(
      "Checkout origin does not match this application.",
      403,
    );
  assertCheckoutBudget(now);
  const scopeHash = input.scopeHash;
  const nonce = sign(
    `${input.requestId}:${scopeHash}:${input.billing}:${input.homeMode}`,
    key,
  );
  const fields = new URLSearchParams({
    mode: "subscription",
    locale: "en",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(
      input.billing === "annual" ? pricing.annualCents : pricing.monthlyCents,
    ),
    "line_items[0][price_data][recurring][interval]":
      input.billing === "annual" ? "year" : "month",
    "line_items[0][price_data][product_data][name]":
      "Fixdeed Plus — one home (TEST)",
    "line_items[0][quantity]": "1",
    "adaptive_pricing[enabled]": "false",
    success_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&attempt_id=${input.requestId}`,
    cancel_url: `${origin}/checkout?plan=${input.billing}&canceled=1`,
    "metadata[app]": "fixdeed",
    "metadata[billing]": input.billing,
    "metadata[scope]": scopeHash,
    "metadata[nonce]": hash(nonce),
    "metadata[attempt]": input.requestId,
  });
  const session = await stripeRequest("checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `fixdeed-${input.requestId}`,
    },
    body: fields.toString(),
  });
  if (
    session.livemode !== false ||
    typeof session.id !== "string" ||
    !/^cs_test_[A-Za-z0-9_]+$/.test(session.id) ||
    typeof session.url !== "string" ||
    new URL(session.url).origin !== "https://checkout.stripe.com"
  )
    throw new RequestError(
      "Stripe did not return a valid sandbox checkout.",
      502,
    );
  if (
    typeof session.expires_at !== "number" ||
    session.expires_at * 1000 <= now
  )
    throw new RequestError("Stripe returned an expired checkout.", 502);
  const bindings = [
    {
      sessionId: session.id,
      attemptId: input.requestId,
      billing: input.billing,
      homeMode: input.homeMode,
      scopeHash,
      nonce,
      expiresAt: session.expires_at * 1000,
    },
  ];
  return {
    url: session.url as string,
    cookieValue: encodeBinding(bindings, key),
  };
}
export async function verifyTestCheckout(
  sessionId: string,
  cookie: string | undefined,
  now = Date.now(),
) {
  const binding = readCheckoutBinding(cookie, now, sessionId);
  if (!binding || binding.sessionId !== sessionId)
    throw new RequestError(
      "This checkout does not belong to this browser session, or it has expired.",
      403,
    );
  const session = await stripeRequest(
    `checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`,
  );
  const expected =
    binding.billing === "annual" ? pricing.annualCents : pricing.monthlyCents;
  if (
    session.id !== sessionId ||
    session.livemode !== false ||
    session.mode !== "subscription" ||
    session.status !== "complete" ||
    session.payment_status !== "paid" ||
    session.currency !== "usd" ||
    session.amount_total !== expected ||
    session.subscription?.status !== "active" ||
    session.metadata?.app !== "fixdeed" ||
    session.metadata?.billing !== binding.billing ||
    session.metadata?.scope !== binding.scopeHash ||
    session.metadata?.nonce !== hash(binding.nonce) ||
    session.metadata?.attempt !== binding.attemptId
  )
    throw new RequestError(
      "Stripe has not confirmed the expected paid test subscription. No Plus access was activated.",
      409,
    );
  return {
    verified: true,
    attemptId: binding.attemptId,
    billing: binding.billing,
    homeMode: binding.homeMode,
    scopeHash: binding.scopeHash,
    sessionId,
    realMoneyCharged: false,
  };
}
