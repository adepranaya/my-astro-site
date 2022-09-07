import { c as createMetadata, $ as $$module1, a as $$module2, b as $$module3, d as createAstro, e as createComponent, r as renderTemplate, f as renderComponent, g as $$HeadLayout, m as maybeRenderHead, h as $$Navbar, i as renderSlot, _ as _sfc_main } from '../entry.mjs';
import 'html-escaper';
import '@astrojs/netlify/netlify-functions.js';
import 'vue';
import 'vue/server-renderer';
/* empty css                                                                        */import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import 'path-to-regexp';

const $$metadata = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/layouts/MDXLayout.astro", { modules: [{ module: $$module1, specifier: "../components/Footer.vue", assert: {} }, { module: $$module2, specifier: "../components/Navbar.astro", assert: {} }, { module: $$module3, specifier: "../components/base/HeadLayout.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/layouts/MDXLayout.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$MDXLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$MDXLayout;
  const { frontmatter } = Astro2.props;
  return renderTemplate`<html class="scroll-smooth" lang="en">
  ${renderComponent($$result, "HeadLayout", $$HeadLayout, {})}
  ${maybeRenderHead($$result)}<body>
    <div class="flex flex-col min-h-screen">
      <div>
        ${renderComponent($$result, "Navbar", $$Navbar, {})}
      </div>
      <div class="mb-auto">
        <article class="mx-6 lg:mx-auto lg:max-w-6xl py-6">
          <h1 class="text-5xl font-bold text-primary mb-1">${frontmatter.title}</h1>
          <h2 class="text-gray-500 mb-4">${frontmatter.created_at}</h2>
          ${renderSlot($$result, $$slots["default"])}
          <!-- your content is injected here -->
        </article>
      </div>
      <div>
        ${renderComponent($$result, "Footer", _sfc_main, {})}
      </div>
    </div>
  </body></html>`;
});

const $$file = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/layouts/MDXLayout.astro";
const $$url = undefined;

export { $$metadata, $$MDXLayout as default, $$file as file, $$url as url };
