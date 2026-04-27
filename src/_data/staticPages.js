// Static (non-templated) pages that need to be in the sitemap.
//
// When a page is migrated from root → /src/, REMOVE its entry here and
// the auto-sitemap will pick it up via its frontmatter instead. The goal
// is for this list to shrink to zero as we migrate pages in Phase 2/3.
//
// `lastmod` is the last meaningful content change. It does NOT need to
// be updated on every CSS tweak — only when the actual content changes
// in a way that crawlers should re-index.

module.exports = [
  { loc: "/",                                  lastmod: "2026-04-26", changefreq: "weekly",  priority: "1.0",
    alternates: [{ lang: "en", href: "/" }, { lang: "da", href: "/index-da.html" }] },
  { loc: "/index-da.html",                     lastmod: "2026-04-26", changefreq: "weekly",  priority: "0.9",
    alternates: [{ lang: "en", href: "/" }, { lang: "da", href: "/index-da.html" }] },
  { loc: "/services.html",                     lastmod: "2026-04-26", changefreq: "monthly", priority: "0.9",
    alternates: [{ lang: "en", href: "/services.html" }, { lang: "da", href: "/services-da.html" }] },
  { loc: "/services-da.html",                  lastmod: "2026-04-26", changefreq: "monthly", priority: "0.8",
    alternates: [{ lang: "en", href: "/services.html" }, { lang: "da", href: "/services-da.html" }] },
  { loc: "/ai-governance-assessment.html",     lastmod: "2026-04-26", changefreq: "monthly", priority: "0.9" },
  { loc: "/eu-ai-act-classifier.html",         lastmod: "2026-04-26", changefreq: "monthly", priority: "0.9" },
  { loc: "/book-session.html",                 lastmod: "2026-04-26", changefreq: "monthly", priority: "0.8" },
  { loc: "/templates.html",                    lastmod: "2026-04-26", changefreq: "monthly", priority: "0.8" },
  { loc: "/privacy.html",                      lastmod: "2026-04-26", changefreq: "yearly",  priority: "0.3" },
  { loc: "/cost-of-inaction.html",             lastmod: "2026-04-26", changefreq: "monthly", priority: "0.7" },
  { loc: "/roi-calculator.html",               lastmod: "2026-04-26", changefreq: "monthly", priority: "0.7" },
  { loc: "/ai-readiness-scan.html",            lastmod: "2026-04-26", changefreq: "monthly", priority: "0.7" },
  { loc: "/nis2-gap-assessment.html",          lastmod: "2026-04-26", changefreq: "monthly", priority: "0.8" },
  { loc: "/nis2-implementation-roadmap.html",  lastmod: "2026-04-26", changefreq: "monthly", priority: "0.8" },
  { loc: "/insights.html",                     lastmod: "2026-04-26", changefreq: "weekly",  priority: "0.9" },
];
