import { NextResponse } from "next/server";
import { getProductCards } from "@/server/queries/storefront";
import { logger } from "@/lib/logger";

/** Current cards for product ids saved in the browser (wishlist, recently viewed). */
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9]{10,64}$/i.test(s))
    .slice(0, 50);
  try {
    const items = await getProductCards([...new Set(ids)]);
    return NextResponse.json({ items }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    logger.error("product cards failed", { err: String(err) });
    return NextResponse.json({ items: [] }, { status: 502 });
  }
}
