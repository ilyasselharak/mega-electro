"use server";

import { revalidatePath } from "next/cache";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/lib/convex";
import { assertStaff } from "@/lib/session";
import { orderStatusUpdateSchema } from "@/lib/validators/orders";
import { invalidate, TAGS } from "@/server/cache";
import { ok, toActionError, UserFacingError, type ActionResult } from "./result";

export async function updateOrderStatus(input: { orderId: string; status: string; message?: string }): Promise<ActionResult> {
  try {
    await assertStaff();
    const data = orderStatusUpdateSchema.parse(input);
    await fetchAuthMutation(api.orders.updateStatus, { orderId: data.orderId, status: data.status, message: data.message || undefined });
    invalidate(TAGS.catalog);
    revalidatePath(`/admin/orders/${data.orderId}`);
    revalidatePath("/admin/orders");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "updateOrderStatus");
  }
}

export async function addOrderNote(orderId: string, message: string): Promise<ActionResult> {
  try {
    await assertStaff();
    await fetchAuthMutation(api.orders.addNote, { orderId, message });
    revalidatePath(`/admin/orders/${orderId}`);
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "addOrderNote");
  }
}

export async function updateOrderCustomer(
  orderId: string,
  input: { fullName: string; phone: string; city: string; address: string; internalNote?: string },
): Promise<ActionResult> {
  try {
    await assertStaff();
    const { moroccanPhone } = await import("@/lib/validators/common");
    const phone = moroccanPhone.parse(input.phone);
    if (input.fullName.trim().length < 2 || input.address.trim().length < 4 || input.city.trim().length < 2) {
      throw new UserFacingError("Informations client invalides.");
    }
    await fetchAuthMutation(api.orders.updateCustomer, {
      orderId,
      fullName: input.fullName.trim(),
      phone,
      city: input.city.trim(),
      address: input.address.trim(),
      internalNote: input.internalNote?.trim() || undefined,
    });
    revalidatePath(`/admin/orders/${orderId}`);
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "updateOrderCustomer");
  }
}
