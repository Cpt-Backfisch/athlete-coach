# athlete.coach — Status & Roadmap

> **Zweck dieser Datei:** Lebendiger Projektstand. Hier stehen aktueller Stand, To-dos, Phasen, Bugs.
> Vision & Architektur-Grundlagen → siehe `context.md`.

**Letztes Update:** 20.04.2026

---

## 0. Arbeitsweise (gilt für alle Phasen)

- **Sebastian** trifft ausschließlich **High-Level-Entscheidungen** (Stack, UX-Richtung, Feature-Prioritäten, Sicherheits-/Kosten-Freigaben).
- **Claude App** (Chat) berät, plant, generiert Doku, schlägt Architektur vor, formuliert Aufgaben für Claude Code.
- **Claude Code** (Terminal auf MacBook) implementiert den eigentlichen Code, committet, pusht.
- Sebastian liest keinen Code zeilenweise mit. Reviews passieren auf der Ebene „funktioniert es / sieht es richtig aus / sind Sicherheits- und Kostenregeln eingehalten".
- Daraus folgt: **Doku und CI sind kritisch**, weil sie Sebastians einziger verlässlicher Kontrollkanal sind.

---

## 1. Aktueller Stand in einem Satz

React-Migration ist abgeschlossen, App läuft unter /app/ parallel zur alten Monolith. Der Schema-Mismatch zwischen React-App und bestehendem Supabase-Schema ist behoben (PRs #32, #33) — alle Tabellen nutzen jetzt konsistent das JSON-Blob-Pattern der alten Monolith via jsonBlobStore-Helper. Strava-OAuth funktioniert. Nächste offene Themen: Kommentar-Bug, Aktivitäten-Duplikate, Import-Strategie, Projekt-Doku-Pattern.

---

## 2. Roadmap in Phasen

Die Entwicklung wird in **klar abgegrenzte Phasen** zerlegt. Eine Phase ist erst „fertig", wenn ihr Definition-of-Done erfüllt ist. Erst dann beginnt die nächste.

### ✅ Phase 0 — Tooling & Fundament _(abgeschlossen, 13.04.2026)_

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

#### Backlog Phase 0

- Schema-Drift-Check in CI — supabase-js Typescript-Codegen oder einfacher information_schema-Vergleich gegen erwartete Shapes im Code. Rationale: Der Schema-Mismatch, der in PRs #32 und #33 behoben wurde, hätte mit einem solchen Check von Anfang an auffallen müssen.

#### Detail: GitHub Actions CI

Workflow-Datei `.github/workflows/ci.yml` mit diesen Jobs (alle aktiv):

1. **Lint** — ESLint + Prettier-Check (`.js`-Dateien; index.html bewusst ausgenommen bis zur React-Migration)
2. **Secret-Scan** — `gitleaks/gitleaks-action@v2` scannt die gesamte Git-History bei jedem Push und PR
3. **Unit-Tests** — Vitest, 17 Tests in `tests/unit/` (`stravaDistance`, `vdot`)
4. **E2E-Tests** — Playwright, 5 Smoke-Tests gegen live GitHub Pages
5. **Deploy-Gate** — deployt `index.html` auf GitHub Pages; läuft nur auf `main`-Push nach grünem CI; BUILD-Timestamp wird automatisch gesetzt

**Kosten:** Public Repo → GitHub Actions kostenlos und unbegrenzt. Falls das Repo später privat wird → 2000 Min/Monat frei, danach kostenpflichtig.

#### Detail: Erste Tests

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

#### Detail: Deployment-Prozess

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

### 🧱 Phase 1 — Solo-App, lesende Freunde

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

**Beide Apps parallel live:**

- <https://cpt-backfisch.github.io/athlete-coach/> (alte App, produktiv)
- <https://cpt-backfisch.github.io/athlete-coach/app/> (neue App, aktuell Skelett)

- [ ] **State-of-the-art UI/UX**
  - Mobile-first Layout, getestet primär in Safari iOS und Safari macOS (keine native App, reine Web-App)
  - Touch-Targets ≥ 44px, iOS Safe Areas (`env(safe-area-inset-*)`), korrektes PWA-Verhalten beim „Zum Home-Bildschirm hinzufügen"
  - Light/Dark Mode über Tailwind + shadcn Theme
- [ ] **Bidirektionaler Telegram-Coach**
  - `api/telegram.js` als Webhook für eingehende Telegram-Messages
  - Konversationskontext in Supabase speichern (Tabelle `coach_messages`)
  - Claude Sonnet für Chat (statt nur Haiku-Push)
  - 💰 **Kostenhinweis schon jetzt:** echter Chat verbraucht deutlich mehr Tokens als die heutigen Push-Bewertungen. Vor Aktivierung Budget-Cap überlegen.
- [ ] **Sicherheits-Audit**
  - RLS-Policies durchsehen (besonders nach Modularisierung)
  - Secret-Rotation dokumentieren
  - CSP-Header für GitHub Pages (über `<meta http-equiv>`, da kein Server)
- [ ] **Sozial-Features für Freunde im Share-Link**
  - Likes/Reaktionen
  - Telegram-Notification an Sebastian bei neuen Kommentaren/Likes
- [ ] **Strava Auto-Sync** beim App-Start (kein Polling, nur on-open)
- [ ] **`context.md` aktualisieren am Ende von Phase 1** — siehe Abschnitt 6 unten. Zu diesem Zeitpunkt haben sich Architektur (React-Stack), Tabellen (`coach_messages`), Vercel-Functions (`api/telegram.js`) und der Status der Single-File-Schuld geändert. **Trigger: bevor Phase 1 als „done" markiert wird.**

**DoD:** Sebastian nutzt die App täglich auf Mobile und Laptop ohne Reibung; Freunde haben einen Link, mit dem sie lesen und kommentieren; Telegram-Chat mit dem Coach funktioniert in beide Richtungen; Sicherheitsregeln dokumentiert und in CI geprüft; `context.md` ist auf den neuen Stand gebracht.

---

### 👥 Phase 2 — Multi-User

**Ziel:** Freunde können sich registrieren und die App selbst als Athleten nutzen.

- [ ] User-Onboarding-Flow (Registrierung, eigene Strava-Verbindung)
- [ ] Mandantentrennung in Supabase verifizieren (RLS pro `user_id` für _alle_ Tabellen)
- [ ] Per-User-Einstellungen (eigene Wettkämpfe, eigener Coach-Prompt)
- [ ] Soziale Features zwischen registrierten Athleten (Folgen, Reaktionen)
- [ ] Quota / Rate-Limiting für Claude-API pro User (sonst frisst ein Power-User das Budget)
- [ ] DSGVO-Basics: Datenschutzerklärung, Datenexport, Account-Löschung
- [ ] Optional: eigene Domain (`athlete.coach`?) — vorher Verfügbarkeit & Kosten prüfen
- [ ] **`context.md` erneut aktualisieren am Ende von Phase 2** — Vision-Abschnitt von „Solo + Lese-Freunde" auf „Multi-User produktiv" umschreiben, neue Tabellen und User-Modell ergänzen.

**DoD:** Mindestens ein zweiter realer Nutzer kann die App vollständig und sicher allein benutzen; `context.md` reflektiert den Multi-User-Stand.

---

### 🚀 Phase 3+ — Ausbau (Backlog, ungewichtet)

- KI-Trainingsplan dynamisch aus Wettkampfterminen
- Wettkampfprognosen pro Segment
- Pace-Rechner
- Garmin FIT-Import (für HR-Stream und HRV)
- Aktivitätsdetailseite mit Karten und Charts (teilweise da)
- PWA-Push-Notifications
- Wöchentliche Coach-Zusammenfassung als interaktiver Report (heute nur Telegram-Text)

---

## 3. Bekannte Bugs

**1. Kommentar-Erstellung schlägt fehl**

POST /rest/v1/comments?select=* → 400 (Bad Request).
Datum: 20.04.2026. Vermutete Ursache: gleicher Schema-Mismatch wie bei den anderen Tabellen — Tabelle comments wurde in PR #33 nicht geprüft und nicht gefixt. Reproschritte: In Share-View einen Kommentar schreiben und abschicken.

**2. Aktivitäten erscheinen doppelt**

In der Aktivitäten-Liste erscheinen fast alle Einheiten doppelt: einmal mit Pace-Angabe und farbigem Punkt, einmal ohne Pace und mit grauem Punkt.
Datum: 20.04.2026. Vermutete Ursache noch offen: entweder Alt-Duplikate aus Monolith-CSV + Strava-Webhook ohne Dedup, oder beide Apps haben während der parallelen Koexistenz doppelt geschrieben. Zu untersuchen.

**3. Hard-Reload auf App-Seite führt zu 404**

Cmd+Shift+R auf https://cpt-backfisch.github.io/athlete-coach/app/ landet auf https://cpt-backfisch.github.io/#/activities (ohne /athlete-coach/app/).
Datum: 20.04.2026. Vermutete Ursache: HashRouter berücksichtigt base-Path beim Reload nicht. Low priority.

---

## 4. Offene Fragen / Entscheidungen

- **Eigene Domain in Phase 2?** Kosten & Aufwand vs. Nutzen
- **Vercel-Aufräumen:** altes Projekt `athlete-coach-proxy` löschen, sobald sicher keine Referenzen mehr dranhängen
- **Logo-Design für PWA-Icon:** Ausstehend, blockiert Sequenz-Schritt 13 (PWA-Finalisierung). Nicht dringend.
- **Strava-Import-Strategie:** Initialer CSV-Import (Code aus Monolith übernehmen) vs. API-Bulk-Import mit Throttling. Strava-Rate-Limits (200 req / 15 min, 2000 req / Tag) müssen berücksichtigt werden. Streams-Daten: on-demand beim Öffnen einer Aktivität cachen, nicht bulk.
- **Doku-Pattern für status.md:** Projekt-Anweisungen dürfen nicht nur „lies die Datei im Repo" sagen, weil das Fetchen der raw-URL inkonsistent funktioniert. Sebastian trägt den aktuellen Stand beim Chat-Start manuell in den Chat ein. Entsprechend müssen die Projekt-Anweisungen angepasst werden.

---

## 5. Letzte Änderungen

| Datum      | Was                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 20.04.2026 | PR #33 gemergt: Systematischer Schema-Fix für activities, races, past_results, week_frame (JSON-Blob via neuem jsonBlobStore.ts-Helper) + public_shares (share_token) + Debug-Log-Cleanup aus stravaOAuth.ts. React-App jetzt vollständig schema-kompatibel zur alten Monolith. |
| 20.04.2026 | PR #32 gemergt: Fix für Strava-OAuth-Bug — strava_token und settings auf JSON-Blob-Schema umgestellt. Pre-existing Lint-Fehler beiläufig ausgeräumt. |
| 20.04.2026 | PR #31 gemergt (Diagnose-Only): Temporäre Debug-Logs eingefügt, die den Schema-Mismatch als Ursache offengelegt haben. Logs in PR #33 wieder entfernt. |
| 19.04.2026 | T1 MVP React-Migration abgeschlossen. Alle 12 Schritte (Auth, Layout, Strava, CRUD, Listen, Detail, Trainingsplan, Dashboard, Events, Coach+Telegram, Einstellungen, Share-View) gemergt. Deploy-Gate aktiv, App live unter /athlete-coach/app/. Strava OAuth Bug offen.                                                                                                                                                                                                                                                           |
| 18.04.2026 | Migrations-Sequenz erstellt (`migration-sequence.md`): 13 Schritte in 5 Schichten, 2 Bug-Sessions als Zwischenschritte. Geschätzte Dauer T1-MVP: 21–31 Arbeitstage. Umschalt-Tag-Ziel: August/September 2026. (PR #15)                                                                                                                                                                                                                                                                                                             |
| 18.04.2026 | Feature-Parity-Priorisierung: 115 Features in 13 Gruppen priorisiert (47 T1, 34 T2, 5 T3, 4 Phase 2, 24 kann weg). Neue Features: Streak-Counter, TSS/TRIMP, ACWR, Race-Day-View, Tapering-Hinweis, Rennbericht, Triathlon-Splits, Besucher-Tracking, u.a. Secrets (Claude API Key, Telegram Token/Chat ID) werden aus Frontend entfernt → nur noch Vercel Env Vars. Coach-Chat wird Telegram-only (kein Web-Chat mehr). (PR #14)                                                                                                  |
| 14.04.2026 | Doku-Korrektur in `context.md` §4 basierend auf Feature-Parity-Review (PR #12): „HRV-Zonenverteilung" → „HF-Zonenverteilung (5 Zonen nach max HR)" — kein echter HRV-Import vorhanden. Belastungsampel war bereits korrekt enthalten. (PR #13)                                                                                                                                                                                                                                                                                     |
| 14.04.2026 | **Migrations-Schritt 3 abgeschlossen:** `feature-parity.md` angelegt — 67 Features der alten App in 13 Gruppen als Checkliste. Alle Einträge auf `[Priorität: ?]`. Priorisierung durch Sebastian steht noch aus. (PR #12)                                                                                                                                                                                                                                                                                                          |
| 14.04.2026 | **Migrations-Schritt 2 abgeschlossen:** CI baut und deployt parallel alte `index.html` auf `/` und neue React-App auf `/app/`. Erste Live-URL der neuen App: https://cpt-backfisch.github.io/athlete-coach/app/ (PR #10: Vite `base`-Pfad; PR #11: CI dual deploy).                                                                                                                                                                                                                                                                |
| 14.04.2026 | Phase-1-Migrations-Fahrplan formalisiert (Session mit Claude Opus): 12 granulare Schritte, Strangler-Fig-Strategie, Parallelbetrieb alte App auf `/` und neue App auf `/app/`. Migrations-Schritt 1 (Vite-Skelett) abgeschlossen (PR #7). Migrations-Schritt „Pre-Push-Regel in CLAUDE.md" ergänzt (PR danach). Risiken & Rollback dokumentiert: Feature-Parity-Checkliste, Storage-Key-Isolation für Supabase-Auth, Git-Tag `v1-legacy-last` vor Umschalt-Tag, Revert-Strategie pro PR.                                           |
| 13.04.2026 | **Phase 1 gestartet.** Design-Session in Claude App (Opus) abgeschlossen. Entscheidungen: Design-Sprache "offen & selbstbewusst", Dark-first (#141416) mit Light-Toggle (#FAFAF8) und OS-Auto-Switch, vier Sportart-Farben + separates Status-Farb-System, Geist Sans als Schrift, Radius 12px, Hybrid-Navigation. Ergebnis als `design.md` ins Repo-Root committet — dient als Single Source of Truth für shadcn/ui-Theme-Config in der bevorstehenden React-Migration. Logo-Design als Backlog-Item für nach Phase 1 vorgemerkt. |
| 13.04.2026 | **Phase 0 abgeschlossen.** PR #3: 17 Vitest Unit-Tests (stravaDistance + VDOT) + 5 Playwright Smoke-Tests eingerichtet, CI-Platzhalter durch echte Jobs ersetzt. PR #4: `context.md` und `status.md` ins Repo gelegt, `CLAUDE.md` mit Pflichtlektüre-Hinweis ergänzt. PR #5: Deploy-Gate scharf geschaltet — CI-Pipeline Lint → Secret-Scan → Unit → E2E → Deploy, BUILD-Timestamp automatisch, GitHub Pages Source auf „GitHub Actions" umgestellt.                                                                               |
| 12.04.2026 | Lokales Setup MacBook komplett: VS Code + 10 Extensions installiert, Workspace-Root korrigiert (vorher irrtümlich auf Eltern-Ordner "Mupsi Dokumente"), Warp Terminal, Homebrew, nvm, Node 20.20.2, npm 10.8.2, GitHub CLI. `.vscode/extensions.json` auf vollständige 10er-Empfehlungsliste erweitert (PR gemergt). ESLint-Lint-Job mit `--no-error-on-unmatched-pattern` stabilisiert für leere Code-Basis. Phase-0-Tage 1–5 damit durch.                                                                                        |
| 12.04.2026 | PR #1 gemergt: CI-Workflow live (4 aktive Jobs, Deploy-Gate als Skelett). Branch-Protection auf `main` aktiviert (PR-Pflicht, Status-Checks, force push blockiert). GitHub Secret Protection aktiv. Tag 5 (gitleaks) damit abgeschlossen.                                                                                                                                                                                                                                                                                          |
| 08.04.2026 | Frontend-Stack für Phase 1 entschieden: Vite + React + TypeScript + Tailwind + shadcn/ui + vite-plugin-pwa + recharts + react-leaflet. Phase-1-Modularisierungs-Bullet entsprechend konkretisiert. Arbeitsweise (Sebastian = High-Level, Claude = Implementierung) explizit in Abschnitt 0 dokumentiert. `context.md`-Update als To-do in Phase 1 und Phase 2 verankert.                                                                                                                                                           |
| 08.04.2026 | Phase 0 ergänzt: explizite To-dos für `.github/workflows/ci.yml` und Frontend-Stack-Session vor Phase-1-Start. Test-Setup festgelegt: Playwright (5 Smoke) + Vitest (2 Unit).                                                                                                                                                                                                                                                                                                                                                      |
| 08.04.2026 | Neue Doku-Struktur eingeführt: `context.md` (stabil) + `status.md` (lebendig) + `CLAUDE.md` (für Claude Code). Phasenplan formalisiert, Vision aktualisiert.                                                                                                                                                                                                                                                                                                                                                                       |

---

## 6. Wann muss `context.md` angepasst werden?

`context.md` ist die _stabile_ Schicht. Sie soll sich nur ändern, wenn sich Vision, Architektur oder Rahmenbedingungen wirklich verschieben. Konkret heißt das:

**Pflicht-Update am Ende von Phase 1:**

- Architektur-Tabelle (Abschnitt 3): „Single-Page `index.html`, Vanilla JS" → „Vite + React + TypeScript + Tailwind + shadcn/ui, gebaut über GitHub Actions"
- Supabase-Tabellen: `coach_messages` ergänzen
- Vercel-Functions: `api/telegram.js` ergänzen
- Abschnitt 4 „Was es heute schon kann": Single-File-Schuld-Hinweis entfernen oder umformulieren
- Abschnitt 7 Constraints: ggf. Hinweis ergänzen, dass Build-Step nötig ist

**Pflicht-Update am Ende von Phase 2:**

- Vision (Abschnitt 2): Phase 1/Phase 2 umschreiben — Multi-User ist dann Realität, nicht mehr Plan
- Architektur-Tabelle: Domain ergänzen, falls eigene Domain gekauft
- Tabellen-Liste: alles, was für Multi-User dazugekommen ist
- Constraints: ggf. DSGVO-Hinweise

**Sofort-Update jederzeit, wenn:**

- ein neuer kostenpflichtiger Dienst dazukommt (Abschnitt 6 „Kostenbewusstsein")
- eine neue Sicherheitsregel nötig wird (Abschnitt 5)
- sich die Sprache, Zielgruppe oder Solo-/Team-Konstellation ändert
- sich die Doku-Pattern-Konventionen ändern (z.B. wie status.md in Chat-Kontext gebracht wird) — dann auch in Projekt-Anweisungen nachziehen

**Regel für Claude (App und Code):** Beim Abschluss einer Phase aktiv prüfen, ob `context.md` nachgezogen werden muss, und Sebastian einen konkreten Diff vorschlagen, _bevor_ die Phase als „done" markiert wird.

---

## 7. Learnings aus der Migration (Stand 20.04.2026)

**JSON-Blob-Pattern ist Repo-Konvention, nicht Ausnahme**: Bei der React-Migration wurde fälschlich angenommen, die Supabase-Tabellen hätten normalisierte Spalten. Tatsächlich nutzen 6 von 7 beobachteten Tabellen (activities, races, past_results, week_frame, strava_token, settings) das Pattern `user_id uuid, data text, updated_at timestamptz`, bei dem alle User-Daten als JSON-String in `data` liegen. Einzige Ausnahme: `public_shares` mit echten Spalten. Künftige Migrationsarbeit muss dieses Pattern bewusst respektieren oder explizit dagegen entscheiden — nicht implizit normalisieren.

**Clientseitige Filter/Sortierung**: Weil das Schema nicht nach einzelnen Feldern filtern lässt, wird in allen JSON-Blob-Tabellen clientseitig gefiltert und sortiert (siehe jsonBlobStore.ts). Bei den Datenmengen der Solo-App (einige hundert Aktivitäten, wenige Rennen) ist das unproblematisch. Falls später Multi-User oder größere Datenmengen kommen: PostgreSQL-JSON-Queries (z.B. `data->>'date'`) oder Schema-Normalisierung sind die Eskalationsstufen.

**Ein-PR-pro-Baustelle hat gelohnt**: Die Bug-Detektivarbeit hat drei gezielte PRs gebraucht (Diagnose, Teilfix, Gesamtfix) statt sich in blinden Versuchen zu verlieren. Leitprinzip: Bei komplexen Bugs erst eine Diagnose-PR mit temporärem Logging, danach gezielter Fix-PR. Logs und Fix immer in getrennten PRs.
