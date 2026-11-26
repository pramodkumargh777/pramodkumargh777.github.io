# Portfolio audit — pramodkumargh777.github.io

Audit of `main` @ `53df6dc` (identical content to `4440823`), run 27 Nov 2026.

**Tooling:** `playwright-core` driving headless Brave (Chromium 155), Lighthouse 13.6.0, `@axe-core/playwright` (WCAG 2.0/2.1/2.2 A+AA + best practice). The tools were installed outside the repo, so nothing was added to the site.

**Screenshots:** [`audit/before/`](audit/before/) has full-page captures at 375 / 768 / 1440 px. The site is dark-only, so there's no light capture. No horizontal overflow at any width.

---

## 1. Baseline scores

| Lighthouse | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 99 | 92 | 96 | 100 |
| Desktop | 100 | 92 | 96 | 100 |

Mobile timings: FCP and LCP 1.6 s, TBT 0 ms, CLS 0.011, page weight 269 KiB.

| Failing audit | Cause |
|---|---|
| `color-contrast` (axe: serious ×5) | Career dates `#69756a` on `#f4f0e6` = **4.23:1** at 11px, below the 4.5:1 AA minimum |
| `errors-in-console` | `/favicon.ico` returns 404 |
| `render-blocking` (~810 ms mobile) | Google Fonts CSS (3 families, 9 weights) |
| `image-delivery` (~102 KiB) | `photo.jpg` (760×1351, 131 KB) shown at 250 px. No WebP/AVIF, no `srcset`, no `width`/`height` |
| `cache-insight` | GitHub Pages default caching. Not fixable from the repo. Keep bytes small instead |

## 2. Findings

### Visual hierarchy
- The H1 is a personality tagline ("Serious about the work…"), so the first screen doesn't say what Pramod does or for whom. The value proposition sits in an 18px lead paragraph.
- The strongest proof (40% fewer stockouts, ~$200K, 30%, 75%) is in small career bullets on a light section halfway down. None of it is above the fold.
- **Adike Naadi**, the only live product, uses the same layout as the other cards apart from a tinted background, and has no imagery.
- **About** has six large interest cards. They take up as much visual weight as the whole Work section and push Contact down.
- Stack is a flat list of tags with no sense of depth or capability.

### Typography
- Playfair Display is a high-contrast Didone. At `-0.055em` tracking it gets cramped at large sizes, and its hairlines break up on low-DPI screens.
- The labels are tiny. Mono eyebrows are 10–11px at `0.12em` tracking, and the **mobile nav drops to 8–9px**, which is unreadable. 78 text elements are under 12px.
- Only H1/H2 use `clamp()`. The rest of the scale is fixed px, with no consistent ratio.

### Spacing & layout
- There's no grid system. It's ad-hoc `grid-template-columns` per section (1.5fr/.55fr, 190px/1fr, 4-up, 3-up).
- The light Career band breaks the dark rhythm with a hard edge. The lime Contact block is effective but also abrupt.
- Mobile gutters are 18px, which is tight next to 49px+ headlines.

### Color & contrast (WCAG AA)
- Dark palette passes: ivory `#f4f0e6` on `#101b16` is about 16:1, and muted `#a4b0a6` is about 8:1.
- **Fails:** career dates at 4.23:1 (above).
- Borders `#34443a` on `#101b16` are about 1.7:1. That's fine for decoration, but some cards rely on them to show they're interactive.

### Motion
- The only motion is a hover `translateY(-2px)`.
- `scroll-behavior: smooth` ignores `prefers-reduced-motion`.
- The ticker is static and cut off with `overflow:hidden`, so it reads as a bug, not a marquee.

### Mobile navigation
- There's no menu. Four links are squeezed into the header at 8–9px.
- **Tap targets are 10px tall** (WCAG 2.5.8 asks for at least 24px, and the brief asks for 44px). "Visit product" is 14px tall, and the footer links are 13px.

### Anchors & links
- All in-page anchors resolve. `#stack` exists but isn't in the nav.
- The logo links to `#`, not `#top`.
- **Footer bug:** the three `<span>`s have no whitespace between them, so `textContent` (screen readers, reader mode, copy/paste, search snippets) reads *"…PRAMOD KUMAR G H**BUILT** WITH CURIOSITY · BENGALURU, INDIA**ADIKE NAADI**GITHUB"*.
- Earlier commits linked `resume.pdf`, which has never been in the repo (404).

### SEO & meta
- Has `<title>`, description, `og:title`, `og:description` and `og:image`.
- **Missing:** canonical, `og:url`, `og:type`, `twitter:card`, JSON-LD, favicon, apple-touch-icon, `robots.txt`, `sitemap.xml` and a 404 page.
- `og:image` points to the portrait JPG (9:16), which social cards crop badly. It should be a 1200×630 card.

### Performance
- It's already fast because the page is a single 18 KB HTML file.
- The main costs are the Google Fonts round trips (`googleapis` → `gstatic`) and an oversized JPG.
- There's no lazy-loading, and the `<img>` has no intrinsic size.

### Accessibility
- There's no skip link.
- `:focus-visible` is the browser default, which is barely visible on the lime buttons.
- Section landmarks have no labels.
- The H2 styling is inline (`style="color:var(--lime)"`).
- Two H3s say "Siemens Healthcare", which isn't wrong but is ambiguous.
- The portrait alt text is generic ("Portrait of Pramod Kumar"). Commit `dd3cd04` had much better alt text (see §4).

---

## 3. Current design patterns (research)

These patterns came up again and again across the references. I'll rebuild each one in vanilla HTML/CSS/JS, in my own design. Nothing is copied.

| # | Pattern | Reference | How I'll adapt it |
|---|---|---|---|
| 1 | **Editorial serif display + neutral sans + mono metadata** | [Awwwards portfolio winners](https://www.awwwards.com/websites/winner_category_portfolio/), [Godly](https://godly.website), [rauno.me](https://rauno.me) (mixed-style inline headline) | Instrument Serif for H1/H2 (italic for the accent phrase), Geist for UI and body, Geist Mono for dates, labels and section numbers. One fluid `clamp()` scale, ratio ≈1.25. |
| 2 | **Bento grid, used only for mixed content** | [spoko.space — 2026 trends](https://spoko.space/blog/modern-website-design-trends/) ("works for heterogeneous content, badly for lists"), [redesignr.ai](https://redesignr.ai/blog/modern-web-design-trends-2025), [Linear](https://linear.app) | The proof strip (6 tiles of different sizes) and the Stack-by-capability block. Career stays a list, following that warning. |
| 3 | **Sticky nav with in-page jump links and active indicator** | [brittanychiang.com](https://brittanychiang.com) (`aria-label="In-page jump links"`, sticky column) | A sticky, blurred top bar. An IntersectionObserver moves a sliding indicator under the current section, and sets `aria-current`. |
| 4 | **Hover-dim lists + cursor spotlight** | [brittanychiang.com](https://brittanychiang.com) (`group-hover/list:opacity-50`, cursor-following radial gradient) | Project cards get a radial glow positioned from CSS `--x/--y` vars, plus a lift and border highlight. Career entries dim their siblings on hover/focus. Only on fine pointers, and off under reduced motion. |
| 5 | **⌘K command palette** | [paco.me](https://paco.me) / [cmdk](https://github.com/pacocoursey/cmdk), Linear, Vercel | A `<dialog>` palette with keyboard filtering: jump to sections, open case studies, copy email, switch theme, open LinkedIn/GitHub. Opened by ⌘K/Ctrl+K or a visible nav button. Accessible combobox/listbox roles. |
| 6 | **Grain + soft radial gradient atmosphere** | [Linear](https://linear.app), [Vercel templates](https://vercel.com/templates/portfolio), Godly | An inline SVG `feTurbulence` noise layer at about 4% opacity, fixed and non-interactive. A soft green/lime radial glow behind the hero. Hairline 1px borders at 8–12% alpha. |
| 7 | **Restrained, purposeful motion + toasts** | [emilkowal.ski — "You don't need animations"](https://emilkowal.ski/ui/you-dont-need-animations), [Sonner](https://sonner.emilkowal.ski) | Every transition is 300 ms or less with ease-out. Scroll reveals play once. The ticker pauses on hover and stops entirely under `prefers-reduced-motion`. A small Sonner-style toast confirms "Email copied". |
| 8 | **Long-form case-study layout with sticky table of contents** | Awwwards case studies, [Astro portfolio themes](https://astro.build/themes/), [Vercel portfolio templates](https://vercel.com/templates/portfolio) | `/work/adike-naadi.html`: a sticky side ToC with scroll-spy, numbered chapters, device-framed screenshots, an inline SVG architecture diagram and a trade-offs table. |
| 9 | **Text-first, short "about" + "now"** | [leerob.com](https://leerob.com), [paco.me](https://paco.me) | About cut to about 90 words, plus one compact "Off the clock" row in mono. |

---

## 4. Content mined from git history

Older versions (`50c8c90` → `dd3cd04`, Oct 2026) were a large "personal almanac" (~1,300 lines). Later redesigns (`55d5ac5`, `8c42acc`, `5e30aa1`) changed the work content. The table lists **facts about the work that aren't on the current site.**

| Content (verbatim or close) | Last seen | Use it? |
|---|---|---|
| ITC: "Built the backend of a GenAI platform (Python, FastAPI, PostgreSQL) serving **200+ users across 5 business units**" | `dd3cd04` | ❓ Ask (Q3) |
| ITC: "Shipped **15+ LLM agents** … cutting manual ticket triage by **about 40%**" | `dd3cd04` | ❓ Ask (Q3) |
| ITC: "RAG pipelines with LangChain, Azure OpenAI and Azure AI Search, **10,000+ documents** through a configurable **7-stage ingestion framework**" | `dd3cd04` | ❓ Ask (Q3) |
| ITC: "**~3×** ingestion throughput after re-architecting to async", "**~25%** lower inference cost via smart routing" | `dd3cd04` | ❓ Ask (Q3) |
| ITC: "LLM routing layer with health probing, p95 latency routing and per-project budgets, and **MCP** server integration" | `dd3cd04` | ✅ Bring back as qualitative architecture, no numbers (safe either way) |
| ITC: "Celery and Redis for **1,000+ concurrent tasks**, with retries, circuit breakers and task claiming" | `dd3cd04` | ❓ Ask (Q3) for the number. ✅ Bring back the pattern |
| ITC: "Azure Container Apps … Azure DevOps CI/CD across Dev, Test and Production" | `dd3cd04` | ✅ Bring back (stack only) |
| ITC: "reported **35% latency reduction**", "deployment across **two large enterprise environments**", "agents for ITSM, knowledge and productivity" | `55d5ac5` | ❓ Ask (Q3) |
| ITC agent names (ServiceNow ITSM Assistant, BOM Generator, Spec Sheet Generator…) | `dd3cd04` | ❌ Leave out. Too close to client detail |
| Building "agents that admit doubt": evaluation harnesses, confidence scores, graceful "I don't know" paths | `dd3cd04` | ✅ Bring back. It's the core of the *guardrails / RAG evaluation* depth area |
| Radar notes: "LLM Evals — golden datasets and judge models, the unit tests of GenAI"; "Pydantic — validating LLM output"; "Embeddings tuned against real user queries"; "Document Intelligence — layout-aware extraction"; "Prompt-only agents — never again" | `dd3cd04` | ✅ Bring back in Stack depth areas (descriptions, no metrics) |
| Extra stack: LangGraph, MCP, Azure AI Search, Celery, Redis, SQLAlchemy, Alembic, Pydantic, pgvector, Pytest, C++ | `dd3cd04` / `42106e6` | ✅ Bring back in Stack groups |
| AXISCADES: API response times cut by 30% "**through query optimisation and indexing**" | `dd3cd04` | ✅ Bring back the "how" |
| Philips: "PACS solution in **Python and C++**", "ensured **DICOM compliance for device interoperability**", Remote | `dd3cd04` | ✅ Bring back. Supports the "regulated healthcare" framing |
| Siemens: "performance monitoring tools for **angiography** systems and X-ray visualisation in C++ and Python", "**Artis icono** product line release and **hazard-related safety features**" | `dd3cd04` | ✅ Bring back (public product name). Strongest "regulated, reliability" evidence |
| Education: SJCE Mysuru, B.E. Electronics & Instrumentation, **2016–2020** | `dd3cd04` | ✅ Bring back the years (Career + JSON-LD `alumniOf`) |
| Intro: "**Six years** building software … At heart I'm a backend engineer: APIs, data models, concurrency and systems that keep working at 3 a.m." | `dd3cd04` | ✅ Rework into About / hero lead |
| Adike Naadi: "SEO-oriented pages and content workflows", "knowledge cards", "Python pipelines and quality checks", "answers anchored in retrieved data rather than model memory" | `55d5ac5`, `5e30aa1` | ✅ Bring back in the case study |
| Portrait alt: "Pramod in a puffer jacket and sunglasses, standing on snow with Himalayan peaks and the rising sun behind him" | `dd3cd04` | ✅ Bring back (far better alt text) |
| Contact: "Copy" email button with clipboard fallback | `dd3cd04` | ✅ Rebuilt with a toast |
| Footer: "Built with curiosity, compounded daily." | `dd3cd04` | ✅ Reuse as the footer line |
| Books, markets, tennis, film and curiosities chapters | `dd3cd04` | ❌ Leave out (the brief asks for a compact "Off the clock" row). A personal contact detail in `50c8c90` was removed in `42106e6` and stays removed |

### ⚠️ Contradictions between commits (need your call)

| # | Topic | Older | Current | My recommendation |
|---|---|---|---|---|
| C1 | LinkedIn URL | `/in/pramodkumargh` (`50c8c90`), `/in/pramod-kumar-g-h-4ba7a9157/` (`9cd83f5`), `/in/pramod-kumar-gh` (`55d5ac5`) | `/in/pramod-kumar-g-h/` (set by `dd3cd04` "Update LinkedIn URL") | Keep the current one |
| C2 | Siemens entity name | "Siemens **Healthineers**" (`50c8c90`–`dd3cd04`) | "Siemens **Healthcare**" | Your call. Healthineers has been the brand name since 2016 |
| C3 | AXISCADES ownership | "**Led** a predictive inventory system … reduced stockouts by 40% … **saving around $200K a year**" (`dd3cd04`) | "**Helped** reduce stockouts by 40% and **supported estimated** $200K annual savings" | Your call. The brief's "~$200K est." matches the current hedged wording |

**Decisions (approved 27 Nov 2026):**
- **Accent:** lime.
- **ITC metrics restored:** 15+ agents / ~40% triage, 10K+ docs / 7-stage ingestion, two enterprise environments. All others stay out.
- **C1:** LinkedIn `/in/pramod-kumar-g-h/`.
- **C2:** "Siemens Healthineers".
- **C3:** hedged AXISCADES wording.
- **Q4:** separate case-study pages.

---

## 5. Adike Naadi capture (Step 0.5)

`https://adikenaadi.com` was reachable (HTTP 200). The product is Kannada-first, with an English mode called **"Areca Pulse"**. I captured 7 views at 2× and converted them to WebP (1× + `@2x`, 1.4 MB total) in [`assets/adike-naadi/`](assets/adike-naadi/):

| File | View |
|---|---|
| `home-desktop` | Latest rates, Kannada, 1440 px |
| `home-mobile` | Latest rates, Kannada, 375 px (bottom tab bar) |
| `assistant-desktop` | English Q: "What is the latest Rashi price?" → 24 cited rates, price-date chips, S1–S4 sources |
| `assistant-mobile` | Kannada Q (koleroga) → **guardrail behaviour**: it declines to paraphrase uncertain scanned text and cites source pages D1–D3 instead |
| `trends-desktop` | Monthly trends since 2021 with annotated policy events |
| `forecast-desktop` | Forecast evaluation leaderboard (LightGBM, Chronos-2, TimesFM 2.5, ARIMA, Theta, ETS vs "last month's price") |
| `sell-or-hold-desktop` | "Sell now or wait?": past-year outcomes after costs |

These **facts read from the live site** will be used verbatim or close in the case study (no invented metrics):
- **Sources:** MAMCOS, TSS, TMS Sirsi, TUMCOS cooperatives + AGMARKNET/data.gov.in APMC prices. Every rate shows its reporting date and source.
- **Coverage:** monthly prices since 2014 from 50+ markets. Arrivals data from KRAMA.
- **Assistant:** answers prices, crop care and weather questions "from verified sources. Every figure is cited." Limited to 30 questions an hour, and questions are not stored.
- **Forecast evaluation:** an honest result. "Not yet better than 'Last month's price'", tested on 34 past months.
- **Distribution:** a daily WhatsApp channel, a KN/EN toggle and dark mode. The site states it is independent and gives "market information only, not financial advice".

---

## 6. Proposed plan (awaiting your OK)

**Branch:** `redesign`, in small commits. Static, no build step, no framework.

### Structure
```
index.html                 404.html   robots.txt   sitemap.xml   favicon.svg   apple-touch-icon.png   og-image.png
work/adike-naadi.html      work/enterprise-genai.html*   work/industrial-iot.html*      (* see Q4)
assets/css/site.css        assets/js/site.js
assets/fonts/              Instrument Serif (400, 400i), Geist (variable), Geist Mono (variable), self-hosted latin woff2
assets/img/                portrait-{320,480,640}.{avif,webp}, og source
assets/adike-naadi/        captured screenshots
```

### Design system
- **Color:** dark-first on `#0d1612` (deepened from `#101b16`, which is kept for raised surfaces). One accent: **warm lime `#cfe38a`** (continuity with the current lime), or amber (Q2). A light theme toggle stored in `localStorage` (wrapped in try/catch) and applied before first paint, so there's no flash. Every text/background pair will be checked at ≥4.5:1.
- **Type:** Instrument Serif + Geist + Geist Mono, self-hosted with `font-display: swap`, preloading the two above-the-fold files. A fluid `clamp()` scale.
- **Grid:** 12 columns, max 1200 px, fluid gutters. Numbered sections 01–05 (Work · Career · Stack · About · Contact) in mono.
- **Details:** grain overlay, hero radial glow, hairline borders, card lift + border highlight + cursor spotlight, IntersectionObserver reveals, sticky blurred nav with active indicator, ⌘K palette, mobile sheet menu (44 px targets, focus trap, Esc to close), skip link, a strong `:focus-visible` ring. Everything honours `prefers-reduced-motion`.

### Homepage sections
1. **Hero** (`#top`)
   - Status chip
   - H1 "I build AI systems that hold up in production."
   - Serif-italic secondary line "Serious about the work. Curious about everything."
   - CTAs: View work / Download résumé (`/resume.pdf`, **TODO**)
   - Social icons
   - Portrait (AVIF/WebP `srcset`)
2. **Proof strip:** 40% fewer stockouts · ~$200K est. annual savings · 30% faster APIs · 75% faster deploys · 6+ years · Live product: Adike Naadi.
3. **01 Selected work:** Adike Naadi as the large hero card (browser + phone frames using the real captures). Then ITC (enterprise GenAI: RAG quality, agent workflows, guardrails), AXISCADES (MQTT → Flask/Postgres, 10K+ req/day) and Healthcare (regulated software: DICOM, imaging pipelines, reliability). Each card has role, years, a 1-line problem, 1 outcome, stack chips and links.
4. **Ticker:** an animated marquee that pauses on hover and stops under reduced motion.
5. **02 Career** (`id="experience"` kept for old links): a vertical timeline with company names set as text "logos", mono dates and 2–3 impact bullets each, plus education.
6. **03 Stack:** a bento of 4 capability groups (Build agents / Ship backends / Data / Deploy) plus highlighted depth areas: RAG evaluation, guardrails, embeddings, edge deployment.
7. **04 About:** about 90 words + an "Off the clock" row (tennis · psychology · economics · books).
8. **05 Contact:** "Have a hard AI or backend problem? Let's talk." Copy email (with toast), LinkedIn, GitHub, Calendly (**TODO**).
9. **Footer:** fixed separators, logo → `#top`, "Built with curiosity, compounded daily."

### Adike Naadi case study
`/work/adike-naadi.html` has these chapters: Problem → Users → Solution → Architecture (inline SVG: React → Workers/Hono → D1 → Workers AI, with GitHub Actions pipelines feeding D1) → Key decisions & trade-offs → Bilingual AI assistant → Results (**TODO** metrics, plus the qualitative facts above) → What's next. There's a sticky ToC, and screenshots are shown in device frames.

### SEO & tech
- Per-page title, description, canonical, OG/Twitter tags
- JSON-LD `Person` (+ `CreativeWork` on the case study)
- A designed 1200×630 `og-image.png`, rendered from HTML with headless Chromium
- `favicon.svg`, a 180 px `apple-touch-icon.png`, `robots.txt`, `sitemap.xml` and a matching `404.html`

### QA
- After-screenshots in `audit/after/` (dark + light × 3 widths × each page), overflow checks, Lighthouse (mobile + desktop) and axe on every page.
- Target: Lighthouse ≥95 in all four categories, 0 axe violations.

### Deliverable
`CHANGES.md` covering what changed, the commit hashes for every fact restored from history, and a TODO checklist.
