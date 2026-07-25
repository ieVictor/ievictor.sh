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

## Deploy — Cloudflare Workers (Static Assets)

Deployed as a Git-connected Cloudflare Workers build. Dashboard settings:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Environment variable:** `NODE_VERSION = 20` (or newer)

`wrangler.jsonc` points the deploy at `./dist` (uploading the repo root instead
would fail with "Asset too large" on `node_modules`). It also sets
`not_found_handling: "404-page"`, so an unknown URL serves `dist/404.html`
("Post not found" + back-home).

- **Custom domain:** `ievictor.sh` attached under the Worker's
  *Settings → Domains & Routes*. (No `CNAME` file — the domain lives in
  Cloudflare's config.)
- **Preview deploys:** every branch/PR gets its own URL — the end-to-end way to
  check a post before promoting it to production.

## Layout / source map

- `build.mjs` — the whole pipeline. All rendering logic lives here.
- `layout.html` — post-page template (`{{title}}`, `{{content}}`, `{{toc}}`, …).
- `home.html` — homepage template (`{{lists}}`).
- `404.html` — not-found page (copied into `dist/`).
- `scripts/post-toc.js` — the only shipped script: wires the pre-rendered TOC's
  mobile drawer + scroll-spy. No content rendering.
- `wrangler.jsonc` — Cloudflare deploy config (serves `./dist`).
