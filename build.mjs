// Static-site build for ievictor.sh.
//
// Pre-renders every markdown post (and the homepage) to complete static HTML:
// KaTeX and highlight.js run here, at build time, so the shipped pages carry a
// real <title>, full content, rendered math, and colored code with zero
// client-side rendering. See ./ok-based-on-that-eventual-charm plan for context.
//
//   node build.mjs            production build (drafts excluded)
//   node build.mjs --drafts   include draft posts (local preview)

import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';
import matter from 'gray-matter';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const POSTS_DIR = path.join(ROOT, 'posts');
const INCLUDE_DRAFTS = process.argv.includes('--drafts');

// Frontmatter keys that drive the build/homepage rather than the visible info
// lines (mirrors scripts/frontmatter.js RESERVED_KEYS, plus our own).
const RESERVED_KEYS = new Set(['title', 'subtitle', 'matterDataPrefix', 'date', 'category', 'draft']);

// Layout ids we must not let a heading slug collide with.
const RESERVED_IDS = ['title', 'subtitle', 'information', 'content', 'links', 'toc', 'toc-fab', 'toc-overlay'];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Fill {{key}} placeholders. Function replacers avoid `$`-sequences in the
// values (KaTeX/code output, prices, etc.) being treated as replace patterns.
function fill(template, values) {
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.replaceAll(`{{${key}}}`, () => value);
  }
  return out;
}

// Copied verbatim from scripts/toc.js so slugs match the client sandbox.
function slugify(text) {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'section';
}

// ---------------------------------------------------------------------------
// markdown pipeline
// ---------------------------------------------------------------------------

// Per-parse sink for TOC entries + used ids, reset before each renderPost().
let headingSink = null;

const marked = new Marked();
// strict:'ignore' silences build-log noise from minor LaTeX quirks in post
// content (e.g. a literal ‖ instead of \Vert); rendering is unchanged.
marked.use(markedKatex({ throwOnError: false, nonStandard: false, strict: 'ignore' }));
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);
// Custom heading renderer: assign a stable id to every h2/h3 (so anchors and the
// pre-rendered TOC line up) and collect the tree. Replaces the client-side
// ensureIds/buildTree in scripts/toc.js.
marked.use({
  renderer: {
    heading(token) {
      const { depth, tokens } = token;
      const inner = this.parser.parseInline(tokens);
      if (depth !== 2 && depth !== 3) {
        return `<h${depth}>${inner}</h${depth}>\n`;
      }
      const base = slugify(token.text);
      let id = base;
      let n = 2;
      while (headingSink.used.has(id)) id = `${base}-${n++}`;
      headingSink.used.add(id);
      headingSink.entries.push({ depth, id, text: token.text });
      return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
    },
  },
});

function renderPost(md) {
  headingSink = { entries: [], used: new Set(RESERVED_IDS) };
  const html = marked.parse(md);
  const toc = headingSink.entries;
  headingSink = null;
  return { html, toc };
}

// h2 -> topic; h3 -> subtopic nested under the closest preceding topic. Mirrors
// buildTree() in scripts/toc.js, emitted as a string instead of DOM nodes.
function renderTocMarkup(entries) {
  if (entries.length === 0) return '';

  const topics = [];
  for (const e of entries) {
    const link = `<a href="#${e.id}" data-target-id="${e.id}">${escapeHtml(e.text)}</a>`;
    if (e.depth === 2 || topics.length === 0) {
      topics.push({ link, subs: [] });
    } else {
      topics[topics.length - 1].subs.push(link);
    }
  }

  let ul = '<ul>';
  for (const t of topics) {
    ul += `<li class="toc-topic">${t.link}`;
    if (t.subs.length) {
      ul += '<ul class="toc-subtopics">';
      for (const s of t.subs) ul += `<li class="toc-subtopic">${s}</li>`;
      ul += '</ul>';
    }
    ul += '</li>';
  }
  ul += '</ul>';

  return (
    `<nav id="toc" aria-label="Table of contents">${ul}</nav>` +
    '<button id="toc-fab" type="button" aria-label="Toggle table of contents" aria-expanded="false">☰</button>' +
    '<div id="toc-overlay"></div>'
  );
}

// ---------------------------------------------------------------------------
// frontmatter -> header (mirrors renderFrontmatter in scripts/frontmatter.js)
// ---------------------------------------------------------------------------

function authorName(author) {
  if (typeof author === 'string') return author;
  return author?.name;
}

function infoLine(label, value) {
  if (value === null || value === undefined) return '';
  return `<p><b>${escapeHtml(label)}:</b> ${escapeHtml(value)}</p>`;
}

function renderInformation(data) {
  let html = '';
  for (const [key, value] of Object.entries(data)) {
    if (RESERVED_KEYS.has(key)) continue;
    if (key === 'author') {
      html += infoLine('by', authorName(value));
    } else if (key === 'metadata' && value && typeof value === 'object') {
      for (const [metaKey, metaValue] of Object.entries(value)) {
        html += infoLine(metaKey, metaValue);
      }
    } else {
      html += infoLine(key, value);
    }
  }
  return html;
}

// ---------------------------------------------------------------------------
// homepage
// ---------------------------------------------------------------------------

function renderHomeLists(entries) {
  const sections = [
    { label: 'Studies', category: 'study' },
    { label: 'Posts', category: 'post' },
  ];

  let html = '';
  for (const { label, category } of sections) {
    const items = entries
      .filter((e) => e.category === category)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    if (items.length === 0) continue;

    html += `<ul><p>${escapeHtml(label)}</p>`;
    for (const item of items) {
      html +=
        `<li><a href="/posts/${item.slug}/">` +
        `${escapeHtml(item.title)}<span>${escapeHtml(item.date)}</span></a></li>`;
    }
    html += '</ul>';
  }

  return html || '<ul><p>Posts</p><li><span>Nothing here yet.</span></li></ul>';
}

// ---------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------

async function build() {
  const layout = await readFile(path.join(ROOT, 'layout.html'), 'utf8');
  const homeTemplate = await readFile(path.join(ROOT, 'home.html'), 'utf8');

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const dirents = await readdir(POSTS_DIR, { withFileTypes: true });
  const slugs = dirents.filter((d) => d.isDirectory()).map((d) => d.name).sort();

  const homeEntries = [];
  let built = 0;

  for (const slug of slugs) {
    const mdPath = path.join(POSTS_DIR, slug, 'index.md');
    let raw;
    try {
      raw = await readFile(mdPath, 'utf8');
    } catch {
      console.warn(`skip ${slug}: no index.md`);
      continue;
    }

    const { data, content } = matter(raw);

    if (data.draft && !INCLUDE_DRAFTS) continue;
    if (data.draft) console.warn(`including draft: ${slug}`);

    const { html, toc } = renderPost(content);
    const description = String(data.subtitle || data.title || '').replace(/\s+/g, ' ').trim();

    const page = fill(layout, {
      title: escapeHtml(data.title || slug),
      description: escapeHtml(description),
      headerTitle: escapeHtml(data.title || ''),
      subtitle: escapeHtml(data.subtitle || ''),
      information: renderInformation(data),
      content: html,
      toc: renderTocMarkup(toc),
    });

    const outDir = path.join(DIST, 'posts', slug);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'index.html'), page);
    built += 1;

    if (!data.draft) {
      if (!data.category) console.warn(`${slug}: no category — will not appear on homepage`);
      if (!data.date) console.warn(`${slug}: no date`);
      homeEntries.push({
        slug,
        title: data.title || slug,
        date: data.date ? String(data.date) : '',
        category: data.category,
      });
    }
  }

  // homepage
  const home = fill(homeTemplate, { lists: renderHomeLists(homeEntries) });
  await writeFile(path.join(DIST, 'index.html'), home);

  // static assets
  await cp(path.join(ROOT, 'styles'), path.join(DIST, 'styles'), { recursive: true });
  await cp(path.join(ROOT, 'assets'), path.join(DIST, 'assets'), { recursive: true });
  await mkdir(path.join(DIST, 'scripts'), { recursive: true });
  await cp(path.join(ROOT, 'scripts', 'post-toc.js'), path.join(DIST, 'scripts', 'post-toc.js'));
  await cp(path.join(ROOT, '404.html'), path.join(DIST, '404.html'));

  // self-hosted KaTeX css + fonts (css references fonts/ by relative path)
  const katexDist = path.join(ROOT, 'node_modules', 'katex', 'dist');
  await cp(path.join(katexDist, 'katex.min.css'), path.join(DIST, 'styles', 'katex.min.css'));
  await cp(path.join(katexDist, 'fonts'), path.join(DIST, 'styles', 'fonts'), { recursive: true });

  console.log(`built ${built} post(s) + homepage -> dist/`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
