import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

export const authComponent = createClient<DataModel, typeof schema>(components.betterAuth, {
  local: { schema },
  verbose: false,
});

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    appName: "Mega Electro",
    baseURL: process.env.SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
      process.env.SITE_URL!,
      "http://localhost:3000",
      ...(process.env.EXTRA_TRUSTED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
    ],
    database: authComponent.adapter(ctx),
    emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
    user: {
      additionalFields: {
        // input: false → can never be set by the client during sign-up
        role: { type: "string", required: false, defaultValue: "CUSTOMER", input: false },
        phone: { type: "string", required: false },
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, window: 60, max: 30 },
    plugins: [convex({ authConfig })],
  }) satisfies BetterAuthOptions;

// For the `auth` CLI
export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));
