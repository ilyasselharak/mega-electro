import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { currentUser, requireAdmin } from "./lib/auth";
import { fail } from "./lib/errors";

export const me = query({ args: {}, handler: (ctx) => currentUser(ctx) });

export const setRole = mutation({
  args: { userId: v.string(), role: v.union(v.literal("CUSTOMER"), v.literal("STAFF"), v.literal("ADMIN")) },
  handler: async (ctx, { userId, role }) => {
    const me = await requireAdmin(ctx);
    if (me.id === userId && role !== "ADMIN") fail("Vous ne pouvez pas retirer votre propre accès administrateur.");
    await ctx.runMutation(components.betterAuth.users.setRole, { id: userId, role });
  },
});
