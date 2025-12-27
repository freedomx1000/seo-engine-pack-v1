import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "hybrid",
  adapter: vercel(),
  site: "https://seo-engine-pack-v1-q5wd.vercel.app",
});
