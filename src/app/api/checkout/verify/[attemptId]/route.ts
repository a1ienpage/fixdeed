import { z } from "zod";
import { checkoutCookieName, verifyTestCheckout } from "@/lib/stripeCheckout";
import { jsonResponse, readBoundedJson, requestFailure } from "@/lib/api";
export const runtime = "nodejs";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const attemptId = z.uuid().parse((await params).attemptId);
    const cookieName = checkoutCookieName(attemptId);
    const { sessionId } = z
      .object({
        sessionId: z
          .string()
          .regex(/^cs_test_[A-Za-z0-9_]+$/)
          .max(255),
      })
      .strict()
      .parse(await readBoundedJson(req));
    const cookie = req.headers
      .get("cookie")
      ?.split(";")
      .map((p) => p.trim())
      .find((p) => p.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);
    const receipt = await verifyTestCheckout(sessionId, cookie);
    if (receipt.attemptId !== attemptId)
      return jsonResponse({ error: "Checkout attempt mismatch." }, 403);
    return jsonResponse(receipt);
  } catch (error) {
    return requestFailure(error);
  }
}
