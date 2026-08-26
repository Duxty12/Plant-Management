# Exotic Plant Management System — Build Prompt

## Scope

**Only build the frontend pages.** Do not build, scaffold, or run any backend/API server — no FastAPI, no database, no auth middleware. This is a frontend-only deliverable that will be wired up to a real backend later.

## Backend Reference Docs

Two reference files sit in the same project directory and describe the backend this frontend will eventually talk to:

- **`message.txt`** — lists all backend endpoints grouped by resource, in this format:

  ```
  ## Auth (`/auth`) — no auth required
  | Method | Endpoint | Description |
  |---|---|---|
  | POST | `/auth/register` | Register a new user |
  | POST | `/auth/login` | Login, returns JWT access token |
  ```

- **`backend.md`** — contains full backend details (request/response schemas, field types, validation rules, auth/JWT behavior, error formats, etc.) for every endpoint listed in `message.txt`.

Read both files before wiring up any page's data calls, and use them to determine which endpoint(s) each page/action should eventually call (e.g. the Login page → `POST /auth/login`, the Plants table → `GET /plants`, "Add Plant" form → `POST /plants`, etc.). Match field names in mock data and forms to the schemas in `backend.md` wherever possible, so swapping in the real API later is a drop-in change.

## API Wiring (Dummy URLs for Now)

Since no backend is being built yet, all data must stay in local/mock state (React state, static JSON, etc.) — pages must render and function fully without a live server. However, structure the code as if it were calling a real API:

- Centralize dummy endpoint URLs in one place (e.g. a `src/api/endpoints.js` / `constants.ts` file) using a placeholder base URL such as `https://api.example.com` or `http://localhost:8000`, e.g.:
  ```js
  export const API_BASE_URL = "https://api.example.com"; // TODO: replace with real FastAPI URL
  export const ENDPOINTS = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    plants: `${API_BASE_URL}/plants`,
    plantById: (id) => `${API_BASE_URL}/plants/${id}`,
    // ...one entry per endpoint found in message.txt
  };
  ```
- For each page's data-driven actions (fetch list, submit form, delete row, etc.), write a small stub function (e.g. `login(payload)`, `fetchPlants()`) that shows the intended `fetch`/`axios` call to the dummy URL, but returns/resolves mock data instead of actually calling out — clearly comment `// TODO: replace mock with real API call once backend is live`.
- **Document example request/response JSON** next to each stub, based on `backend.md`. For example:

  ```js
  // POST /auth/login
  // Request:  { "email": "user@exoticbotanicals.edu", "password": "hunter2" }
  // Response: { "access_token": "eyJhbGciOi...", "token_type": "bearer", "user": { "id": "usr_1", "name": "Dr. E. Thorne", "role": "admin" } }
  ```

  Do this for every page that maps to a backend action (login/register, list+create+update+delete for Plants/Species/Sections/Environment/Watering/Growth/Disease/Maintenance/Suppliers, Activity Timeline fetch, Health Alerts fetch + "Log Care" action, etc.), using the exact field names/types from `backend.md` so the JSON examples are accurate, not guessed.

---

Build a multi-page web application called **"Exotica Management System"** — an admin dashboard for tracking exotic/botanical plant specimens across a facility (greenhouses, sections, suppliers, environmental sensors, health/disease tracking).

## Tech & Global Setup

- Framework: React (functional components + hooks), React Router for navigation between pages.
- Styling: Tailwind CSS.
- Icons: lucide-react.
- Charts: recharts (for the environment trend lines and growth bar chart).
- Layout: persistent **left sidebar** (dark forest-green, ~250px wide) + **top header bar** (white) + light gray (`bg-gray-50`) content area on every page except Login.

## Design System

**Color palette**
- Primary/brand green (sidebar bg, primary buttons, active nav, headings): dark forest green, e.g. `#1B3B2C` / `#14532d` range.
- Accent green (badges, "Healthy" status, success states): medium green `#16a34a` / mint-green tint backgrounds `#dcfce7`.
- Warning/amber: `#f59e0b` on `#fef3c7` background.
- Danger/red: `#dc2626` on `#fee2e2` background.
- Info/blue: `#2563eb` on `#dbeafe` background.
- Neutral surfaces: white cards with `rounded-xl`, subtle `shadow-sm`, `border border-gray-100` on a `bg-gray-50` page background.
- Body text: dark slate/gray-800; secondary text: gray-500.

**Typography**
- Bold serif-free sans (system UI / Inter). Page titles: large bold (~28px). Section headers: semibold ~18px with an inline icon. Table headers: uppercase, small, letter-spaced, gray-500.

**Components used throughout**
- **Sidebar**: circular logo badge (green circle with initials or plant icon) + app name/subtitle at top; vertical nav list with icon + label, active item highlighted with a lighter green pill background; profile block pinned at the bottom.
- **Top header bar**: global search input with icon (left), quick nav text links (Inventory / Logs / Alerts), notification bell (with red dot badge), help "?" icon, settings gear icon, circular avatar, and a solid dark-green primary button (e.g. "+ Add Plant") on the far right.
- **Stat cards**: row of small white cards, each with an uppercase label, big bold number, and a small icon/badge (some cards use colored border-left or colored background for status like Healthy/Unhealthy).
- **Data tables**: white rounded card wrapping a table with uppercase gray column headers, zebra-free rows separated by thin borders, colored pill/badge for status columns (e.g. Healthy=green pill, Unhealthy=red pill, Under Treatment=amber pill), icon+action buttons (edit pencil, delete trash) on the right, and pagination controls at the bottom ("Showing X to Y of Z", numbered pages, prev/next chevrons).
- **Forms**: labeled inputs (uppercase small label above), placeholder text in light gray, icon-prefixed inputs where relevant, a full-width or prominent dark-green "Save" button.
- **Badges/pills**: rounded-full small colored labels for status/priority/category (e.g. Optimal, Active, Overdue, Critical, Warning, Routine, High Priority).
- **Empty/add state cards**: dashed-border card with a "+" circle icon and short instructional text, used to add a new entity (e.g. "Register New Section").

Build the following 13 pages/screens:

---

### 1. Login
Centered card (white, rounded, shadowed) on a soft green-tinted gradient background. Contents: circular dark-green icon badge with a plant/pot icon at top, "Exotic Botanicals" bold green title, "Management System Login" subtitle, labeled Email Address field (mail icon, placeholder `user@exoticbotanicals.edu`), labeled Password field (lock icon, show/hide eye toggle, placeholder dots) with a "Forgot Password?" link aligned to its label row, a "Remember me for 30 days" checkbox, a full-width dark-green "→] SIGN IN TO DASHBOARD" button, a divider, and small centered gray footer text: "Authorized Personnel Only. Secure Environmental Access."

### 2. Dashboard
Header: "Dashboard Overview" title + subtitle "Real-time metrics and environmental status for all active sections."
- Row of 6 stat cards: Total Plants, Total Species, Total Sections, Healthy (green accent), Unhealthy (red accent border/text), Diseases — each with a small icon.
- Two-column row: "Environmental Overview" card (3 sub-metrics: Avg Temperature, Avg Humidity, Avg Light with small up/down/stable trend indicators, "View Details" link) and "Health Overview" card (3 horizontal progress bars: Optimal 85% green, Requires Attention 11% dark, Critical 4% red, each with percentage label).
- Bottom: "Recent Plant Activities" table card with "View All Logs" link — columns: Time, Plant/Species (name + ID subtext), Action/Event, Section, Status (colored pill: Completed/Clear/Action Req).

### 3. Plants (Plant Inventory)
Header: "Plant Inventory" + subtitle, search input + Filter button top-right.
- Row of 4 stat cards: Total Plants, Healthy, Under Treatment, Alerts (each with a circular icon badge on the right side of the card).
- Table card: columns Plant ID, Species (thumbnail image + common name bold + scientific/family name subtext), Section, Supplier, Acquisition Date, Health Status (colored dot+pill: Healthy/Under Treatment/Unhealthy/Recovered), Owner, Actions.
- Pagination footer.

### 4. Species (Species Management)
Header: "Species Management" + subtitle, "+ Add Species" button top-right.
- Filter input card ("Filter species...").
- Table: Species ID, Common Name (bold), Scientific Name (italic-style gray), Origin Country (flag emoji/icon + name), No. of Plants (numeric pill badge), Actions.
- Pagination footer ("Showing 1 to 4 of 128 species").

### 5. Sections (Section Management)
Header: "Section Management" + subtitle.
- Grid of section cards (3 per row): each shows a muted section ID (e.g. SEC-A01), a 3-dot menu, bold section name, large bold "Active Plants" count, a divider, then "LATEST ENVIRONMENT RECORDS" label with 3 mini metric tiles (Temp/Humidity/Light with icons); a card can show a red "⚠ Alert" badge in its header and highlight the offending metric tile in red.
- A dashed-border "add new" card in the grid: centered "+" circle icon, "Register New Section" bold text, small gray helper text below.

### 6. Environment (Environment Monitoring)
Header: "Environment Monitoring" + subtitle.
- Row of 3 metric cards (Avg Temperature, Avg Humidity, Avg Light Level) each with a big number + unit and a small sparkline trend chart underneath, plus a small circular icon top-right (colored per metric).
- "Record Environment" form card: Section dropdown, Date & Time input, two-column Temp(°C)/Humidity(%) inputs, Light Level(lux) input, full-width dark-green "Save Record" button.
- "Historical Records" table card with "Export CSV" link top-right: columns Env ID, Section, Date & Time, Temp, Humidity, Light, Status (pill; red text for out-of-range values like low temp).

### 7. Watering & Fertilization (Watering & Fertilization Logs)
Header: title + subtitle, tabbed sub-nav ("Watering Records" / "Fertilization Records", underline-active style).
- Two-column layout: left "Record New Watering" form card (Watering ID auto-generated/read-only field, Date & Time, Amount (ml), Plant Selector dropdown, full-width "Save Record" button); right "Watering History" table card with date-filter input + "All Plants" dropdown in its header, columns Water ID, Plant (bold name + ID subtext), Date & Time, Amount (ml), Actions (edit/delete icons).

### 8. Growth (Growth & Reports)
Breadcrumb at top: "Plants > Records > Growth & Reports". Header: "Growth & Reports" + subtitle, "+ New Entry" button.
- Two-column layout: left "Growth Record Form" card (read-only Growth ID, Plant Specimen dropdown, Date + Height(cm) two-column inputs, Growth Stage dropdown + Leaf Count two-column inputs, "Clear" text button + "Save Record" green button).
- Right column stacked: "Height Progression" card with a bar chart (ascending bars, current/latest bar highlighted darker) and a small plant-ID badge top-right; below it "Growth History" table card with a search input in its header — columns Date, Plant ID, Height (cm), Stage (colored pill: Vegetative/Seedling/Flowering), Leaves.

### 9. Disease (Disease & Treatment Management)
Header: title + subtitle.
- "Active Disease Records" card with icon, subtitle "Tracking identified pathogens and affected specimens.", "+ Add Disease" button top-right; table columns: Disease ID/Name (bold ID + name subtext), Detection Date, Status (pill, e.g. red "Active"), Affected Plants (small circular avatar/initial chips with a "+N" overflow chip), Actions.

### 10. Maintenance (Maintenance Management)
Header + subtitle "Oversee routine facility upkeep and specialized botanical environment calibrations.", tabbed sub-nav in header bar (Overview/History/Settings) + "+ Add Entry" button. Two small stat cards top-right (Overdue red, Upcoming green).
- "Scheduled Tasks" section (2x2 card grid) with "View All" link: each task card has a colored left border (red=high priority/overdue, green=routine, amber=medium priority) plus a top badge row (priority + overdue tag), 3-dot menu, bold task title, description, and a due-date/assignee footer line.
- Below: "Maintenance Logs" table card (filter + download icons in header): columns Log ID, Date, Activity Type (colored pill), Plant ID/Target, Note; pagination footer.
- Right sidebar column: "Quick Actions" card (two buttons: "+ Log New Activity" dark green, "Schedule Maintenance" light green) and "Resource Links" list (Equipment Manuals, Vendor Contacts, Supply Inventory, each with an icon).

### 11. Suppliers
Header: "Suppliers" + subtitle, "+ Add Supplier" button.
- Row of 2 stat cards: Total Suppliers, Pending Reviews (with icon badges).
- Table card with Filter/Sort buttons and a "Showing X-Y of Z" counter in its header: columns ID, Company (colored letter-avatar + bold name), Contact Info (email + phone, each with small icon, stacked), Address, Plants Supplied (numeric, right-aligned); Previous/numbered-pages/Next pagination footer.

### 12. Plant Activity Timeline
Header row: subtitle "Chronological log of all events and interventions." on the left, "Select Specimen" dropdown (shows selected plant name + ID) on the right. Sidebar top shows a circular plant photo avatar instead of the usual logo badge.
- Filter pill row: "All Events" (active/filled) plus Watering, Fertilization, Disease, Treatment, Other (outlined pills).
- Vertical timeline list inside one card: each entry has a small colored icon-in-circle marker on the left (aligned to a vertical connecting line implied by spacing), a light-gray row background, a date chip + bold event title + right-aligned status text (green "Completed"/"Logged" or red bold "Action Required" for a disease-detection entry, which also nests a small "Treatment Applied" sub-card inside it), and a description line; some entries (Growth Record) show a 3-column mini stat row (Height with green "+2cm" delta, Leaf Count with green "+1" delta, Notes).
- "Load Older Records" outlined button centered at the bottom.

### 13. Health Alerts (Health & Care Alerts)
Header: title + subtitle (2 lines: "Monitor plants requiring immediate attention. Review critical health markers, environmental stress indicators, and urgent maintenance requests generated by the monitoring system.").
- Row of 3 stat cards with colored left border: Critical Alerts (red, with "+1 since yesterday" trend), Warnings (amber, "-3 since yesterday"), Stable/Watchlist (green, "Normal parameters") — each with a circular icon badge.
- "Active Alerts" table card with two filter dropdowns ("All Severities", "All Issue Types") in its header: columns Alert Level (colored dot+pill: Critical/Warning), Plant ID/Name (thumbnail + bold name + scientific name subtext), Issue (bold issue name + gray description subtext), Time Detected, Action (button: solid dark-green "Log Care" for critical, outlined "View Details" for warning).
- Pagination footer.

---

## Shared Sidebar Nav Items (in order)
Dashboard, Plants, Species, Search, Sections, Environment, Watering & Fertilization, Growth, Disease (or "Health & Disease"), Maintenance, Suppliers, Activity Timeline, Health Alerts — followed by a Profile block pinned to the bottom (avatar + name/role, plus Settings/Support links on some pages).

## Notes on Data
Use realistic placeholder/mock data (plant names like Monstera Deliciosa Albo, Philodendron Pink Princess, Ghost Orchid, Anthurium Warocqueanum, Calathea Orbifolia, etc.; IDs following patterns like PT-XXXX, SPC-XXXX, SEC-XXX, ENV-XXXX, WAT-XXXX, GRW-YYYY-XXXX, DIS-XXX, ML-XXXX, SUP-XXX). Wire up basic client-side interactivity (tab switching, dropdown open/close, sidebar active state on route change) but backend/data persistence is not required — static/mock state is fine.