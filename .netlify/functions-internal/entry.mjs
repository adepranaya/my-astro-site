import * as adapter from '@astrojs/netlify/netlify-functions.js';
import { defineComponent, h, createSSRApp, mergeProps, useSSRContext, unref, ref } from 'vue';
import { renderToString as renderToString$1, ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { escape } from 'html-escaper';
/* empty css                                                                               */import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import { compile } from 'path-to-regexp';

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * This is the Vue + JSX equivalent of using `<div v-html="value" />`
 */
const StaticHtml = defineComponent({
	props: {
		value: String,
		name: String,
	},
	setup({ name, value }) {
		if (!value) return () => null;
		return () => h('astro-slot', { name, innerHTML: value });
	},
});

function check$1(Component) {
	return !!Component['ssrRender'];
}

async function renderToStaticMarkup$1(Component, props, slotted) {
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		slots[key] = () => h(StaticHtml, { value, name: key === 'default' ? undefined : key });
	}
	const app = createSSRApp({ render: () => h(Component, props, slots) });
	const html = await renderToString$1(app);
	return { html };
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = "1.1.5";
function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape;
class HTMLString extends String {
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith("/@fs") && resolved.endsWith(".jsx")) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === "string";
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === "tagName" && Component === value) {
            return {
              componentExport: key,
              componentUrl: id
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7
};
function serializeArray(value) {
  return value.map((v) => convertToSerializedForm(v));
}
function serializeObject(value) {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v)];
    })
  );
}
function convertToSerializedForm(value) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props) {
  return JSON.stringify(serializeObject(props));
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"'
            );
          }
          break;
        }
      }
    } else if (key === "class:list") {
      extracted.props[key.slice(0, -5)] = serializeListValue(value);
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = value;
    }
  }
  island.props["component-url"] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(renderer.clientEntrypoint);
    island.props["props"] = escapeHTML(serializeProps(props));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  island.props["before-hydration-url"] = await result.resolve("astro:scripts/before-hydration.js");
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=t=>{const e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)},window.dispatchEvent(new Event("astro:idle"));`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()},window.dispatchEvent(new Event("astro:load"));`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}},window.dispatchEvent(new Event("astro:media"));`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=t=>{(async()=>await(await t())())()},window.dispatchEvent(new Event("astro:only"));`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(s,c,n)=>{const r=async()=>{await(await s())()};let i=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){i.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];i.observe(t)}},window.dispatchEvent(new Event("astro:visible"));`;

var astro_island_prebuilt_default = `var l;{const c={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t)},o=(t,i)=>{if(t===""||!Array.isArray(i))return i;const[e,n]=i;return e in c?c[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(l=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement&&this.parentElement.closest("astro-island[ssr]"))return;const i=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(const s of n){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("data-astro-template")||"default"]=s.innerHTML,s.remove())}for(const s of i){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("name")||"default"]=s.innerHTML)}const a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((i,e)=>{e.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate),await import(this.getAttribute("before-hydration-url")),this.start()}start(){const i=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{const n=this.getAttribute("renderer-url"),[a,{default:s}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),r=this.getAttribute("component-export")||"default";if(!r.includes("."))this.Component=a[r];else{this.Component=a;for(const d of r.split("."))this.Component=this.Component[d]}return this.hydrator=s,this.hydrate},i,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},l.observedAttributes=["props"],l))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      return chunk.toString();
    }
  }
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = {"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : !!obj.isAstroComponentFactory;
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let html = "";
  for await (const chunk of renderAstroComponent(Component)) {
    html += stringifyChunk(result, chunk);
  }
  return html;
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (typeof child === "object" && Symbol.asyncIterator in child) {
    yield* child;
  } else {
    yield child;
  }
}
async function renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        content += stringifyChunk(result, chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(content);
  }
  return fallback;
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?<!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `let ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact"];
    default:
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue", "@astrojs/svelte"];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (isAstroComponentFactory(Component)) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const children2 = {};
      if (slots) {
        await Promise.all(
          Object.entries(slots).map(
            ([key, value]) => renderSlot(result, value).then((output) => {
              children2[key] = output;
            })
          )
        );
      }
      const html2 = Component.render({ slots: children2 });
      return markHTMLString(html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (Array.isArray(renderers) && renderers.length === 0 && typeof Component !== "string" && !componentIsHTMLElement(Component)) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`;
    throw new Error(message);
  }
  const children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          children[key] = output;
        })
      )
    );
  }
  let renderer;
  if (metadata.hydrate !== "only") {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${metadata.displayName} client:only="${probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")}" />
`);
    } else if (typeof Component !== "string") {
      const matchingRenderers = renderers.filter((r) => probableRendererNames.includes(r.name));
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? "are" : "is"} ${renderers.length} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render ${metadata.displayName}.

Did you mean to enable ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`
    );
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

new TextEncoder();

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function __astro_tag_component__(Component, rendererName) {
  if (!Component)
    return;
  if (typeof Component !== "function")
    return;
  Object.defineProperty(Component, Renderer, {
    value: rendererName,
    enumerable: false,
    writable: false
  });
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = "astro-client-only";
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function" && !skipAstroJSXCheck.has(vnode.type)) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let body = "";
        for await (const chunk of output) {
          let html = stringifyChunk(result, chunk);
          body += html;
        }
        return markHTMLString(body);
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "SocMed",
  __ssrInlineRender: true,
  setup(__props) {
    const socialMedias = [
      {
        title: "Linkedin",
        link: "https://www.linkedin.com/in/ade-pranaya-567733113/",
        icon: "fa-brands fa-linkedin"
      },
      {
        title: "Instagram",
        link: "https://instagram.com/depran7",
        icon: "fa-brands fa-instagram"
      },
      {
        title: "Youtube",
        link: "https://www.youtube.com/channel/UCNEqtGZAM-LiBeSATMrOvVQ?sub_confirmation=1",
        icon: "fa-brands fa-youtube"
      },
      {
        title: "Github",
        link: "https://www.github.com/adepranaya",
        icon: "fa-brands fa-github"
      },
      {
        title: "Github",
        link: "https://www.github.com/depran7",
        icon: "fa-brands fa-github"
      },
      {
        title: "Github",
        link: "https://www.gitlab.com/ade.pranaya",
        icon: "fa-brands fa-gitlab"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center flex-wrap justify-center md:justify-start" }, _attrs))}><!--[-->`);
      ssrRenderList(socialMedias, (item, index) => {
        _push(`<a${ssrRenderAttr("href", item.link)} target="_blank" class="mr-5"><i class="${ssrRenderClass([item.icon, "text-4xl text-primary"])}"></i></a>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});

const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/SocMed.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "Hero",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex justify-between mt-20 mb-44 flex-wrap flex-col-reverse md:flex-row" }, _attrs))}><div class="text-center md:text-left self-center flex flex-col gap-4"><div class="text-xl md:text-4xl">Hi, I\u2019m</div><h1 class="text-4xl md:text-6xl font-bold"> A<span class="text-primary">dePran</span>aya </h1><div class="text-xl md:text-4xl">web designer/developer</div>`);
      _push(ssrRenderComponent(_sfc_main$5, null, null, _parent));
      _push(`<div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"><a class="bg-primary text-white font-semibold py-2 px-4 border-2 border-transparent hover:bg-gray-900 hover:border-transparent rounded-full flex-1 uppercase sm:mb-0 sm:mr-2 text-center cursor-pointer" href="mailto:adepranaya@gmail.com">contact me</a><a href="#about" class="bg-transparent text-primary font-semibold border-2 border-primary hover:text-white hover:bg-gray-900 hover:border-transparent py-2 px-4 rounded-full sm:flex-1 uppercase text-center">about</a><a href="#positions" class="bg-transparent text-primary font-semibold border-2 border-primary hover:text-white hover:bg-gray-900 hover:border-transparent py-2 px-4 rounded-full sm:flex-1 uppercase text-center sm:col-span-2">see my works</a></div></div><div class="self-center mb-4"></div></div>`);
    };
  }
});

const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Hero.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};

const $$module1$6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: _sfc_main$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$f = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/TechStack.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$f = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/TechStack.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$TechStack = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$TechStack;
  const techStacks = [
    "HTML",
    "CSS",
    "JavaScript",
    "Angular",
    "React JS",
    "Vue JS",
    "Nuxt JS",
    "Electron JS",
    "Java",
    "PHP",
    "Laravel",
    "Codeigniter",
    "Bootstrap",
    "Tailwind CSS"
  ];
  return renderTemplate`${maybeRenderHead($$result)}<div class="flex gap-2 flex-wrap">
  ${techStacks.map((item) => renderTemplate`<div class=" p-1 text-sm bg-primary text-white rounded-lg">
        ${item}
      </div>`)}
</div>`;
});

const $$file$f = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/TechStack.astro";
const $$url$f = undefined;

const $$module1$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$f,
	default: $$TechStack,
	file: $$file$f,
	url: $$url$f
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$e = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/About.astro", { modules: [{ module: $$module1$5, specifier: "./TechStack.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$e = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/About.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$About = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$About;
  return renderTemplate`${maybeRenderHead($$result)}<div id="about" class="border-t-2 border-primary/50 py-20">
  <h2 class="text-4xl md:text-6xl font-bold mb-4">
    About <span class="text-primary">Me</span>
  </h2>
  <p class="mb-4">
    My name is Ade Pranaya, I graduated from Pasundan University. I am Web
    Designer / Developer. I am very happy with programming especially in
    Frontend Development so that's why right now I want to focus as Frontend
    Developer. U can check my last job
    <a href="#positions" class="text-primary underline">here</a>
  </p>
  <h3 class="text-2xl text-primary mb-2">Tech Stack</h3>
  ${renderComponent($$result, "TechStack", $$TechStack, {})}
</div>`;
});

const $$file$e = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/About.astro";
const $$url$e = undefined;

const $$module2$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$e,
	default: $$About,
	file: $$file$e,
	url: $$url$e
}, Symbol.toStringTag, { value: 'Module' }));

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

// import BackButton from '~/components/BackButton';
const _sfc_main$3 = {
  // components: {
  //   BackButton,
  // },
  data: () => {
    return {
      portfolios: [
        {
          sebagai: 'Frontend Developer',
          deskripsi: 'PT Bangunindo Teknusa Jaya, Jakarta',
          teknologi: ['Vue JS', 'Nuxt JS', 'Codeigniter'],
          tanggal: '2022 - now',
        },
        {
          sebagai: 'Frontend Developer',
          deskripsi: 'PT Kunci Teknologi Digital, Bandung',
          teknologi: ['Vue JS', 'Nuxt JS'],
          tanggal: '2019 - 2022',
        },
        {
          sebagai: 'Mentor Private Class',
          deskripsi: 'Web Development',
          teknologi: ['PHP'],
          tanggal: '2020 - now',
        },
        {
          sebagai: 'Freelance web developer',
          deskripsi: [
            'Create Forum Discussion at https://webprogrammingunpas.com',
            'Create slip list customer at PT Pertamina',
            'Create Desktop Point of Sales at Anaheim',
            'Create skin clinic at Naifah',
            "Create 'Sistem Informasi Data Kepegawaian (SIDAKEP) Dinkes Jabar'",
          ],
          teknologi: ['Laravel', 'React JS', 'Electron'],
          tanggal: '2018 - now',
        },
        {
          sebagai: 'Co – Trainer Workshop Professional Web Programming',
          deskripsi: 'Create Website using Bootstrap 4.0 and CodeIgniter',
          teknologi: ['Bootstrap 4.0', 'CodeIgniter 2'],
          tanggal: '2019',
        },
        {
          sebagai: 'Frontend Developer',
          deskripsi: 'Internship at PT Titik Terang Teknologi, Bandung',
          teknologi: ['Laravel'],
          tanggal: '2018',
        },
        {
          sebagai: 'Informatic Laboratory Asistant',
          deskripsi:
            'Guide a students at Research Group Programming and Logic at Pasundan University',
          teknologi: [],
          tanggal: '2016 – 2019',
        },
      ],
    };
  },
};

function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({
    id: "positions",
    class: "border-t-2 border-primary/50 py-20 h-full flex"
  }, _attrs))}><div class="w-full relative"><div class="flex flex-col relative z-10 min-h-full"><h1 class="text-4xl md:text-6xl font-bold">Positions</h1><div class="flex-1 max-h-full"><div class="grid grid-cols-1 mt-6"><!--[-->`);
  ssrRenderList(_ctx.portfolios, (el, index) => {
    _push(`<div class="p-4 border-l-4 border-gray-400 bg-white relative"><div class="w-4 h-4 absolute top-5 -left-2.5 bg-primary rounded-full"></div><div class="ml-4 pb-4 border-b-2 border-gray-400/50"><h2 class="font-bold text-xl">${
      ssrInterpolate(el.sebagai)
    }</h2><p class="text-gray-600">${
      ssrInterpolate(el.tanggal)
    }</p>`);
    if (typeof el.deskripsi === 'object') {
      _push(`<ul class="list-disc ml-4"><!--[-->`);
      ssrRenderList(el.deskripsi, (desc, iD) => {
        _push(`<li class="mb-2 break-normal">${ssrInterpolate(desc)}</li>`);
      });
      _push(`<!--]--></ul>`);
    } else {
      _push(`<p>${ssrInterpolate(el.deskripsi)}</p>`);
    }
    _push(`<ul><!--[-->`);
    ssrRenderList(el.teknologi, (tech, iT) => {
      _push(`<li class="inline-block bg-primary text-white mr-4 mt-4 p-1 rounded-sm text-sm">${ssrInterpolate(tech)}</li>`);
    });
    _push(`<!--]--></ul></div></div>`);
  });
  _push(`<!--]--></div></div></div></div></div>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext()
  ;(ssrContext.modules || (ssrContext.modules = new Set())).add("src/components/Positions.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : undefined
};
const Positions = /*#__PURE__*/_export_sfc(_sfc_main$3, [['ssrRender',_sfc_ssrRender$1]]);

const $$module3$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: Positions
}, Symbol.toStringTag, { value: 'Module' }));

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Footer",
  __ssrInlineRender: true,
  setup(__props) {
    const currentDate = new Date().getFullYear().toString();
    const name = "Ade Pranaya";
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-6 lg:mx-auto lg:max-w-6xl py-6" }, _attrs))}><div class="mt-4 flex items-center mb-4 flex-wrap justify-center">`);
      _push(ssrRenderComponent(_sfc_main$5, null, null, _parent));
      _push(`<span>copyright \xA9 ${ssrInterpolate(unref(currentDate))}. ${ssrInterpolate(name)}</span></div></div>`);
    };
  }
});

const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Footer.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};

const $$module1$4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: _sfc_main$2
}, Symbol.toStringTag, { value: 'Module' }));

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "NavbarContainer",
  __ssrInlineRender: true,
  props: {
    currentPath: null
  },
  setup(__props) {
    const isOpen = ref(false);
    const navs = [
      {
        "link": "/",
        "title": "home"
      },
      {
        "link": "/blog",
        "title": "blog"
      },
      {
        "link": "/notes",
        "title": "notes"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<nav${ssrRenderAttrs(mergeProps({ class: "mx-6 lg:mx-auto lg:max-w-6xl py-6 relative" }, _attrs))}><button class="ml-auto flex self-end md:hidden"><svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path fill-rule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"></path></svg></button><div class="${ssrRenderClass([isOpen.value ? "flex absolute w-full bg-white shadow p-2" : "hidden", "flex items-start flex-col md:flex md:flex-row gap-2 uppercase md:justify-between md:items-center"])}"><ul class="md:flex flex-col md:flex-row md:gap-2 md:w-1/2"><!--[-->`);
      ssrRenderList(navs, (item, index) => {
        _push(`<li class="mr-6 pb-2 md:py-0"><a${ssrRenderAttr("href", item.link)} class="${ssrRenderClass(
          __props.currentPath === item.title ? "text-primary font-bold" : "text-gray-900 hover:text-primary"
        )}">${ssrInterpolate(item.title)}</a></li>`);
      });
      _push(`<!--]--></ul><a class="md:flex hover:bg-gray-900-primary bg-primary text-white rounded-full py-2 px-4" href="mailto:adepranaya@gmail.com?subject=I want hire you!&amp;body=Hello Ade!, my name is ...">Contact Me</a></div></nav>`);
    };
  }
});

const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/NavbarContainer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};

const $$module1$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: _sfc_main$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$d = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/Navbar.astro", { modules: [{ module: $$module1$3, specifier: "./NavbarContainer.vue", assert: {} }], hydratedComponents: [_sfc_main$1], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set(["visible"]), hoisted: [] });
const $$Astro$d = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/Navbar.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$Navbar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$Navbar;
  const pathname = new URL(Astro2.request.url).pathname;
  const currentPath = pathname.slice(1);
  return renderTemplate`${renderComponent($$result, "NavbarContainer", _sfc_main$1, { "client:visible": true, "currentPath": currentPath, "client:component-hydration": "visible", "client:component-path": "/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/NavbarContainer.vue", "client:component-export": "default" })}`;
});

const $$file$d = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/Navbar.astro";
const $$url$d = undefined;

const $$module2$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$d,
	default: $$Navbar,
	file: $$file$d,
	url: $$url$d
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$c = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphArticleTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$c = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphArticleTags.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$OpenGraphArticleTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$OpenGraphArticleTags;
  const { publishedTime, modifiedTime, expirationTime, authors, section, tags } = Astro2.props.openGraph.article;
  return renderTemplate`${publishedTime ? renderTemplate`<meta property="article:published_time"${addAttribute(publishedTime, "content")}>` : null}
${modifiedTime ? renderTemplate`<meta property="article:modified_time"${addAttribute(modifiedTime, "content")}>` : null}
${expirationTime ? renderTemplate`<meta property="article:expiration_time"${addAttribute(expirationTime, "content")}>` : null}
${authors ? authors.map((author) => renderTemplate`<meta property="article:author"${addAttribute(author, "content")}>`) : null}
${section ? renderTemplate`<meta property="article:section"${addAttribute(section, "content")}>` : null}
${tags ? tags.map((tag) => renderTemplate`<meta property="article:tag"${addAttribute(tag, "content")}>`) : null}
`;
});

const $$file$c = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphArticleTags.astro";
const $$url$c = undefined;

const $$module1$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$c,
	default: $$OpenGraphArticleTags,
	file: $$file$c,
	url: $$url$c
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$b = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphBasicTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$b = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphBasicTags.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$OpenGraphBasicTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$OpenGraphBasicTags;
  const { openGraph } = Astro2.props;
  return renderTemplate`<meta property="og:title"${addAttribute(openGraph.basic.title, "content")}>
<meta property="og:type"${addAttribute(openGraph.basic.type, "content")}>
<meta property="og:image"${addAttribute(openGraph.basic.image, "content")}>
<meta property="og:url"${addAttribute(openGraph.basic.url || Astro2.url.href, "content")}>
`;
});

const $$file$b = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphBasicTags.astro";
const $$url$b = undefined;

const $$module2$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$b,
	default: $$OpenGraphBasicTags,
	file: $$file$b,
	url: $$url$b
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$a = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphImageTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$a = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphImageTags.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$OpenGraphImageTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$OpenGraphImageTags;
  const { image } = Astro2.props.openGraph.basic;
  const { url, secureUrl, type, width, height, alt } = Astro2.props.openGraph.image;
  return renderTemplate`<meta property="og:image:url"${addAttribute(image, "content")}>
${secureUrl ? renderTemplate`<meta property="og:image:secure_url"${addAttribute(secureUrl, "content")}>` : null}
${type ? renderTemplate`<meta property="og:image:type"${addAttribute(type, "content")}>` : null}
${width ? renderTemplate`<meta property="og:image:width"${addAttribute(width, "content")}>` : null}
${!(height === null) ? renderTemplate`<meta property="og:image:height"${addAttribute(height, "content")}>` : null}
${!(alt === null) ? renderTemplate`<meta property="og:image:alt"${addAttribute(alt, "content")}>` : null}
`;
});

const $$file$a = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphImageTags.astro";
const $$url$a = undefined;

const $$module3$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$a,
	default: $$OpenGraphImageTags,
	file: $$file$a,
	url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$9 = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphOptionalTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$9 = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphOptionalTags.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$OpenGraphOptionalTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$OpenGraphOptionalTags;
  const { optional } = Astro2.props.openGraph;
  return renderTemplate`${optional.audio ? renderTemplate`<meta property="og:audio"${addAttribute(optional.audio, "content")}>` : null}
${optional.description ? renderTemplate`<meta property="og:description"${addAttribute(optional.description, "content")}>` : null}
${optional.determiner ? renderTemplate`<meta property="og:determiner"${addAttribute(optional.determiner, "content")}>` : null}
${optional.locale ? renderTemplate`<meta property="og:locale"${addAttribute(optional.locale, "content")}>` : null}
${optional.localeAlternate?.map((locale) => renderTemplate`<meta property="og:locale:alternate"${addAttribute(locale, "content")}>`)}
${optional.siteName ? renderTemplate`<meta property="og:site_name"${addAttribute(optional.siteName, "content")}>` : null}
${optional.video ? renderTemplate`<meta property="og:video"${addAttribute(optional.video, "content")}>` : null}
`;
});

const $$file$9 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/OpenGraphOptionalTags.astro";
const $$url$9 = undefined;

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$9,
	default: $$OpenGraphOptionalTags,
	file: $$file$9,
	url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$8 = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/ExtendedTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/ExtendedTags.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$ExtendedTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$ExtendedTags;
  const { props } = Astro2;
  return renderTemplate`${props.extend.link?.map((attributes) => renderTemplate`<link${spreadAttributes(attributes)}>`)}
${props.extend.meta?.map(({ content, httpEquiv, name, property }) => renderTemplate`<meta${addAttribute(content, "content")}${addAttribute(httpEquiv, "http-eqiv")}${addAttribute(name, "name")}${addAttribute(property, "property")}>`)}
`;
});

const $$file$8 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/ExtendedTags.astro";
const $$url$8 = undefined;

const $$module5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$8,
	default: $$ExtendedTags,
	file: $$file$8,
	url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$7 = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/TwitterTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/TwitterTags.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$TwitterTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$TwitterTags;
  const { card, site, creator } = Astro2.props.twitter;
  return renderTemplate`${card ? renderTemplate`<meta name="twitter:card"${addAttribute(card, "content")}>` : null}
${site ? renderTemplate`<meta name="twitter:site"${addAttribute(site, "content")}>` : null}
${creator ? renderTemplate`<meta name="twitter:creator"${addAttribute(creator, "content")}>` : null}
`;
});

const $$file$7 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/components/TwitterTags.astro";
const $$url$7 = undefined;

const $$module6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$7,
	default: $$TwitterTags,
	file: $$file$7,
	url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$6 = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/SEO.astro", { modules: [{ module: $$module1$2, specifier: "./components/OpenGraphArticleTags.astro", assert: {} }, { module: $$module2$1, specifier: "./components/OpenGraphBasicTags.astro", assert: {} }, { module: $$module3$1, specifier: "./components/OpenGraphImageTags.astro", assert: {} }, { module: $$module4, specifier: "./components/OpenGraphOptionalTags.astro", assert: {} }, { module: $$module5, specifier: "./components/ExtendedTags.astro", assert: {} }, { module: $$module6, specifier: "./components/TwitterTags.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$6 = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/SEO.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$SEO = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$SEO;
  const { props } = Astro2;
  const { title, description, canonical, noindex, nofollow } = props;
  function validateProps(props2) {
    const { openGraph, description: description2 } = props2;
    if (openGraph) {
      if (!openGraph.basic || openGraph.basic.title == null || openGraph.basic.type == null || openGraph.basic.image == null) {
        throw new Error(
          "If you pass the openGraph prop, you have to at least define the title, type, and image basic properties!"
        );
      }
    }
    if (title && openGraph?.basic.title) {
      if (title == openGraph.basic.title) {
        console.warn(
          "WARNING(astro-seo): You passed the same value to `title` and `openGraph.optional.title`. This is most likely not what you want. See docs for more."
        );
      }
    }
    if (openGraph?.basic?.image && !openGraph?.image?.alt) {
      console.warn(
        "WARNING(astro-seo): You defined `openGraph.basic.image`, but didn't define `openGraph.image.alt`. This is stongly discouraged.'"
      );
    }
  }
  validateProps(props);
  return renderTemplate`${title ? renderTemplate`<title>${markHTMLString(title)}</title>` : null}

<link rel="canonical"${addAttribute(canonical || Astro2.url.href, "href")}>

${description ? renderTemplate`<meta name="description"${addAttribute(description, "content")}>` : null}

<meta name="robots"${addAttribute(`${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`, "content")}>

${props.openGraph && renderTemplate`${renderComponent($$result, "OpenGraphBasicTags", $$OpenGraphBasicTags, { ...props })}`}
${props.openGraph?.optional && renderTemplate`${renderComponent($$result, "OpenGraphOptionalTags", $$OpenGraphOptionalTags, { ...props })}`}
${props.openGraph?.image && renderTemplate`${renderComponent($$result, "OpenGraphImageTags", $$OpenGraphImageTags, { ...props })}`}
${props.openGraph?.article && renderTemplate`${renderComponent($$result, "OpenGraphArticleTags", $$OpenGraphArticleTags, { ...props })}`}
${props.twitter && renderTemplate`${renderComponent($$result, "TwitterTags", $$TwitterTags, { ...props })}`}
${props.extend && renderTemplate`${renderComponent($$result, "ExtendedTags", $$ExtendedTags, { ...props })}`}
`;
});

const $$file$6 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/node_modules/.pnpm/astro-seo@0.6.0/node_modules/astro-seo/src/SEO.astro";
const $$url$6 = undefined;

const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	SEO: $$SEO,
	$$metadata: $$metadata$6,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$5 = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/base/HeadLayout.astro", { modules: [{ module: $$module1$1, specifier: "astro-seo", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/base/HeadLayout.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$HeadLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$HeadLayout;
  const metaDesc = "My name is Ade Pranaya, I graduated from Pasundan University. I am Web Designer / Developer. I am very happy with programming especially in Frontend Development so that's why right now I want to focus as Frontend Developer. U can check my last job";
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`<head>
  <meta charset="utf-8">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="viewport" content="width=device-width">
  <meta name="generator"${addAttribute(Astro2.generator, "content")}>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  ${renderComponent($$result, "SEO", $$SEO, { "title": "Ade Pranaya", "description": metaDesc, "class": "astro-H5FUZYZU" })}

  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" integrity="sha512-xh6O/CkQoPOWDdYTDqeRdPCVd1SpvCA9XXcUnZS2FmJNp1coAFzvtCN9BmamE+4aHK8yyUHUSCcJHgXloTyT2A==" crossorigin="anonymous" referrerPolicy="no-referrer">
  <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/brands.min.css" integrity="sha512-+oRH6u1nDGSm3hH8poU85YFIVTdSnS2f+texdPGrURaJh8hzmhMiZrQth6l56P4ZQmxeZzd2DqVEMqQoJ8J89A==" crossorigin="anonymous" referrerPolicy="no-referrer" /> -->
  
${renderHead($$result)}</head>`;
});

const $$file$5 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/base/HeadLayout.astro";
const $$url$5 = undefined;

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$5,
	default: $$HeadLayout,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/layouts/default.astro", { modules: [{ module: $$module1$4, specifier: "../components/Footer.vue", assert: {} }, { module: $$module2$2, specifier: "../components/Navbar.astro", assert: {} }, { module: $$module3, specifier: "../components/base/HeadLayout.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/layouts/default.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$Default = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Default;
  return renderTemplate`<html class="scroll-smooth" lang="en">
  ${renderComponent($$result, "HeadLayout", $$HeadLayout, {})}
  ${maybeRenderHead($$result)}<body>
    <div class="flex flex-col min-h-screen">
      <div>
        ${renderComponent($$result, "Navbar", $$Navbar, {})}
      </div>
      <div class="mb-auto">
        <article class="mx-6 lg:mx-auto lg:max-w-6xl py-6">
          ${renderSlot($$result, $$slots["default"])}
          <!-- your content is injected here -->
        </article>
      </div>
      <div>
        ${renderComponent($$result, "Footer", _sfc_main$2, {})}
      </div>
    </div>
  </body></html>`;
});

const $$file$4 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/layouts/default.astro";
const $$url$4 = undefined;

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$4,
	default: $$Default,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$3 = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/index.astro", { modules: [{ module: $$module1$6, specifier: "../components/Hero.vue", assert: {} }, { module: $$module2$3, specifier: "../components/About.astro", assert: {} }, { module: $$module3$2, specifier: "../components/Positions.vue", assert: {} }, { module: $$module2, specifier: "../layouts/default.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/index.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$Index$2 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Index$2;
  return renderTemplate`${renderComponent($$result, "Layout", $$Default, {}, { "default": () => renderTemplate`${renderComponent($$result, "Hero", _sfc_main$4, {})}${renderComponent($$result, "About", $$About, {})}${renderComponent($$result, "Positions", Positions, {})}` })}`;
});

const $$file$3 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/index.astro";
const $$url$3 = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$3,
	default: $$Index$2,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/notes/index.astro", { modules: [{ module: $$module2, specifier: "../../layouts/default.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/notes/index.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$Index$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Index$1;
  const posts = await Astro2.glob(/* #__PURE__ */ Object.assign({"./notes.mdx": () => Promise.resolve().then(() => _page2)}), () => "./*.mdx");
  return renderTemplate`${renderComponent($$result, "Layout", $$Default, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<h1 class="text-4xl text-primary font-bold">Notes</h1><p class="mb-8">
    this page for my dev notes like errors, tips, etc. If you get the benefits
    I'm participating
  </p>${posts.map((post) => renderTemplate`<a${addAttribute("/notes/" + post.frontmatter.slug, "href")}>
        <div class="border-l-4 pl-4">
          <h2 class="font-bold text-xl text-primary">
            ${post.frontmatter.title}
          </h2>
          <span class="text-gray-500">${post.frontmatter.created_at}</span>
          <p>${post.frontmatter.desc}</p>
        </div>
      </a>`)}` })}`;
});

const $$file$2 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/notes/index.astro";
const $$url$2 = "/notes";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$2,
	default: $$Index$1,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const MDXLayout$1 = async function ({
  children
}) {
  const Layout = (await import('./chunks/MDXLayout.e9663c38.mjs')).default;
  const {
    layout,
    ...content
  } = frontmatter$1;
  content.file = file$1;
  content.url = url$1;
  content.astro = {};
  Object.defineProperty(content.astro, "headings", {
    get() {
      throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."');
    }

  });
  Object.defineProperty(content.astro, "html", {
    get() {
      throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."');
    }

  });
  Object.defineProperty(content.astro, "source", {
    get() {
      throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."');
    }

  });
  return createVNode(Layout, {
    file: file$1,
    url: url$1,
    content,
    frontmatter: content,
    headings: getHeadings$1(),
    "server:root": true,
    children
  });
};
const frontmatter$1 = {
  "layout": "../../layouts/MDXLayout.astro",
  "title": "Specified input file /src/inpus.css does not exist.",
  "desc": "Getting error when i trying Start the Tailwind CLI build...",
  "created_at": "5 Agustus 2022",
  "slug": "notes"
};
function getHeadings$1() {
  return [];
}

function _createMdxContent$1(props) {
  const _components = Object.assign({
    p: "p",
    pre: "pre",
    code: "code",
    span: "span"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.p, {
      children: ["Getting error when i trying Start the Tailwind CLI build process like the ", createVNode("a", {
        href: "https://tailwindcss.com/docs/installation",
        class: "text-primary",
        children: "docs"
      }), " ,"]
    }), "\n", createVNode(_components.pre, {
      className: "astro-code",
      style: {
        backgroundColor: "#282A36",
        overflowX: "auto"
      },
      children: createVNode(_components.code, {
        children: createVNode(_components.span, {
          className: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "npx tailwindcss "
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "i ."
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "/"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "src"
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "/"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "input.css "
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "o ."
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "/"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "dist"
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "/"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "output.css "
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "--"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "watch"
          })]
        })
      })
    }), "\n", createVNode(_components.p, {
      children: "so the solution is just remove the first slash from the path like this"
    }), "\n", createVNode(_components.pre, {
      className: "astro-code",
      style: {
        backgroundColor: "#282A36",
        overflowX: "auto"
      },
      children: createVNode(_components.code, {
        children: createVNode(_components.span, {
          className: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "npx tailwindcss "
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "i src"
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "/"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "inpus.css "
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "-"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "o dist"
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "/"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "output.css "
          }), createVNode(_components.span, {
            style: {
              color: "#FF79C6"
            },
            children: "--"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "watch"
          })]
        })
      })
    })]
  });
}

function MDXContent$1(props = {}) {
  return createVNode(MDXLayout$1, { ...props,
    children: createVNode(_createMdxContent$1, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$1, "astro:jsx");
MDXContent$1[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter$1.layout);
const url$1 = "/notes/notes";
const file$1 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/notes/notes.mdx";
function rawContent$1() { throw new Error("MDX does not support rawContent()! If you need to read the Markdown contents to calculate values (ex. reading time), we suggest injecting frontmatter via remark plugins. Learn more on our docs: https://docs.astro.build/en/guides/integrations-guide/mdx/#inject-frontmatter-via-remark-or-rehype-plugins") }function compiledContent$1() { throw new Error("MDX does not support compiledContent()! If you need to read the HTML contents to calculate values (ex. reading time), we suggest injecting frontmatter via rehype plugins. Learn more on our docs: https://docs.astro.build/en/guides/integrations-guide/mdx/#inject-frontmatter-via-remark-or-rehype-plugins") }const Content$1 = MDXContent$1;

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$1,
	getHeadings: getHeadings$1,
	default: MDXContent$1,
	url: url$1,
	file: file$1,
	rawContent: rawContent$1,
	compiledContent: compiledContent$1,
	Content: Content$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$1 = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/blog/index.astro", { modules: [{ module: $$module2, specifier: "../../layouts/default.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/blog/index.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Index;
  const posts = await Astro2.glob(/* #__PURE__ */ Object.assign({"./helloworld.mdx": () => Promise.resolve().then(() => _page4)}), () => "./*.mdx");
  return renderTemplate`${renderComponent($$result, "Layout", $$Default, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<h1 class="text-4xl text-primary font-bold">Blog</h1><p class="mb-8">
    
  </p>${posts.map((post) => renderTemplate`<a${addAttribute("/blog/" + post.frontmatter.slug, "href")}>
        <h2 class="font-bold text-3xl text-primary">
          ${post.frontmatter.title}
        </h2>
        <span class="text-gray-500">${post.frontmatter.created_at}</span>
        <p>${post.frontmatter.desc}</p>
      </a>`)}` })}`;
});

const $$file$1 = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/blog/index.astro";
const $$url$1 = "/blog";

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	default: $$Index,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const MDXLayout = async function ({
  children
}) {
  const Layout = (await import('./chunks/MDXLayout.e9663c38.mjs')).default;
  const {
    layout,
    ...content
  } = frontmatter;
  content.file = file;
  content.url = url;
  content.astro = {};
  Object.defineProperty(content.astro, "headings", {
    get() {
      throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."');
    }

  });
  Object.defineProperty(content.astro, "html", {
    get() {
      throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."');
    }

  });
  Object.defineProperty(content.astro, "source", {
    get() {
      throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."');
    }

  });
  return createVNode(Layout, {
    file,
    url,
    content,
    frontmatter: content,
    headings: getHeadings(),
    "server:root": true,
    children
  });
};
const frontmatter = {
  "layout": "../../layouts/MDXLayout.astro",
  "title": "Hello World",
  "desc": "Lorem ipsum dolor sit amet consectetur...",
  "created_at": "5 Agustus 2022",
  "slug": "helloworld"
};
function getHeadings() {
  return [];
}

function _createMdxContent(props) {
  const _components = Object.assign({
    p: "p",
    pre: "pre",
    code: "code",
    span: "span"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.p, {
      children: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio ipsum quae quod assumenda vero doloribus laboriosam dolorem fugit, rerum maxime quaerat veritatis voluptatem iste aliquam. Dolorum voluptatum unde nisi aliquam?"
    }), "\n", createVNode(_components.pre, {
      className: "astro-code",
      style: {
        backgroundColor: "#282A36",
        overflowX: "auto"
      },
      children: createVNode(_components.code, {
        children: createVNode(_components.span, {
          className: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "console."
          }), createVNode(_components.span, {
            style: {
              color: "#50FA7B"
            },
            children: "log"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: "("
          }), createVNode(_components.span, {
            style: {
              color: "#E9F284"
            },
            children: "'"
          }), createVNode(_components.span, {
            style: {
              color: "#F1FA8C"
            },
            children: "hello world"
          }), createVNode(_components.span, {
            style: {
              color: "#E9F284"
            },
            children: "'"
          }), createVNode(_components.span, {
            style: {
              color: "#F8F8F2"
            },
            children: ")"
          })]
        })
      })
    })]
  });
}

function MDXContent(props = {}) {
  return createVNode(MDXLayout, { ...props,
    children: createVNode(_createMdxContent, { ...props
    })
  });
}

__astro_tag_component__(getHeadings, "astro:jsx");
MDXContent[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
const url = "/blog/helloworld";
const file = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/blog/helloworld.mdx";
function rawContent() { throw new Error("MDX does not support rawContent()! If you need to read the Markdown contents to calculate values (ex. reading time), we suggest injecting frontmatter via remark plugins. Learn more on our docs: https://docs.astro.build/en/guides/integrations-guide/mdx/#inject-frontmatter-via-remark-or-rehype-plugins") }function compiledContent() { throw new Error("MDX does not support compiledContent()! If you need to read the HTML contents to calculate values (ex. reading time), we suggest injecting frontmatter via rehype plugins. Learn more on our docs: https://docs.astro.build/en/guides/integrations-guide/mdx/#inject-frontmatter-via-remark-or-rehype-plugins") }const Content = MDXContent;

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter,
	getHeadings,
	default: MDXContent,
	url,
	file,
	rawContent,
	compiledContent,
	Content
}, Symbol.toStringTag, { value: 'Module' }));

// import BackButton from "~/components/BackButton";
const _sfc_main = {
  // components: {
  //   BackButton,
  // },
  data: () => {
    return {
      portfolios: [
        {
          sebagai: 'Specified input file /src/inpus.css does not exist.',
          deskripsi:
            "Getting error when i trying Start the Tailwind CLI build process like the <a href='https://tailwindcss.com/docs/installation' class='text-primary'>docs</a> , <pre class='whitespace-pre-wrap'>npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch</pre> <br> so the solution is just remove the first slash from the path like this <pre class='whitespace-pre-wrap'>npx tailwindcss -i src/inpus.css -o dist/output.css --watch</pre>",
          teknologi: ['Tailwind CSS v3.1.2'],
          tanggal: '15 Juni 2022',
        },
      ],
    };
  },
};

function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full flex" }, _attrs))}><div class="w-full relative px-10 md:p-0"><div class="flex flex-col overflow-auto relative z-10 min-h-full"><h1 class="text-4xl md:text-6xl font-bold lg:-my-3">Notes</h1><div class="flex-1 flex-wrap max-h-full"><div class="grid grid-cols-1 gap-4 mt-6"><!--[-->`);
  ssrRenderList(_ctx.portfolios, (el, index) => {
    _push(`<div class="p-4 border border-l-4 border-gray-400 bg-white"><h2 class="font-bold text-xl">${
      ssrInterpolate(el.sebagai)
    }</h2><p class="text-gray-600">${
      ssrInterpolate(el.tanggal)
    }</p>`);
    if (typeof el.deskripsi === 'object') {
      _push(`<ul class="list-disc ml-4"><!--[-->`);
      ssrRenderList(el.deskripsi, (desc, iD) => {
        _push(`<li class="mb-2">${ssrInterpolate(desc)}</li>`);
      });
      _push(`<!--]--></ul>`);
    } else {
      _push(`<p class="whitespace-pre-wrap">${el.deskripsi}</p>`);
    }
    _push(`<ul><!--[-->`);
    ssrRenderList(el.teknologi, (tech, iT) => {
      _push(`<li class="inline-block bg-primary text-white mr-4 mt-4 p-1 rounded-sm text-sm">${ssrInterpolate(tech)}</li>`);
    });
    _push(`<!--]--></ul></div>`);
  });
  _push(`<!--]--></div></div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext()
  ;(ssrContext.modules || (ssrContext.modules = new Set())).add("src/components/Notes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined
};
const Notes = /*#__PURE__*/_export_sfc(_sfc_main, [['ssrRender',_sfc_ssrRender]]);

const $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: Notes
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata = createMetadata("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/404.astro", { modules: [{ module: $$module1, specifier: "../components/Notes.vue", assert: {} }, { module: $$module2, specifier: "../layouts/default.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/404.astro", "", "file:///Users/adepranaya/Documents/dev_project/personal/my-astro-site/");
const $$404 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$404;
  return renderTemplate`${renderComponent($$result, "Layout", $$Default, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<h1>404 Not Found</h1>` })}`;
});

const $$file = "/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/pages/404.astro";
const $$url = "/404";

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$404,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['src/pages/index.astro', _page0],['src/pages/notes/index.astro', _page1],['src/pages/notes/notes.mdx', _page2],['src/pages/blog/index.astro', _page3],['src/pages/blog/helloworld.mdx', _page4],['src/pages/404.astro', _page5],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/vue","clientEntrypoint":"@astrojs/vue/client.js","serverEntrypoint":"@astrojs/vue/server.js"}, { ssr: _renderer1 }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return segment[0].spread ? `/:${segment[0].content.slice(3)}(.*)?` : "/" + segment.map((part) => {
      if (part)
        return part.dynamic ? `:${part.content}` : part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/netlify/functions","routes":[{"file":"","links":["assets/404-blog-helloworld-blog-index-index-notes-index-notes-notes.66c3c57b.css"],"scripts":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/404-blog-helloworld-blog-index-index-notes-index-notes-notes.66c3c57b.css"],"scripts":[],"routeData":{"route":"/notes","type":"page","pattern":"^\\/notes\\/?$","segments":[[{"content":"notes","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/notes/index.astro","pathname":"/notes","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/404-blog-helloworld-blog-index-index-notes-index-notes-notes.66c3c57b.css"],"scripts":[],"routeData":{"route":"/notes/notes","type":"page","pattern":"^\\/notes\\/notes\\/?$","segments":[[{"content":"notes","dynamic":false,"spread":false}],[{"content":"notes","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/notes/notes.mdx","pathname":"/notes/notes","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/404-blog-helloworld-blog-index-index-notes-index-notes-notes.66c3c57b.css"],"scripts":[],"routeData":{"route":"/blog","type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/404-blog-helloworld-blog-index-index-notes-index-notes-notes.66c3c57b.css"],"scripts":[],"routeData":{"route":"/blog/helloworld","type":"page","pattern":"^\\/blog\\/helloworld\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"helloworld","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/helloworld.mdx","pathname":"/blog/helloworld","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/404-blog-helloworld-blog-index-index-notes-index-notes-notes.66c3c57b.css"],"scripts":[],"routeData":{"route":"/404","type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","_meta":{"trailingSlash":"ignore"}}}],"base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"dracula","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"remarkRehype":{},"extendDefaultPlugins":false,"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/layouts/MDXLayout.astro":"chunks/MDXLayout.e9663c38.mjs","/@fs/Users/adepranaya/Documents/dev_project/personal/my-astro-site/src/components/NavbarContainer.vue":"NavbarContainer.0a561464.js","@astrojs/vue/client.js":"client.be9603a9.js","astro:scripts/before-hydration.js":"data:text/javascript;charset=utf-8,//[no before-hydration script]"},"assets":["/assets/404-blog-helloworld-blog-index-index-notes-index-notes-notes.66c3c57b.css","/NavbarContainer.0a561464.js","/client.be9603a9.js","/favicon.svg","/instagram_logo.svg","/youtube_logo.svg","/assets/profile.png","/chunks/runtime-core.esm-bundler.5aeb8bcd.js"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = {};

const _exports = adapter.createExports(_manifest, _args);
const handler = _exports['handler'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { $$module1$4 as $, _sfc_main$2 as _, $$module2$2 as a, $$module3 as b, createMetadata as c, createAstro as d, createComponent as e, renderComponent as f, $$HeadLayout as g, $$Navbar as h, handler, renderSlot as i, maybeRenderHead as m, renderTemplate as r };
