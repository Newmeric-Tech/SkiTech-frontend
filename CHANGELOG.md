# SkiTech Frontend — Changelog

> See `../DEVELOPMENT_LOG.md` for full documentation covering both frontend and backend.

---

## [2026-07-23] — Marketing Landing Page Restyle: Typography, ZoomParallax Section, Seam Fix

> Full write-up: `../DEVELOPMENT_LOG.md` § 4.11

### Added
- **Font system**: `app/(marketing)/layout.tsx` loads Playfair Display + Plus Jakarta Sans via `next/font/google`, scoped to the marketing route group only (dashboard/auth pages keep Merriweather). New `--mk-font-serif` / `--mk-font-sans` tokens in `app/globals.css`, threaded through `ThemeProvider.tsx` via a `fontVariables` prop.
- **New component `components/marketing/ZoomParallax.tsx`**: scroll-pinned section (Framer Motion `useScroll`/`useTransform`) between Hero and the marquee ticker — six module cards fly outward and scale up while pinned, reusing `Features.tsx`'s module data. Enriched in a follow-up pass with real widget content per card (status dots, progress bars, avatar stack, sparkline, pulsing alert dot), the exact mockup quote with a gradient "growth partner." span, and the same `ParticleCanvas` constellation background used in the Hero.

### Changed
- **Font pass** across `Features`, `HowItWorks`, `PrinciplesDeck`, `AboutUs`, `Pricing`, `Testimonials`, `FAQ`, `CTA`, `Footer` — headlines now render in Playfair Display, body/labels/chips in Plus Jakarta Sans, matched element-by-element against the mockup's own `font-serif` usage rather than assumed uniformly.
- **`Hero.tsx`**: removed the floating `dashboard.png` block entirely; hero now ends cleanly after the trust-pill row.

### Fixed
- **Hero → ZoomParallax seam**: the boundary had a visible hard line — Hero's neutral monochrome glow met ZoomParallax's indigo spotlight at full opacity with no transition. Added the matching grain-texture overlay to `ZoomParallax.tsx` and tied its spotlight opacity to scroll progress so it fades in instead of snapping on.
- Removed a stale "Merriweather is loaded globally" comment in `Pricing.tsx` left over from before the font swap.

### Verification
- `npm run build` compiles clean across all ~107 routes after each change.
- Manually scrolled every section in both dark and light themes; tested module-card expand/collapse, pricing monthly/annual toggle, FAQ accordion, theme toggle.
- One pre-existing dev-only hydration console warning (`#cursor-ring` style mutation from the raw cursor-tracking script in `(marketing)/layout.tsx`) was investigated and confirmed unrelated — present before this session, not introduced by it.

### Commits
`4a2d95c` (typography + Hero cleanup + first ZoomParallax pass) · `09ebf2b` (ZoomParallax widget enrichment) · `806b819` (seam smoothing fix)

---

## [2026-07-09] — Marketing Site: Images, Layout Fixes, Footer Redesign, Theme Toggle

### Added
- **Core module images**: Copied `sop_management.png`, `property_management.png`, `inventory_stock.png`, `kra_monitoring.png`, `employee_management.png`, `analytics_reporting.png` into `public/images/modules/`. `Features.tsx` now references these local files instead of the six Unsplash placeholder URLs.
- **Footer "Connect" column**: `Footer.tsx` — added a 4th link column (X/LinkedIn/GitHub/Email as text links) alongside Product/Company/Access, replacing the old icon-button row. All footer links now use an animated underline-on-hover effect.
- **Theme tokens**: `app/globals.css` — added `--mk-watermark-gradient` / `--mk-watermark-opacity` (metallic gradient text) and `--mk-footer-wash` (smooth black/white gradient background), each defined for both `html[data-theme="dark"]` and `html[data-theme="light"]`.

### Changed
- **Footer redesign ("Popcorn"-style floating card)**: `Footer.tsx` rewritten — the footer is now a floating rounded card (`rounded-[24px] md:rounded-[36px]`, margin around it, border, shadow, ambient glow) instead of a flush full-width bar. Added a large cropped metallic-gradient "SkiTech" watermark at the card's bottom edge. Kept the existing "Stay Updated" newsletter signup, restyled to fit above the link columns. Replaced a grainy noise-texture background with the smooth `--mk-footer-wash` gradient.
- **Theme toggle redesign**: `ThemeToggle.tsx` — replaced the icon+pill+label button with a glassmorphic capsule switch (sliding thumb behind a Sun/Moon icon pair from lucide-react; active icon glows yellow/blue, inactive is dimmed). `ThemeProvider.tsx` and the underlying `data-theme` toggle logic were **not** touched.
- **Removed duplicate "Explore Platform" CTAs**: `AboutUs.tsx` — removed from both the hero section and the "bottom line" closing section (kept "Get in touch").

### Fixed
- **Section-seam overlap**: `SectionSeam.tsx`'s transition gradient had `position: absolute` + `z-index: 0`, which per CSS stacking rules painted it *over* static heading text near a section's top (e.g. "Simple, Transparent Pricing" looked cut off). Changed `zIndex` to `-1` and added `isolate` to the six sections using it (`Pricing.tsx`, `CTA.tsx`, `Footer.tsx`, `FAQ.tsx`, `HowItWorks.tsx`, `Testimonials.tsx`) so each section's gradient stays contained within its own section.
- **Public route gating**: `proxy.ts` — `/features`, `/pricing`, `/about`, `/faqs`, `/product` were missing from `PUBLIC_ROUTES`, so logged-out visitors clicking those links were redirected to `/auth/login`. Added all five.
- **Fixed navbar covering footer**: `app/(marketing)/layout.tsx` — added a 60px spacer after `<Footer />` matching the fixed navbar's height. Fixed-position navbars are excluded from document flow, so on shorter pages scrolling to the true bottom left the navbar permanently overlapping the last ~60px of footer content with no way to scroll past it.
- **Wrong "Request a Demo" link**: `CTA.tsx` — button's `href` was `/auth/login` (mislabeled), changed to `/demo`. Audited every other CTA/link across the marketing site (Hero, Navbar, Pricing, Footer, MenuOverlay, standalone `/demo` `/contact` `/product` `/pricing` pages) — no other mismatches found.
- **Footer grid bug**: `Footer.tsx` — the card grid was `lg:grid-cols-5` (brand spans 2 + 3 original link columns = 5). Adding the 4th "Connect" column made it 2+4=6, which overflowed the grid — Connect wrapped onto an empty second row, roughly doubling the footer's height. Fixed to `lg:grid-cols-6`; also trimmed padding/margins and watermark size for a more compact card.

### Known follow-ups (not yet fixed)
- Social icon links (Footer "Connect" column, `MenuOverlay` social row) still point to `href="#"` placeholders — no real Twitter/X, LinkedIn, GitHub, or Instagram URLs provided yet.
- `app/(marketing)/product/page.tsx` — the "Watch Demo" button has no `onClick` handler; it's currently inert.

---

## [2026-05-25] — Bug Fixes (Session, Editor, Hotel Lock, Complaints, Persistence)

### Fixed
- **Editor full-screen**: Create Document editor now renders via `createPortal(document.body)` at `z-[9999]`. Previously the sidebar overlapped the editor because both were at `z-50` in different stacking contexts.
- **Session persistence**: `localStorage.clear()` in the API interceptor was wiping all app state (docs, logs, Zustand store) on token refresh failure. Replaced with targeted key removals (`skitech_access_token`, `skitech_refresh_token`, `skitech_role`, `skitech_auth`).
- **Hotel dropdown locked for managers**: Manager Punch In/Out and Attendance pages now display the manager's assigned property name instead of a dropdown. Managers are locked to their `property_id` from the JWT.
- **Document persistence on refresh**: Documents created locally (id `doc-*`) are now merged with the API response instead of being overwritten on page load.
- **Activity log stats showing 0**: Changed summary window from 7 → 365 days. Stats were 0 because all historical events were older than 7 days.
- **Manager "Report Issue" button**: Added a full complaint creation form to the manager complaints page header.
- **Team collaborators dynamic**: Editor now fetches real staff from `usersAPI.list()` instead of showing hardcoded names.

---

## [2026-05-25] — 7 UI Fixes (Dark Mode, Search, Toolbar, Sidebar, Alerts)

### Fixed
- **Editor toolbar buttons** (B/I/U/H1/H2/List/Quote): Buttons now insert markdown syntax at the cursor using `applyFormat()` + `useRef<HTMLTextAreaElement>`.
- **StatCard dark mode**: Added `dark:` Tailwind variants — card bg, icon container, badge, value, footer gradient.
- **Activity log dark mode**: `LogRow`, `ActivityTable`, `SeverityBadge` all have dark mode styles. Action badges and severity badges are now visible in dark mode.
- **Recent Alerts fallback**: Shows pending task count from `dashboard.pending_tasks` when no inventory alerts exist.
- **Search relocated**: Moved from inside profile dropdown to header (next to bell icon), collapses to icon button.
- **Sidebar icons & scroll** (collapsed state): Icons now `22×22px` centered; nav items use `justify-center px-2`; added `overflow-x-hidden` on main content.
- **Chat removed from sidebar**: Removed duplicate "Chat" nav item (floating chat icon already provides this).

---

## [2026-05-25] — Document Management Features

### Added
- **Delete button** (Owner only): Visible directly in the actions row of `DocumentTable`. Only shown when `role === "Owner"`.
- **Publish Draft**: In ⋮ dropdown and in Edit modal — changes status from "Draft" to "Active".
- **Role normalizer**: `ROLE_DISPLAY` map converts localStorage `"owner"` → `"Owner"` before role checks. Applied in `DocumentTable`, `DocumentOverviewPage`, `MyDocumentsPage`.
- **Auto-approve for owners**: Documents uploaded by Owner/Super Admin are automatically approved (no review needed). Applied in both frontend store and backend endpoint.

---

## [2026-05-23] — Module API Integration

### Added
- `lib/api/activity-log.ts` — wraps `/v1/activity-log/*`
- `lib/api/complaints.ts` — wraps `/v1/complaints/*` (full CRUD + dashboards)
- `lib/api/documents.ts` — wraps `/v1/documents/*`
- `lib/api/scheduling.ts` — wraps `/v1/scheduling/*`

### Fixed
- All four new module endpoints were missing the `/v1/` prefix, causing `{"detail":"Not Found"}` on all calls.
- `get_current_user` returns a JWT dict, not a User ORM. New endpoints needed `get_current_user_obj` (added to `dependencies.py`).
- Employee Scheduling 400 error for owners: Removed hard property_id guard; owners (with `property_id = None`) now query all properties.

---

## [2026-05-22] — Chat System

### Added
- Floating chat widget (bottom-right, all authenticated pages)
- Side panel: conversation list + message thread split-view
- Real-time message delivery, `last_message` preview
- Group and direct conversations supported
