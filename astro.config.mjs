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
  integrations: [
    vue(),
    tailwind(),
    mdx(),
    robotsTxt(),
    partytown({
      // Adds dataLayer.push as a forwarding-event.
      config: {
        debug: true,
        forward: [
          ['dataLayer.push', { preserveBehavior: true }],
          // ['fbq', { preserveBehavior: false }],
          'gtm.push',
        ],
      },
    }),
  ],
  // output: "server",
  // adapter: netlify()
});
