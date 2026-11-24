import "server-only";
import { unstable_cache } from "next/cache";
import { api } from "@convex/_generated/api";
import { publicQuery } from "@/lib/convex";
import { TAGS } from "@/server/cache";

// Saving in Admin → Paramètres refreshes this immediately (tag "settings");
// changes made directly in Convex show up within 5 minutes.
export const getSettings = unstable_cache(() => publicQuery(api.catalog.settings, {}), ["store-settings-v2"], { tags: [TAGS.settings], revalidate: 300 });

export type StoreSettingsData = Awaited<ReturnType<typeof getSettings>>;
