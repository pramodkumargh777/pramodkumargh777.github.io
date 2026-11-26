# Changes — portfolio redesign

Branch: `redesign` (small commits on top of `main` @ `4440823`). The site is still static: vanilla HTML/CSS/JS, no build step, no CDN dependencies. See [AUDIT.md](AUDIT.md) for the audit, research and plan that was approved.

## Results

| Page | Mode | Perf | A11y | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|---|
| `/` | mobile | **100** | **100** | **100** | **100** | 1.1 s | 0 |
| `/` | desktop | **100** | **100** | **100** | **100** | 0.3 s | 0 |
| `/work/adike-naadi.html` | mobile / desktop | **100** / **100** | **100** / **100** | **100** / **100** | **100** / **100** | 1.1 s / 0.6 s | 0 |
| `/work/enterprise-genai.html` | mobile / desktop | **100** / **100** | **100** / **100** | **100** / **100** | **100** / **100** | 1.4 s / 0.3 s | 0 |
| `/work/predictive-inventory.html` | mobile / desktop | **100** / **100** | **100** / **100** | **100** / **100** | **100** / **100** | 1.4 s / 0.3 s | 0 |
| `/404.html` | mobile / desktop | 100 | 100 | 100 | 63\* | 1.1 s / 0.3 s | 0 |

\* The 404 page is deliberately `noindex`, and Lighthouse's SEO check penalises that. This is expected.

**Before:** Perf 99 / A11y 92 / BP 96 / SEO 100 (mobile).
**axe-core** (WCAG 2.2 AA + best practice): **0 violations** on all 5 pages in dark and light. The command palette, the mobile menu and the toast were also checked while open, again in both themes.
**Overflow:** none at 375 / 768 / 1440 px on any page or theme.
**Screenshots:** [`audit/before/`](audit/before/) (PNG) and [`audit/after/`](audit/after/) (30 WebP files: 5 pages × 2 themes × 3 widths).

Tooling: Lighthouse 13.6, axe-core via Playwright, headless Brave 155. All of it was installed outside the repo.

## What changed

> **27 Nov follow-up:** "IoT" framing removed. The AXISCADES case study moved from `/work/industrial-iot.html` to `/work/predictive-inventory.html`, and the work card, career entry and meta descriptions now say backend & data. The portrait outline is now concentric (even gap all round) instead of an offset frame, on the site and in `og-image.png`.

### Design system
- **Colour:** dark-first `#0b1410` with `#101b16` kept as the brand surface. One warm-lime accent `#cfe38a`. An optional light theme, saved in `localStorage` (wrapped in `try/catch`) and applied before first paint so there's no flash.
- **Type:** Instrument Serif (display), Geist (UI/body) and Geist Mono (labels, dates, numbers). They're self-hosted latin `woff2` subsets (~83 KB total) with `font-display: swap`, and the two above-the-fold files are preloaded. The scale is fluid, using `clamp()` at a ratio of about 1.25.
- **Layout:** 12-column grid with fluid gutters. The numbered sections 01–05 are kept as an editorial motif.
- **Details:**
  - Grain overlay and a soft radial glow behind the hero
  - Hairline borders; cards lift with a border highlight and a cursor-aware spotlight
  - IntersectionObserver scroll reveals
  - Sticky blurred nav with an active-section indicator
  - **⌘K / Ctrl+K** quick-nav palette (sections, case studies, copy email, theme, links)
  - Sonner-style toast
- **Reduced motion:** all of the above respects `prefers-reduced-motion`. The ticker stops completely and turns into a static, wrapped list, and the reveals, the status-dot ping and smooth scrolling are switched off. The ticker also has a visible pause button (WCAG 2.2.2).
- **Mobile:** a full-screen sheet menu with a focus trap, Esc to close and focus returned to the trigger. Every control is at least 44 px.

### Homepage (`index.html`)
1. **Hero**
   - Status chip: "Open to senior GenAI / backend roles · Bengaluru".
   - H1: *"I build AI systems that hold up in production."* The secondary line "Serious about the work. Curious about everything." is kept.
   - "View work" and "Download résumé" CTAs, plus GitHub, LinkedIn and email icons.
   - Portrait served as AVIF/WebP with `srcset`.
2. **Proof strip (bento):** 40% fewer stockouts, ~$200K est. annual savings, 30% faster APIs, 75% faster deploys, 6+ years, and a live-product tile for Adike Naadi.
3. **01 Selected work:** rich cards, each with role, years, a one-line problem, one outcome, stack chips and links.
   - **Adike Naadi** is the large hero card, with real captures in a browser frame and a phone frame.
   - **ITC Infotech** (enterprise RAG and agents) and **AXISCADES** (predictive inventory backend).
   - **Regulated healthcare software** (Siemens Healthineers and Philips), reframed around DICOM, imaging pipelines and reliability.
4. **Ticker:** a real marquee now. It was a clipped static strip before.
5. **02 Career:** vertical timeline with company names styled as text "logos", dates in mono, 2–3 impact bullets each, and education. Hovering an entry dims its siblings. `id="experience"` is kept so old links still work.
6. **03 Stack:** grouped by capability (Build agents / Ship backends / Data / Deploy). A "Where I go deep" panel covers RAG evaluation, guardrails, embeddings and edge deployment.
7. **04 About:** ~90 words plus a compact "Off the clock" row (tennis, psychology, economics, books). The six large interest cards are gone.
8. **05 Contact:** *"Have a hard AI or backend problem? Let's talk."* A copy-email button with a toast, plus Email, LinkedIn, GitHub, a Calendly placeholder (TODO) and a facts panel.
9. **Footer:** the `G HBUILT` separator bug is fixed (each part is its own element with real spacing). The logo now links to `#top`, and every nav anchor resolves (checked automatically).

### New pages
- **`/work/adike-naadi.html`**
  - Chapters: Problem → Users → Solution → Architecture (inline, theme-aware SVG) → Decisions & trade-offs → Bilingual AI assistant → Results → What's next.
  - Sticky table of contents with scroll-spy and a progress bar.
  - Seven captures in device frames.
- **`/work/enterprise-genai.html`** (ITC Infotech): context, architecture SVG, RAG quality, agents and guardrails, outcomes. No client names, data or internal agent names.
- **`/work/predictive-inventory.html`** (AXISCADES): MQTT → Python ingestion → PostgreSQL → Flask APIs, plus Jenkins/Docker delivery. Results are stated as team outcomes.
- **`/404.html`** in the same style ("Lost *in the middle.*"), with the ⌘K palette.

### SEO / tech
- Each page has its own `<title>`, meta description, canonical URL, `og:*` tags (type, url, image, dimensions, alt) and `twitter:card=summary_large_image`.
- **JSON-LD:**
  - `Person` on the homepage: name, jobTitle, url, image, email, address, worksFor, `alumniOf` SJCE, knowsAbout, and `sameAs` LinkedIn and GitHub.
  - `Article` on each case study.
- **`og-image.png`:** a designed 1200×630 card, rendered from [`assets/og/source.html`](assets/og/source.html) with headless Chromium.
- **Icons:** `favicon.svg` is drawn from the actual Instrument Serif "P" glyph. There's also a 180 px `apple-touch-icon.png` and a 16/32/48 `favicon.ico`.
- **`robots.txt` and `sitemap.xml`:** `/audit/` and the OG source are disallowed.
- **Accessibility:** semantic landmarks, a skip link, a strong `:focus-visible` ring, descriptive alt text on every image, and labelled SVG diagrams (`<title>`/`<desc>`).
- **Performance:**
  - Self-hosted fonts, so Google Fonts no longer blocks rendering.
  - The portrait went from a 131 KB JPG to an 11–44 KB AVIF via `srcset`.
  - Images have explicit `width`/`height` and are lazy-loaded below the fold.
  - Hero copy is excluded from the scroll reveal, which brought mobile LCP from 2.4 s down to 1.1 s.
- `photo.jpg` is kept in place so existing external links don't break. The site no longer loads it.

## Content sources

### Restored from git history

| Fact used | Where it appears | Source commit |
|---|---|---|
| 15+ LLM agents in production, ~40% less manual ticket triage | Work card, Career, `enterprise-genai.html` | `dd3cd04` (restore approved by you) |
| 10,000+ documents through a 7-stage ingestion framework | Career, Stack depth, `enterprise-genai.html` | `dd3cd04` (restore approved by you) |
| Deployed across two large enterprise environments | Career, `enterprise-genai.html` | `55d5ac5` (restore approved by you) |
| LLM routing layer: health probing, p95 routing, per-project budgets; MCP integration | `enterprise-genai.html`, Stack | `dd3cd04` |
| Celery + Redis with retries, circuit breakers, task claiming (no number used) | `enterprise-genai.html`, Stack | `dd3cd04` |
| Azure Container Apps, Azure DevOps CI/CD across Dev, Test and Production; Azure AI Search; layout-aware document extraction | `enterprise-genai.html` | `dd3cd04` |
| "Agents that admit doubt": evals, confidence, graceful "I don't know" | Stack depth, `enterprise-genai.html` | `dd3cd04` |
| LLM Evals ("unit tests of GenAI"), Pydantic validation of LLM output, embeddings tuned on real queries, "prompt-only agents: never again", "Lost in the Middle" chunk ordering | Stack depth, `enterprise-genai.html` | `dd3cd04` |
| Extra tools: LangGraph, SQLAlchemy, Alembic, Pydantic, Celery, Redis, Azure AI Search, Pytest (C++ later removed to match the résumé) | Stack | `dd3cd04` |
| AXISCADES 30% faster API "through query optimisation and indexing" | Proof strip, Career, `predictive-inventory.html` | `dd3cd04` |
| Philips: PACS in Python (C++ dropped to match the résumé), DICOM compliance for device interoperability, Remote | Career, healthcare card | `dd3cd04` |
| Siemens Healthineers (name approved by you): angiography performance tooling in Python, X-ray visualisation to DICOM standards; Artis icono release and hazard-related safety features | Career, healthcare card | `dd3cd04` |
| SJCE Mysuru, B.E. Electronics & Instrumentation, 2016–2020 | Career, JSON-LD `alumniOf` | `dd3cd04` |
| "At heart I'm a backend engineer: APIs, data models, concurrency and systems that keep working at 3 a.m." | About | `dd3cd04` |
| Portrait alt text (puffer jacket, Himalayan peaks) and the "Above the snowline" caption | Hero | `dd3cd04` / `42106e6` |
| Copy-email button pattern | Contact, palette | `dd3cd04` |
| "Built with curiosity, compounded daily." | Footer | `dd3cd04` |
| Adike Naadi: "answers from grounded sources rather than model memory", Python pipelines and quality checks, SEO/content workflows | `adike-naadi.html` | `55d5ac5`, `5e30aa1` |

**Not restored:**
- ITC "200+ users / 5 BUs", "~3× throughput", "~25% inference cost", "1,000+ concurrent tasks" and "35% latency". You chose not to restore these.
- ITC internal agent names (client detail).
- A personal contact detail removed in `42106e6`.

### From your résumé and screenshots (27 Nov 2026)
- **Résumé:** Adike Naadi "2025 – Present", "Founder & Sole Developer", AGMARKNET API ingestion with outlier checks against the recent median, automated tests gating deployment, Qwen3-30B + BGE-M3 on Workers AI, answer-sentence grounding checks with retry and data-only fallback, SEO-friendly market/variety pages, and automated daily rates videos with AI voice-over.
- **Google Search Console** (adikenaadi.com, last 28 days): 65 clicks, 2.02K impressions, 3.2% CTR, avg. position 7.9.
- **Facebook reels** (Adike Naadi page): 186K views on the top reel; the visible reels add up to 190K+.
- **Cloudflare analytics** (adikenaadi.com): 10.31K visits and 32.02K requests in the last 30 days; 9.91K pageviews and 8.42K visits in the last 14 days. Singapore is the top country, which suggests part of this is crawler traffic, so the site says "visits", not "users".

### Read from the live site (adikenaadi.com, 27 Nov 2026)
- **Sources:** MAMCOS, TSS, TMS Sirsi, TUMCOS and AGMARKNET/data.gov.in, plus KRAMA arrivals. Every rate carries its date and source.
- **Coverage:** prices since 2014 from 50+ markets.
- **Features:** WhatsApp channel, Kannada/English toggle, "Sell now or wait?", market comparison with CSV export, anomaly flags with no interpolation.
- **Forecast evaluation:** "not yet better than last month's price", tested on 34 months.
- **Assistant:** cited sources S1–S4 and D1–D4, the "How this answer was made" panel, the no-assumed-costs prompt, a data-only fallback, a refusal to paraphrase scanned text, 30 questions/hour, questions not stored, a Workers AI Qwen3 model and the disclaimers.
- **Screenshots:** all 7 captures in [`assets/adike-naadi/`](assets/adike-naadi/) are real. None are placeholders.

## Optional additions

All visible TODO placeholders were removed from the site on 27 Nov 2026. These can be added back later if you want them:

- **Calendly** button in Contact (`index.html`, next to the GitHub button; the `#i-calendar` icon is already in the sprite).
- **Adike Naadi GitHub** link on the work card, if the repo becomes public.
- **More Adike Naadi results:** WhatsApp channel followers, assistant questions/month, p95 API latency, monthly infra cost (`work/adike-naadi.html`, Results).
- **User research** paragraph in the Adike Naadi "Users" chapter, and a **roadmap** in "What's next".
- **Decisions table:** the "Why" column was inferred from how the product behaves; worth a read to make sure it matches your reasoning.
