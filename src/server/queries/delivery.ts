import "server-only";
import { unstable_cache } from "next/cache";
import { api } from "@convex/_generated/api";
import { publicQuery } from "@/lib/convex";
import { TAGS } from "@/server/cache";

// Delivery zones + payment switches. Saving zones/payment in Admin refreshes the "settings" tag.
export const getDeliveryConfig = unstable_cache(() => publicQuery(api.delivery.config, {}), ["delivery-config", "v1"], { tags: [TAGS.settings], revalidate: 300 });
export type DeliveryConfigData = Awaited<ReturnType<typeof getDeliveryConfig>>;
