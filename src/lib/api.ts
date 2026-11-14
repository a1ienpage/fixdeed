import { z } from "zod";

export const MAX_REQUEST_BYTES = 32_768;
export function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export class RequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function readBoundedJson(req: Request): Promise<unknown> {
  if (
    !req.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new RequestError("Use application/json.", 415);
  if (Number(req.headers.get("content-length")) > MAX_REQUEST_BYTES)
    throw new RequestError("Request is too large.", 413);
  const reader = req.body?.getReader();
  if (!reader) throw new RequestError("Request body is required.", 400);
  let total = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new RequestError("Request is too large.", 413);
      }
      chunks.push(value);
    }
    const combined = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    try {
      return JSON.parse(new TextDecoder().decode(combined));
    } catch {
      throw new RequestError("Invalid JSON.", 400);
    }
  } finally {
    reader.releaseLock();
  }
}
export function requestFailure(error: unknown): Response {
  if (error instanceof RequestError)
    return jsonResponse({ error: error.message }, error.status);
  return jsonResponse(
    {
      error:
        error instanceof z.ZodError
          ? error.issues[0]?.message
          : "Invalid request.",
    },
    400,
  );
}
export const PartialProfileSchema = z.object({
  homeName: z.string().max(100).optional(),
  housingType: z.enum(["house", "apartment", "townhome"]).optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1600)
    .max(new Date().getFullYear() + 1)
    .optional(),
  homeEra: z.enum(["pre1980", "1980_2000", "post2000"]).optional(),
  bedrooms: z.number().nonnegative().max(100).optional(),
  bathrooms: z.number().nonnegative().max(100).optional(),
  hvacType: z
    .enum([
      "central_ac_gas",
      "heat_pump",
      "window_mini_split",
      "radiator_no_ac",
    ])
    .optional(),
  appliances: z
    .array(
      z.enum([
        "tank_water_heater",
        "tankless_water_heater",
        "dishwasher",
        "washer_dryer",
        "garbage_disposal",
        "central_hvac",
      ]),
    )
    .max(6)
    .optional(),
});
export const ImageSchema = z
  .string()
  .regex(/^data:image\/(jpeg|png|webp|heic|heif);base64,[A-Za-z0-9+/]*={0,2}$/)
  .max(24_000);
