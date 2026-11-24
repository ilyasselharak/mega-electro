"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CircleAlert, CircleDashed, ExternalLink, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SingleImageField } from "@/components/admin/image-manager";
import { StoreImage } from "@/components/shared/store-image";
import { auditOne, renderedTitle, SEO_LIMITS, suggestForCategory, suggestForProduct, type SuggestionPatch } from "@convex/lib/seoRules";
import { entitySeoFormSchema, type EntitySeoFormInput, type EntitySeoFormValues } from "@/lib/validators/seo";
import { saveEntitySeo } from "@/server/actions/seo";
import { cn, slugify } from "@/lib/utils";
import { SeoStatusBadge } from "./status-badge";

export type SuggestionSource =
  | { kind: "category"; name: string; parentName: string | null; childNames: string[]; brandNames: string[]; productCount: number; hasImage: boolean }
  | { kind: "product"; name: string; brandName: string | null; categoryName: string | null; price: number; shortDescription: string | null; images: { key: string; alt: string | null }[] };

type Props = {
  kind: "category" | "product";
  id: string;
  initial: EntitySeoFormInput;
  imageKey: string | null;
  publicPath: string;
  isPublic: boolean;
  siteName: string;
  freeShippingThreshold: number;
  siteUrl: string;
  /** Other pages' titles/descriptions (normalised) for live duplicate detection. */
  others: { titles: string[]; descriptions: string[] };
  source: SuggestionSource;
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

function Field({ label, hint, error, children, className, counter }: { label: string; hint?: React.ReactNode; error?: string; children: React.ReactNode; className?: string; counter?: { value: number; min: number; max: number } }) {
  const tone = counter ? (counter.value === 0 ? "text-muted-foreground" : counter.value < counter.min || counter.value > counter.max ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400") : "";
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label>{label}</Label>
        {counter ? <span className={cn("font-mono text-xs tabular-nums", tone)}>{counter.value} / {counter.min}–{counter.max}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SeoEntityForm({ kind, id, initial, imageKey, publicPath, isPublic, siteName, freeShippingThreshold, siteUrl, others, source }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<EntitySeoFormInput, unknown, EntitySeoFormValues>({ resolver: zodResolver(entitySeoFormSchema), defaultValues: initial });
  const { register, control, watch, setValue, getValues, formState: { errors, isDirty } } = form;
  const v = watch();
  const isCategory = kind === "category";

  // Recomputed on every render: watch() may return the same (mutated) object, so no memo.
  const audit = (() => {
    const title = (v.metaTitle ?? "").trim();
    const desc = (v.metaDescription ?? "").trim();
    return auditOne(
      {
        kind,
        id,
        name: v.name || source.name,
        slug: v.slug,
        metaTitle: title || null,
        metaDescription: desc || null,
        shortText: v.shortText ?? null,
        longText: v.longText ?? null,
        hasImage: isCategory ? Boolean(imageKey) : (v.imageAlts ?? []).length > 0,
        imagesMissingAlt: (v.imageAlts ?? []).filter((a) => !a.alt?.trim()).length,
        seo: { ...v.seo, ogImageKey: v.seo?.ogImageKey ?? undefined },
      },
      siteName,
      Boolean(title) && !v.seo?.noindex && others.titles.includes(norm(title)),
      Boolean(desc) && !v.seo?.noindex && others.descriptions.includes(norm(desc)),
    );
  })();

  /** Fills EMPTY form fields only. Nothing is saved until "Enregistrer". */
  function suggest() {
    const ctx = { siteName, freeShippingThreshold };
    const s: SuggestionPatch & { imageAlts?: { key: string; alt: string }[] } =
      source.kind === "category" ? suggestForCategory({ ...source, name: getValues("name") || source.name }, ctx) : suggestForProduct(source, ctx);
    let filled = 0;
    const fill = (path: Parameters<typeof setValue>[0], value: string | undefined) => {
      if (!value) return;
      const current = getValues(path);
      if (typeof current === "string" && current.trim()) return;
      setValue(path, value as never, { shouldDirty: true });
      filled++;
    };
    fill("metaTitle", s.metaTitle);
    fill("metaDescription", s.metaDescription);
    if (isCategory) {
      fill("shortText", s.shortText);
      fill("longText", s.seo.longDescription);
      fill("seo.imageAlt", s.seo.imageAlt);
    }
    for (const key of ["h1", "keywords", "titleAr", "metaDescriptionAr", "descriptionAr", "keywordsAr", "ogTitle", "ogDescription"] as const) fill(`seo.${key}`, s.seo[key]);
    if (s.imageAlts) {
      const alts = getValues("imageAlts") ?? [];
      alts.forEach((a, i) => {
        if (!a.alt?.trim()) {
          const alt = s.imageAlts!.find((x) => x.key === a.key)?.alt;
          if (alt) {
            setValue(`imageAlts.${i}.alt`, alt, { shouldDirty: true });
            filled++;
          }
        }
      });
    }
    toast[filled ? "success" : "info"](filled ? `${filled} champ(s) vide(s) pré-rempli(s). Relisez puis enregistrez.` : "Aucun champ vide à pré-remplir.");
  }

  function onSubmit(values: EntitySeoFormValues) {
    start(async () => {
      const res = await saveEntitySeo(kind, id, values);
      if (!res.ok) {
        toast.error(res.error);
        if (res.fieldErrors) for (const [k, msg] of Object.entries(res.fieldErrors)) if (msg?.[0]) form.setError(k as keyof EntitySeoFormInput, { message: msg[0] });
        return;
      }
      toast.success("SEO enregistré — la page publique est mise à jour.");
      form.reset(values as EntitySeoFormInput);
      router.refresh();
    });
  }

  const previewTitle = renderedTitle((v.metaTitle ?? "").trim() || (isCategory ? `${v.name || source.name} au meilleur prix au Maroc` : `${source.name} — Prix Maroc`), siteName);
  const slugChanged = v.slug !== initial.slug;
  const host = siteUrl.replace(/^https?:\/\//, "");

  return (
    <form onSubmit={form.handleSubmit(onSubmit, () => toast.error("Veuillez corriger les champs en rouge."))} className="pb-24">
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Résultat Google</CardTitle><CardDescription>Titre et description tels qu&apos;ils peuvent apparaître dans Google.</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-background p-4">
                <p className="truncate text-xs text-[#006621] dark:text-[#bdc1c6]">{host} › {isCategory ? "categorie" : "produit"} › {v.slug}</p>
                <p className="mt-0.5 line-clamp-1 text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{previewTitle}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{(v.metaDescription ?? "").trim() || "Aucune méta-description : Google choisira un extrait de la page."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Métadonnées (français)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {isCategory ? (
                <Field label="Nom de la catégorie *" error={errors.name?.message}><Input {...register("name")} /></Field>
              ) : null}
              <Field
                label="Slug (URL) *"
                error={errors.slug?.message}
                hint={slugChanged ? <span className="text-amber-700 dark:text-amber-400">L&apos;ancienne URL sera automatiquement redirigée (301) vers la nouvelle.</span> : `${isCategory ? "/categorie/" : "/produit/"}${v.slug}`}
              >
                <div className="flex gap-2">
                  <Input {...register("slug")} />
                  <Button type="button" variant="outline" size="icon" onClick={() => setValue("slug", slugify(v.name || source.name), { shouldDirty: true })} aria-label="Générer depuis le nom"><Wand2 /></Button>
                </div>
              </Field>
              <Field label="Titre H1 (affiché sur la page)" error={errors.seo?.h1?.message} hint={`Vide = ${isCategory ? "nom de la catégorie" : "nom du produit"}.`}>
                <Input {...register("seo.h1")} placeholder={v.name || source.name} />
              </Field>
              <Field label="Titre SEO (balise title)" error={errors.metaTitle?.message} counter={{ value: audit.titleLength, min: SEO_LIMITS.titleMin, max: SEO_LIMITS.titleMax }} hint={`Le compteur inclut « | ${siteName} » ajouté automatiquement.`}>
                <Input {...register("metaTitle")} />
              </Field>
              <Field label="Méta-description" error={errors.metaDescription?.message} counter={{ value: (v.metaDescription ?? "").trim().length, min: SEO_LIMITS.descMin, max: SEO_LIMITS.descMax }}>
                <Textarea rows={3} {...register("metaDescription")} />
              </Field>
              <Field label="Mots-clés cibles" error={errors.seo?.keywords?.message} hint="Séparés par des virgules. Servent à guider la rédaction (Google n'utilise pas la balise keywords pour le classement).">
                <Input {...register("seo.keywords")} placeholder={isCategory ? "réfrigérateur maroc, prix frigo maroc…" : "machine à laver lg 9kg prix maroc…"} />
              </Field>
              <Field label={isCategory ? "Description courte (sous le H1)" : "Résumé (près du prix)"} error={errors.shortText?.message} hint={`${(v.shortText ?? "").length} caractères`}>
                <Textarea rows={3} {...register("shortText")} />
              </Field>
              <Field
                label={isCategory ? "Texte SEO long (sous la liste de produits, page 1)" : "Description détaillée"}
                error={errors.longText?.message}
                hint={`${(v.longText ?? "").length} caractères${isCategory ? " · paragraphes séparés par une ligne vide" : ""}`}
              >
                <Textarea rows={isCategory ? 8 : 10} {...register("longText")} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Arabe / Darija</CardTitle>
              <CardDescription>Affiché dans un bloc en arabe sur la page publique (titre + description), pour capter les recherches en arabe. Rédigez naturellement, sans traduction mot à mot.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4" dir="rtl" lang="ar">
              <Field label="العنوان (Titre arabe)" error={errors.seo?.titleAr?.message}><Input {...register("seo.titleAr")} /></Field>
              <Field label="الوصف المختصر (Méta-description arabe)" error={errors.seo?.metaDescriptionAr?.message}><Textarea rows={2} {...register("seo.metaDescriptionAr")} /></Field>
              <Field label="الوصف (Description arabe affichée)" error={errors.seo?.descriptionAr?.message}><Textarea rows={4} {...register("seo.descriptionAr")} /></Field>
              <Field label="الكلمات المفتاحية (Mots-clés arabe / darija)" error={errors.seo?.keywordsAr?.message}><Input {...register("seo.keywordsAr")} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Images & ALT</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {isCategory ? (
                imageKey ? (
                  <div className="flex items-start gap-4">
                    <span className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-white"><StoreImage imageKey={imageKey} alt="" fill sizes="80px" className="object-contain p-1" /></span>
                    <Field label="Texte ALT de l'image" error={errors.seo?.imageAlt?.message} className="flex-1" hint="Décrivez l'image (ex : « Réfrigérateurs combinés inox »)."><Input {...register("seo.imageAlt")} /></Field>
                  </div>
                ) : <p className="text-sm text-muted-foreground">Aucune image pour cette catégorie (ajoutez-en une depuis Catégories).</p>
              ) : (v.imageAlts ?? []).length ? (
                (v.imageAlts ?? []).map((img, i) => (
                  <div key={img.key} className="flex items-center gap-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-white"><StoreImage imageKey={img.key} alt="" fill sizes="56px" className="object-contain p-1" /></span>
                    <Input {...register(`imageAlts.${i}.alt`)} placeholder={`Description de l'image ${i + 1}`} aria-label={`Texte ALT image ${i + 1}`} />
                  </div>
                ))
              ) : <p className="text-sm text-muted-foreground">Ce produit n&apos;a aucune image.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Réseaux sociaux (Open Graph)</CardTitle><CardDescription>Aperçu lors d&apos;un partage sur Facebook, WhatsApp, etc. Vide = titre et description SEO.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Titre Open Graph" error={errors.seo?.ogTitle?.message}><Input {...register("seo.ogTitle")} /></Field>
              <Field label="Description Open Graph" error={errors.seo?.ogDescription?.message}><Textarea rows={2} {...register("seo.ogDescription")} /></Field>
              <Controller control={control} name="seo.ogImageKey" render={({ field }) => (
                <Field label="Image Open Graph (1200×630 recommandé)" hint={`Vide = ${isCategory ? "image de la catégorie" : "première photo du produit"}.`}>
                  <SingleImageField scope="seo" value={field.value} onChange={field.onChange} />
                </Field>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Indexation & URL canonique</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="URL canonique" error={errors.seo?.canonicalUrl?.message} hint="Vide = l'URL de la page elle-même (recommandé). À renseigner uniquement si cette page duplique une autre page.">
                <Input {...register("seo.canonicalUrl")} placeholder={`${siteUrl}${publicPath}`} />
              </Field>
              <Controller control={control} name="seo.noindex" render={({ field }) => (
                <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                  <span><span className="font-medium">Noindex</span><span className="block text-xs text-muted-foreground">Exclut la page de Google et du sitemap.</span></span>
                  <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                </label>
              )} />
              <Controller control={control} name="seo.nofollow" render={({ field }) => (
                <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                  <span><span className="font-medium">Nofollow</span><span className="block text-xs text-muted-foreground">Demande à Google de ne pas suivre les liens de la page (rarement utile).</span></span>
                  <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                </label>
              )} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Score SEO</CardTitle>
              <SeoStatusBadge status={audit.status} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-heading text-3xl font-bold tabular-nums">{audit.score}%</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full rounded-full", audit.score >= 85 ? "bg-emerald-500" : audit.score >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${audit.score}%` }} /></span>
              </div>
              <ul className="space-y-2 text-sm">
                {audit.checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-2">
                    {c.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : c.required ? <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" /> : <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                    <span className={cn(!c.ok && !c.required && "text-muted-foreground")}>{c.label}{c.required ? "" : " (recommandé)"}</span>
                  </li>
                ))}
              </ul>
              <Button type="button" variant="outline" className="w-full" onClick={suggest}><Sparkles /> Suggérer pour les champs vides</Button>
              <p className="text-xs text-muted-foreground">Les suggestions ne remplissent que les champs vides et ne sont enregistrées qu&apos;après validation. {kind === "product" ? "Les descriptions produit ne sont jamais générées : elles doivent venir de la fiche réelle." : ""}</p>
            </CardContent>
          </Card>
          {isPublic ? (
            <a href={publicPath} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-sm text-primary hover:underline">Voir la page publique <ExternalLink className="size-3.5" /></a>
          ) : (
            <p className="text-sm text-muted-foreground">Cette page n&apos;est pas visible en boutique ({isCategory ? "catégorie masquée" : "produit non actif"}).</p>
          )}
          {kind === "product" ? <Link href={`/admin/products/${id}`} className="block text-sm text-primary hover:underline">Ouvrir la fiche produit complète</Link> : <Link href="/admin/categories" className="block text-sm text-primary hover:underline">Gérer les catégories</Link>}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur lg:start-64">
        <div className="flex items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {isDirty ? <span className="me-auto text-sm text-muted-foreground">Modifications non enregistrées</span> : null}
          <Button type="button" variant="outline" asChild><Link href={isCategory ? "/admin/seo/categories" : "/admin/seo/products"}>Retour</Link></Button>
          <Button type="submit" disabled={pending} className="min-w-32">{pending ? <Loader2 className="animate-spin" /> : null} Enregistrer</Button>
        </div>
      </div>
    </form>
  );
}
