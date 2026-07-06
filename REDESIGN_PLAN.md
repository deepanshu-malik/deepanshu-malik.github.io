# Portfolio v4 — "The Living System"

Creative + technical plan for rebuilding deepanshu-malik.github.io from scratch.
Decisions locked with Deepanshu on 2026-07-03: **Living System + Agent** concept,
**Warm Engineered** brand, **Vite + vanilla JS** stack.

---

## 1. Diagnosis of v3 (current site)

- Terminal-template aesthetic (Fira Code everywhere, `#c778dd` purple, `#hash` nav) —
  clean but recognizably a template; says nothing specific about Deepanshu.
- The one genuinely rare asset — a **real production RAG backend** on Koyeb
  (intent classification, hybrid retrieval, LLM reranking, SSE streaming) — is hidden
  behind a modal button.
- Positioning is stale: site says "Senior Backend Engineer, 4+ years". Reality:
  **AI Practice Lead** (Apr 2026–present) at Kogta Financial — sole technical
  authority for company-wide AI decisions, direct accountability to the CTO,
  5+ years experience.
- Data bug: schema.org block claims `alumniOf: IIIT Delhi` — false; real education is
  DCRUST (MCA) and MDU (BSc CS).
- Worth keeping: JSON-driven content (`data/*.json`), SEO foundation (meta, schema,
  sitemap, OG pipeline, Search Console verification), GitHub Pages hosting.

## 2. Concept — The Living System

The portfolio **is** the kind of system Deepanshu builds. The page is rendered as a
production pipeline; scrolling moves a request through it. Each section is a node:

| Node | Section | Story it tells |
|---|---|---|
| INTAKE | Hero | Identity, live telemetry, "system: operational" |
| CLASSIFY | About / positioning | Who is this, what problems does he route |
| RETRIEVE | Experience | Deployment log — releases shipped since 2021 |
| ORCHESTRATE | Projects | Running services with real metrics |
| STACK | Skills | The layered architecture he operates |
| DISPATCH | Contact | Message dispatched ✓ |
| AGENT | Persistent dock | The RAG agent — centerpiece proof of claim |

The agent stops being a modal afterthought: it shows **visible tool-calls**
(`classify_intent → hybrid_retrieve → rerank → stream_response`) while answering,
demonstrating the actual backend pipeline to visitors.

## 3. Brand system — Warm Engineered

Drafting-room / ops-room-at-night aesthetic: engineering-drawing hairlines, mono
margin annotations, copper accent. Deliberately warm where every AI portfolio is
cold neon.

### Color tokens

Dark (default — "ops room at night"):

| Token | Hex | Role |
|---|---|---|
| `--bg0` | `#191410` | page ground |
| `--bg1` | `#211a13` | alternate band |
| `--panel` | `#281f16` | cards / surfaces |
| `--line` | `#3d3225` | hairlines, borders |
| `--text` | `#ede2ce` | primary text (warm bone) |
| `--muted` | `#a3907a` | secondary text |
| `--copper` | `#d4772b` | accent |
| `--copper-hi` | `#e99a55` | accent hover / glow |
| `--ok` | `#8cb271` | semantic status only (never decorative) |
| `--err` | `#c96f5e` | semantic error |

Light ("drafting paper"): ground `#f2e9da`, band `#f7f0e3`, panel `#fbf5ea`,
line `#d8c9b0`, text `#271e12`, muted `#7a6a55`, copper `#b05e17`, ok `#5e8a47`.

Theming is token-level: dark on `:root`, light under `@media (prefers-color-scheme:
light)`, and `:root[data-theme="dark"|"light"]` overrides win in both directions
(user toggle).

### Typography

- **Bricolage Grotesque** (variable 400–800, latin subset, self-hosted woff2) —
  display + body. Characterful warm grotesk; H1 at weight 800, tight leading.
- **IBM Plex Mono** (400/500, latin, self-hosted) — data, annotations, labels, code.
  Replaces Fira-Code-everywhere; mono becomes an *annotation voice*, not the body.
- No font CDNs. Files live in `public/assets/fonts/`.

### Motion identity — three verbs

1. **Stream** — text arrives token-by-token (hero headline, agent responses).
2. **Flow** — packets travel along paths (canvas pipeline, dispatch animation).
3. **Settle** — numbers tick to final values, elements ease into place on scroll.

Consistent easing, 200–600 ms UI moves, continuous ambient canvas. Full
`prefers-reduced-motion` fallbacks: static canvas frame, instant text, no smooth
scroll.

## 4. Information architecture

Single-page narrative (`index.html`) + `resume.html` (ATS/print-friendly, kept) +
`404.html`. `about.html` and `projects.html` become canonical redirect stubs into
index sections (preserves indexed URLs). Sitemap trimmed to index + resume.

### Hero copy (repositioned)

- Eyebrow (mono): `DEEPANSHU MALIK · AI PRACTICE LEAD · GURUGRAM, IN`
- H1: **"I ship AI systems that survive production."**
- Sub: Setting the AI engineering direction at a regulated fintech — production
  agents, RAG at scale, and the standards an organisation builds on.
  Python · FastAPI · AWS · Kubernetes (CKA).
- Status chips (all true, from real work): `● system: operational`,
  `10,000+ docs/mo`, `99.9% delivery`, `8s → 2s queries`.
- CTAs: **Talk to the agent** (primary) · Resume.

### Playables

- **Agent workspace** with visible tool-call trace (stage events simulated
  client-side and synced to the real SSE lifecycle; later the backend can emit real
  stage events).
- **⌘K command palette** — navigate, toggle theme, open agent, resume, `load-test`.
- **Dispatch animation** on contact actions ("message dispatched ✓" toast).
- **Load-test easter egg** — briefly floods the pipeline canvas with packets.

## 5. Technical architecture

- **Vite** (vanilla, no framework), multi-page inputs: `index`, `resume`, `404`.
- **GSAP + ScrollTrigger** for reveals, **Lenis** for smooth scroll,
  **Canvas 2D** for the pipeline (DPR-capped, paused offscreen).
- Structure:
  - `src/styles/` — `tokens.css`, `base.css`, `components.css`, `sections.css`, `agent.css`
  - `src/js/` — `main.js`, `pipeline.js`, `motion.js`, `agent.js`, `palette.js`, `render.js`
  - `public/` — static passthrough: `assets/`, `data/`, `robots.txt`, `sitemap.xml`,
    Google verification file
- **Deploy**: GitHub Actions (`.github/workflows/deploy.yml`) builds `dist/` and
  deploys via `actions/deploy-pages`. Requires one manual switch in repo settings:
  Pages → Source → **GitHub Actions**. Until then the old branch-served site stays
  live — zero-downtime cutover.
- **Budgets**: Lighthouse ≥ 95, JS < 120 KB gz (GSAP+Lenis ~50 KB), fonts ~110 KB
  total, LCP < 1.5 s, CLS ≈ 0. Accessibility: semantic landmarks, keyboard paths,
  visible focus, AA contrast.
- Agent backend stays the existing Koyeb service
  (`/api/chat/v2/stream`); UI handles cold starts gracefully ("agent waking up…").
  Markdown rendered by a small local parser — no `marked` CDN dependency.

## 6. Content updates

- `data/resume-data.json`: add **AI Practice Lead, Apr 2026–Present** (agents in
  production, sole AI technical authority, org-wide adoption programs); Sr SWE role
  ends Mar 2026; title/summary reworked; "5+ years".
- `index.html` schema.org: job title AI Practice Lead, real education, remove
  IIIT Delhi.
- All page titles/descriptions/OG copy repositioned. OG image regeneration in the
  new brand is a follow-up (existing `scripts/generate-og.mjs` pipeline).

## 7. Task board

1. ✍️ This plan document
2. Scaffold Vite, move statics to `public/`, self-host fonts, deploy workflow
3. Design-system CSS (tokens, both themes, type scale, primitives)
4. New `index.html` — all sections, repositioned content, fixed schema
5. Pipeline canvas engine
6. Motion layer (Lenis, GSAP reveals, streamed H1, settle counters)
7. Agent workspace (SSE + tool-call trace + cold-start handling)
8. Playables (⌘K palette, dispatch animation, load-test)
9. Resume data + restyle (ATS/print preserved)
10. 404 rebrand, about/projects redirects, sitemap/SEO updates
11. Build, verify, report

## 8. Risks / notes

- **Koyeb cold starts** → agent UI needs a warming state; consider a lightweight
  `/health` ping on dock open.
- **Canvas on mobile** → cap DPR at 2, reduce packet count under 480 px, pause when
  offscreen or tab hidden.
- **Vite + user-page deploy** → site only switches when Pages source is set to
  GitHub Actions; do this after reviewing the built site locally.
- **Truthfulness** — every metric shown comes from the resume/LinkedIn data; nothing
  invented.
