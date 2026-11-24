import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireStaff } from "./lib/auth";
import { fail } from "./lib/errors";
import { opt } from "./lib/products";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const cats = new Map((await ctx.db.query("categories").collect()).map((c) => [c._id as string, c.name]));
    return (await ctx.db.query("faqs").collect())
      .sort((a, b) => (a.categoryId ?? "").localeCompare(b.categoryId ?? "") || a.position - b.position)
      .map((f) => ({
        id: f._id as string,
        question: f.question,
        answer: f.answer,
        questionAr: f.questionAr ?? "",
        answerAr: f.answerAr ?? "",
        categoryId: (f.categoryId as string | undefined) ?? null,
        categoryName: f.categoryId ? (cats.get(f.categoryId) ?? null) : null,
        position: f.position,
        isActive: f.isActive,
      }));
  },
});

export const save = mutation({
  args: {
    id: v.union(v.string(), v.null()),
    question: v.string(),
    answer: v.string(),
    questionAr: v.optional(v.string()),
    answerAr: v.optional(v.string()),
    categoryId: v.optional(v.union(v.string(), v.null())),
    position: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, a) => {
    await requireStaff(ctx);
    if (a.question.trim().length < 5 || a.answer.trim().length < 2) fail("Question et réponse requises.");
    const categoryId = a.categoryId ? (ctx.db.normalizeId("categories", a.categoryId) ?? undefined) : undefined;
    if (a.categoryId && !categoryId) fail("Catégorie introuvable.");
    const doc = {
      question: a.question.trim(),
      answer: a.answer.trim(),
      questionAr: opt(a.questionAr?.trim()),
      answerAr: opt(a.answerAr?.trim()),
      categoryId,
      position: a.position,
      isActive: a.isActive,
      updatedAt: Date.now(),
    };
    const fid = a.id ? ctx.db.normalizeId("faqs", a.id) : null;
    if (fid) await ctx.db.replace(fid, doc);
    else await ctx.db.insert("faqs", doc);
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const fid = ctx.db.normalizeId("faqs", id);
    if (fid) await ctx.db.delete(fid);
  },
});
