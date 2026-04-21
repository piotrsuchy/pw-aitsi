# TODO — pw-aitsi (Community Photo Archive)

Status as of 2026-04-21. Organized by grading criteria from `criteria.md` and demo steps from `project-verification.md`.

---

## Medium Priority (quality / robustness)

- [ ] **Configure `next.config.ts` image remote patterns**  
  Currently empty. If user avatars (Google profile images) or any external image URLs are ever displayed via `<Image>`, they will be blocked.

- [ ] **`/api/admin/recent` — document or remove**  
  This endpoint duplicates the admin page SSR query and is never called by the frontend. Either document it as a demo-curl target (Verification step 6) or remove it.

- [ ] **WAVE accessibility audit**  
  Run the WAVE browser extension on the homepage and fix any reported errors (contrast, missing alt text, etc.) before the demo.  
  *Verification step 4a*

---

## Documentation (required for grading)

- [ ] **Information architecture diagram** — site map or tree diagram showing the category hierarchy and page structure. *Criteria 1*
- [ ] **Database schema diagram** — ER diagram of all models. *Criteria 7*
- [ ] **API documentation** — list of all public and private endpoints with example `curl` calls. *Criteria 8, Verification step 6*
- [ ] **Architecture overview** — describe the Next.js App Router + Prisma + PostgreSQL + NextAuth stack and justify design decisions. *Criteria 8*
- [ ] **WCAG compliance summary** — list the WCAG 2.1 AA techniques used (semantic HTML, skip link, aria-label, focus ring, high-contrast theme, keyboard navigation). *Criteria 6, Verification step 4a*
- [ ] **Business/functional requirements** (for custom project track). *Criteria 10*

---

## Already Complete (for reference)

- [x] Google OAuth login with role system (VIEWER / CREATOR / ADMIN)
- [x] Admin dashboard: recent uploads table + full user management (role change, block toggle)
- [x] Photo upload with file + full metadata (title, description, category, date, location, tags)
- [x] Photo detail page with inline edit + delete (owner or admin)
- [x] Creator "My Photos" page
- [x] Browse by category hierarchy with breadcrumb and subcategory pills
- [x] Text search across title, description, tags, city, region
- [x] Theme switcher: light / dark / high-contrast, persisted in localStorage
- [x] Responsive grid layouts throughout
- [x] Accessibility basics: skip link, `role="search"`, aria-labels, semantic HTML, visible focus ring, sr-only labels
- [x] Public REST API with pagination + filtering (`/api/photos`)
- [x] File upload API with MIME + size validation
- [x] Admin-only user management API (`/api/users/[id]/role`, `/api/users/[id]/block`)
- [x] Docker Compose for local Postgres + pgAdmin
- [x] Prisma seed with sample categories (Warsaw, Krakow hierarchy)
- [x] **Blocked-user redirect middleware** (`web/middleware.ts`)
  Switched auth to JWT strategy (Edge-compatible). `middleware.ts` checks `session.user.blocked` and redirects to `/blocked`. Also added the `blocked` check to `PATCH /api/photos/[id]`.
  *Verification step 1e, 3a*
- [x] **Search filters UI** — year range + category + region/city
  `GET /api/photos` already accepts `dateFrom`, `dateTo`, `category`, `region`, `city` but `/search` only exposes the text `q` field. Need filter controls on the search page.
  *Criteria 3 — "zawężanie wyników"; Verification step 2e*
- [x] **Seed admin email must match real Google account**
  Seed updated to `piotrsuchypp@gmail.com`. Dev credentials provider added (`admin@dev.local`, `creator@dev.local`, `viewer@dev.local`) with "Dev Login" buttons on the login page (development only). `npm run dev:set-role -- <email> <ROLE>` script added for ad-hoc role changes.
  *Verification step 1c*
- [x] **Category `<optgroup>` on upload form** (`web/app/creator/upload/upload-form.tsx`)  
  All categories are listed flat. Group leaf categories under their parent using `<optgroup>` labels for clarity.  
  *Criteria 4, Criteria 5 — "intuicyjny interfejs"*
- [x] **Tag editing in photo edit panel** (`web/app/photos/[id]/photo-actions.tsx`)
  Upload form supports tags; inline edit does not. The `PATCH /api/photos/[id]` endpoint needs to be extended to handle tags, and the edit form needs a tags field.
  *Criteria 4 — "edycja i usuwanie swoich materiałów"*
- [x] **Give an option to add categories - currently it's just Krakow and Warsaw**
- [x] **Restrict category creation and deletion to Admin only**
  Created a deletion endpoint enforcing business constraints (zero child/photo counts) and moved taxonomy UI entirely to the /admin Dashboard scope, hiding these capabilities from standard CREATOR access.
- [x] **Pagination UI on Browse and Search pages**
  `GET /api/photos` returns `meta.pages` / `meta.total` but both pages use a hard-coded `take: 48`. Large archives silently truncate. Add "Load more" or page links.
  *Criteria 3 — "prezentacja wyników"*
- [x] **Success feedback after inline photo edit**  
  `PhotoActions` shows an error state but no success toast/message after a successful save. Add a brief confirmation.  
  *Criteria 5 — "obsługa błędów"*
