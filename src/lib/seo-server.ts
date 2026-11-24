import "server-only";
import { getLocale } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";

/** buildMetadata for the current route's language (read from the [lang] root segment). */
export async function localizedMetadata(args: Omit<Parameters<typeof buildMetadata>[0], "locale">) {
  return buildMetadata({ ...args, locale: await getLocale() });
}
