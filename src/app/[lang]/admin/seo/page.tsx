import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, CircleSlash, ExternalLink, FileCode2, Map as MapIcon, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { ScoreBar, SeoStatusBadge } from "@/components/admin/seo/status-badge";
import { getSeoOverview } from "@/server/queries/seo";
import { buildSeoRows, summarize } from "@/server/seo-audit";
import { siteBase, urlFor } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tableau de bord" };

function Stat({ label, value, hint, href, tone }: { label: string; value: string | number; hint?: string; href?: string; tone?: "good" | "warn" | "bad" }) {
  const body = (
    <Card className="h-full gap-0 py-0 transition hover:shadow-md">
      <CardContent className="space-y-1 p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn("font-heading text-2xl font-bold tabular-nums", tone === "good" && "text-emerald-700 dark:text-emerald-400", tone === "warn" && "text-amber-700 dark:text-amber-400", tone === "bad" && "text-red-700 dark:text-red-400")}>{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}

function StatusLine({ ok, warn, children }: { ok: boolean; warn?: boolean; children: React.ReactNode }) {
  const Icon = ok ? CheckCircle2 : warn ? AlertTriangle : XCircle;
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <Icon className={cn("mt-0.5 size-4 shrink-0", ok ? "text-emerald-600" : warn ? "text-amber-600" : "text-red-600")} aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export default async function SeoDashboardPage() {
  const overview = await getSeoOverview();
  const { categories, products } = buildSeoRows(overview);
  const c = summarize(categories);
  const p = summarize(products);
  const seo = overview.settings;
  const base = siteBase(seo);
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const baseOk = /^https:\/\//.test(base) && !/localhost|127\.0\.0\.1/.test(base);

  const sitemapCategories = overview.categories.filter((x) => x.isActive && !x.seo.noindex && !x.seo.canonicalUrl).length;
  const sitemapProducts = overview.products.filter((x) => x.status === "ACTIVE" && !x.seo.noindex && !x.seo.canonicalUrl).length;
  const sampleProduct = products.find((r) => r.isPublic && !r.noindex);
  const sampleCategory = categories.find((r) => r.isPublic && !r.noindex);
  const priorities = [...categories, ...products].filter((r) => r.isPublic && r.status !== "optimized").sort((a, b) => a.score - b.score).slice(0, 10);
  const richTest = (path: string) => `https://search.google.com/test/rich-results?url=${encodeURIComponent(urlFor(path, seo))}`;

  return (
    <>
      <PageHeader title="Référencement (SEO)" description="État du référencement de la boutique. Cliquez sur un indicateur pour ouvrir la liste correspondante." />

      {!seo.robotsIndex ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p><strong>Tout le site est en noindex.</strong> Google ne référencera aucune page. Réactivez l&apos;indexation dans <Link href="/admin/seo/settings" className="underline">Paramètres SEO → Global</Link>.</p>
        </div>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Catalogue</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
        <Stat label="Produits" value={p.total} hint={`${p.visible} visibles en boutique`} href="/admin/seo/products" />
        <Stat label="Catégories" value={c.total} hint={`${c.visible} visibles en boutique`} href="/admin/seo/categories" />
        <Stat label="Catégories optimisées" value={`${c.optimized}/${c.visible}`} tone={c.optimized === c.visible ? "good" : undefined} href="/admin/seo/categories?filtre=optimized" />
        <Stat label="Catégories à compléter" value={c.incomplete + c.missing} hint={`${c.missing} sans aucun SEO`} tone={c.incomplete + c.missing ? "warn" : "good"} href="/admin/seo/categories?filtre=incomplete" />
        <Stat label="Score moyen catégories" value={`${c.averageScore}%`} />
        <Stat label="Produits optimisés" value={`${p.optimized}/${p.visible}`} tone={p.optimized === p.visible ? "good" : undefined} href="/admin/seo/products?filtre=optimized" />
        <Stat label="Produits à compléter" value={p.incomplete + p.missing} hint={`${p.missing} sans aucun SEO`} tone={p.incomplete + p.missing ? "warn" : "good"} href="/admin/seo/products?filtre=incomplete" />
        <Stat label="Méta-descriptions manquantes" value={c.missingDescription + p.missingDescription} hint={`${c.missingDescription} catégories · ${p.missingDescription} produits`} tone={c.missingDescription + p.missingDescription ? "warn" : "good"} href="/admin/seo/products?filtre=no-description" />
        <Stat label="Titres dupliqués" value={c.duplicateTitles + p.duplicateTitles} tone={c.duplicateTitles + p.duplicateTitles ? "bad" : "good"} href="/admin/seo/products?filtre=duplicates" />
        <Stat label="Descriptions dupliquées" value={c.duplicateDescriptions + p.duplicateDescriptions} tone={c.duplicateDescriptions + p.duplicateDescriptions ? "bad" : "good"} href="/admin/seo/products?filtre=duplicates" />
        <Stat label="Pages en noindex" value={c.noindex + p.noindex} hint={`${c.noindex} catégories · ${p.noindex} produits`} href="/admin/seo/products?filtre=noindex" />
        <Stat label="Score moyen produits" value={`${p.averageScore}%`} />
        <Stat label="Redirections 301" value={overview.redirectCount} href="/admin/seo/redirects" />
      </div>

      {(() => {
        // Arabic and rich-content completeness of active products (internal indicator, not a Google ranking score).
        const active = overview.products.filter((x) => x.status === "ACTIVE");
        const n = active.length || 1;
        const row = (x: (typeof active)[number]) => x as typeof x & { nameAr?: string | null; faqCount?: number; specCount?: number; images: { altAr?: string | null }[] };
        const count = (f: (x: ReturnType<typeof row>) => boolean) => active.map(row).filter(f).length;
        const known = active.some((x) => "nameAr" in x);
        const items = [
          { label: "Nom arabe", done: known ? count((x) => Boolean(x.nameAr)) : null },
          { label: "Titre SEO arabe", done: count((x) => Boolean(x.seo.titleAr)) },
          { label: "Méta-description arabe", done: count((x) => Boolean(x.seo.metaDescriptionAr)) },
          { label: "Description arabe", done: count((x) => Boolean(x.seo.descriptionAr)) },
          { label: "Mots-clés arabes / darija", done: count((x) => Boolean(x.seo.keywordsAr)) },
          { label: "FAQ produit", done: known ? count((x) => (x.faqCount ?? 0) > 0) : null },
          { label: "Caractéristiques", done: known ? count((x) => (x.specCount ?? 0) > 0) : null },
          { label: "ALT arabe des images", done: known ? count((x) => x.images.length > 0 && x.images.every((i) => Boolean(i.altAr))) : null },
        ];
        return (
          <>
            <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Arabe et contenu enrichi ({active.length} produits actifs)</h2>
            <p className="mb-3 text-xs text-muted-foreground">Indicateur interne de complétude, pas un score Google.</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {items.map((it) => (
                <Stat
                  key={it.label}
                  label={it.label}
                  value={it.done == null ? "—" : `${Math.round((it.done / n) * 100)}%`}
                  hint={it.done == null ? "Après déploiement du backend" : `${it.done}/${active.length}`}
                  tone={it.done == null ? undefined : it.done === active.length ? "good" : it.done / n < 0.5 ? "bad" : "warn"}
                />
              ))}
            </div>
          </>
        );
      })()}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapIcon className="size-4.5 text-orange-strong" /> SEO technique</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <StatusLine ok={baseOk} warn={!baseOk}>
                URL canonique du site : <code className="rounded bg-muted px-1 text-xs">{base}</code>
                {!baseOk ? <span className="block text-xs text-muted-foreground">Définissez NEXT_PUBLIC_SITE_URL (https://…) ou l&apos;URL canonique dans Paramètres SEO.</span> : null}
                {seo.canonicalBaseUrl && envUrl && seo.canonicalBaseUrl.replace(/\/$/, "") !== envUrl.replace(/\/$/, "") ? <span className="block text-xs text-amber-700">Différente de NEXT_PUBLIC_SITE_URL ({envUrl}).</span> : null}
              </StatusLine>
              <StatusLine ok={seo.robotsIndex}>Indexation globale : {seo.robotsIndex ? "autorisée" : "BLOQUÉE (noindex)"}{seo.robotsFollow ? "" : " · nofollow"}</StatusLine>
              <StatusLine ok>
                Sitemap XML : {sitemapCategories} catégories, {sitemapProducts} produits{seo.sitemapIncludeBrands ? `, ${overview.brandCount} marques` : ""}{seo.sitemapIncludeImages ? " + images" : ""}.{" "}
                <a href="/sitemap.xml" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-orange-strong hover:underline">Ouvrir <ExternalLink className="size-3" /></a>
              </StatusLine>
              <StatusLine ok>
                robots.txt : zones privées bloquées (admin, panier, commande, compte), pages produits et catégories autorisées
                {seo.robotsExtraDisallow.trim() ? ` · ${seo.robotsExtraDisallow.trim().split("\n").length} règle(s) personnalisée(s)` : ""}.{" "}
                <a href="/robots.txt" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-orange-strong hover:underline">Ouvrir <ExternalLink className="size-3" /></a>
              </StatusLine>
              <StatusLine ok={Boolean(seo.googleVerification)} warn>
                Google Search Console : {seo.googleVerification ? "balise de validation installée" : "aucune balise de validation (facultatif si le domaine est validé par DNS)"}
              </StatusLine>
              <StatusLine ok>Pagination : chaque page (?page=2…) a sa propre URL canonique et reste indexable ; les filtres et tris sont en noindex.</StatusLine>
              <StatusLine ok>Pages privées (connexion, panier, commande, compte, admin) : noindex.</StatusLine>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileCode2 className="size-4.5 text-orange-strong" /> Données structurées (JSON-LD)</CardTitle>
            <CardDescription>Uniquement des données réelles du catalogue. Modifiables dans Paramètres SEO → Données structurées.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <StatusLine ok={seo.sdOrganization} warn>Organization / {seo.orgType} {seo.sdOrganization ? "" : "(désactivé)"}</StatusLine>
              <StatusLine ok={seo.sdWebsite} warn>WebSite + champ de recherche {seo.sdWebsite ? "" : "(désactivé)"}</StatusLine>
              <StatusLine ok={seo.sdBreadcrumbs} warn>BreadcrumbList (fil d&apos;Ariane) {seo.sdBreadcrumbs ? "" : "(désactivé)"}</StatusLine>
              <StatusLine ok={seo.sdProduct} warn>
                Product + Offer : prix, devise, disponibilité, SKU, marque, images
                {seo.sdProduct ? (
                  <span className="block text-xs text-muted-foreground">
                    Livraison : {seo.sdShipping ? `frais réels de la boutique, ${seo.shippingHandlingMin}–${seo.shippingHandlingMax} j de préparation, ${seo.shippingTransitMin}–${seo.shippingTransitMax} j de transport` : "non déclarée"} · Retours : {seo.sdReturnPolicy ? `${seo.returnDays} jours${seo.returnFees ? "" : ", frais non précisés"}${seo.returnMethod ? "" : ", mode non précisé"}` : "non déclarés"}
                  </span>
                ) : null}
              </StatusLine>
              <StatusLine ok={seo.sdItemList} warn>ItemList sur les pages de liste {seo.sdItemList ? "" : "(désactivé)"}</StatusLine>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground"><CircleSlash className="mt-0.5 size-4 shrink-0" /> AggregateRating / Review : non émis (aucun avis client réel sur la boutique).</li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground"><CircleSlash className="mt-0.5 size-4 shrink-0" /> FAQPage / Article : non émis (pas de FAQ ni de blog sur le site).</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 border-t pt-4 text-sm">
              <a href={richTest("/")} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-muted">Tester l&apos;accueil <ExternalLink className="size-3" /></a>
              {sampleCategory ? <a href={richTest(sampleCategory.publicPath)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-muted">Tester une catégorie <ExternalLink className="size-3" /></a> : null}
              {sampleProduct ? <a href={richTest(sampleProduct.publicPath)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-muted">Tester un produit <ExternalLink className="size-3" /></a> : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div><CardTitle>Priorités</CardTitle><CardDescription>Pages visibles avec le score SEO le plus bas.</CardDescription></div>
          <Link href="/admin/seo/categories?filtre=incomplete" className="flex items-center gap-1 text-sm font-medium text-orange-strong hover:underline">Catégories <ArrowRight className="size-4" /></Link>
        </CardHeader>
        <CardContent>
          {priorities.length ? (
            <ul className="divide-y">
              {priorities.map((r) => (
                <li key={`${r.kind}-${r.id}`} className="flex flex-wrap items-center gap-3 py-2.5">
                  <span className="w-20 text-xs uppercase tracking-wide text-muted-foreground">{r.kind === "category" ? "Catégorie" : "Produit"}</span>
                  <Link href={`/admin/seo/edit/${r.kind}/${r.id}`} className="min-w-0 flex-1 truncate font-medium hover:text-orange-strong hover:underline">{r.name}</Link>
                  <SeoStatusBadge status={r.status} />
                  <ScoreBar score={r.score} />
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Toutes les pages visibles sont optimisées.</p>}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Blog : aucun module blog n&apos;existe sur la boutique. Les pages d&apos;information (livraison, CGV, contact…) utilisent les métadonnées par défaut.
      </p>
    </>
  );
}
