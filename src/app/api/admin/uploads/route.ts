import { NextResponse } from "next/server";
import { assertStaff, AuthorizationError } from "@/lib/session";
import { uploadRequestSchema } from "@/lib/validators/catalog";
import { logger } from "@/lib/logger";
import { CLOUDINARY_ROOT, signParams } from "@convex/lib/cloudinary";

/** Signs a direct browser → Cloudinary upload. The API secret never leaves the server. */
export async function POST(req: Request) {
  try {
    await assertStaff();
    const body = uploadRequestSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
    const folder = `${CLOUDINARY_ROOT}/${body.data.scope}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const { signature, apiKey, cloudName } = await signParams({ folder, timestamp });
    return NextResponse.json({
      url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      fields: { folder, timestamp: String(timestamp), api_key: apiKey, signature },
    });
  } catch (err) {
    if (err instanceof AuthorizationError) return NextResponse.json({ error: err.message }, { status: 403 });
    logger.error("Upload signing failed", { err });
    return NextResponse.json({ error: "Impossible de préparer l'envoi" }, { status: 500 });
  }
}
