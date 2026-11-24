// Mega Electro's own functions over the auth tables (called from the app via components.betterAuth.users.*).
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const publicUser = (u: { _id: string; name: string; email: string; phone?: string | null; role?: string | null; createdAt: number }) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone ?? null,
  role: u.role ?? "CUSTOMER",
  createdAt: u.createdAt,
});

export const list = query({
  args: { q: v.optional(v.string()) },
  handler: async (ctx, { q }) => {
    const users = await ctx.db.query("user").order("desc").take(5000);
    const needle = q?.trim().toLowerCase();
    return users
      .filter((u) => !needle || [u.name, u.email, u.phone ?? ""].some((f) => f.toLowerCase().includes(needle)))
      .map(publicUser);
  },
});

export const countByRole = query({
  args: { role: v.string() },
  handler: async (ctx, { role }) => (await ctx.db.query("user").withIndex("role", (q) => q.eq("role", role)).collect()).length,
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const nid = ctx.db.normalizeId("user", id);
    const u = nid ? await ctx.db.get(nid) : null;
    return u ? publicUser(u) : null;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const u = await ctx.db.query("user").withIndex("email_name", (q) => q.eq("email", email.toLowerCase())).first();
    return u ? publicUser(u) : null;
  },
});

/** Changes a role and signs the user out everywhere so it applies immediately. */
export const setRole = mutation({
  args: { id: v.string(), role: v.string() },
  handler: async (ctx, { id, role }) => {
    const nid = ctx.db.normalizeId("user", id);
    if (!nid || !(await ctx.db.get(nid))) throw new Error("Utilisateur introuvable");
    await ctx.db.patch(nid, { role, updatedAt: Date.now() });
    for (const s of await ctx.db.query("session").withIndex("userId", (q) => q.eq("userId", id)).collect()) await ctx.db.delete(s._id);
  },
});
