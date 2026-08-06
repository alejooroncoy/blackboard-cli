// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://campuscli.com",
  // The live URLs all end in a slash and are already indexed. Anything else
  // here would silently change every canonical on the site.
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [sitemap()],
});
