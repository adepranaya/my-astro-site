import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import robotsTxt from 'astro-robots-txt';
import partytown from '@astrojs/partytown';

// import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
  vite: {
    ssr: {
      external: ['svgo'],
    },
  },
  site: 'https://adepranaya.com',

  experimental: {
    integrations: true,
  },
  integrations: [
    vue(),
    tailwind(),
    mdx(),
    robotsTxt(),
    partytown({
      config: { debug: false },
      // Adds dataLayer.push as a forwarding-event.
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  // output: "server",
  // adapter: netlify()
});
