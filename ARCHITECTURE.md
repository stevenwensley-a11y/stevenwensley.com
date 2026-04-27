# stevenwensley.com — site architecture

This document explains how the site is built. It is the canonical reference
for anyone (Steven, future contributors, Claude in a later session) who
needs to add a page, change shared chrome, or understand why a file lives
where it does.

## High-level

The site is a static, multi-language portfolio + lead-gen funnel for an AI
governance / programme management consultancy in Copenhagen. It is hosted
on **GitHub Pages** at the apex domain `stevenwensley.com` (via `CNAME`).

## Auto-generated artefacts

These files are **build outputs** — do not edit by hand. They are
regenerated from `/src/` on every `npm run build` and CI fails if the
committed copy drifts from the freshly built version.

| File | Source | Generator |
|---|---|---|
| `/sitemap.xml` | `/src/_data/staticPages.js` + `collections.insights` | `/src/sitemap.njk` |
| `/feed.xml` | `collections.insights` | `/src/feed.njk` (Atom 1.0) |
| `/feed.json` | `collections.insights` | `/src/feed.json.njk` (JSON Feed 1.1) |
| `/insights/*.html` | `/src/insights/<slug>.html` + `_layouts/article.njk` | Eleventy |
| `/fonts/*.woff2` + `/fonts/fonts.css` | Google Fonts API | `/scripts/fetch-fonts.py` (one-shot, idempotent) |


GitHub Pages serves the **repository root** as the document root. So
`/index.html`, `/services.html`, `/insights/foo.html` etc. are the actual
deployed URLs.

## Build pipeline

```
   /src/               ──[ npm run build ]──▶   /insights/*.html
   ├── _data/                                   (committed alongside source)
   ├── _includes/
   ├── _layouts/
   └── insights/*.html  (frontmatter + body)
```

Eleventy v3 (`eleventy.config.js`) reads from `/src/`, processes Nunjucks
templates, and writes the rendered HTML directly to the project root
(`output: "."`). The build output is **committed** so GitHub Pages can
serve it without an extra deploy step.

CI (`.github/workflows/test.yml` job `build-verify`) re-runs the build on
every push / PR and `git diff --exit-code` against the committed
`/insights/*.html`. If a contributor edits `/src/` but forgets to commit
the rebuild, CI fails.

### Why not output to `_site/` and deploy via GH Actions?

That's the standard 11ty deploy pattern, and it's the right long-term
target. We didn't do it in this PR because:

1. It requires Steven to switch the GitHub Pages source from
   "Deploy from branch (main)" to "GitHub Actions" in repo settings.
2. We wanted a strictly additive PR that did not change the deployment
   model — only the authoring model.

When ready to flip: drop `output: "_site"` in the config, add a deploy
workflow using `actions/deploy-pages@v4`, switch Pages settings, delete
committed `/insights/*.html` from main. See `MIGRATION.md` Phase 4.

## Directory map

```
/                              project root, served by GitHub Pages
├── /index.html                ← unmanaged (will migrate in later PR)
├── /services.html             ← unmanaged
├── /insights.html             ← unmanaged (hub page)
├── /privacy.html              ← unmanaged
├── /404.html                  ← unmanaged
├── /<tool>.html               ← React-based, will not be templated
├── /insights/*.html           ← BUILD OUTPUT from /src/insights/
├── /img/, /favicon.ico, ...   ← static assets, untouched by Eleventy
│
├── /src/                      ← Eleventy input (NOT served — input dir)
│   ├── _data/
│   │   └── site.js            ← site-wide vars: URL, GA4 ID, nav links
│   ├── _includes/
│   │   ├── head.njk           ← <head> block (meta, OG, JSON-LD)
│   │   ├── nav.njk            ← <nav> with skip-link target
│   │   ├── footer.njk         ← three-column footer
│   │   ├── skip-link.njk      ← skip-to-main-content style block
│   │   └── article-styles.css ← canonical article CSS (~512 lines)
│   ├── _layouts/
│   │   └── article.njk        ← layout for /insights/* articles
│   └── insights/
│       └── <slug>.html        ← frontmatter + body, one per article
│
├── /scripts/
│   └── extract-insights.py    ← one-shot: legacy /insights/*.html → /src/
│
├── /tests/                    ← Playwright smoke tests
├── /.github/workflows/test.yml ← CI: build-verify, html-validate, links, lighthouse, playwright
├── eleventy.config.js
└── package.json
```

## Article frontmatter contract

Every file under `/src/insights/<slug>.html` has YAML frontmatter that
drives `_layouts/article.njk`. All fields are documented inline at the top
of `article.njk`. Required:

- `layout: article.njk`
- `title`, `description`
- `slug`, `permalink: /insights/<slug>.html`
- `canonical`, `hreflang` (array)
- `datePublished`, `dateModified`
- `tag` (singular display label) and `tags` (array, must include `"insights"` for collection membership; other entries are topical for tag-based "related" matching)
- `displayDate`, `readTime`, `lead`
- `jsonLd` (raw object emitted as Article schema)
- `cta` (heading, body, buttons, divider) — different per article

Optional:
- `related` — array of `{ slug, title, description }`. Manual override.
  If omitted, the layout auto-fills 2 articles by tag overlap (uses the
  `relatedByTags` filter in `eleventy.config.js`, ranking by shared
  topical tag count and breaking ties by recency).

`BreadcrumbList` JSON-LD is built automatically from `title` + `permalink`
(Home → Insights → article) and emitted alongside the Article schema.

Body (the article prose) lives below the `---` frontmatter terminator and
is straight HTML.

## Adding a new article

1. Create `/src/insights/<slug>.html` with frontmatter (copy from an
   existing article and edit).
2. Write body in HTML (`<p>`, `<h2>`, `<ul>` etc).
3. Run `npm run build`.
4. Commit both `/src/insights/<slug>.html` and the generated
   `/insights/<slug>.html`.
5. Add the article to `/sitemap.xml`. (Auto-generation from a 11ty
   collection is a follow-up.)

## Local development

```sh
npm install
npm run build         # one-shot build
npm run build:watch   # rebuild on /src/ changes
npm run serve         # 11ty dev server on :8080 with live reload
npm run verify        # build + diff against committed /insights/
```

## Self-hosted fonts (PR #4)

Two webfonts are served from `/fonts/`, downloaded once from Google
Fonts and committed:

- **DM Serif Display** 400 + 400 italic (display headings)
- **Space Grotesk** 300, 400, 500, 600, 700 (body + UI)

Each weight × style is split into Latin, Latin Extended, and (for Space
Grotesk) Vietnamese unicode-range subsets — exactly as Google Fonts
serves them. Browsers fetch only the subsets they need based on the
`unicode-range` declarations in `/fonts/fonts.css`. Typical English
page hits 2 files; a Danish page hits 4.

Why self-host:

| Before | After |
|---|---|
| 5 network connections (preconnect ×2 + CSS + 2 woff2, all to fonts.googleapis.com / fonts.gstatic.com) | 3 same-origin requests (CSS + 2 preloaded woff2) |
| Third-party data leak: Google sees every page view via the CSS request | Zero third-party font requests |
| Font version pinned to whatever Google serves today | Font version pinned to the woff2 in `/fonts/` (refresh via `npm run fetch:fonts`) |
| GDPR concern in EU jurisdictions (German court rulings 2022) | No external transfer triggered by font load |

To refresh fonts (e.g. when adding a weight or pinning a new version):

```sh
python3 scripts/fetch-fonts.py
git add fonts/
git commit -m "fonts: refresh"
```

The script is idempotent — already-downloaded files are skipped on
subsequent runs.

## SEO + syndication infrastructure (PR #3)

The Eleventy build now emits:

1. **`/sitemap.xml`** — auto-generated from `/src/_data/staticPages.js`
   (hand-curated list of non-templated pages) plus `collections.insights`
   (any article in `/src/insights/`). When a page migrates from root →
   `/src/`, remove it from `staticPages.js` so the auto-discovery picks
   it up via its frontmatter.

2. **`/feed.xml`** (Atom 1.0) — for Feedly, NewsBlur, Inoreader and
   anyone who reads via RSS aggregators. Auto-discovered by browsers via
   `<link rel="alternate" type="application/atom+xml">` in every
   article's `<head>`.

3. **`/feed.json`** (JSON Feed 1.1) — modern alternative to RSS, well
   supported by NetNewsWire, Reeder, and many feed-to-Slack/Discord
   bridges. Same content as Atom; some readers prefer one over the
   other.

4. **`BreadcrumbList`** Schema.org JSON-LD on every insights article —
   helps Google show breadcrumb trails in search results.

5. **Tag-based "related articles"** — `relatedByTags` filter in
   `eleventy.config.js` picks 2 articles with highest topical-tag
   overlap. Excludes the `"insights"` collection tag from scoring.
   Falls back to manual `related:` frontmatter if set (editorial
   override always wins).

6. **LinkedIn Insight Tag** scaffolding — disabled by default. Set
   `site.linkedinInsightId` in `/src/_data/site.js` to a 7-digit
   Campaign Manager partner ID to activate. Useful for future LinkedIn
   Ads retargeting.

## What is NOT yet templated

Everything outside `/insights/`, `/sitemap.xml`, `/feed.xml`, `/feed.json`
is still hand-edited HTML at project root. See `MIGRATION.md` for the
planned phasing and rationale.
