"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SingleImageField } from "@/components/admin/image-manager";
import { brandFormSchema, type BrandFormInput } from "@/lib/validators/catalog";
import { saveBrand } from "@/server/actions/taxonomy";
import { slugify } from "@/lib/utils";

const EMPTY: BrandFormInput = { name: "", slug: "", description: "", isActive: true, logoKey: null, metaTitle: "", metaDescription: "" };

export function BrandDialog({ id, initial }: { id?: string; initial?: BrandFormInput }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const form = useForm<BrandFormInput>({ resolver: zodResolver(brandFormSchema) as never, defaultValues: initial ?? EMPTY });
  const { register, control, setValue, formState: { errors } } = form;
  const submit = form.handleSubmit((values) =>
    start(async () => {
      const res = await saveBrand(id ?? null, values);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Marque enregistrée");
      setOpen(false);
      if (!id) form.reset(EMPTY);
      router.refresh();
    }),
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{id ? <Button variant="ghost" size="icon-sm" aria-label="Modifier"><Pencil /></Button> : <Button><Plus /> Nouvelle marque</Button>}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>{id ? "Modifier la marque" : "Nouvelle marque"}</DialogTitle><DialogDescription className="sr-only">Formulaire de marque</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Nom *</Label><Input {...register("name", { onChange: (e) => !id && setValue("slug", slugify(e.target.value)) })} />{errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}</div>
            <div className="space-y-1.5"><Label>Slug *</Label><Input {...register("slug")} />{errors.slug ? <p className="text-xs text-destructive">{errors.slug.message}</p> : null}</div>
          </div>
          <Controller control={control} name="logoKey" render={({ field }) => <div className="space-y-1.5"><Label>Logo</Label><SingleImageField scope="brands" value={field.value} onChange={field.onChange} /></div>} />
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} {...register("description")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Titre SEO</Label><Input {...register("metaTitle")} /></div>
            <div className="space-y-1.5"><Label>Méta-description</Label><Input {...register("metaDescription")} /></div>
          </div>
          <Controller control={control} name="isActive" render={({ field }) => <label className="flex items-center justify-between rounded-lg border p-3 text-sm">Visible en boutique <Switch checked={field.value} onCheckedChange={field.onChange} /></label>} />
          <DialogFooter><Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} Enregistrer</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
