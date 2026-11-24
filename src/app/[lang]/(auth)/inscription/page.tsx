import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { localizedMetadata } from "@/lib/seo-server";
import { getDictionary } from "@/i18n/server";

export async function generateMetadata() {
  return localizedMetadata({ title: (await getDictionary()).auth.signUp, path: "/inscription", noIndex: true });
}

export default function SignUpPage() {
  return <Suspense><AuthForm mode="sign-up" /></Suspense>;
}
