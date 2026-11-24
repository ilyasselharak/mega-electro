"use client";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    inferAdditionalFields({
      user: { role: { type: "string", input: false }, phone: { type: "string", required: false } },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
