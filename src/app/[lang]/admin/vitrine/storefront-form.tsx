"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SingleImageField } from "@/components/admin/image-manager";
import { HOME_SECTIONS, campaignStatus, contrast, isHex } from "@/lib/storefront";
import type { BannerInput, CollectionInput, StorefrontInput } from "@/lib/validators/storefront";
import { saveStorefront } from "@/server/actions/storefront";
import { cn } from "@/lib/utils";

type State = {
  banners: (BannerInput & { startsAt: number | null; endsAt: number | null })[];
  collections: (CollectionInput & { startsAt: number | null; endsAt: number | null })[];
  sections: { key: string; visible: boolean }[];
  theme: { accent: string; navy: string };
};

const newId = () => Math.random().toString(36).slice(2, 10);
const LABELS = Object.fromEntries(HOME_SECTIONS.map((s) => [s.key, s.label]));

/** epoch ms ⇄ <input type="datetime-local"> value, in the admin's own time zone. */
function toLocalInput(ms: number | null | undefined) {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const fromLocalInput = (v: string) => (v ? new Date(v).getTime() : null);

function Field({ label, children, hint, className }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Schedule({ startsAt, endsAt, onChange }: { startsAt: number | null; endsAt: number | null; onChange: (v: { startsAt: number | null; endsAt: number | null }) => void }) {
  const status = campaignStatus({ startsAt, endsAt });
  const live = status === "live";
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <Field label="Début de campagne (facultatif)">
        <Input type="datetime-local" value={toLocalInput(startsAt)} onChange={(e) => onChange({ startsAt: fromLocalInput(e.target.value), endsAt })} />
      </Field>
      <Field label="Fin de campagne (facultatif)">
        <Input type="datetime-local" value={toLocalInput(endsAt)} onChange={(e) => onChange({ startsAt, endsAt: fromLocalInput(e.target.value) })} />
      </Field>
      <span className={cn("mb-2 inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium", live ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground")}>
        {live ? "En ligne" : status === "scheduled" ? "Programmée" : "Terminée"}
      </span>
    </div>
  );
}

function move<T>(list: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function StorefrontForm({ initial, disabled }: { initial: State; disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [s, setS] = useState<State>(initial);
  const patchBanner = (i: number, v: Partial<State["banners"][number]>) => setS((p) => ({ ...p, banners: p.banners.map((b, k) => (k === i ? { ...b, ...v } : b)) }));
  const patchCollection = (i: number, v: Partial<State["collections"][number]>) => setS((p) => ({ ...p, collections: p.collections.map((c, k) => (k === i ? { ...c, ...v } : c)) }));

  function save() {
    start(async () => {
      const res = await saveStorefront(s as StorefrontInput);
      if (res.ok) {
        toast.success("Vitrine enregistrée");
        router.refresh();
      } else {
        const first = res.fieldErrors ? Object.entries(res.fieldErrors).find(([, v]) => v?.length) : null;
        toast.error(first ? `${res.error} (${first[0]} : ${first[1]?.[0]})` : res.error);
      }
    });
  }

  const accentOk = !s.theme.accent || isHex(s.theme.accent);
  const navyOk = !s.theme.navy || isHex(s.theme.navy);
  const accent = isHex(s.theme.accent) ? s.theme.accent : "#f97316";
  const navy = isHex(s.theme.navy) ? s.theme.navy : "#0f172a";
  const buttonContrast = contrast(accent, navy);
  const navyContrast = contrast(navy, "#ffffff");

  return (
    <div className="max-w-4xl space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Sections de la page d&apos;accueil</CardTitle>
          <CardDescription>Ordre d&apos;affichage et visibilité. Une section sans contenu (par ex. aucune vente enregistrée) ne s&apos;affiche pas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="divide-y rounded-lg border">
            {s.sections.map((sec, i) => (
              <li key={sec.key} className="flex items-center gap-3 px-3 py-2">
                <span className="w-6 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                <span className={cn("flex-1 text-sm", !sec.visible && "text-muted-foreground line-through")}>{LABELS[sec.key] ?? sec.key}</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Monter" disabled={i === 0} onClick={() => setS((p) => ({ ...p, sections: move(p.sections, i, -1) }))}><ArrowUp /></Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Descendre" disabled={i === s.sections.length - 1} onClick={() => setS((p) => ({ ...p, sections: move(p.sections, i, 1) }))}><ArrowDown /></Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={sec.visible ? "Masquer" : "Afficher"}
                  aria-pressed={sec.visible}
                  onClick={() => setS((p) => ({ ...p, sections: p.sections.map((x, k) => (k === i ? { ...x, visible: !x.visible } : x)) }))}
                >
                  {sec.visible ? <Eye /> : <EyeOff />}
                </Button>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bannières</CardTitle>
          <CardDescription>
            « Principale » remplace le visuel du haut de page (la première bannière principale en ligne avec une image est utilisée). « Promotionnelle » s&apos;affiche en tuile (3 au maximum).
            Le titre H1 de la page reste celui défini dans SEO.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {s.banners.map((b, i) => (
            <fieldset key={b.id} className="space-y-4 rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <legend className="me-auto text-sm font-semibold">{b.title || "Nouvelle bannière"}</legend>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={b.isActive} onCheckedChange={(v) => patchBanner(i, { isActive: v })} /> Active
                </label>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Monter" disabled={i === 0} onClick={() => setS((p) => ({ ...p, banners: move(p.banners, i, -1) }))}><ArrowUp /></Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Descendre" disabled={i === s.banners.length - 1} onClick={() => setS((p) => ({ ...p, banners: move(p.banners, i, 1) }))}><ArrowDown /></Button>
                <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" aria-label="Supprimer la bannière" onClick={() => setS((p) => ({ ...p, banners: p.banners.filter((_, k) => k !== i) }))}><Trash2 /></Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Emplacement">
                  <select value={b.placement} onChange={(e) => patchBanner(i, { placement: e.target.value as "hero" | "promo" })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="hero">Principale (haut de page)</option>
                    <option value="promo">Promotionnelle (tuile)</option>
                  </select>
                </Field>
                <Field label="Lien" hint="Chemin du site (/promotions, /categorie/lavage) ou https://…">
                  <Input value={b.href} onChange={(e) => patchBanner(i, { href: e.target.value })} placeholder="/promotions" />
                </Field>
                <Field label="Titre (français)"><Input value={b.title} onChange={(e) => patchBanner(i, { title: e.target.value })} maxLength={90} /></Field>
                <Field label="Titre (arabe)"><Input dir="rtl" value={b.titleAr ?? ""} onChange={(e) => patchBanner(i, { titleAr: e.target.value })} maxLength={90} /></Field>
                <Field label="Texte (français)"><Textarea rows={2} value={b.subtitle ?? ""} onChange={(e) => patchBanner(i, { subtitle: e.target.value })} maxLength={180} /></Field>
                <Field label="Texte (arabe)"><Textarea dir="rtl" rows={2} value={b.subtitleAr ?? ""} onChange={(e) => patchBanner(i, { subtitleAr: e.target.value })} maxLength={180} /></Field>
                <Field label="Bouton (français)"><Input value={b.ctaLabel ?? ""} onChange={(e) => patchBanner(i, { ctaLabel: e.target.value })} maxLength={40} placeholder="Voir l'offre" /></Field>
                <Field label="Bouton (arabe)"><Input dir="rtl" value={b.ctaLabelAr ?? ""} onChange={(e) => patchBanner(i, { ctaLabelAr: e.target.value })} maxLength={40} /></Field>
              </div>
              <Field label="Image" hint="Principale : format paysage 16/10, au moins 1600 px de large. Tuile : image produit ou d'ambiance.">
                <SingleImageField value={b.imageKey} onChange={(key) => patchBanner(i, { imageKey: key ?? undefined })} scope="banners" />
              </Field>
              <Schedule startsAt={b.startsAt} endsAt={b.endsAt} onChange={(v) => patchBanner(i, v)} />
            </fieldset>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={s.banners.length >= 20}
            onClick={() => setS((p) => ({ ...p, banners: [...p.banners, { id: newId(), placement: "promo", title: "", href: "/promotions", isActive: true, startsAt: null, endsAt: null }] }))}
          >
            <Plus /> Ajouter une bannière
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collections saisonnières</CardTitle>
          <CardDescription>Sélection de produits par référence (SKU), une par ligne. Seuls les produits actifs s&apos;affichent, avec leurs prix et stock réels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {s.collections.map((c, i) => (
            <fieldset key={c.id} className="space-y-4 rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <legend className="me-auto text-sm font-semibold">{c.title || "Nouvelle collection"}</legend>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={c.isActive} onCheckedChange={(v) => patchCollection(i, { isActive: v })} /> Active
                </label>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Monter" disabled={i === 0} onClick={() => setS((p) => ({ ...p, collections: move(p.collections, i, -1) }))}><ArrowUp /></Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Descendre" disabled={i === s.collections.length - 1} onClick={() => setS((p) => ({ ...p, collections: move(p.collections, i, 1) }))}><ArrowDown /></Button>
                <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" aria-label="Supprimer la collection" onClick={() => setS((p) => ({ ...p, collections: p.collections.filter((_, k) => k !== i) }))}><Trash2 /></Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Titre (français)"><Input value={c.title} onChange={(e) => patchCollection(i, { title: e.target.value })} maxLength={90} placeholder="Spécial été : climatisation" /></Field>
                <Field label="Titre (arabe)"><Input dir="rtl" value={c.titleAr ?? ""} onChange={(e) => patchCollection(i, { titleAr: e.target.value })} maxLength={90} /></Field>
                <Field label="Description (français)"><Textarea rows={2} value={c.description ?? ""} onChange={(e) => patchCollection(i, { description: e.target.value })} maxLength={240} /></Field>
                <Field label="Description (arabe)"><Textarea dir="rtl" rows={2} value={c.descriptionAr ?? ""} onChange={(e) => patchCollection(i, { descriptionAr: e.target.value })} maxLength={240} /></Field>
              </div>
              <Field label={`Références produits (${c.skus.length}/24)`}>
                <Textarea
                  rows={4}
                  dir="ltr"
                  className="font-mono text-xs"
                  defaultValue={c.skus.join("\n")}
                  onBlur={(e) => patchCollection(i, { skus: [...new Set(e.target.value.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean))].slice(0, 24) })}
                />
              </Field>
              <Schedule startsAt={c.startsAt} endsAt={c.endsAt} onChange={(v) => patchCollection(i, v)} />
            </fieldset>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={s.collections.length >= 12}
            onClick={() => setS((p) => ({ ...p, collections: [...p.collections, { id: newId(), title: "", skus: [], isActive: true, startsAt: null, endsAt: null }] }))}
          >
            <Plus /> Ajouter une collection
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Couleurs de la marque</CardTitle>
          <CardDescription>Laisser vide pour garder les couleurs Mega Electro (orange #F97316, bleu nuit #0F172A).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(["accent", "navy"] as const).map((k) => (
              <Field key={k} label={k === "accent" ? "Couleur d'action (boutons, promotions)" : "Couleur principale (en-tête, pied de page, textes)"}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isHex(s.theme[k]) ? s.theme[k] : k === "accent" ? "#f97316" : "#0f172a"}
                    onChange={(e) => setS((p) => ({ ...p, theme: { ...p.theme, [k]: e.target.value } }))}
                    className="size-9 shrink-0 cursor-pointer rounded-md border"
                    aria-label="Choisir la couleur"
                  />
                  <Input value={s.theme[k]} onChange={(e) => setS((p) => ({ ...p, theme: { ...p.theme, [k]: e.target.value } }))} placeholder={k === "accent" ? "#f97316" : "#0f172a"} dir="ltr" className="font-mono" aria-invalid={k === "accent" ? !accentOk : !navyOk} />
                  {s.theme[k] ? <Button type="button" variant="ghost" size="sm" onClick={() => setS((p) => ({ ...p, theme: { ...p.theme, [k]: "" } }))}>Défaut</Button> : null}
                </div>
              </Field>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-bold" style={{ background: accent, color: navy }}>Ajouter au panier</span>
            <span className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold text-white" style={{ background: navy }}>En-tête</span>
            <p className={cn("text-xs", buttonContrast < 4.5 || navyContrast < 4.5 ? "font-medium text-destructive" : "text-muted-foreground")}>
              Contraste bouton {buttonContrast.toFixed(1)}:1, texte blanc sur fond {navyContrast.toFixed(1)}:1
              {buttonContrast < 4.5 || navyContrast < 4.5 ? " : insuffisant (4,5:1 minimum), le texte sera difficile à lire." : " : lisible."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur lg:ps-64">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-3 px-4 py-3">
          {disabled ? <p className="me-auto text-xs text-muted-foreground">Enregistrement disponible après le déploiement du backend.</p> : null}
          <Button type="button" onClick={save} disabled={pending || disabled || !accentOk || !navyOk} className="h-11 px-6 font-bold">
            {pending ? <Loader2 className="animate-spin" /> : null} Enregistrer la vitrine
          </Button>
        </div>
      </div>
    </div>
  );
}
