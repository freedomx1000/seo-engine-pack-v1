import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://seo-engine-pack-v1-q5wd.vercel.app",
  integrations: [sitemap()],
});

