# 🛡️ pushingSecurity Website — Worker Design Brief

> **Task ID:** `WB-PS-001`
> **Priority:** P0 — IMMEDIATE
> **Staged by:** Antigravity
> **Date:** 2026-04-15
> **Live preview:** https://singh-costume-sections-ebook.trycloudflare.com
> **Source:** [page.tsx](https://github.com/Pushingcapital/pushing-platform/edit/main/projects/pushingsecurity-control/apps/pushing-capital-web/src/app/(customer)/page.tsx)

---

## Assigned Workers

| Worker | Code | Role | Scope |
|--------|------|------|-------|
| **retool_ui_ux_designer** | TC | UI/UX, design tokens, components | Layout, spacing, interaction design |
| **retool_brand_designer** | T0 | Brand aesthetics | Color, typography, identity, tone |
| **codex_design** | CD | Asset generation | 8K images, glass textures, icons, backgrounds |
| **retool_worker_coordinator** | TD | Coordination | Assign, track, merge |

---

## Current State

The pushingSecurity website is **live** at `localhost:3020` with:
- **Hero:** `pushingSecurity` title — massive, centered, teal gradient
- **Services:** 3 glassmorphic cards (Credit Intelligence, Identity Vault, Secure Browse)
- **Trust Bar:** 4 trust badges
- **Dashboard Preview:** Mock Clarity dashboard (credit score, docs, sessions)
- **How It Works:** 4-step pipeline
- **CTA:** "Get Started Free"
- **Footer:** Pushing Capital branding

### Design System
- **Fonts:** Space Grotesk (headings), IBM Plex Mono (code)
- **Background:** `#0a0f1a`
- **Accents:** Cyan `#37f5f1`, Teal `#34d399`, Violet `#8b5cf6`
- **Style:** Vision Pro glassmorphism, dark mode only
- **Framework:** Next.js + Tailwind CSS

---

## What Needs Work

### For Worker TC (UI/UX)
1. Review the layout and spacing — hero, services, trust bar, CTA flow
2. Improve mobile responsiveness (currently desktop-first)
3. Add micro-animations and hover states
4. Design the navigation states (active, hover, scroll-shrink)
5. Review the Clarity Dashboard preview — make it feel alive
6. Add loading states and transitions between sections

### For Worker T0 (Brand)
1. The hero title (`pushingSecurity`) needs to **dominate** — make it the centerpiece
2. Color palette audit — ensure teal/cyan/violet harmony
3. Typography hierarchy review — heading sizes, weights, tracking
4. Brand consistency with the broader Pushing Capital family
5. "Enter Vault" button styling — should feel premium, inviting
6. Footer branding — Pushing Capital mark and tagline

### For Worker CD (Assets)
1. Generate hero background image — dark vault concept, 8K, glass texture
2. Generate the `vault-bg.jpg` brand image (currently may be missing)
3. Generate `vault-radial.png` — teal radial glow overlay
4. Generate `p-glass-mark.png` — P logo with glass effect (if not existing)
5. Generate service card icons — shield, lock, globe in glass style
6. Generate Clarity Dashboard screenshot for the preview section

---

## Files to Edit

| File | Lines | What |
|------|-------|------|
| `src/app/(customer)/page.tsx` | ~580 | Homepage — hero, services, trust, dashboard, CTA, footer |
| `src/components/vault/vault-dashboard.tsx` | 442 | Vault dashboard — categories, items, tabs |
| `src/components/vault/clarity-dashboard.tsx` | 607 | Credit dashboard — FICO ring, accounts, inquiries, Drive files |
| `src/components/vault/secure-browser.tsx` | 290 | Proxied browser — URL bar, rendered HTML |
| `src/app/layout.tsx` | 67 | Root layout — fonts, meta, PWA |
| `public/brand/` | — | Brand assets directory |

---

## API Endpoints Available

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/health` | GET | System health check |
| `/api/vault` | GET/POST/DELETE | Vault item CRUD |
| `/api/clarity` | GET | Credit data from BigQuery |
| `/api/credit-report` | GET | Google Drive credit report files |
| `/api/proxy-browse` | POST | Proxied browsing |
| `/api/sessions` | GET/POST/DELETE | Browse session management |
| `/api/audit` | GET/POST | Audit trail |
| `/api/onboarding` | POST | Client intake |
| `/api/document-ai/parse-license` | POST | License OCR |
| `/api/document-ai/face-match` | POST | Face verification |

---

## Acceptance Criteria

- [ ] `pushingSecurity` title is the dominant visual element on page load
- [ ] All brand assets are generated and placed in `public/brand/`
- [ ] Mobile responsive (375px–1440px)
- [ ] No mock data visible to end users — use real API calls or empty states
- [ ] Page loads in under 2 seconds
- [ ] All interactive elements have hover/focus states
- [ ] Glassmorphic design is consistent across all sections
- [ ] Credit score ring animation is smooth
- [ ] Vault category cards have proper tap targets on mobile
- [ ] "Enter Vault" flow navigates correctly to `/onboard`

---

> **Route to:** Worker TD (retool_worker_coordinator)
> **Tag:** `pushingcap`, `pushingSecurity`, `design`
> **Stitch:** Link outputs to MemoryPC and /pushing-debate-studio.y
