import { defineConfig } from 'astro/config';
import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";

import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'dracula'
    }
  },
  vite: {
    ssr: {
      external: ["svgo"]
    }
  },
  integrations: [vue(), tailwind(), mdx()],
  output: "server",
  adapter: netlify()
});