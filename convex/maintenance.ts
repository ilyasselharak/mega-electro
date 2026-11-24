import { internalMutation } from "./_generated/server";

/**
 * One-time category tidy-up for categories created by the Electro Darna import.
 * Heating goes under climate ("Climatisation & chauffage"), with Arabic names and icons.
 *   npx convex run maintenance:organizeCategories
 */
export const organizeCategories = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bySlug = async (slug: string) => ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
    const climate = await bySlug("climatisation");
    if (!climate) return "climatisation introuvable";
    await ctx.db.patch(climate._id, { name: "Climatisation & chauffage", nameAr: climate.nameAr || "التكييف والتدفئة", updatedAt: Date.now() });
    const children: [string, string, string, string][] = [
      ["chauffage", "Chauffage", "مدافئ", "heater"],
      ["chauffe-eau", "Chauffe-eau", "سخانات الماء", "flame"],
    ];
    for (const [slug, name, nameAr, icon] of children) {
      const cat = await bySlug(slug);
      if (cat) await ctx.db.patch(cat._id, { name, nameAr, icon, parentId: climate._id, updatedAt: Date.now() });
    }
    return "ok";
  },
});
