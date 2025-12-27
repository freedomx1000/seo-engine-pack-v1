import { createClient } from "@supabase/supabase-js";
import { resolveTenant } from "../lib/tenant";

export const prerender = false;

const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY;

function getBaseUrl(request: Request) {
  const xfProto = request.headers.get("x-forwarded-proto") || "https";
  const xfHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const host = xfHost.split(":")[0];
  return `${xfProto}://${host}`;
}

export async function GET({ request }: { request: Request }) {
  const tenant = await resolveTenant(request);
  const base = getBaseUrl(request);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, published_at, created_at")
    .eq("org_id", tenant.org_id)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(5000);

  const urls = [
    { loc: `${base}/`, lastmod: new Date().toISOString() },
    { loc: `${base}/blog`, lastmod: new Date().toISOString() },
    ...(posts ?? []).map((p) => ({
      loc: `${base}/blog/${p.slug}`,
      lastmod: new Date(p.published_at ?? p.created_at ?? Date.now()).toISOString(),
    })),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map(
        (u) =>
          `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`
      )
      .join("") +
    `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
