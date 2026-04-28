# Archiv: Phase 0 & Phase 1 — abgeschlossene Schritte

> Ausgelagert aus status.md am 28.04.2026 zur Verschlankung.
> Tagesaktueller Stand → status.md.

---

## Phase 0 — Tooling & Fundament _(abgeschlossen, 13.04.2026)_

**Ziel:** Sebastian arbeitet mit professionellem Setup; jede Änderung wird automatisch geprüft.

- [x] **VS Code einrichten** (MacBook) — installiert, Workspace auf Projekt-Root geöffnet, alle 10 empfohlenen Extensions installiert (12.04.2026)
  - Installierte Extensions: ESLint, Prettier, GitLens, Supabase, REST Client, Error Lens, Tailwind CSS IntelliSense, GitHub Pull Requests, Markdown All in One, Live Server
  - Workspace-Settings committet: `.vscode/settings.json`, `.vscode/extensions.json`
- [x] **Warp Terminal installieren** auf MacBook (12.04.2026)
- [x] **Node-Toolchain eingerichtet** — Homebrew, nvm, Node 20.20.2, npm 10.8.2, GitHub CLI (`gh`) (12.04.2026)
- [x] **`.editorconfig`, `.gitignore`, `.prettierrc`, `.prettierignore`** ins Repo (12.04.2026)
- [x] **`.github/workflows/ci.yml` geschrieben** — 4 Jobs: Lint, Secret-Scan, Unit-Tests-Platzhalter, E2E-Tests-Platzhalter; Deploy-Gate als auskommentiertes Skelett (PR #1, 12.04.2026)
- [x] **GitHub Actions CI scharf geschaltet** auf `main` und Pull Requests — alle 4 Jobs grün (12.04.2026)
- [x] **Branch-Protection auf `main`** — PR + grüner CI Pflicht, force push blockiert, restrict deletions aktiv (12.04.2026)
- [x] **Secret Scanning aktiv** — GitHub Secret Protection (public Repo, automatisch) + gitleaks im CI (12.04.2026)
- [x] **Branch-Strategie festgelegt und erzwungen:** `main` = produktiv, Feature-Branches → PR → CI grün → Merge → Auto-Deploy. Durch Branch-Protection technisch durchgesetzt (12.04.2026)
- [x] **Frontend-Stack für Phase 1 entschieden (08.04.2026):** Vite + React + TypeScript + Tailwind + shadcn/ui. Begründung: meistverbreiteter moderner Stack → beste Claude-Code-Unterstützung in jeder Session, shadcn/ui liefert State-of-the-Art-Komponenten ohne eigene Designarbeit, statisch deploybar auf GitHub Pages, `vite-plugin-pwa` ersetzt den heutigen BUILD-Timestamp-Trick. Look-and-Feel wird in eigener Design-Session zu Beginn von Phase 1 festgelegt.
- [x] **Erste Test-Cases geschrieben und in CI eingebunden** — 17 Vitest Unit-Tests (stravaDistance + VDOT) + 5 Playwright Smoke-Tests gegen live GitHub Pages; CI-Platzhalter-Jobs durch echte Jobs ersetzt (PR #3, 13.04.2026)
- [x] **Professioneller Deployment-Prozess** — Deploy-Gate scharf geschaltet; CI-Pipeline: Lint → Secret-Scan → Unit-Tests → E2E-Tests → Deploy; BUILD-Timestamp automatisch; GitHub Pages Source auf „GitHub Actions" umgestellt (PR #5, 13.04.2026)

**DoD:** Push auf `main` triggert CI, Tests laufen grün, Deployment ist nachvollziehbar protokolliert, Frontend-Stack-Entscheidung für Phase 1 ist getroffen und dokumentiert.

**DoD-Status (13.04.2026):** 3 von 4 erfüllt.

- ✅ CI läuft bei jedem Push/PR grün durch
- ✅ Frontend-Stack-Entscheidung getroffen und dokumentiert (React-Migration inzwischen durchgeführt — 19.04.2026)
- ✅ Echte Tests eingerichtet und in CI eingebunden (PR #3, 13.04.2026)
- ✅ Deploy-Gate scharf geschaltet, Auto-Deploy aus CI aktiv (PR #5, 13.04.2026)

### Detail: GitHub Actions CI

Workflow-Datei `.github/workflows/ci.yml` mit diesen Jobs (alle aktiv):

1. **Lint** — ESLint + Prettier-Check (`.js`-Dateien; index.html bewusst ausgenommen bis zur React-Migration)
2. **Secret-Scan** — `gitleaks/gitleaks-action@v2` scannt die gesamte Git-History bei jedem Push und PR
3. **Unit-Tests** — Vitest, 17 Tests in `tests/unit/` (`stravaDistance`, `vdot`)
4. **E2E-Tests** — Playwright, 5 Smoke-Tests gegen live GitHub Pages
5. **Deploy-Gate** — deployt `index.html` auf GitHub Pages; läuft nur auf `main`-Push nach grünem CI; BUILD-Timestamp wird automatisch gesetzt

**Kosten:** Public Repo → GitHub Actions kostenlos und unbegrenzt. Falls das Repo später privat wird → 2000 Min/Monat frei, danach kostenpflichtig.

### Detail: Erste Tests

Festgelegt: **Playwright** (Smoke) + **Vitest** (Unit für rechenlastige Stellen).

- **Vitest** — 2 Unit-Tests (Tag 6–7):
  1. Schwimm-Distanz-Konvertierung (Meter vs. km)
  2. VDOT-/VO2max-Berechnung
- **Playwright** — 5 Smoke-Tests (Tag 8–10):
  1. App lädt ohne JS-Fehler
  2. Login-Screen erscheint, wenn nicht eingeloggt
  3. Dashboard rendert nach Mock-Login
  4. Share-Link öffnet Read-Only-View
  5. Service Worker / PWA-Manifest valide

### Detail: Deployment-Prozess

**Aktueller Prozess (seit 13.04.2026):**

1. Feature-Branch → lokale Entwicklung → `npm run test` lokal grün
2. Push zum Feature-Branch → CI läuft → PR öffnen
3. CI grün + Self-Review → Merge nach `main`
4. Deploy-Gate-Job deployt automatisch: setzt BUILD-Timestamp, packt `index.html` als Artefakt, deployt auf GitHub Pages über `actions/deploy-pages`
5. Optional: Slack/Telegram-Ping bei erfolgreichem Deploy (noch nicht eingerichtet)

**Dualer Deploy (seit 14.04.2026, Migrations-Schritt 2):**

Seit PR #11 baut und deployt die CI-Pipeline beide Apps parallel in einem gemeinsamen `_site/`-Artefakt:

- `index.html` (alte App) → `_site/` → `https://cpt-backfisch.github.io/athlete-coach/`
- `app/dist/` (neue React-App) → `_site/app/` → `https://cpt-backfisch.github.io/athlete-coach/app/`

Ein dedizierter Job `build-app` baut die React-App (`cd app && npm ci && npm run build`) und lädt `app/dist/` als Artefakt hoch. Der `deploy-gate`-Job lädt dieses Artefakt herunter und kombiniert beide Apps in `_site/`.

**Warum `base: '/athlete-coach/app/'` in `app/vite.config.ts` nötig ist:** Vite referenziert Assets standardmäßig mit absolutem Pfad (`/assets/…`). Da die neue App nicht im Root, sondern unter `/athlete-coach/app/` liegt, würden Asset-URLs ohne diesen Wert auf 404 laufen. Mit `base` gesetzt zeigen alle generierten `<script>`- und `<link>`-Tags auf den richtigen Subpfad.

---

## Phase 1 — Solo-App, lesende Freunde (T1-MVP abgeschlossen, 19.04.2026)

**Ziel:** Saubere, moderne, sichere App für Sebastian + read-only/kommentierender Zugang für Freunde über gesicherten Link.

- [x] **Design-Session zu Phase-1-Start** (13.04.2026) — Look-and-Feel festgelegt: "offen & selbstbewusst" (Linear/Superhuman-Vibe), Dark-Mode default (#141416) + Light-Mode (#FAFAF8) mit Auto-Switch, vier Sportart-Farben (Laufen Purple #8E6FE0, Schwimmen Electric Blue #3359C4, Rad Orange #FF7A1A, Sonstiges Rost #B54A2E), Status-Farben separat (Grün/Gelb/Rot), Schrift Geist Sans Weight 500/600, Border-Radius 12px, Hybrid-Navigation (Sidebar Desktop / Bottom-Nav Mobile). Wort-Marke Variante B (Schriftzug mit Purple-Akzent-Punkt), Logo-Slot im Header vorgesehen für späteres Logo-Design. Vollständig dokumentiert in `design.md`.
- [x] **Migrations-Schritt 1: Vite-Skelett in `app/`** (14.04.2026) — PR #7. Leeres Vite+React+TS-Projekt in `app/`, alte `index.html` unangetastet. Versionen: Node 20.20.2, Vite 8.0.4, React 19.2.4, TS 6.0.2.
- [x] **Migrations-Schritt 2: CI erweitern, `/app/` deployen** (14.04.2026) — PR #10 (Vite `base`-Pfad) + PR #11 (CI dual deploy). CI baut `app/` via Job `build-app` und kombiniert beide Apps in `_site/`. Neue App live unter `https://cpt-backfisch.github.io/athlete-coach/app/`.
- [x] **Migrations-Schritt 3: Feature-Parity-Checkliste erstellen** (14.04.2026) — PR #12. `feature-parity.md` angelegt: 67 Features in 13 Gruppen. Alle auf `[Priorität: ?]` — Sebastian priorisiert in separater Session.
- [x] **Doku-Korrektur `context.md` §4** (14.04.2026) — „HRV-Zonenverteilung" → „HF-Zonenverteilung (5 Zonen nach max HR)". (PR #13)
- [x] **Migrations-Schritt 3b: Feature-Parity-Priorisierung abgeschlossen** (18.04.2026) — PR #14. 115 Features in 13 Gruppen, Tier-Einteilung T1 (47 MVP) / T2 (34 Polish) / T3 (5 Advanced). Neue Features identifiziert: Streak-Counter, TSS/TRIMP, ACWR, Race-Day-View u.a. Secrets (Claude API Key, Telegram Token/Chat ID) werden aus Frontend entfernt → nur noch Vercel Env Vars. Coach-Chat wird Telegram-only (kein Web-Chat mehr).
- [x] **Migrations-Sequenz erstellt** (18.04.2026) — PR #15. `migration-sequence.md`: 13 Schritte in 5 Schichten, 2 Bug-Sessions als Zwischenschritte. Geschätzte Dauer T1-MVP: 21–31 Arbeitstage. Ziel: Umschalt-Tag August/September 2026.
- [x] **Frontend auf Vite + React + TypeScript + Tailwind + shadcn/ui migrieren** _(abgeschlossen, 19.04.2026)_ — Alle 12 Migrations-Schritte implementiert und gemergt. T1 MVP feature-complete. PRs #16–#29.
  - [x] Auth (Login/Logout, Supabase Session)
  - [x] Layout (Sidebar Desktop / Bottom-Nav Mobile, Dark Mode)
  - [x] Strava OAuth + Sync
  - [x] Aktivitäten-CRUD (Liste, Detail, Bearbeiten, Löschen)
  - [x] Trainingsplan (Wochenrahmen + Ziele)
  - [x] Dashboard (KPI-Karten, Volumen-Chart)
  - [x] Events (Wettkämpfe + Ergebnisse)
  - [x] Coach + Telegram (Einstellungen, Share-Token)
  - [x] Share-View (Read-Only für Freunde, Kommentar-Sektion)
  - [x] Schema-Kompatibilität zur alten Monolith hergestellt (PRs #32, #33, 20.04.2026)
