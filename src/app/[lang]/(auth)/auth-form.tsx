"use client";

import { useState } from "react";
import { Link, useI18n, useLocalePath } from "@/i18n/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";

type Values = { name?: string; email: string; password: string };

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { t } = useI18n();
  const lp = useLocalePath();
  const signInSchema = z.object({ email: z.email(t.auth.errEmail), password: z.string().min(1, t.auth.errPassword) });
  const signUpSchema = signInSchema.extend({ name: z.string().trim().min(2, t.auth.errName), password: z.string().min(8, t.auth.errPasswordLength) });
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(mode === "sign-in" ? signInSchema : signUpSchema) as never,
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: Values) {
    setError(null);
    const res =
      mode === "sign-in"
        ? await signIn.email({ email: values.email, password: values.password })
        : await signUp.email({ name: values.name!, email: values.email, password: values.password });
    if (res.error) {
      setError(
        res.error.status === 401 || res.error.code === "INVALID_EMAIL_OR_PASSWORD"
          ? t.auth.errCredentials
          : res.error.code === "USER_ALREADY_EXISTS"
            ? t.auth.errExists
            : t.auth.errGeneric,
      );
      return;
    }
    const role = (res.data?.user as { role?: string } | undefined)?.role;
    router.push(next ?? (role === "ADMIN" || role === "STAFF" ? "/admin" : lp("/compte")));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold">{mode === "sign-in" ? t.auth.signIn : t.auth.signUp}</h1>
        <p className="text-sm text-muted-foreground">
          {mode === "sign-in" ? t.auth.signInIntro : t.auth.signUpIntro}
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {mode === "sign-up" ? (
          <div className="space-y-1.5">
            <Label htmlFor="name">{t.auth.name}</Label>
            <Input id="name" autoComplete="name" className="h-11" {...form.register("name")} />
            {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input id="email" type="email" dir="ltr" autoComplete="email" className="h-11 rtl:text-right" {...form.register("email")} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input id="password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="h-11" {...form.register("password")} />
          {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
        </div>
        {error ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl">
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {mode === "sign-in" ? t.auth.submitSignIn : t.auth.submitSignUp}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? (
          <>{t.auth.noAccount} <Link href={`/inscription${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-orange-strong hover:underline">{t.auth.signUp}</Link></>
        ) : (
          <>{t.auth.haveAccount} <Link href={`/connexion${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-orange-strong hover:underline">{t.auth.submitSignIn}</Link></>
        )}
      </p>
      <p className="text-center text-xs text-muted-foreground"><Link href="/" className="hover:underline">{t.auth.back}</Link></p>
    </div>
  );
}
