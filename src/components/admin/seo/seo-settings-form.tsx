"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleImageField } from "@/components/admin/image-manager";
import { BASE_ROBOTS_DISALLOW, SEO_LIMITS } from "@convex/lib/seoRules";
import { seoSettingsFormSchema, type SeoSettingsFormInput, type SeoSettingsFormValues } from "@/lib/validators/seo";
import { saveSeoSettings } from "@/server/actions/seo";

type Name = Path<SeoSettingsFormInput>;
const NONE = "__none__";

export function SeoSettingsForm({ initial, canEdit, envSiteUrl }: { initial: SeoSettingsFormInput; canEdit: boolean; envSiteUrl: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<SeoSettingsFormInput, unknown, SeoSettingsFormValues>({ resolver: zodResolver(seoSettingsFormSchema), defaultValues: initial });
  const { register, control, watch, formState: { errors, isDirty } } = form;
  const v = watch();

  const err = (name: Name) => name.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], errors) as { message?: string } | undefined;

  const text = (name: Name, label: string, opts: { hint?: string; placeholder?: string; rows?: number; counter?: [number, number]; dir?: "rtl" } = {}) => {
    const value = String(v[name as keyof SeoSettingsFormInput] ?? "");
    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor={name}>{label}</Label>
          {opts.counter ? <span className="font-mono text-xs tabular-nums text-muted-foreground">{value.length} / {opts.counter[0]}–{opts.counter[1]}</span> : null}
        </div>
        {opts.rows ? <Textarea id={name} rows={opts.rows} placeholder={opts.placeholder} {...register(name)} /> : <Input id={name} placeholder={opts.placeholder} {...register(name)} />}
        {err(name)?.message ? <p className="text-xs text-destructive">{err(name)?.message}</p> : opts.hint ? <p className="text-xs text-muted-foreground">{opts.hint}</p> : null}
      </div>
    );
  };
  const toggle = (name: Name, label: string, hint?: string) => (
    <Controller control={control} name={name} render={({ field }) => (
      <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
        <span><span className="font-medium">{label}</span>{hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}</span>
        <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} disabled={!canEdit} />
      </label>
    )} />
  );
  const image = (name: Name, label: string, hint?: string) => (
    <Controller control={control} name={name} render={({ field }) => (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <SingleImageField scope="seo" value={field.value as string | null} onChange={field.onChange} />
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    )} />
  );
  const num = (name: Name, label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type="number" min={0} {...register(name)} />
      {err(name)?.message ? <p className="text-xs text-destructive">{err(name)?.message}</p> : null}
    </div>
  );
  const select = (name: Name, label: string, options: { value: string; label: string }[]) => (
    <Controller control={control} name={name} render={({ field }) => (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <Select value={(field.value as string) || NONE} onValueChange={(val) => field.onChange(val === NONE ? "" : val)} disabled={!canEdit}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{options.map((o) => <SelectItem key={o.value || NONE} value={o.value || NONE}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    )} />
  );

  function onSubmit(values: SeoSettingsFormValues) {
    start(async () => {
      const res = await saveSeoSettings(values);
      if (!res.ok) {
        toast.error(res.error);
        if (res.fieldErrors) for (const [k, msg] of Object.entries(res.fieldErrors)) if (msg?.[0]) form.setError(k as Name, { message: msg[0] });
        return;
      }
      toast.success("Paramètres SEO enregistrés — le site est mis à jour.");
      form.reset(values as SeoSettingsFormInput);
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit, () => toast.error("Veuillez corriger les champs en rouge (vérifiez chaque onglet)."))} className="max-w-4xl pb-24">
      {!canEdit ? <p className="mb-4 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">Lecture seule : seuls les administrateurs peuvent modifier les paramètres SEO globaux.</p> : null}
      <fieldset disabled={!canEdit} className="contents">
        <Tabs defaultValue="global" className="gap-6">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="home">Page d&apos;accueil</TabsTrigger>
            <TabsTrigger value="social">Open Graph</TabsTrigger>
            <TabsTrigger value="org">Organisation</TabsTrigger>
            <TabsTrigger value="schema">Données structurées</TabsTrigger>
            <TabsTrigger value="technical">Technique</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Paramètres globaux</CardTitle><CardDescription>Valeurs par défaut utilisées quand une page n&apos;a pas de métadonnées personnalisées.</CardDescription></CardHeader>
              <CardContent className="grid gap-4">
                {text("siteName", "Nom du site", { hint: "Ajouté à la fin de chaque titre : « Titre | Nom du site »." })}
                {text("defaultTitle", "Titre SEO du site (par défaut)", { counter: [SEO_LIMITS.titleMin, SEO_LIMITS.titleMax] })}
                {text("defaultDescription", "Méta-description par défaut", { rows: 3, counter: [SEO_LIMITS.descMin, SEO_LIMITS.descMax] })}
                {text("defaultKeywords", "Mots-clés par défaut", { hint: "Séparés par des virgules." })}
                {text("canonicalBaseUrl", "URL canonique du site", { placeholder: envSiteUrl || "https://www.mega-electro.ma", hint: `Origine utilisée dans les URL canoniques, le sitemap et le JSON-LD. Vide = NEXT_PUBLIC_SITE_URL (${envSiteUrl || "non défini"}).` })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Directives robots par défaut</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                {toggle("robotsIndex", "Autoriser l'indexation du site (index)", "Désactiver met TOUT le site en noindex. À n'utiliser que sur un site de test.")}
                {toggle("robotsFollow", "Autoriser le suivi des liens (follow)")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="home" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>SEO de la page d&apos;accueil</CardTitle><CardDescription>Vide = valeurs globales / contenu actuel de la page.</CardDescription></CardHeader>
              <CardContent className="grid gap-4">
                {text("homeTitle", "Titre SEO de l'accueil", { counter: [SEO_LIMITS.titleMin, SEO_LIMITS.titleMax], hint: "Affiché tel quel (sans suffixe)." })}
                {text("homeDescription", "Méta-description de l'accueil", { rows: 3, counter: [SEO_LIMITS.descMin, SEO_LIMITS.descMax] })}
                {text("homeKeywords", "Mots-clés de l'accueil")}
                {text("homeH1", "Titre H1 de l'accueil", { placeholder: "L'électroménager qui rend la maison plus belle." })}
                {text("homeSeoHeading", "Titre du bloc texte SEO (bas de page)", { placeholder: "Mega Electro, votre spécialiste de l'électroménager au Maroc" })}
                {text("homeSeoText", "Texte SEO (bas de page)", { rows: 8, hint: "Paragraphes séparés par une ligne vide. Vide = texte actuel." })}
                {text("homeOgTitle", "Titre Open Graph de l'accueil")}
                {text("homeOgDescription", "Description Open Graph de l'accueil", { rows: 2 })}
                {image("homeOgImageKey", "Image Open Graph de l'accueil (1200×630)")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Open Graph & partage social</CardTitle><CardDescription>Utilisés quand une page n&apos;a pas sa propre image (pages d&apos;information, accueil…).</CardDescription></CardHeader>
              <CardContent className="grid gap-4">
                {text("ogTitle", "Titre Open Graph par défaut")}
                {text("ogDescription", "Description Open Graph par défaut", { rows: 2 })}
                {image("ogImageKey", "Image Open Graph par défaut (1200×630)", "Vide = visuel Mega Electro généré automatiquement.")}
                {image("socialImageKey", "Image de partage Twitter/X par défaut", "Vide = image Open Graph.")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="org" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Informations sur l&apos;organisation</CardTitle><CardDescription>Téléphone, e-mail, adresse et réseaux sociaux viennent de Paramètres → Boutique.</CardDescription></CardHeader>
              <CardContent className="grid gap-4">
                {select("orgType", "Type", [{ value: "Store", label: "Magasin (Store)" }, { value: "OnlineStore", label: "Boutique en ligne (OnlineStore)" }, { value: "Organization", label: "Organisation" }])}
                {text("orgLegalName", "Raison sociale")}
                {text("orgDescription", "Description de l'entreprise", { rows: 3 })}
                {image("orgLogoKey", "Logo (PNG/JPG carré, 112 px min.)", "Vide = icône SVG du site. Google recommande un logo matriciel.")}
                {text("orgSameAs", "Autres profils (une URL par ligne)", { rows: 3, hint: "Ex : page Google Business, LinkedIn, YouTube." })}
                {text("priceRange", "Gamme de prix", { placeholder: "$$" })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schema" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Types de données structurées</CardTitle><CardDescription>Avis et notes ne sont jamais émis tant qu&apos;il n&apos;existe pas de vrais avis clients.</CardDescription></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {toggle("sdOrganization", "Organization / Store")}
                {toggle("sdWebsite", "WebSite + recherche")}
                {toggle("sdBreadcrumbs", "BreadcrumbList")}
                {toggle("sdProduct", "Product + Offer")}
                {toggle("sdItemList", "ItemList (listes)")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Livraison (dans Offer)</CardTitle><CardDescription>Le tarif vient des frais de livraison de la boutique. Les délais doivent correspondre à la page « Livraison & retours » (24 à 72 h).</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">{toggle("sdShipping", "Déclarer les conditions de livraison")}</div>
                {num("shippingHandlingMin", "Préparation min. (jours)")}
                {num("shippingHandlingMax", "Préparation max. (jours)")}
                {num("shippingTransitMin", "Transport min. (jours)")}
                {num("shippingTransitMax", "Transport max. (jours)")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Politique de retour</CardTitle><CardDescription>Ne déclarez que ce qui figure réellement dans vos conditions. Laissez « Non précisé » tant que la page Livraison & retours ne l&apos;indique pas.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">{toggle("sdReturnPolicy", "Déclarer la politique de retour")}</div>
                {num("returnDays", "Délai de retour (jours)")}
                {select("returnFees", "Frais de retour", [{ value: "", label: "Non précisé" }, { value: "FreeReturn", label: "Retour gratuit" }, { value: "ReturnFeesCustomerResponsibility", label: "À la charge du client" }, { value: "ReturnShippingFees", label: "Frais de retour facturés" }])}
                {select("returnMethod", "Mode de retour", [{ value: "", label: "Non précisé" }, { value: "ReturnByMail", label: "Par transporteur / livreur" }, { value: "ReturnInStore", label: "En magasin" }, { value: "ReturnAtKiosk", label: "En point relais" }])}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>robots.txt</CardTitle><CardDescription>Règles toujours présentes : {BASE_ROBOTS_DISALLOW.join("  ")}</CardDescription></CardHeader>
              <CardContent className="grid gap-4">
                {text("robotsExtraDisallow", "Disallow supplémentaires (une règle par ligne)", { rows: 4, placeholder: "/suivi-commande", hint: "Les règles qui bloqueraient l'accueil, les produits, les catégories ou les marques sont refusées." })}
                {text("robotsExtraAllow", "Allow supplémentaires (une règle par ligne)", { rows: 2 })}
                <a href="/robots.txt" target="_blank" rel="noopener" className="text-sm text-primary hover:underline">Voir le robots.txt actuel</a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Sitemap XML</CardTitle><CardDescription>Index : /sitemap.xml → pages, catégories, produits, marques. Les pages en noindex ou avec une URL canonique externe sont exclues automatiquement.</CardDescription></CardHeader>
              <CardContent className="grid gap-3">
                {toggle("sitemapIncludeImages", "Inclure les images (sitemap d'images)")}
                {toggle("sitemapIncludeBrands", "Inclure les pages marques")}
                {toggle("sitemapIncludeStaticPages", "Inclure les pages d'information (CGV, contact…)")}
                <a href="/sitemap.xml" target="_blank" rel="noopener" className="text-sm text-primary hover:underline">Voir le sitemap actuel</a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Validation des outils webmaster</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                {text("googleVerification", "Google Search Console (google-site-verification)", { hint: "Uniquement la valeur content=\"…\" de la balise HTML." })}
                {text("bingVerification", "Bing Webmaster Tools (msvalidate.01)")}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </fieldset>

      {canEdit ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur lg:start-64">
          <div className="flex items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
            {isDirty ? <span className="me-auto text-sm text-muted-foreground">Modifications non enregistrées</span> : null}
            <Button type="submit" disabled={pending} className="min-w-32">{pending ? <Loader2 className="animate-spin" /> : null} Enregistrer</Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
