"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SingleImageField } from "@/components/admin/image-manager";
import { CATEGORY_ICONS, CategoryIcon } from "@/components/shared/category-icon";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/validators/catalog";
import { deleteCategory, saveCategory } from "@/server/actions/taxonomy";
import { slugify } from "@/lib/utils";

const NONE = "__none__";
const EMPTY: CategoryFormInput = { name: "", nameAr: "", slug: "", description: "", parentId: null, icon: "", position: 0, isActive: true, imageKey: null, metaTitle: "", metaDescription: "" };

export function CategoryDialog({ id, initial, parents }: { id?: string; initial?: CategoryFormInput; parents: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const form = useForm<CategoryFormInput>({ resolver: zodResolver(categoryFormSchema) as never, defaultValues: initial ?? EMPTY });
  const { register, control, setValue, formState: { errors } } = form;

  const submit = form.handleSubmit((values) =>
    start(async () => {
      const res = await saveCategory(id ?? null, values);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Catégorie enregistrée");
      setOpen(false);
      if (!id) form.reset(EMPTY);
      router.refresh();
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {id ? <Button variant="ghost" size="icon-sm" aria-label="Modifier"><Pencil /></Button> : <Button><Plus /> Nouvelle catégorie</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{id ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          <DialogDescription className="sr-only">Formulaire de catégorie</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nom *</Label>
              <Input {...register("name", { onChange: (e) => !id && setValue("slug", slugify(e.target.value)) })} />
              {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input {...register("slug")} />
              {errors.slug ? <p className="text-xs text-destructive">{errors.slug.message}</p> : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Nom en arabe</Label>
            <Input dir="rtl" lang="ar" placeholder="ثلاجات" {...register("nameAr")} />
            <p className="text-xs text-muted-foreground">Affiché sur le site arabe (menus, page catégorie). Vide = nom français.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Controller control={control} name="parentId" render={({ field }) => (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Catégorie parente</Label>
                <Select value={field.value || NONE} onValueChange={(v) => field.onChange(v === NONE ? null : v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={NONE}>— Aucune (niveau principal) —</SelectItem>{parents.filter((p) => p.id !== id).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )} />
            <div className="space-y-1.5"><Label>Ordre</Label><Input type="number" min={0} {...register("position")} /></div>
          </div>
          <Controller control={control} name="icon" render={({ field }) => (
            <div className="space-y-1.5">
              <Label>Icône</Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(CATEGORY_ICONS).map((name) => (
                  <button key={name} type="button" onClick={() => field.onChange(name)} aria-label={name} aria-pressed={field.value === name} className={`flex size-9 items-center justify-center rounded-lg border ${field.value === name ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                    <CategoryIcon name={name} className="size-4.5" />
                  </button>
                ))}
              </div>
            </div>
          )} />
          <Controller control={control} name="imageKey" render={({ field }) => (
            <div className="space-y-1.5"><Label>Image</Label><SingleImageField scope="categories" value={field.value} onChange={field.onChange} /></div>
          )} />
          <div className="space-y-1.5"><Label>Description (affichée en haut de page, bon pour le SEO)</Label><Textarea rows={3} {...register("description")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Titre SEO</Label><Input {...register("metaTitle")} /></div>
            <div className="space-y-1.5"><Label>Méta-description</Label><Input {...register("metaDescription")} /></div>
          </div>
          <Controller control={control} name="isActive" render={({ field }) => (
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">Visible en boutique <Switch checked={field.value} onCheckedChange={field.onChange} /></label>
          )} />
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteTaxonomyButton({ id, kind }: { id: string; kind: "category" | "brand" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      aria-label="Supprimer"
      onClick={() => {
        if (!confirm("Supprimer définitivement ?")) return;
        start(async () => {
          const { deleteBrand } = await import("@/server/actions/taxonomy");
          const res = kind === "category" ? await deleteCategory(id) : await deleteBrand(id);
          if (res.ok) {
            toast.success("Supprimé");
            router.refresh();
          } else toast.error(res.error);
        });
      }}
    >
      <Trash2 className="text-destructive" />
    </Button>
  );
}
