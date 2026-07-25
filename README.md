# ievictor.sh

Static site. Markdown posts are **pre-rendered to complete HTML at build time** —
KaTeX and highlight.js run during the build, so shipped pages carry a real `<title>`,
full content, rendered math, and colored code with **zero client-side rendering**
(good for LinkedIn/Discord unfurls, Google, `curl`, and reader mode).

## Writing a post

1. Create `posts/<slug>/index.md`. The folder name becomes the URL: `/<slug>/` →
   `https://ievictor.sh/posts/<slug>/`.
2. Add frontmatter:

   ```yaml
   ---
   title: My Post Title
   date: '2026-07-25'      # drives homepage ordering (newest first)
   category: post          # post | study  → which homepage section
   subtitle: >-            # optional; also used as the meta/OG description
     One-line summary.
   author:
     name: Victor Gabriel Lucio   # optional
   metadata:               # optional; each key becomes an info line in the header
     readTime: 10 minutes
     status: finished
   draft: true             # optional; drafts never deploy (see below)
   ---
   ```
3. `npm run build` and preview `dist/`.

The homepage (`dist/index.html`) is **generated** from the posts' frontmatter — no
hand-editing a post list.

## Building

```sh
npm install
npm run build            # production build → dist/ (drafts excluded)
npm run build -- --drafts   # include draft posts, for local preview
```

`dist/` is a full, deployable copy of the site (pages + `styles/`, `assets/`,
self-hosted KaTeX CSS/fonts, the highlight theme, and `scripts/post-toc.js`). It is
**gitignored** — treat it as a build artifact, never hand-edit it. Every build is a
full rebuild from source, so a template/CDN change can't leave a stale page behind.

Preview locally with any static server pointed at `dist/`, e.g. `npx serve dist`.

## Deploy — Cloudflare Pages

Configured in the Cloudflare Pages dashboard (native build, no GitHub Action):

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `NODE_VERSION = 20` (or newer)
- **Custom domain:** `ievictor.sh` attached under the project's *Custom domains* tab.
  (No `CNAME` file — the domain lives in Cloudflare's config.)

A bad URL is served `dist/404.html` ("Post not found" + back-home) by Cloudflare Pages.

## Layout / source map

- `build.mjs` — the whole pipeline. All rendering logic lives here.
- `layout.html` — post-page template (`{{title}}`, `{{content}}`, `{{toc}}`, …).
- `home.html` — homepage template (`{{lists}}`).
- `404.html` — not-found page (copied into `dist/`).
- `scripts/post-toc.js` — the only shipped script: wires the pre-rendered TOC's
  mobile drawer + scroll-spy. No content rendering.
- `template.html` + `scripts/{toc,frontmatter,nav}.js` — the **old client-side-render
  sandbox**, kept for ad-hoc rendering tests. Dev-only; never copied into `dist/`.
