# athlete.coach — Status & Roadmap

> **Zweck dieser Datei:** Lebendiger Projektstand. Hier stehen aktueller Stand, To-dos, Phasen, Bugs.
> Vision & Architektur-Grundlagen → siehe `context.md`.

**Letztes Update:** 12.04.2026

---

## 0. Arbeitsweise (gilt für alle Phasen)

- **Sebastian** trifft ausschließlich **High-Level-Entscheidungen** (Stack, UX-Richtung, Feature-Prioritäten, Sicherheits-/Kosten-Freigaben).
- **Claude App** (Chat) berät, plant, generiert Doku, schlägt Architektur vor, formuliert Aufgaben für Claude Code.
- **Claude Code** (Terminal auf MacBook) implementiert den eigentlichen Code, committet, pusht.
- Sebastian liest keinen Code zeilenweise mit. Reviews passieren auf der Ebene „funktioniert es / sieht es richtig aus / sind Sicherheits- und Kostenregeln eingehalten".
- Daraus folgt: **Doku und CI sind kritisch**, weil sie Sebastians einziger verlässlicher Kontrollkanal sind.

---

## 1. Aktueller Stand in einem Satz

Lokales Setup steht, CI läuft grün, Branch-Protection aktiv — das Fundament für professionelles Arbeiten ist gelegt. Nächster Schritt: echte Tests (Vitest, Playwright) und Deploy-Gate, danach React-Migration in Phase 1.

---

## 2. Roadmap in Phasen

Die Entwicklung wird in **klar abgegrenzte Phasen** zerlegt. Eine Phase ist erst „fertig", wenn ihr Definition-of-Done erfüllt ist. Erst dann beginnt die nächste.

### 🛠 Phase 0 — Tooling & Fundament _(in Arbeit, Tage 1–5 abgeschlossen)_

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
- [ ] **Erste Test-Cases schreiben und in CI einbinden** — Vitest Unit-Tests (Tag 6–7) und Playwright Smoke-Tests (Tag 8–10), ersetzen die aktuellen Platzhalter-Jobs
- [ ] **Professioneller Deployment-Prozess** — Deploy-Gate scharf schalten, Auto-Deploy aus CI statt direkt aus `main` (Tag 11)

**DoD:** Push auf `main` triggert CI, Tests laufen grün, Deployment ist nachvollziehbar protokolliert, Frontend-Stack-Entscheidung für Phase 1 ist getroffen und dokumentiert.

**DoD-Status (12.04.2026):** 2 von 4 erfüllt.

- ✅ CI läuft bei jedem Push/PR grün durch
- ✅ Frontend-Stack-Entscheidung getroffen und dokumentiert
- ⏳ Echte Tests fehlen noch (Tag 6–10)
- ⏳ Deploy-Gate nicht scharf geschaltet (Tag 11)

#### Detail: GitHub Actions CI

Workflow-Datei `.github/workflows/ci.yml` aktuell mit diesen Jobs:

1. **Lint** — ESLint + Prettier-Check (`.js`-Dateien, `--no-error-on-unmatched-pattern` für aktuell leere Code-Basis; index.html bewusst ausgenommen bis zur React-Migration)
2. **Secret-Scan** — `gitleaks/gitleaks-action@v2` scannt die gesamte Git-History bei jedem Push und PR
3. **Unit-Tests** — Platzhalter-Job (wird an Tag 6–7 mit echtem Vitest ersetzt)
4. **E2E-Tests** — Platzhalter-Job (wird an Tag 8–10 mit echtem Playwright ersetzt)
5. **Deploy-Gate** — auskommentiertes Skelett, wird an Tag 11 aktiviert

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

Heute: `git push` → GitHub Pages live. Funktional, aber ohne Sicherheitsnetz.

**Neuer Prozess (ab Tag 11):**

1. Feature-Branch → lokale Entwicklung → `npm run test` lokal grün
2. Push zum Feature-Branch → CI läuft → PR öffnen
3. PR-Preview-Deployment auf Vercel (optional, kostenfrei) oder GitHub Pages Preview Action
4. CI grün + Self-Review → Merge nach `main`
5. Auto-Deploy auf GitHub Pages über Actions (nicht mehr direkt aus `main`-Branch, sondern über Build-Step → BUILD-Timestamp wird automatisch gesetzt → Artefakt deployt)
6. Optional: Slack/Telegram-Ping bei erfolgreichem Deploy

---

### 🧱 Phase 1 — Solo-App, lesende Freunde

**Ziel:** Saubere, moderne, sichere App für Sebastian + read-only/kommentierender Zugang für Freunde über gesicherten Link.

- [ ] **Design-Session zu Phase-1-Start** — Look-and-Feel-Richtung festlegen (clean/minimal vs. sportlich/energetisch vs. dark-first), Farb-Tokens, Typografie, Spacing-Skala. Ergebnis als `design.md` ablegen. **Muss vor der Migration stattfinden**, damit shadcn/ui-Theme direkt richtig konfiguriert wird.
- [ ] **Frontend auf Vite + React + TypeScript + Tailwind + shadcn/ui migrieren**
  - Neues Repo-Layout mit `src/`, Komponenten-Struktur, Routing (React Router)
  - shadcn/ui initialisieren und Basis-Komponenten ziehen (Button, Card, Dialog, Tabs, Toast, Input)
  - State-Handling: React Context für Auth/Settings, evtl. Zustand oder TanStack Query für Server-State (Supabase) — Entscheidung im Migrationsschritt
  - `vite-plugin-pwa` für Service Worker, Manifest, automatisches Cache-Busting (ersetzt heutigen BUILD-Timestamp)
  - Charts: `recharts` (passt zu shadcn/ui)
  - Karte: `react-leaflet` (Sebastian nutzt heute bereits Leaflet)
  - Supabase: `@supabase/supabase-js` wie heute
  - Migration in Schritten, nicht Big-Bang: zuerst Skelett + Auth + Dashboard, dann Activity-Detail, dann Wettkämpfe, dann Share-View
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
  - „Zugangslink mit Ablaufdatum"
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

_Keine kritischen Bugs aktuell._

Falls einer auftaucht: hier eintragen mit Datum, Beschreibung, Reproschritten.

---

## 4. Offene Fragen / Entscheidungen

- **Eigene Domain in Phase 2?** Kosten & Aufwand vs. Nutzen
- **Vercel-Aufräumen:** altes Projekt `athlete-coach-proxy` löschen, sobald sicher keine Referenzen mehr dranhängen

---

## 5. Letzte Änderungen

| Datum      | Was                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.04.2026 | Lokales Setup MacBook komplett: VS Code + 10 Extensions installiert, Workspace-Root korrigiert (vorher irrtümlich auf Eltern-Ordner "Mupsi Dokumente"), Warp Terminal, Homebrew, nvm, Node 20.20.2, npm 10.8.2, GitHub CLI. `.vscode/extensions.json` auf vollständige 10er-Empfehlungsliste erweitert (PR gemergt). ESLint-Lint-Job mit `--no-error-on-unmatched-pattern` stabilisiert für leere Code-Basis. Phase-0-Tage 1–5 damit durch. |
| 12.04.2026 | PR #1 gemergt: CI-Workflow live (4 aktive Jobs, Deploy-Gate als Skelett). Branch-Protection auf `main` aktiviert (PR-Pflicht, Status-Checks, force push blockiert). GitHub Secret Protection aktiv. Tag 5 (gitleaks) damit abgeschlossen.                                                                                                                                                                                                   |
| 08.04.2026 | Frontend-Stack für Phase 1 entschieden: Vite + React + TypeScript + Tailwind + shadcn/ui + vite-plugin-pwa + recharts + react-leaflet. Phase-1-Modularisierungs-Bullet entsprechend konkretisiert. Arbeitsweise (Sebastian = High-Level, Claude = Implementierung) explizit in Abschnitt 0 dokumentiert. `context.md`-Update als To-do in Phase 1 und Phase 2 verankert.                                                                    |
| 08.04.2026 | Phase 0 ergänzt: explizite To-dos für `.github/workflows/ci.yml` und Frontend-Stack-Session vor Phase-1-Start. Test-Setup festgelegt: Playwright (5 Smoke) + Vitest (2 Unit).                                                                                                                                                                                                                                                               |
| 08.04.2026 | Neue Doku-Struktur eingeführt: `context.md` (stabil) + `status.md` (lebendig) + `CLAUDE.md` (für Claude Code). Phasenplan formalisiert, Vision aktualisiert.                                                                                                                                                                                                                                                                                |

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

**Regel für Claude (App und Code):** Beim Abschluss einer Phase aktiv prüfen, ob `context.md` nachgezogen werden muss, und Sebastian einen konkreten Diff vorschlagen, _bevor_ die Phase als „done" markiert wird.
