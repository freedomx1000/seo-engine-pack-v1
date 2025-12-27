export const prerender = false;

export async function GET({ request }: { request: Request }) {
  const xfProto = request.headers.get("x-forwarded-proto") || "https";
  const xfHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const host = xfHost.split(":")[0];
  const base = `${xfProto}://${host}`;

  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
