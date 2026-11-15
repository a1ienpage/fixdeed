import { POST as startCheckout } from "@/app/api/checkout/route";
import { POST as verifyCheckout } from "@/app/api/checkout/verify/[attemptId]/route";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createTestCheckout,
  verifyTestCheckout,
  readCheckoutBinding,
  checkoutCookieName,
  checkoutVerifyPath,
  assertCheckoutBudget,
} from "@/lib/stripeCheckout";
const origin = "https://fixdeed.vercel.app";
const input = {
  billing: "annual" as const,
  scopeHash: "a".repeat(64),
  homeMode: "personal" as const,
  requestId: "765d51cb-9ba7-49b2-86b1-981529bd60f8",
};
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
function key() {
  vi.stubEnv("STRIPE_SECRET_KEY", ["sk", "test", "unitfixture"].join("_"));
  vi.stubEnv("APP_BASE_URL", origin);
}
async function fixture() {
  key();
  let fields = new URLSearchParams();
  vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
    fields = new URLSearchParams(String(init.body));
    return Response.json({
      id: "cs_test_annualfixture",
      livemode: false,
      expires_at: 86401,
      url: "https://checkout.stripe.com/c/pay/cs_test_annualfixture",
    });
  });
  const created = await createTestCheckout(input, origin, 1000);
  const binding = readCheckoutBinding(created.cookieValue, 1001)!;
  const session = {
    id: binding.sessionId,
    livemode: false,
    mode: "subscription",
    status: "complete",
    payment_status: "paid",
    currency: "usd",
    amount_total: 13999,
    subscription: { status: "active" },
    metadata: {
      app: "fixdeed",
      billing: "annual",
      scope: fields.get("metadata[scope]"),
      nonce: fields.get("metadata[nonce]"),
      attempt: input.requestId,
    },
  };
  return { created, fields, session };
}
describe("Stripe sandbox checkout boundary", () => {
  it("bounds requests per warm server instance without claiming distributed enforcement", () => {
    for (let i = 0; i < 60; i++) assertCheckoutBudget(900000);
    expect(() => assertCheckoutBudget(900001)).toThrow(/too many/i);
    expect(() => assertCheckoutBudget(960000)).not.toThrow();
  });
  it("sets independent path-scoped cookies for truly concurrent HTTP checkout requests", async () => {
    key();
    const inputB = {
      ...input,
      requestId: "765d51cb-9ba7-49b2-86b1-981529bd60f9",
      billing: "monthly" as const,
    };
    const sessions = new Map<string, object>();
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      if (init?.method !== "POST")
        return Response.json(
          sessions.get(url.split("/").at(-1)!.split("?")[0]),
        );
      const fields = new URLSearchParams(String(init.body));
      const attempt = fields.get("metadata[attempt]")!;
      const id = `cs_test_${attempt.replaceAll("-", "")}`;
      sessions.set(id, {
        id,
        livemode: false,
        mode: "subscription",
        status: "complete",
        payment_status: "paid",
        currency: "usd",
        amount_total: Number(
          fields.get("line_items[0][price_data][unit_amount]"),
        ),
        subscription: { status: "active" },
        metadata: {
          app: "fixdeed",
          billing: fields.get("metadata[billing]"),
          scope: fields.get("metadata[scope]"),
          nonce: fields.get("metadata[nonce]"),
          attempt,
        },
      });
      return Response.json({
        id,
        livemode: false,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        url: `https://checkout.stripe.com/c/pay/${id}`,
      });
    });
    const request = (value: typeof input | typeof inputB) =>
      new Request(`${origin}/api/checkout`, {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify(value),
      });
    const responses = await Promise.all([
      startCheckout(request(input)),
      startCheckout(request(inputB)),
    ]);
    for (let i = 0; i < responses.length; i++) {
      const attemptId = [input, inputB][i].requestId;
      expect(responses[i].status).toBe(200);
      const cookie = responses[i].headers.get("set-cookie")!;
      expect(cookie).toContain(`Path=/api/checkout/verify/${attemptId};`);
      expect(cookie).toContain("HttpOnly; SameSite=Lax;");
      const sessionId = `cs_test_${attemptId.replaceAll("-", "")}`;
      const req = new Request(`${origin}/api/checkout/verify/${attemptId}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookie.split(";")[0],
        },
        body: JSON.stringify({ sessionId }),
      });
      const verified = await verifyCheckout(req, {
        params: Promise.resolve({ attemptId }),
      });
      expect(verified.status).toBe(200);
      expect((await verified.json()).attemptId).toBe(attemptId);
    }
  });
  it("creates the annual subscription from server pricing and binds its return", async () => {
    const { created, fields } = await fixture();
    expect(fields.get("line_items[0][price_data][unit_amount]")).toBe("13999");
    expect(fields.get("line_items[0][price_data][recurring][interval]")).toBe(
      "year",
    );
    expect(fields.get("mode")).toBe("subscription");
    expect(fields.get("success_url")).toBe(
      "https://fixdeed.vercel.app/checkout/return?session_id={CHECKOUT_SESSION_ID}&attempt_id=765d51cb-9ba7-49b2-86b1-981529bd60f8",
    );
    expect(fields.toString()).not.toContain("personal-home");
    expect(
      readCheckoutBinding(created.cookieValue + "tampered", 1001),
    ).toBeNull();
    expect(readCheckoutBinding(created.cookieValue, 86401001)).toBeNull();
  });
  it("fails closed for live credentials and mismatched origins", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", ["sk", "live", "unitfixture"].join("_"));
    await expect(createTestCheckout(input, origin)).rejects.toThrow(/sandbox/i);
    key();
    await expect(
      createTestCheckout(input, "https://other.example"),
    ).rejects.toThrow(/origin/i);
  });
  it("grants access only after a paid test subscription with the expected amount and binding", async () => {
    const { created, session } = await fixture();
    vi.stubGlobal("fetch", async () => Response.json(session));
    const verified = await verifyTestCheckout(
      session.id,
      created.cookieValue,
      1001,
    );
    expect(verified.billing).toBe("annual");
    expect(verified.realMoneyCharged).toBe(false);
    expect(verified.homeMode).toBe("personal");
    for (const patch of [
      { payment_status: "unpaid" },
      { livemode: true },
      { amount_total: 1 },
      { subscription: { status: "incomplete" } },
      { metadata: { ...session.metadata, nonce: "wrong" } },
    ]) {
      vi.stubGlobal("fetch", async () =>
        Response.json({ ...session, ...patch }),
      );
      await expect(
        verifyTestCheckout(session.id, created.cookieValue, 1001),
      ).rejects.toThrow();
    }
    await expect(
      verifyTestCheckout("cs_test_other", created.cookieValue, 1001),
    ).rejects.toThrow();
  });
  it("can still verify tab A after tab B starts an independent checkout", async () => {
    const { created, session } = await fixture();
    let fieldsB = new URLSearchParams();
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      fieldsB = new URLSearchParams(String(init.body));
      return Response.json({
        id: "cs_test_secondfixture",
        livemode: false,
        expires_at: 86401,
        url: "https://checkout.stripe.com/c/pay/cs_test_secondfixture",
      });
    });
    const inputB = {
      ...input,
      requestId: "765d51cb-9ba7-49b2-86b1-981529bd60f9",
      billing: "monthly" as const,
    };
    const checkoutB = await createTestCheckout(inputB, origin, 1002);
    expect(checkoutCookieName(input.requestId)).not.toBe(
      checkoutCookieName(inputB.requestId),
    );
    expect(checkoutVerifyPath(input.requestId)).toBe(
      `/api/checkout/verify/${input.requestId}`,
    );
    expect(checkoutVerifyPath(inputB.requestId)).not.toBe(
      checkoutVerifyPath(input.requestId),
    );
    expect(
      readCheckoutBinding(checkoutB.cookieValue, 1003, session.id),
    ).toBeNull();
    vi.stubGlobal("fetch", async () => Response.json(session));
    expect(
      (await verifyTestCheckout(session.id, created.cookieValue, 1003)).billing,
    ).toBe("annual");
    const sessionB = {
      ...session,
      id: "cs_test_secondfixture",
      amount_total: 1499,
      metadata: {
        ...session.metadata,
        billing: "monthly",
        nonce: fieldsB.get("metadata[nonce]"),
        attempt: inputB.requestId,
      },
    };
    vi.stubGlobal("fetch", async () => Response.json(sessionB));
    expect(
      (await verifyTestCheckout(sessionB.id, checkoutB.cookieValue, 1004))
        .billing,
    ).toBe("monthly");
  });
});
