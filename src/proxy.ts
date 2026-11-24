import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { splitLocale } from "@/i18n/config";

type Rule = { to: string; statusCode: number };

// Redirects managed in Admin → SEO → Redirections. Cached per server instance and refreshed
// every minute; if Convex is unreachable the request simply continues (fail-open).
const TTL_MS = 60_000;
let cache: { at: number; rules: Map<string, Rule> } | null = null;
let inflight: Promise<Map<string, Rule>> | null = null;

async function loadRedirects(): Promise<Map<string, Rule>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rules;
  if (!inflight) {
    inflight = (async () => {
      try {
        const url = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!url) return new Map();
        const list = await new ConvexHttpClient(url).query(api.seo.redirectMap, {});
        const rules = new Map(list.map((r) => [r.from, { to: r.to, statusCode: r.statusCode }]));
        cache = { at: Date.now(), rules };
        return rules;
      } catch {
        return cache?.rules ?? new Map();
      } finally {
        inflight = null;
      }
    })();
  }
  return inflight;
}

const PROTECTED = /^\/(admin|compte)(\/|$)/;

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const { locale, path } = splitLocale(pathname);

  // /fr/... is never public: French URLs are unprefixed (one URL per page).
  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    const url = req.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url, 308);
  }

  // Optimistic auth gate only: real authorization (roles) is enforced server-side.
  if (PROTECTED.test(path) && !getSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = locale === "ar" ? "/ar/connexion" : "/connexion";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  // The back office is French only.
  if (locale === "ar" && /^\/admin(\/|$)/.test(path)) {
    const url = req.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  }

  if (req.method === "GET" || req.method === "HEAD") {
    const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    const rules = await loadRedirects();
    let decoded = clean;
    try {
      decoded = decodeURIComponent(clean);
    } catch {}
    const rule = rules.get(clean) ?? rules.get(decoded);
    if (rule) {
      const target = /^https?:\/\//i.test(rule.to) ? new URL(rule.to) : new URL(rule.to, req.nextUrl.origin);
      // Keep the query string (tracking parameters, pagination) unless the target defines its own.
      if (!target.search && search) target.search = search;
      return NextResponse.redirect(target, rule.statusCode === 302 ? 302 : 301);
    }
  }

  // French pages live under app/[lang] with lang = "fr": rewrite internally, keep the public URL.
  if (locale === "fr") {
    const url = req.nextUrl.clone();
    url.pathname = `/fr${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals, API routes, metadata files and static assets.
  matcher: ["/((?!_next/|api/|og$|sitemap|robots\\.txt|manifest\\.webmanifest|icon\\.svg|favicon\\.ico|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|map|txt|xml|woff2?)$).*)"],
};
