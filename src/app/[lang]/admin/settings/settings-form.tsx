"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsSchema, type SettingsInput } from "@/lib/validators/orders";
import { saveSettings } from "@/server/actions/admin";

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema) as never, defaultValues: initial });
  const { register, formState: { errors } } = form;
  const f = (name: keyof SettingsInput, label: string, props: React.ComponentProps<typeof Input> = {}, hint?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} {...props} {...register(name)} />
      {errors[name] ? <p className="text-xs text-destructive">{errors[name]?.message as string}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
  return (
    <form
      className="max-w-3xl space-y-6"
      onSubmit={form.handleSubmit((values) =>
        start(async () => {
          const res = await saveSettings(values);
          if (res.ok) {
            toast.success("Paramètres enregistrés");
            router.refresh();
          } else toast.error(res.error);
        }),
      )}
    >
      <Card>
        <CardHeader><CardTitle>Boutique</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {f("storeName", "Nom de la boutique")}
          {f("tagline", "Slogan")}
          <div className="sm:col-span-2">{f("announcement", "Bandeau d'annonce", {}, "Affiché tout en haut du site. Laisser vide pour masquer.")}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Livraison</CardTitle><CardDescription>Montants en dirhams.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {f("shippingFee", "Frais de livraison (DH)", { type: "number", step: "0.01", min: 0 })}
          {f("freeShippingThreshold", "Livraison gratuite à partir de (DH)", { type: "number", step: "0.01", min: 0 })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {f("phone", "Téléphone affiché")}
          {f("whatsapp", "WhatsApp (format international sans +)", {}, "Ex : 212600000000")}
          {f("email", "Email", { type: "email" })}
          {f("address", "Adresse")}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Réseaux sociaux</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {f("facebookUrl", "Facebook")}
          {f("instagramUrl", "Instagram")}
          {f("tiktokUrl", "TikTok")}
        </CardContent>
      </Card>
      <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} Enregistrer</Button>
    </form>
  );
}
