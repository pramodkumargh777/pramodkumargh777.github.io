# pramodkumargh777.github.io

Personal portfolio of Pramod Kumar G H. It's a static site for GitHub Pages, written in vanilla HTML, CSS and JS with no build step.

```
index.html               homepage (sections 01–05)
work/*.html              case studies (adike-naadi, enterprise-genai, predictive-inventory)
404.html                 not-found page
assets/css/site.css      design system (tokens, dark + light theme, components)
assets/js/site.js        interactions (theme, nav, sheet menu, reveal, ⌘K palette, toast)
assets/fonts/            self-hosted Instrument Serif, Geist, Geist Mono (OFL)
assets/img/              responsive portrait (AVIF/WebP)
assets/adike-naadi/      product screenshots (1x + @2x WebP)
assets/og/source.html    source for og-image.png (render at 1200×630 in headless Chromium)
googleddf0941e09246b25.html  Google Search Console ownership file — keep it, or verification is lost
assets/data/rashi-monthly.json  Adike Naadi price series for the homepage chart (auto-updated)
scripts/update-market-data.mjs  fetches that series from the Adike Naadi API (`node scripts/update-market-data.mjs`)
.github/workflows/update-market-data.yml  runs the script daily at 09:00 IST and commits only when the data changes
```

**Preview locally:** run `python3 -m http.server` in the repo root and open http://localhost:8000. Use a server rather than `file://`, because the pages use root-relative paths.

See [AUDIT.md](AUDIT.md) for the design audit and [CHANGES.md](CHANGES.md) for the redesign summary and the open TODOs.
