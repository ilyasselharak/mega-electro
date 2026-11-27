"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageManager } from "@/components/admin/image-manager";
import { productFormSchema, type ProductFormInput, type ProductFormValues } from "@/lib/validators/catalog";
import { saveProduct } from "@/server/actions/products";
import { cn, slugify } from "@/lib/utils";

type Option = { id: string; name: string };
const NONE = "__none__";

function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ProductForm({ productId, initial, categories, brands }: { productId: string | null; initial: ProductFormInput; categories: Option[]; brands: Option[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues: initial });
  const { register, control, watch, setValue, formState: { errors, isDirty } } = form;
  const specs = useFieldArray({ control, name: "specs" });
  const faq = useFieldArray({ control, name: "faq" });

  const [name, price, costPrice, slug, metaTitle, metaDescription, shortDescription] = watch(["name", "price", "costPrice", "slug", "metaTitle", "metaDescription", "shortDescription"]);
  const margin = Number(price) > 0 && Number(costPrice) > 0 ? Math.round(((Number(price) - Number(costPrice)) / Number(price)) * 100) : null;

  function onSubmit(values: ProductFormValues) {
    start(async () => {
      const res = await saveProduct(productId, values);
      if (!res.ok) {
        toast.error(res.error);
        if (res.fieldErrors) for (const [k, v] of Object.entries(res.fieldErrors)) if (v?.[0]) form.setError(k as keyof ProductFormInput, { message: v[0] });
        return;
      }
      toast.success(productId ? "Produit enregistré" : "Produit créé");
      form.reset(values as unknown as ProductFormInput);
      if (!productId) router.replace(`/admin/products/${res.data.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit, () => toast.error("Veuillez corriger les champs en rouge."))} className="pb-24">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Nom du produit *" error={errors.name?.message}>
                <Input
                  {...register("name", {
                    onChange: (e) => {
                      if (!productId && !form.getFieldState("slug").isDirty) setValue("slug", slugify(e.target.value));
                    },
                  })}
                  placeholder="Ex : Réfrigérateur combiné No Frost 340 L Inox"
                />
              </Field>
              <Field label="Nom en arabe" error={errors.nameAr?.message} hint="Affiché sur le site arabe (/ar). Vide = nom français.">
                <Input dir="rtl" lang="ar" {...register("nameAr")} placeholder="ثلاجة سامسونغ 340 لتر" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Slug (URL) *" error={errors.slug?.message} hint={`/produit/${slug || "…"}`}>
                  <div className="flex gap-2">
                    <Input {...register("slug")} />
                    <Button type="button" variant="outline" size="icon" onClick={() => setValue("slug", slugify(name ?? ""), { shouldDirty: true })} aria-label="Générer depuis le nom"><Wand2 /></Button>
                  </div>
                </Field>
                <Field label="Référence (SKU) *" error={errors.sku?.message}>
                  <Input {...register("sku")} className="uppercase" />
                </Field>
              </div>
              <Field label="Résumé" error={errors.shortDescription?.message} hint={`${(shortDescription ?? "").length}/300 — affiché près du prix`}>
                <Textarea rows={2} {...register("shortDescription")} />
              </Field>
              <Field label="Description détaillée" error={errors.description?.message}>
                <Textarea rows={8} {...register("description")} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Images</CardTitle><CardDescription>Stockées sur Cloudflare R2 et servies en AVIF/WebP optimisé.</CardDescription></CardHeader>
            <CardContent>
              <Controller control={control} name="images" render={({ field }) => <ImageManager value={field.value} onChange={field.onChange} onUploadingChange={setUploading} />} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div><CardTitle>Caractéristiques techniques</CardTitle><CardDescription>Affichées sous forme de tableau sur la fiche produit.</CardDescription></div>
              <Button type="button" variant="outline" size="sm" onClick={() => specs.append({ label: "", value: "" })}><Plus /> Ajouter</Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {specs.fields.length === 0 ? <p className="text-sm text-muted-foreground">Ex : Capacité — 9 kg, Classe énergétique — A+++, Couleur — Inox.</p> : null}
              {specs.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input {...register(`specs.${i}.label`)} placeholder="Caractéristique" className="w-2/5" aria-invalid={!!errors.specs?.[i]?.label} />
                  <Input {...register(`specs.${i}.value`)} placeholder="Valeur" className="flex-1" aria-invalid={!!errors.specs?.[i]?.value} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => specs.remove(i)} aria-label="Supprimer"><Trash2 /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div><CardTitle>Questions fréquentes</CardTitle><CardDescription>Propres à ce produit (s&apos;ajoutent aux questions de la boutique et de la catégorie). Réponses réelles uniquement.</CardDescription></div>
              <Button type="button" variant="outline" size="sm" onClick={() => faq.append({ question: "", answer: "", questionAr: "", answerAr: "" })} disabled={faq.fields.length >= 20}><Plus /> Ajouter</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {faq.fields.length === 0 ? <p className="text-sm text-muted-foreground">Aucune question propre à ce produit.</p> : null}
              {faq.fields.map((f, i) => (
                <div key={f.id} className="space-y-2 rounded-xl border p-3">
                  <div className="flex gap-2">
                    <Input {...register(`faq.${i}.question`)} placeholder="Question" aria-invalid={!!errors.faq?.[i]?.question} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => faq.remove(i)} aria-label="Supprimer la question"><Trash2 /></Button>
                  </div>
                  <Textarea rows={2} {...register(`faq.${i}.answer`)} placeholder="Réponse" aria-invalid={!!errors.faq?.[i]?.answer} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input dir="rtl" lang="ar" {...register(`faq.${i}.questionAr`)} placeholder="السؤال (اختياري)" />
                    <Input dir="rtl" lang="ar" {...register(`faq.${i}.answerAr`)} placeholder="الجواب (اختياري)" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Référencement (SEO)</CardTitle>
              <CardDescription>
                Laissez vide pour générer automatiquement.
                {productId ? <> H1, mots-clés, arabe, Open Graph, ALT, canonique et noindex : <Link href={`/admin/seo/edit/product/${productId}`} className="text-orange-strong hover:underline">SEO avancé</Link>.</> : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Titre SEO" error={errors.metaTitle?.message} hint={`${(metaTitle ?? "").length}/70`}><Input {...register("metaTitle")} placeholder={`${name || "Nom du produit"} — Prix Maroc`} /></Field>
              <Field label="Méta-description" error={errors.metaDescription?.message} hint={`${(metaDescription ?? "").length}/170`}><Textarea rows={3} {...register("metaDescription")} /></Field>
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs text-muted-foreground">Aperçu Google</p>
                <p className="mt-1 truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{metaTitle || `${name || "Nom du produit"} — Prix Maroc`} | Mega Electro</p>
                <p className="truncate text-xs text-[#006621] dark:text-[#bdc1c6]">mega-electro.ma › produit › {slug}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{metaDescription || shortDescription || "La description sera générée automatiquement à partir du résumé et du prix."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Controller control={control} name="status" render={({ field }) => (
                <Field label="Statut">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Actif — visible en boutique</SelectItem>
                      <SelectItem value="DRAFT">Brouillon — masqué</SelectItem>
                      <SelectItem value="ARCHIVED">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )} />
              <Controller control={control} name="isFeatured" render={({ field }) => (
                <label className="flex items-center justify-between gap-3 text-sm"><span>Mettre en avant sur l&apos;accueil</span><Switch checked={field.value} onCheckedChange={field.onChange} /></label>
              )} />
              {productId && initial.status === "ACTIVE" ? (
                <Link href={`/produit/${initial.slug}`} target="_blank" className="flex items-center gap-1.5 text-sm text-orange-strong hover:underline">Voir en boutique <ExternalLink className="size-3.5" /></Link>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Prix (DH)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Prix de vente TTC *" error={errors.price?.message}><Input type="number" step="0.01" min="0" inputMode="decimal" {...register("price")} /></Field>
              <Field label="Prix barré (avant promo)" error={errors.compareAtPrice?.message} hint="Laisser vide si pas de promotion"><Input type="number" step="0.01" min="0" inputMode="decimal" {...register("compareAtPrice", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })} /></Field>
              <Field label="Prix d'achat (interne)" error={errors.costPrice?.message} hint={margin != null ? `Marge : ${margin}%` : "Jamais affiché aux clients"}><Input type="number" step="0.01" min="0" inputMode="decimal" {...register("costPrice", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Stock</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Field label="Quantité" error={errors.stock?.message}><Input type="number" min="0" {...register("stock")} /></Field>
              <Field label="Seuil d'alerte" error={errors.lowStockThreshold?.message}><Input type="number" min="0" {...register("lowStockThreshold")} /></Field>
              <p className="col-span-2 text-xs text-muted-foreground">Toute modification est tracée dans l&apos;historique de stock.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Organisation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Controller control={control} name="categoryId" render={({ field }) => (
                <Field label="Catégorie">
                  <Select value={field.value || NONE} onValueChange={(v) => field.onChange(v === NONE ? null : v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value={NONE}>— Aucune —</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              )} />
              <Controller control={control} name="brandId" render={({ field }) => (
                <Field label="Marque">
                  <Select value={field.value || NONE} onValueChange={(v) => field.onChange(v === NONE ? null : v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value={NONE}>— Aucune —</SelectItem>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              )} />
              <Field label="Garantie (mois)" error={errors.warrantyMonths?.message}><Input type="number" min="0" {...register("warrantyMonths", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })} placeholder="24" /></Field>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur lg:start-64">
        <div className="flex items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {isDirty ? <span className="me-auto text-sm text-muted-foreground">Modifications non enregistrées</span> : null}
          <Button type="button" variant="outline" asChild><Link href="/admin/products">Annuler</Link></Button>
          <Button type="submit" disabled={pending || uploading} className="min-w-32">
            {pending || uploading ? <Loader2 className="animate-spin" /> : null} {uploading ? "Envoi des images…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
