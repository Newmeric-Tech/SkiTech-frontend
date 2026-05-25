# SkiTech Frontend — Changelog

> See `../DEVELOPMENT_LOG.md` for full documentation covering both frontend and backend.

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
