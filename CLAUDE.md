# CLAUDE.md — Anweisungen für Claude Code

> Diese Datei wird von **Claude Code** im Terminal beim Start jeder Session gelesen.
> Für vollständigen Projektkontext: lies zusätzlich `context.md` und `status.md`.

---

## Pflichtlektüre zu Beginn jeder Session
Lies immer zuerst `context.md` (Vision, Architektur) und `status.md` (aktueller Stand, offene To-dos) bevor du anfängst.

---

## Projekt in einem Satz

**athlete.coach** — Sebastians persönliche Triathlon-Coach-Web-App. Single-Page Vanilla-JS-Frontend (`index.html`) auf GitHub Pages, Supabase-Backend, Vercel-Functions für Strava/Telegram/Claude-Integration.

---

## Goldene Regeln

### 🔐 Sicherheit (höchste Priorität)
1. **Niemals Secrets in Code, Markdown oder Commit-Messages.** Nicht als Beispiel, nicht als Platzhalter, nicht „nur kurz zum Testen”.
2. Vor jedem Commit, der Konfigurationsdateien, `.env`-ähnliche Dateien, oder neue Strings enthält, die nach Token aussehen → **explizit warnen und Bestätigung abwarten**.
3. Falls Sebastian aus Versehen ein Secret hineindiktiert: **stoppen, warnen, alternative vorschlagen** (Supabase `settings`-Tabelle oder Vercel Env Var).
4. Diese Werte sind **öffentlich und sicher** im Code: Supabase URL, Supabase Publishable Key (`sb_publishable_…`), Strava Client ID `216084`, Vercel Proxy URL.
5. Diese Werte sind **geheim** und gehören ausschließlich in Supabase `settings` oder Vercel Env Vars: Claude API Key, Strava Client Secret, Strava Refresh Token, Telegram Bot Token, Telegram Chat ID, Supabase Service Key.

### 💰 Kosten
Vor jeder Aktion oder Empfehlung, die einen kostenpflichtigen Dienst berührt (Claude API, Vercel-Upgrades, Supabase Pro, kostenpflichtige NPM-Pakete, GitHub Actions Minuten bei privaten Repos), **ungefragt** eine kurze Kostenschätzung mitliefern.

### 🗣 Sprache
Antworte auf Deutsch. UI-Texte, Code-Kommentare und Commit-Messages auf Deutsch.

---

## Architektur (Kurzfassung)

| Schicht | Detail |
|---|---|
| Frontend | `index.html` — eine Datei, ~3500 Zeilen, Vanilla JS, kein Build-System (noch) |
| Hosting | GitHub Pages → `https://cpt-backfisch.github.io/athlete-coach` |
| App-Repo | `github.com/Cpt-Backfisch/athlete-coach` |
| Proxy-Repo | `github.com/Cpt-Backfisch/athlete-coach-proxy` |
| Datenbank + Auth | Supabase, RLS aktiv, Email/Password Login |
| Serverless | Vercel Functions (`api/webhook.js`, `api/weekly.js`, `api/strava.js`) |
| Vercel-Projekt (aktiv) | `athlete-coach-proxy-rnuy` |
| Vercel-Projekt (alt, zu löschen) | `athlete-coach-proxy` |
| KI | Claude API — Haiku für Push-Bewertungen, Sonnet für Chat (geplant) |
| Notifications | Telegram Bot |

### Supabase-Tabellen
`activities`, `races`, `past_results`, `week_frame`, `strava_token`, `settings`, `public_shares`, `comments`, `streams` — alle mit RLS.

`streams`-Schema: `{id, user_id, activity_id text, data text, created_at}`, UNIQUE(user_id, activity_id).

### Vercel Env Vars (Projekt `athlete-coach-proxy-rnuy`)
`STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_ATHLETE_REFRESH_TOKEN`, `CLAUDE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SUPABASE_SERVICE_KEY`.

---

## Aktueller Workflow (heute)

1. Änderungen in `index.html`
2. `git add index.html`
3. `git commit -m "Beschreibung"`
4. `git push`
5. GitHub Pages deployt automatisch (~1 Min)
6. **Cache-Busting:** BUILD-Timestamp aktualisieren
   - Regex: `const BUILD='(\d+)'`
   - Ersetzen mit: `const BUILD='<Math.floor(Date.now()/1000)>'`

> ⚠️ **Dieser Workflow wird in Phase 0 ersetzt.** Sobald GitHub Actions CI steht, läuft Deploy nur noch über grünes CI. Siehe `status.md` → Phase 0.

---

## Constraints

- **Firmenrechner blockt GitHub API** → Pushes nur vom MacBook (Claude Code im Terminal) oder GitHub Desktop.
- **Datei heißt `index.html`** (nicht `training-coach-v2.html` o.ä.)
- **Keine npm-Build-Pipeline** im Frontend — noch nicht. Daher: keine `import`-Statements im Browser-Code, alles inline oder per `<script>`.

---

## Technische Details, an die man sich erinnern muss

### Datenspeicherung
Hybrid: localStorage als schneller Cache + Supabase als persistenter Speicher.
- `DB.get` / `DB.set` → localStorage
- `sbSave` / `sbLoad` → Supabase
- Bei jedem `saveActivities()`, `saveRaces()` etc. wird beides gespeichert.

### Schwimm-Distanz Fix
Strava CSV gibt Schwimmen in Metern, alle anderen Sportarten in km.
Im CSV-Import: `if (type === 'swim') { /* keine Konversion */ } else { dist *= 1000 }`.

### Share-Link System
- Token in `public_shares`
- URL: `https://cpt-backfisch.github.io/athlete-coach?share=TOKEN`
- Kein Login nötig
- RLS-Policy erlaubt SELECT auf `activities`, `races`, `past_results` bei gültigem Share-Token
- `comments`: INSERT für alle erlaubt

### Telegram / Webhook
- Strava Webhook-Subscription-ID `338947`, aktiv
- `api/webhook.js` liest `coachPrompt` aus Supabase `settings` vor jeder Nachricht
- `api/weekly.js`: Vercel Cron `0 18 * * 0` (So 20:00 CEST)

### Strava Streams
- `loadStreams(a)` in `index.html`: prüft Supabase `streams`-Cache, fällt auf direkte Strava API zurück
- Endpoint: `GET https://www.strava.com/api/v3/activities/{id}/streams?keys=heartrate,latlng,velocity_smooth,cadence,altitude,time&key_by_type=true`
- Permanent gecacht (UPSERT)
- `renderStreamChart(container, streams, type, a)` mit `type ∈ {'hr','pace','alt'}`
- `renderGPSTrack(container, streams)` — SVG, Farbe nach HR-Intensität
- ⚠️ Strava liefert keinen HR-Stream für Garmin-Einheiten (nur Ø HR). Lösung über Garmin FIT-Import (siehe Backlog).

---

## Was Claude Code tun darf und was nicht

✅ **Darf:**
- `index.html` und alle anderen Repo-Dateien lesen, editieren, refactoren
- Tests schreiben und ausführen
- Lokale Builds und Linter laufen lassen
- Branches erstellen, Commits machen
- Vorschläge für Architekturänderungen formulieren

⚠️ **Nur nach expliziter Bestätigung:**
- `git push` (besonders auf `main`)
- Neue Abhängigkeiten in `package.json`
- Änderungen an CI-Workflows
- Dateien, die Konfiguration oder Secrets berühren könnten

❌ **Nie:**
- Secrets in Dateien schreiben
- Force-Push auf `main`
- Supabase-Tabellen oder RLS-Policies ohne Rückfrage löschen oder ändern
- Dependencies installieren, die Telemetrie nach außen senden

---

## Verweise

- `context.md` — Vision, Zielgruppe, Architektur-Grundlage (stabil)
- `status.md` — aktueller Stand, Phasenplan, Bugs, To-dos (lebendig)
- `index.html` — die App
