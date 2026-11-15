import {
  checkoutCookieName,
  checkoutVerifyPath,
  CheckoutInputSchema,
  createTestCheckout,
} from "@/lib/stripeCheckout";
import { jsonResponse, readBoundedJson, requestFailure } from "@/lib/api";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const body = CheckoutInputSchema.parse(await readBoundedJson(req));
    const checkout = await createTestCheckout(
      body,
      req.headers.get("origin") ?? "",
      Date.now(),
    );
    const response = jsonResponse({ url: checkout.url });
    response.headers.append(
      "Set-Cookie",
      `${checkoutCookieName(body.requestId)}=${checkout.cookieValue}; HttpOnly; SameSite=Lax; Path=${checkoutVerifyPath(body.requestId)}; Max-Age=86400${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`,
    );
    return response;
  } catch (error) {
    return requestFailure(error);
  }
}
