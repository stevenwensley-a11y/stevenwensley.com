# Changelog

This file is a high-level log of merged PRs. Each PR description on
GitHub remains the source of truth; this is a quick scannable index.

## PR #3 — SEO + syndication leverage  *(claude/seo-syndication)*

Builds on the Eleventy infrastructure from PR #2 to add:

**Auto-generated artefacts**
- `/sitemap.xml` — generated from `/src/_data/staticPages.js` and the
  `collections.insights` collection. Insights `lastmod` always reflects
  `dateModified` from frontmatter; no more stale dates.
- `/feed.xml` — Atom 1.0 feed for RSS readers (Feedly, NewsBlur, ...).
- `/feed.json` — JSON Feed 1.1 for modern aggregators.
- Both feeds discoverable from every article via
  `<link rel="alternate" type="application/atom+xml">` and
  `<link rel="alternate" type="application/feed+json">`.

**SEO**
- `BreadcrumbList` Schema.org JSON-LD on every insights article
  (Home → Insights → article). Renders breadcrumb trails in Google SERPs.

**Author UX**
- Tag-based "Related Articles" — `relatedByTags` filter picks 2 articles
  with highest topical-tag overlap. Manual `related:` frontmatter still
  overrides for editorial control.

**Cleanup**
- Footer "About" no longer links to `/about.html` (404) — now `/#about`.
- Footer "Book a Call" no longer links to `/contact.html` (404) — now
  `/book-session.html`.
- Footer "Contact" replaced with `/templates.html`.

**Infrastructure**
- New Eleventy filters: `isoDate`, `rfc822`, `rfc3339`, `orderByDate`,
  `relatedByTags` (in `eleventy.config.js`).
- LinkedIn Insight Tag scaffolding in `head.njk` — disabled by default,
  set `site.linkedinInsightId` to activate.

## PR #2 — Eleventy migration phase 1  *(claude/eleventy-migration)*

Templates the 10 `/insights/*.html` articles using Eleventy v3.

- `/src/` is the new source tree; `_layouts/article.njk` +
  `_includes/{head,nav,footer,skip-link}.njk` extract ~5,000 lines of
  duplicated inline CSS/markup.
- `/insights/*.html` remain committed as build output so GitHub Pages
  serves them unchanged.
- New CI job `build-verify` re-runs `npm run build` and fails on drift.
- Body word count + structural elements verified identical to PR #1.

## PR #1 — Quality-gate QA pass  *(claude/website-qa-improvements-gNj9n)*

Site-wide a11y, SEO, and CI fixes.

- Skip-link, `<main>` landmark, `aria-label="Primary"` on nav across all
  26 pages.
- hreflang en/da/x-default on 21 pages that lacked it.
- Static `<noscript>` h1 on React-rendered tool pages.
- 404.html canonical, OG/Twitter cards, `noindex`.
- Sitemap `lastmod` refreshed.
- Insights `datePublished` spread over 9 weeks; `dateModified` added.
- Image `width/height/loading` on hero portraits.
- WCAG rules re-enabled in `.htmlvalidate.json`.
- Smoke-test `KEY_PAGES` filter and Lighthouse CI scope fixed.
