# athlete.coach — Status & Roadmap

> **Zweck dieser Datei:** Lebendiger Projektstand. Hier stehen aktueller Stand, To-dos, Phasen, Bugs.
> Vision & Architektur-Grundlagen → siehe `context.md`.

**Letztes Update:** 28.04.2026

---

## 0. Arbeitsweise (gilt für alle Phasen)

- **Sebastian** trifft ausschließlich **High-Level-Entscheidungen** (Stack, UX-Richtung, Feature-Prioritäten, Sicherheits-/Kosten-Freigaben).
- **Claude App** (Chat) berät, plant, generiert Doku, schlägt Architektur vor, formuliert Aufgaben für Claude Code.
- **Claude Code** (Terminal auf MacBook) implementiert den eigentlichen Code, committet, pusht.
- Sebastian liest keinen Code zeilenweise mit. Reviews passieren auf der Ebene „funktioniert es / sieht es richtig aus / sind Sicherheits- und Kostenregeln eingehalten".
- Daraus folgt: **Doku und CI sind kritisch**, weil sie Sebastians einziger verlässlicher Kontrollkanal sind.

### Doku-Pattern für status.md (neu seit 20.04.2026)

- `status.md` im Repo ist die **Wahrheit** (Git-History, PR-protokolliert, CI-formatiert).
- Die **Projektanweisungen** in Claude Chat enthalten eine **Kopie** des aktuellen `status.md`-Inhalts — damit jeder Chat sofort den richtigen Stand im Kontext hat, unabhängig von Modell-Wahl und Fetch-Verlässlichkeit.
- Die „lies die Datei im Repo"-Anweisung in den Projektanweisungen wird **nicht mehr** verwendet — das Fetchen funktioniert inkonsistent.
- **Am Ende jeder Session mit Änderungen** formuliert Claude Chat den neuen `status.md`-Inhalt und liefert Sebastian zwei Artefakte:
  1. Einen Claude-Code-Prompt zum Committen ins Repo (→ PR, merge)
  2. Eine fertige `status.md`-Datei zum Download (→ ins Claude-Projekt ziehen, ersetzt die alte)
- Sebastian führt beides aus. Zeit-Investment pro Session-Ende: ~2 Minuten.

---

## 1. Aktueller Stand in einem Satz

Polish-Phase S1–S5 abgeschlossen — PRs #43–#47 gemergt: Foundation (Formatter `format.ts`, Sportart-Gradienten, einheitlicher `ChartTooltip`), Filter-UX (Segmented Control F7, KPI-Filter-Buttons F6, Volume-Chart-Klick F8, CumulativeTime-Jahr-Pills F10), Wochenziel-Karte F1 + Share-View-Chart-Parität B1, Polish-Paket (Toasts, Empty States, Skeleton-Loader, Pull-to-Refresh, Hover-States, Stagger-Animation F9, Comments-Sheet, Splash-Screen F12), Athletenprofil F4/F13 + Radrolle-Erkennung F2 + Orts-Erkennung F3 + Sebi-vs-Nico-Chart F11. Behobene Bugs: B1–B4, B6–B12. Nächster Schritt: Bug-Session (Telegram-Wochen-Review ISO-Logik, Kommentar-Löschen Share-View, Menü-Wechsel-Performance-Diagnose).

---

## 2. Roadmap in Phasen

Die Entwicklung wird in **klar abgegrenzte Phasen** zerlegt. Eine Phase ist erst „fertig", wenn ihr Definition-of-Done erfüllt ist. Erst dann beginnt die nächste.

### ✅ Phase 0 — Tooling & Fundament _(abgeschlossen, 13.04.2026)_

CI mit 5 Jobs (Lint, Secret-Scan, Unit, E2E, Deploy-Gate), Branch-Protection auf main, Vite+React+TS+Tailwind+shadcn/ui als Stack festgelegt, dualer Deploy (alte App auf /, neue auf /app/). Detail-Doku → docs/archive-phase-0-1.md.

**Backlog Phase 0:**

- Schema-Drift-Check in CI (siehe Learnings #1)
- `tsc -b --noEmit` als Pre-Push-Schritt (PR #44 Lehre)

---

### 🧱 Phase 1 — Solo-App, lesende Freunde

**Ziel:** Saubere, moderne, sichere App für Sebastian + read-only/kommentierender Zugang für Freunde über gesicherten Link.

- [x] **T1-MVP-Migration abgeschlossen (19.04.2026)** — 12 Schritte, Strangler-Fig, beide Apps parallel live. Detail → docs/archive-phase-0-1.md.

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

### 🎨 Phase 2 — App-Ausbau & Feature-Komplettheit

**Ziel:** Die neue App ist für Sebastian (inkl. Read-/Social-Funktionen für „Fans") feature-complete und in der UI poliert. Phase 2 ist erst abgeschlossen, wenn Sebastian die App täglich reibungslos nutzt, alle für ihn relevanten Features drin sind und die UI state-of-the-art ist.

- [x] **Fehlende Dashboard-Charts** (implementiert in PR 2, 27.04.2026):
  - Wochenkarte mit Donut + Fortschrittsbalken vs. Wochenziele
  - Trainingsumfang Stunden (monatlich, gestapelt) + Trainingsumfang Kilometer (monatlich)
  - Sportverteilung (Kuchendiagramm + Legende mit Prozentangabe)
  - Kumulierte Trainingszeit Jahresvergleich 2024/2025/2026
- [x] **Dark Mode Fix iOS** — Behoben in PR 1 (27.04.2026): hardcoded Farbklassen (`bg-white/5` etc.) durch semantische Tokens (`bg-card`, `bg-muted`) ersetzt.
- [x] **Polish-Block S1–S5** — Formatierung (`format.ts`, `sportColors.ts`, `ChartTooltip`), Filter-UX (Segmented Control F7, KPI-Filter F6, Volume-Chart-Klick F8, CumulativeTime-Jahr-Pills F10), Wochenziel-Karte F1 + Share-View-Chart-Parität B1, Polish-Paket (Toasts, Empty States, Skeleton-Loader, Pull-to-Refresh, Hover-States, Stagger-Animation F9, Comments-Sheet, Splash-Screen F12), Athletenprofil F4/F13, Radrolle-Erkennung F2, Orts-Erkennung F3, Sebi-vs-Nico-Chart F11 (PRs #43–#47, 28.04.2026).
- [ ] **Feature-Parity-Rest abarbeiten** — `feature-parity.md` durchgehen und alle noch nicht migrierten T1-Features in die React-App bringen. Besonderes Augenmerk: Features der ursprünglichen App-Version, die in der Priorisierungs-Runde möglicherweise übersehen oder falsch eingeordnet wurden. Sebastian macht dafür einen separaten Review-Pass durch die alte App und ergänzt fehlende Punkte in `feature-parity.md`.
- [ ] **T2-Polish-Features implementieren** — die 34 T2-Features aus `feature-parity.md` (priorisiert am 18.04.2026, PR #14).
- [ ] **UI-Polishing** — Design-Fein-Tuning, Animationen, Empty States, Loading States, Mobile-Feinschliff, Accessibility-Pass.
- [ ] **Performance-Check** — Lighthouse-Audit, Bundle-Size-Check, Initial-Load-Time-Optimierung.
- [ ] **Sicherheits-Audit** (aus Phase 1 übernommen, falls noch offen): RLS-Policies, Secret-Rotation, CSP-Header.
- [ ] **Bidirektionaler Telegram-Coach** (aus Phase 1 übernommen, falls noch offen) — siehe Phase 1.
- [ ] **Social-Features erweitern:** Likes/Reaktionen auf Share-Seite, Telegram-Notification bei Kommentaren/Likes (siehe Phase 1).

**DoD:** Sebastian nutzt die neue App exklusiv und reibungslos auf Mobile und Laptop. Alle für Sebastian relevanten Features sind drin. UI ist poliert. Performance ist gut. Keine kritischen Bugs mehr offen. Die alte Monolith wird nicht mehr gebraucht.

---

### 🔚 Meilenstein — Abschalten der alten Monolith

**Ziel:** Nach Abschluss Phase 2 kann die alte `index.html` abgeschaltet und der zugehörige Code aufgeräumt werden, ohne dass Sebastian Funktionalität oder Daten verliert.

- [ ] **Smoke-Test-Woche:** Mindestens eine Woche lang ausschließlich die neue App nutzen, ohne auf die alte zurückzugreifen. Probleme in den Bug-Abschnitt eintragen.
- [ ] **Datenmigrations-Check:** Sicherstellen, dass alle relevanten Daten aus Supabase in der neuen App sichtbar und bearbeitbar sind.
- [ ] **Git-Tag setzen:** `v1-legacy-last` vor dem Löschen, als Rollback-Anker.
- [ ] **Alte Dateien entfernen:** `index.html` und nicht mehr benötigte Vanilla-JS-Dateien, zugehörige CI-Schritte im Deploy-Gate.
- [ ] **Routing anpassen:** `https://cpt-backfisch.github.io/athlete-coach/` leitet ab jetzt auf die neue App weiter oder hostet direkt die neue App auf dem Root-Pfad — Entscheidung Sebastian.
- [ ] **`context.md` aktualisieren** — Architektur-Tabelle angleichen, Single-File-Schuld-Hinweis endgültig entfernen, Doppel-Deploy-Konstruktion aus Abschnitt „Deployment-Prozess" rausnehmen.

**DoD:** Nur noch die neue React-App läuft. Alte Dateien sind entfernt. Repo ist aufgeräumt. `context.md` reflektiert den neuen Stand.

---

### 👥 Phase 3 — Multi-User

**Ziel:** Freunde können sich registrieren und die App selbst als Athleten nutzen.

- [ ] User-Onboarding-Flow (Registrierung, eigene Strava-Verbindung)
- [ ] Mandantentrennung in Supabase verifizieren (RLS pro `user_id` für _alle_ Tabellen)
- [ ] Per-User-Einstellungen (eigene Wettkämpfe, eigener Coach-Prompt)
- [ ] Soziale Features zwischen registrierten Athleten (Folgen, Reaktionen)
- [ ] Quota / Rate-Limiting für Claude-API pro User (sonst frisst ein Power-User das Budget)
- [ ] DSGVO-Basics: Datenschutzerklärung, Datenexport, Account-Löschung
- [ ] Optional: eigene Domain (`athlete.coach`?) — vorher Verfügbarkeit & Kosten prüfen
- [ ] **`context.md` erneut aktualisieren am Ende von Phase 3** — Vision-Abschnitt von „Solo + Lese-Freunde" auf „Multi-User produktiv" umschreiben, neue Tabellen und User-Modell ergänzen.

**DoD:** Mindestens ein zweiter realer Nutzer kann die App vollständig und sicher allein benutzen; `context.md` reflektiert den Multi-User-Stand.

---

### 🚀 Phase 4+ — Ausbau (Backlog, ungewichtet)

- KI-Trainingsplan dynamisch aus Wettkampfterminen
- Wettkampfprognosen pro Segment
- Pace-Rechner
- Garmin FIT-Import (für HR-Stream und HRV)
- Aktivitätsdetailseite mit Karten und Charts (teilweise da)
- PWA-Push-Notifications
- Wöchentliche Coach-Zusammenfassung als interaktiver Report (heute nur Telegram-Text)

---

## 3. Bekannte Bugs

**1. Telegram-Push nach Aktivität — Test ausstehend**

Ursachen wurden identifiziert und gefixt (Proxy PR #3, 22.04.2026):

- `telegram-coach.js` nutzte Spaltenfilter die im JSON-Blob-Schema nicht existieren → Fix: `select=data&limit=1`, dann clientseitig filtern analog zu `weekly.js`
- `webhook.js` suchte Coach-Prompt unter `cfg.coachPrompt` (alter Monolith-Key), React-App schreibt unter `cfg.coach_system_prompt` → Fix: React-App-Key hat jetzt Vorrang mit Fallback auf alten Key

Vercel redeployed am 22.04.2026. **Bestätigung steht aus — nächste Trainingseinheit abwarten.**
Reproschritte: neue Einheit in Strava hochladen, 1–2 Min warten, Telegram checken.

---

**2. Telegram-Wochen-Review — falsche Wochen-Logik**

`api/weekly.js` berechnet die Woche als beliebiges 7-Tages-Fenster statt ISO 8601 (Montag–Sonntag). Auswirkung: wöchentlicher Review-Push enthält teils falsche Einheitenauswahl.

Fix: ISO-8601-Wochen-Logik aus `WeekGoalCard.tsx` (S3/PR #45) auf die Vercel-Function übertragen.

---

**3. Kommentar-Löschen in Share-View funktioniert nicht**

Eingeloggter Owner kann Kommentare in der Share-View nicht löschen. Vermutlicher Bereich: RLS-Policy oder Owner-Check in Supabase. Bug existiert bereits in der Legacy-App (feature-parity.md 12.6).

---

**4. Menü-Wechsel-Performance (B5)**

Merkliche Trägheit beim Tab-Wechsel zwischen App-Sektionen auf Mobile. Separate Diagnose-Session geplant (Opus empfohlen für Profiling-Analyse).

---

## 4. Offene Fragen / Entscheidungen

- **Eigene Domain in Phase 2?** Kosten & Aufwand vs. Nutzen
- **Vercel-Aufräumen:** altes Projekt `athlete-coach-proxy` löschen, sobald sicher keine Referenzen mehr dranhängen
- **Logo-Design für PWA-Icon:** Ausstehend, blockiert Sequenz-Schritt 13 (PWA-Finalisierung). Nicht dringend.
- **Feature-Parity-Review für Phase 2:** Sebastian macht einen separaten Durchgang durch die alte App, um Features zu identifizieren, die in der 18.04.2026-Priorisierung übersehen oder falsch eingeordnet wurden, und ergänzt diese in `feature-parity.md` vor Phase-2-Start.
- **Strava-Import-Strategie:** Initialer CSV-Import (Code aus Monolith übernehmen) vs. API-Bulk-Import mit Throttling. Strava-Rate-Limits (200 req / 15 min, 2000 req / Tag) müssen berücksichtigt werden. Streams-Daten: on-demand beim Öffnen einer Aktivität cachen, nicht bulk.
- **Avatar-Bild:** `avatar_transparent.png` muss von Sebastian in die App eingepflegt werden — Profil-Modal zeigt aktuell Strichmännchen-Platzhalter (F4/F13, PR #47).
- **Skills initial setzen:** Skill-Balken (Ausdauer, Schnelligkeit, Wettkampfhärte, Technik) liegen auf Default-Werten — Sebastian setzt Startwerte 1–10 über Einstellungen (Stepper).
- **Erste Nico-Datenpunkte:** Sebi-vs-Nico-Chart (F11) zeigt nur Sebastians kumulierte Lauf-km; Nico-Einträge müssen über das Import-Modal initial eingetragen werden.

---

## 5. Letzte Änderungen

| Datum      | Was                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 28.04.2026 | **PRs #43–#47 (S1–S5) gemergt:** Foundation (Formatter `format.ts` + Sportart-Gradienten `sportColors.ts` + einheitlicher `ChartTooltip`), Filter-UX (Segmented Control F7, KPI-Filter-Buttons F6, Volume-Chart-Balken-Klick F8, CumulativeTime-Jahr-Pills F10, MobileHeader-Wortmarke B11, Triathlon-Farbe B12), Wochenziel-Karte F1 (SVG-Fortschrittsring, ISO-8601-Wochenlogik) + Share-View-Chart-Parität B1, Polish-Paket (Sonner-Toasts PR3-P4, Empty States PR3-P2, KpiCard-/BarChart-Skeleton PR3-P3, Pull-to-Refresh PR3-P5, Hover-Shadow PR3-P6, KPI-Stagger-Animation F9, Comments-Sheet PR3-P1, Splash-Screen F12), Athletenprofil-Modal F4/F13 + Radrolle-Erkennung F2 + Orts-Erkennung F3 + Sebi-vs-Nico-Chart F11. Behobene Bugs: B1, B2, B3, B4, B6, B7, B8, B9, B10, B11, B12. Neue Features: F1–F3, F4/F13, F5–F12. Hinweis: CI-Lücke beobachtet — `tsc -b --noEmit` fängt strict-mode-TS-Fehler ab, die ESLint übersieht (PR #44 hatte initial roten CI durch toten Import); als Backlog-Punkt in Phase 0 vermerkt. |
| 27.04.2026 | **PR 2 gemergt (PR #41): Dashboard-Charts und Events-Polish.** Fünf neue Chart-Komponenten (`WeekCard`, `VolumeChartHours`, `VolumeChartKm`, `SportDistribution`, `CumulativeTime`) in `app/src/components/charts/` ausgelagert. Filter-Reihenfolge neu (Alles, 2026, 2025, 2024, 1J, 6M, 12W, 4W, 1W) mit Default 2026 für Dashboard und Einheiten-Menü. `TimeRange` um `'2024'` erweitert. Events-Liste mit Vollformat-Datum (DD.MM.YYYY), „Verlauf" umbenannt zu „Vergangene Events". Triathlon-Detail-View mit Splits (Schwimmen, Wechsel 1, Rad, Wechsel 2, Lauf) und Format-Info (Distanz, Neo). Renn-Daten in Supabase `past_results` via `SPLIT_SEED` ergänzt: 8 Triathlons (FFM Mitteldistanz 2025, HH Kurzdistanz 2024+2025, Würzburg Olympisch 2025, FFM Olympisch 2024, HH Olympisch 2023) und 3 Halbmarathons (FFM 2026+2025, Offenbach 2024). Schema-Migration für alte Feldnamen (`type`→`sport_type`, `goalTime`→`goal_time`) läuft einmalig automatisch beim ersten Laden.                                            |
| 27.04.2026 | **PR 1 gemergt (PR #40): Foundation für Dark Mode und Mobile.** Dark Mode jetzt Default beim App-Start (kein OS-Auto-Switch mehr), echtes Schwarz #000000 als Hintergrund, manueller Toggle im Menü mit localStorage-Persistenz. Hardcoded Farbklassen (`bg-white/5` etc.) durch semantische Tokens (`bg-card`, `bg-muted`) ersetzt → behebt iOS-Bug (schwarze Schrift auf dunkel). Bottom-Nav mit `env(safe-area-inset-bottom)`, Mindesthöhe 64px und `viewport-fit=cover` — fixt schwer-erreichbares Menü am iPhone. Tabular-Nums global aktiviert für stabile Zahlen-Darstellung. Sport-Farben (Purple/Orange/Blau/Rost) jetzt sichtbar in aktiven Filter-Buttons. `design.md` mit allen geänderten Werten aktualisiert. `context.md` korrigiert: FFM Halbmarathon 2026 abgeschlossen am 22.03.2026 mit 1:38:57 (war fälschlich noch als kommendes Event mit 26.04. + Ziel 1:37 eingetragen).                                                                                                                                       |
| 22.04.2026 | **6 Bugs gefixt (PRs #37, #38, Proxy PR #3):** Share-Link URL-Format (zeigte auf alte statt neue App), Kommentar-Erstellung 400 (Schema-Mismatch comments-Tabelle), Hard-Reload 404 (HashRouter base-Path) — alle drei in PR #37. Aktivitäten-Duplikate via `normalizeAndDedup()` in activities.ts (Feldnamen-Normalisierung + Dedup per stravaId) — PR #38. Telegram-Coach kein Zugriff auf Trainingsdaten (Spaltenfilter existierten im JSON-Blob-Schema nicht) + Coach-Prompt-Key-Mismatch (`cfg.coachPrompt` vs. `cfg.coach_system_prompt`) — beides Proxy PR #3. Telegram-Push-Bestätigung steht aus (Vercel redeployed, nächste Einheit abwarten). Neue Phase-2-Punkte eingetragen: fehlende Dashboard-Charts (Wochenkarte, Trainingsumfang, Sportverteilung, Jahresvergleich) + Dark Mode iOS.                                                                                                                                                                                                                                  |
| 20.04.2026 | Roadmap-Umbau: Phase 2 und 3 getauscht. Neue Phase 2 ist „App-Ausbau & Feature-Komplettheit", danach neuer Meilenstein „Alte Monolith abschalten", dann Phase 3 „Multi-User". Begründung: Sebastian will die App zuerst für sich selbst perfektionieren, bevor andere Nutzer aufgesattelt werden. Neuer Bug eingetragen: Telegram-Nachrichten nach Einheiten kommen nicht an.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| älter      | siehe Git-History und docs/archive-phase-0-1.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 20.04.2026 | PR #34 gemergt: `status.md` aktualisiert nach Schema-Fix-Session (PRs #31, #32, #33). Neuer Abschnitt 7 „Learnings aus der Migration" ergänzt. Prettier-Fix als Folge-Commit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

---

## 6. Wann muss `context.md` angepasst werden?

`context.md` ist die _stabile_ Schicht. Sie soll sich nur ändern, wenn sich Vision, Architektur oder Rahmenbedingungen wirklich verschieben. Konkret heißt das:

**Pflicht-Update am Ende von Phase 1:**

- Architektur-Tabelle (Abschnitt 3): „Single-Page `index.html`, Vanilla JS" → „Vite + React + TypeScript + Tailwind + shadcn/ui, gebaut über GitHub Actions"
- Supabase-Tabellen: `coach_messages` ergänzen
- Vercel-Functions: `api/telegram.js` ergänzen
- Abschnitt 4 „Was es heute schon kann": Single-File-Schuld-Hinweis entfernen oder umformulieren
- Abschnitt 7 Constraints: ggf. Hinweis ergänzen, dass Build-Step nötig ist

**Pflicht-Update beim Meilenstein „Alte Monolith abschalten":**

- Architektur-Tabelle: nur noch neue App, keine Dual-Deploy-Konstruktion
- Abschnitt 4 „Was es heute schon kann": Single-File-Schuld-Hinweis endgültig entfernen
- Abschnitt „Deployment-Prozess": Dualer-Deploy-Teil rausnehmen
- Alle Verweise auf `index.html` und Monolith prüfen und entfernen

**Pflicht-Update am Ende von Phase 3:**

- Vision (Abschnitt 2): Phase 1/Phase 3 umschreiben — Multi-User ist dann Realität, nicht mehr Plan
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

**Doku-Pattern muss Modell-unabhängig verlässlich sein**: Die Anweisung „Claude holt die status.md aus dem Repo" klang elegant, war aber fragil — je nach Modell, Konversations-Start und Netzwerklage kam nur ein Platzhalter im Kontext an. Die Korrektur: status.md-Inhalt wird am Ende jeder Session mit Änderungen direkt in die Projektanweisungen gepastet. Redundanz zum Repo ist bewusst — Projektanweisungen sind die Abkürzung für Claude Chat, das Repo bleibt die Wahrheit für Claude Code und Mensch.

**Sequenzielles Session-Pattern hat sich für die Polish-Phase bewährt (S1–S5):** Eine Session = ein abgegrenzter Fokus = ein PR = sauberer Claude-Code-Chat ohne kontextuellen Ballast aus Vorgänger-Sessions. 5 Sessions (S1–S5) liefen ohne Verwerfungen oder Konflikte durch. Foundation-First (S1: `format.ts`, `sportColors.ts`, `ChartTooltip`) hat allen späteren Sessions fertige Helper bereitgestellt und verhindert, dass jede Session die Grundlagen neu löst.
