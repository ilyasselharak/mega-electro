"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthAction } from "@/lib/convex";
import { assertStaff } from "@/lib/session";
import { invalidate, TAGS } from "@/server/cache";
import { ok, toActionError, type ActionResult } from "./result";

const importSchema = z.object({
  ids: z.array(z.string().min(1).max(64)).min(1).max(50),
  status: z.enum(["DRAFT", "ACTIVE"]),
});

export async function importElectroDarnaProducts(input: z.input<typeof importSchema>): Promise<ActionResult<{ created: number; skipped: number; failed: string[] }>> {
  try {
    await assertStaff();
    const data = importSchema.parse(input);
    const res = await fetchAuthAction(api.electrodarna.importProducts, data);
    invalidate(TAGS.catalog);
    revalidatePath("/admin/products");
    revalidatePath("/admin/electrodarna");
    return ok(res);
  } catch (err) {
    return toActionError(err, "importElectroDarnaProducts");
  }
}

export async function syncElectroDarnaNow(): Promise<ActionResult<{ checked: number; updated: number; outOfStock: number }>> {
  try {
    await assertStaff();
    const res = await fetchAuthAction(api.electrodarna.syncNow, {});
    invalidate(TAGS.catalog);
    revalidatePath("/admin/electrodarna");
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    return ok(res);
  } catch (err) {
    return toActionError(err, "syncElectroDarnaNow");
  }
}
