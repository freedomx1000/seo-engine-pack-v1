import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.SUPABASE_URL!,
  import.meta.env.SUPABASE_ANON_KEY!
);

export const GET: APIRoute = async ({ url }) => {
  const origin = url.origin;

  const staticUrls = [
    `${origin}/`,
    `${origin}/blog`,
  ];

  const { data: posts, error } = await supabase
    .from("posts")
    .select("slug, updated_at, published_at")
    .eq("status", "published");

  if (error) {
    // Si Supabase falla, al menos devuelve estáticas (no romper indexación)
    const xml = buildSitemap(staticUrls);
    return new Response(xml, { headers: { "Content-Type": "application/xml" } });
  }

  const postUrls = (posts ?? [])
    .filter(p => p?.slug)
    .map(p => `${origin}/blog/${p.slug}`);

  const xml = buildSitemap([...staticUrls, ...postUrls]);

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};

function buildSitemap(urls: string[]) {
  const body = urls
    .map((loc) => `<url><loc>${escapeXml(loc)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

function escapeXml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
