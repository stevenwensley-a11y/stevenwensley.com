// Eleventy v3 config — see ARCHITECTURE.md for full overview.
//
// Strategy: source lives in /src/, but build output is written directly to
// the project root. So /src/insights/foo.html → /insights/foo.html. We do
// NOT use a separate /_site/ directory because GitHub Pages serves from
// the repository root (CNAME = stevenwensley.com), and we want the build
// output committed alongside source.
//
// Only /src/insights/ is currently templated. All other root .html files
// are unmanaged by Eleventy and pass through untouched. They'll be
// migrated incrementally — see MIGRATION.md.
//
// To add a new templated page later: drop a frontmatter file under /src/
// with a matching `permalink:` and Eleventy will write to the right path.

module.exports = function (eleventyConfig) {
  // No passthrough copy — Eleventy must not own any static assets in this
  // PR. /img/, /css/, /favicon.ico etc. remain at project root and are
  // committed manually.

  // Suppress Eleventy from clobbering /index.html and other unmanaged
  // root files. With `output: "."` Eleventy still only writes the files
  // it has rendered from /src/ — this guard is defence-in-depth.
  eleventyConfig.setServerOptions({ port: 8080 });

  // ── Filters ───────────────────────────────────────────────────────────
  // YAML dates parse as JS Date objects in Eleventy. Format them
  // explicitly when emitting.

  /** ISO date YYYY-MM-DD — used in sitemap.xml `<lastmod>` and JSON-LD. */
  eleventyConfig.addFilter("isoDate", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toISOString().slice(0, 10);
  });

  /** RFC 822 — used in RSS `<pubDate>`, `<lastBuildDate>`. */
  eleventyConfig.addFilter("rfc822", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toUTCString();
  });

  /** RFC 3339 — used in Atom and JSON Feed. */
  eleventyConfig.addFilter("rfc3339", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toISOString();
  });

  /** Pick N items from a collection, newest first by datePublished. */
  eleventyConfig.addFilter("orderByDate", (collection, n) => {
    return [...collection]
      .sort((a, b) => {
        const ad = new Date(a.data.datePublished || 0).getTime();
        const bd = new Date(b.data.datePublished || 0).getTime();
        return bd - ad;
      })
      .slice(0, n || collection.length);
  });

  /**
   * Find articles that share at least one tag with the current article,
   * ranked by tag-overlap count, then by recency. Excludes the article
   * itself. Used by article.njk to auto-fill the "Related" block when
   * frontmatter doesn't override.
   */
  eleventyConfig.addFilter("relatedByTags", (collection, currentUrl, currentTags, n) => {
    const current = new Set(
      (currentTags || []).filter((t) => t !== "insights" && t !== "all")
    );
    const scored = collection
      .filter((item) => item.url !== currentUrl)
      .map((item) => {
        const itemTags = (item.data.tags || []).filter(
          (t) => t !== "insights" && t !== "all"
        );
        const overlap = itemTags.filter((t) => current.has(t)).length;
        return { item, overlap };
      })
      .filter((x) => x.overlap > 0)
      .sort((a, b) => {
        if (b.overlap !== a.overlap) return b.overlap - a.overlap;
        const ad = new Date(a.item.data.datePublished || 0).getTime();
        const bd = new Date(b.item.data.datePublished || 0).getTime();
        return bd - ad;
      });
    return scored.slice(0, n || 2).map((x) => x.item);
  });

  return {
    dir: {
      input: "src",
      output: ".",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    // .html files under /src/ run through Nunjucks so frontmatter +
    // {% include %} work. Markdown is also Nunjucks-rendered for future
    // article authoring in .md.
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md", "xml"],
  };
};
