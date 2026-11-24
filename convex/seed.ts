import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction, internalMutation } from "./_generated/server";
import { createAuth } from "./betterAuth/auth";
import { isCloudinaryConfigured, uploadFromUrl } from "./lib/cloudinary";
import { buildSearchText } from "./lib/products";

/**
 * Seed: first administrator, category tree, brands and demo products. Idempotent.
 *   npx convex run seed:run '{"adminEmail":"…","adminPassword":"…","demo":true}'
 * Demo product images are uploaded to Cloudinary when it is configured.
 */

const CATEGORIES: { name: string; slug: string; icon: string; description: string; children?: { name: string; slug: string }[] }[] = [
  { name: "Réfrigérateurs", slug: "refrigerateurs", icon: "refrigerator", description: "Réfrigérateurs combinés, américains, doubles portes et congélateurs au meilleur prix au Maroc.", children: [{ name: "Combinés", slug: "refrigerateurs-combines" }, { name: "Américains", slug: "refrigerateurs-americains" }, { name: "Congélateurs", slug: "congelateurs" }] },
  { name: "Lavage", slug: "lavage", icon: "washing-machine", description: "Machines à laver, lave-linge séchants et lave-vaisselle.", children: [{ name: "Machines à laver", slug: "machines-a-laver" }, { name: "Lave-vaisselle", slug: "lave-vaisselle" }] },
  { name: "Cuisson", slug: "cuisson", icon: "flame", description: "Cuisinières, fours encastrables, plaques et hottes.", children: [{ name: "Cuisinières", slug: "cuisinieres" }, { name: "Fours", slug: "fours" }] },
  { name: "Climatisation", slug: "climatisation", icon: "air-vent", description: "Climatiseurs split inverter, ventilateurs et chauffages." },
  { name: "Micro-ondes", slug: "micro-ondes", icon: "microwave", description: "Micro-ondes solo, grill et combinés." },
  { name: "TV & Image", slug: "tv-image", icon: "tv", description: "Téléviseurs LED, QLED et Smart TV." },
  { name: "Petit électroménager", slug: "petit-electromenager", icon: "blend", description: "Blenders, robots, cafetières, aspirateurs et fers à repasser." },
];

const BRANDS = ["Samsung", "LG", "Beko", "Bosch", "Whirlpool", "Midea", "Hisense", "Moulinex", "Philips", "Tefal"];

type Shape = "fridge" | "washer" | "oven" | "ac" | "tv" | "microwave" | "small";
const PRODUCTS: { name: string; cat: string; brand: string; price: number; compare?: number; stock: number; shape: Shape; featured?: boolean; specs: [string, string][] }[] = [
  { name: "Réfrigérateur combiné No Frost 340 L Inox", cat: "refrigerateurs-combines", brand: "Samsung", price: 6990, compare: 7990, stock: 12, shape: "fridge", featured: true, specs: [["Capacité", "340 L"], ["Technologie", "No Frost"], ["Classe énergétique", "A+"], ["Couleur", "Inox"]] },
  { name: "Réfrigérateur américain 617 L avec distributeur d'eau", cat: "refrigerateurs-americains", brand: "LG", price: 16490, compare: 18990, stock: 4, shape: "fridge", featured: true, specs: [["Capacité", "617 L"], ["Compresseur", "Inverter Linear"], ["Distributeur", "Eau et glaçons"]] },
  { name: "Réfrigérateur double porte 450 L", cat: "refrigerateurs", brand: "Beko", price: 5490, stock: 8, shape: "fridge", specs: [["Capacité", "450 L"], ["Classe énergétique", "A+"]] },
  { name: "Congélateur coffre 200 L", cat: "congelateurs", brand: "Midea", price: 2890, stock: 2, shape: "small", specs: [["Capacité", "200 L"], ["Type", "Coffre"]] },
  { name: "Machine à laver frontale 9 kg 1400 tr/min", cat: "machines-a-laver", brand: "LG", price: 5290, compare: 5990, stock: 15, shape: "washer", featured: true, specs: [["Capacité", "9 kg"], ["Essorage", "1400 tr/min"], ["Moteur", "Direct Drive Inverter"]] },
  { name: "Machine à laver 7 kg 1200 tr/min Blanc", cat: "machines-a-laver", brand: "Beko", price: 3290, stock: 20, shape: "washer", specs: [["Capacité", "7 kg"], ["Essorage", "1200 tr/min"]] },
  { name: "Lave-linge séchant 10/6 kg", cat: "machines-a-laver", brand: "Samsung", price: 7490, stock: 0, shape: "washer", specs: [["Lavage", "10 kg"], ["Séchage", "6 kg"]] },
  { name: "Lave-vaisselle 14 couverts Silence Plus", cat: "lave-vaisselle", brand: "Bosch", price: 5890, compare: 6490, stock: 6, shape: "washer", specs: [["Couverts", "14"], ["Niveau sonore", "44 dB"]] },
  { name: "Cuisinière 5 feux gaz 90 cm Inox", cat: "cuisinieres", brand: "Whirlpool", price: 4590, stock: 9, shape: "oven", featured: true, specs: [["Feux", "5 gaz"], ["Largeur", "90 cm"], ["Four", "Gaz avec tournebroche"]] },
  { name: "Cuisinière 4 feux 60 cm", cat: "cuisinieres", brand: "Beko", price: 2690, stock: 14, shape: "oven", specs: [["Feux", "4 gaz"], ["Largeur", "60 cm"]] },
  { name: "Four encastrable multifonction 71 L", cat: "fours", brand: "Bosch", price: 4990, stock: 3, shape: "oven", specs: [["Volume", "71 L"], ["Nettoyage", "Catalyse"]] },
  { name: "Climatiseur split Inverter 12 000 BTU", cat: "climatisation", brand: "Midea", price: 4290, compare: 4990, stock: 18, shape: "ac", featured: true, specs: [["Puissance", "12 000 BTU"], ["Mode", "Chaud / Froid"], ["Gaz", "R32"]] },
  { name: "Climatiseur split Inverter 18 000 BTU Wi-Fi", cat: "climatisation", brand: "Samsung", price: 6990, stock: 7, shape: "ac", specs: [["Puissance", "18 000 BTU"], ["Connectivité", "Wi-Fi"]] },
  { name: "Micro-ondes grill 25 L", cat: "micro-ondes", brand: "LG", price: 1290, stock: 25, shape: "microwave", specs: [["Volume", "25 L"], ["Fonctions", "Micro-ondes + grill"]] },
  { name: "Micro-ondes solo 20 L Blanc", cat: "micro-ondes", brand: "Midea", price: 749, compare: 899, stock: 30, shape: "microwave", specs: [["Volume", "20 L"]] },
  { name: "Smart TV 55\" 4K UHD", cat: "tv-image", brand: "Hisense", price: 4990, compare: 5790, stock: 10, shape: "tv", featured: true, specs: [["Taille", "55 pouces"], ["Résolution", "4K UHD"], ["Système", "VIDAA"]] },
  { name: "Smart TV 65\" QLED 4K", cat: "tv-image", brand: "Samsung", price: 9990, stock: 5, shape: "tv", specs: [["Taille", "65 pouces"], ["Technologie", "QLED"]] },
  { name: "Blender chauffant 1,75 L", cat: "petit-electromenager", brand: "Moulinex", price: 899, stock: 22, shape: "small", specs: [["Capacité", "1,75 L"], ["Puissance", "1000 W"]] },
  { name: "Robot pâtissier 1000 W", cat: "petit-electromenager", brand: "Philips", price: 1590, stock: 1, shape: "small", specs: [["Puissance", "1000 W"], ["Bol", "4 L"]] },
  { name: "Fer à repasser vapeur 2600 W", cat: "petit-electromenager", brand: "Tefal", price: 449, stock: 40, shape: "small", specs: [["Puissance", "2600 W"], ["Débit vapeur", "45 g/min"]] },
];

const COLORS = ["#cfd8dc", "#e0e0e0", "#b0bec5", "#eceff1", "#d7ccc8"];

function applianceSvg(shape: Shape, tint: string) {
  const body = (inner: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 400 400"><rect width="400" height="400" fill="#ffffff"/><ellipse cx="200" cy="372" rx="120" ry="10" fill="#000" opacity="0.08"/>${inner}</svg>`;
  switch (shape) {
    case "fridge":
      return body(`<rect x="120" y="40" width="160" height="325" rx="14" fill="${tint}" stroke="#78909c" stroke-width="3"/><line x1="120" y1="150" x2="280" y2="150" stroke="#78909c" stroke-width="3"/><rect x="258" y="70" width="8" height="50" rx="4" fill="#546e7a"/><rect x="258" y="175" width="8" height="80" rx="4" fill="#546e7a"/>`);
    case "washer":
      return body(`<rect x="100" y="70" width="200" height="295" rx="14" fill="${tint}" stroke="#78909c" stroke-width="3"/><line x1="100" y1="120" x2="300" y2="120" stroke="#78909c" stroke-width="3"/><circle cx="200" cy="240" r="72" fill="#eceff1" stroke="#546e7a" stroke-width="6"/><circle cx="200" cy="240" r="50" fill="#90a4ae" opacity="0.5"/><rect x="120" y="88" width="60" height="16" rx="4" fill="#546e7a"/><circle cx="270" cy="96" r="10" fill="#546e7a"/>`);
    case "oven":
      return body(`<rect x="95" y="80" width="210" height="285" rx="12" fill="${tint}" stroke="#78909c" stroke-width="3"/><rect x="95" y="80" width="210" height="50" rx="12" fill="#455a64"/><circle cx="130" cy="105" r="9" fill="#cfd8dc"/><circle cx="165" cy="105" r="9" fill="#cfd8dc"/><circle cx="235" cy="105" r="9" fill="#cfd8dc"/><circle cx="270" cy="105" r="9" fill="#cfd8dc"/><rect x="120" y="160" width="160" height="150" rx="10" fill="#37474f" opacity="0.85"/><rect x="130" y="145" width="140" height="8" rx="4" fill="#546e7a"/>`);
    case "ac":
      return body(`<rect x="50" y="150" width="300" height="100" rx="24" fill="${tint}" stroke="#78909c" stroke-width="3"/><line x1="75" y1="225" x2="325" y2="225" stroke="#78909c" stroke-width="3"/><line x1="75" y1="237" x2="325" y2="237" stroke="#78909c" stroke-width="2"/><circle cx="310" cy="180" r="5" fill="#26a69a"/>`);
    case "tv":
      return body(`<rect x="40" y="90" width="320" height="190" rx="8" fill="#263238"/><rect x="50" y="100" width="300" height="170" rx="4" fill="#37474f"/><path d="M50 270 L180 150 L250 210 L350 130 L350 270 Z" fill="#546e7a" opacity="0.6"/><rect x="185" y="280" width="30" height="40" fill="#455a64"/><rect x="140" y="318" width="120" height="10" rx="5" fill="#455a64"/>`);
    case "microwave":
      return body(`<rect x="70" y="130" width="260" height="160" rx="12" fill="${tint}" stroke="#78909c" stroke-width="3"/><rect x="88" y="148" width="170" height="124" rx="8" fill="#37474f" opacity="0.85"/><rect x="272" y="150" width="42" height="20" rx="4" fill="#263238"/><circle cx="293" cy="200" r="9" fill="#546e7a"/><circle cx="293" cy="235" r="9" fill="#546e7a"/>`);
    default:
      return body(`<rect x="140" y="110" width="120" height="250" rx="40" fill="${tint}" stroke="#78909c" stroke-width="3"/><rect x="160" y="60" width="80" height="70" rx="12" fill="#90a4ae" opacity="0.7"/><circle cx="200" cy="300" r="16" fill="#546e7a"/>`);
  }
}


export const catalog = internalMutation({
  args: { demo: v.boolean(), images: v.record(v.string(), v.array(v.object({ key: v.string(), width: v.number(), height: v.number(), size: v.number(), mimeType: v.string() }))) },
  handler: async (ctx, { demo, images }) => {
    const now = Date.now();
    const catIds = new Map<string, Id<"categories">>();
    for (const [i, c] of CATEGORIES.entries()) {
      const existing = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", c.slug)).first();
      const parentId = existing?._id ?? (await ctx.db.insert("categories", { name: c.name, slug: c.slug, icon: c.icon, description: c.description, position: i, isActive: true, updatedAt: now }));
      catIds.set(c.slug, parentId);
      for (const [j, ch] of (c.children ?? []).entries()) {
        const ex = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", ch.slug)).first();
        catIds.set(ch.slug, ex?._id ?? (await ctx.db.insert("categories", { name: ch.name, slug: ch.slug, parentId, position: j, isActive: true, updatedAt: now })));
      }
    }
    const brandIds = new Map<string, Id<"brands">>();
    for (const name of BRANDS) {
      const slug = name.toLowerCase();
      const ex = await ctx.db.query("brands").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
      brandIds.set(name, ex?._id ?? (await ctx.db.insert("brands", { name, slug, isActive: true, updatedAt: now })));
    }
    if (!demo) return 0;

    let created = 0;
    for (const [i, p] of PRODUCTS.entries()) {
      const slug = productSlug(p);
      if (await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slug)).first()) continue;
      const fields = {
        name: `${p.brand} ${p.name}`,
        slug,
        sku: `DZ-${String(i + 1).padStart(4, "0")}`,
        shortDescription: `${p.name} de la marque ${p.brand}. Produit neuf, garantie officielle, livraison partout au Maroc.`,
        description: `Découvrez le ${p.name.toLowerCase()} ${p.brand}, alliant performance, fiabilité et design.\n\nIdéal pour les foyers marocains, il bénéficie de la garantie constructeur et d'un service après-vente assuré par Mega Electro.`,
        price: p.price * 100,
        compareAtPrice: p.compare ? p.compare * 100 : undefined,
        costPrice: Math.round(p.price * 0.78) * 100,
        stock: p.stock,
        lowStockThreshold: 3,
        status: "ACTIVE" as const,
        isFeatured: !!p.featured,
        warrantyMonths: 24,
        categoryId: catIds.get(p.cat),
        brandId: brandIds.get(p.brand),
        specs: p.specs.map(([label, value]) => ({ label, value })),
        images: (images[slug] ?? []).map((img) => ({ ...img, alt: `${p.brand} ${p.name}` })),
        salesCount: 0, // real sales only (incremented by orders)
        updatedAt: now,
      };
      const productId = await ctx.db.insert("products", { ...fields, searchText: await buildSearchText(ctx, fields) });
      if (p.stock) await ctx.db.insert("inventoryMovements", { productId, delta: p.stock, stockAfter: p.stock, reason: "RESTOCK", note: "Stock initial (seed)" });
      created++;
    }
    return created;
  },
});

function productSlug(p: { name: string; brand: string }) {
  return p.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + `-${p.brand.toLowerCase()}`;
}

export const run = internalAction({
  args: { adminEmail: v.optional(v.string()), adminPassword: v.optional(v.string()), demo: v.optional(v.boolean()) },
  handler: async (ctx, { adminEmail, adminPassword, demo = true }) => {
    if (adminEmail && adminPassword) {
      let user = await ctx.runQuery(components.betterAuth.users.getByEmail, { email: adminEmail });
      if (!user) {
        await createAuth(ctx).api.signUpEmail({ body: { email: adminEmail, password: adminPassword, name: "Administrateur" } });
        user = await ctx.runQuery(components.betterAuth.users.getByEmail, { email: adminEmail });
        console.log(`✓ Admin created: ${adminEmail}`);
      }
      if (user && user.role !== "ADMIN") await ctx.runMutation(components.betterAuth.users.setRole, { id: user.id, role: "ADMIN" });
    }

    const images: Record<string, { key: string; width: number; height: number; size: number; mimeType: string }[]> = {};
    if (demo && isCloudinaryConfigured()) {
      for (const [i, p] of PRODUCTS.entries()) {
        const slug = productSlug(p);
        const svgs = [applianceSvg(p.shape, COLORS[i % COLORS.length]), applianceSvg(p.shape, COLORS[(i + 2) % COLORS.length])];
        images[slug] = await Promise.all(svgs.map((svg) => uploadFromUrl(`data:image/svg+xml;base64,${btoa(svg)}`, "products/seed")));
      }
    }
    const created: number = await ctx.runMutation(internal.seed.catalog, { demo, images });
    return `Seed complete (${created} demo products created${demo && !isCloudinaryConfigured() ? ", without images: Cloudinary is not configured" : ""})`;
  },
});
