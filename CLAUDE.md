# athlete.coach — Projektkontext für Claude Code

## Wer bin ich
Sebastian Hofherr (GitHub: `Cpt-Backfisch`), Triathlet, baue eine persönliche KI-Coach-Web-App.
E-Mail: sebastian.hofherr@gmail.com

## Sportliche Ziele 2026
- 26.04. Halbmarathon Hamburg → 1:37
- 01.05. Eschborn–Frankfurt Rad (105km) → Ankommen
- 12.07. Olympischer Triathlon Hamburg → 2:20
- 02.08. Mitteldistanz Frankfurt → 4:45
- 25.10. Marathon Frankfurt → 3:50

---

## Architektur

| Komponente | Detail |
|---|---|
| Frontend | Single-Page `index.html` (HTML + Vanilla JS, kein Framework) |
| Hosting | GitHub Pages → `https://cpt-backfisch.github.io/athlete-coach` |
| Repo App | `github.com/Cpt-Backfisch/athlete-coach` |
| Repo Proxy | `github.com/Cpt-Backfisch/athlete-coach-proxy` |
| Datenbank | Supabase (`https://cpzdqgrqodvwtnqmusso.supabase.co`) |
| Auth | Supabase Email/Password Login |
| OAuth-Proxy | Vercel Serverless (`https://athlete-coach-proxy-rnuy.vercel.app`) |
| KI | Claude API (Coach-Chat + Telegram-Bewertungen) |
| Notifications | Telegram Bot |
| Datenquelle | Strava (CSV-Import + OAuth geplant) |

---

## Supabase Tabellen
- `activities` — Trainingseinheiten
- `races` — geplante Wettkämpfe
- `past_results` — vergangene Rennergebnisse mit Splits
- `week_frame` — Wochenrahmen / Trainingsplan
- `strava_token` — Strava OAuth Token
- `settings` — App-Einstellungen (Claude Key, Telegram, etc.)
- `public_shares` — Share-Tokens für read-only Links
- `comments` — Kommentare von Freunden über Share-Link
- `streams` — Strava Streams-Cache (HR, GPS, Pace, Höhe) pro Aktivität; `{id, user_id, activity_id text, data text, created_at}`; UNIQUE(user_id, activity_id)

Alle Tabellen haben RLS aktiviert. Share-Policies erlauben Lesezugriff wenn Share-Token vorhanden.

---

## Implementierte Features
- Dashboard mit Zeitraum/Sport-Filter, KPI-Karten
- Wochenvolumen-Charts (Stunden + km) pro Sportart
- **Belastungsampel** — Ist vs. Soll-Stunden mit Ampelfarben
- Kumulierte Trainingszeit (Jahresvergleich SVG)
- Wettkampf-Performance-Chart
- Events: Countdown + Prognose
- Vergangene Wettkämpfe mit Splits (pace für Läufe)
- Strava CSV-Import (Schwimm-Fix: Meter nicht km)
- **Strava OAuth + Webhook** — nach jedem Training → Claude Haiku analysiert → Telegram-Nachricht; Webhook-ID 338947 aktiv
- **Strava Streams** — on-demand Rohdaten in Aktivitäts-Detail: Pace/Speed (blau), Kadenz (gelb, spm×2 für Laufen), Höhenprofil (grün), GPS-Track auf Leaflet/OpenStreetMap-Karte; permanent gecacht in Supabase `streams`. HR fehlt weil Strava keinen HR-Stream für Garmin-Einheiten liefert.
- **Editierbarer Coach-Prompt** — im Menü Coach als Textarea; wird in Supabase `settings.coachPrompt` gespeichert; `api/webhook.js` liest ihn vor jeder Telegram-Nachricht
- Read-Only Share-Link für Freunde (kein Login nötig)
- Kommentarfunktion im Share-Link (Name + Nachricht)
- Kommentare von Freunden sichtbar im eigenen Dashboard
- Wochenfortschritt als Donut-Chart (Belastungsampel)
- Sportverteilung SVG-Kuchendiagramm
- PWA-Icon (Triathlon-Fisch, Base64 eingebettet)
- Login-Screen mit Supabase Auth
- Datum/Uhrzeit in Topbar
- Responsive Layout (Mobile + Desktop)
- Auto Cache-Busting via BUILD-Timestamp in localStorage

---

## Offene Bugs / Priorität 1

*Aktuell keine bekannten kritischen Bugs.*

---

## Feature Backlog (priorisiert)

1. **Strava Auto-Sync** — beim App-Start automatisch neue Einheiten laden (nur beim Öffnen, kein Polling)
2. **KI-Trainingsplan** — dynamisch basierend auf Wettkampfterminen und aktueller Form
3. **Wettkampf-Prognosen** — KI schätzt Zielzeiten pro Segment
4. **Soziale Features** — liken/reagieren im Share-Link; Telegram-Benachrichtigung bei neuen Kommentaren
5. **Pace-Rechner** — Zielzeit eingeben → Pace pro km
7. **HF-Verlauf in Einheiten** — Strava liefert keinen HR-Stream für Garmin-Einheiten (nur Ø HR). Lösung: Garmin FIT-Import oder Garmin Connect API. Garmin zählt Kadenz einseitig (×2 für spm bereits im Code).
8. **Garmin FIT-Import** — für HRV-Daten + HR-Stream
8. **PWA verbessern** — besseres iPhone-Erlebnis, Push Notifications

---

## Sicherheitsregeln — IMMER beachten

🔐 **NIEMALS in GitHub committen:**
- Claude API Key
- Strava Client Secret
- Telegram Bot Token
- Supabase Service Role Key

✅ **Diese Werte sind öffentlich/sicher im Code:**
- Supabase URL: `https://cpzdqgrqodvwtnqmusso.supabase.co`
- Supabase Publishable Key (beginnt mit `sb_publishable_`)
- Strava Client ID: `216084`
- Vercel Proxy URL: `https://athlete-coach-proxy-rnuy.vercel.app`

🔒 **Diese Werte nur in App-Einstellungen (Supabase `settings` Tabelle):**
- Claude API Key
- Telegram Bot Token: nur in Supabase `settings` Tabelle speichern, nie in Code/CLAUDE.md!
- Telegram Chat ID: nur in Supabase `settings` Tabelle speichern

---

## Kosten-Hinweis
Immer warnen wenn Features Kosten verursachen:
- Claude API: ~0.001–0.003€ pro Coach-Nachricht
- Supabase: kostenlos bis 500MB
- Vercel: kostenlos bis zu bestimmten Limits
- GitHub Pages: kostenlos

---

## Entwicklungs-Workflow

1. Änderungen in `index.html` machen
2. `git add index.html`
3. `git commit -m "Beschreibung"`
4. `git push`
5. GitHub Pages deployed automatisch (~1 Minute)
6. Cache-Busting: BUILD-Timestamp in `index.html` bei jedem Build aktualisieren (Regex: `const BUILD='(\d+)'`)

**Wichtig:** Datei heißt `index.html` (nicht `training-coach-v2.html`).

---

## Technische Details

### Datenspeicherung
- Hybrid: localStorage als schneller Cache + Supabase als persistenter Speicher
- `DB.get/set` → localStorage
- `sbSave/sbLoad` → Supabase
- Bei jedem `saveActivities()`, `saveRaces()` etc. wird beides gespeichert

### Build / Cache Busting
- Jede neue Version braucht einen neuen BUILD-Timestamp
- Regex zum Ersetzen: `const BUILD='(\d+)'` → `const BUILD='NEUER_TIMESTAMP'`
- Timestamp = `Math.floor(Date.now()/1000)`

### Schwimm-Distanz Fix
- Strava CSV gibt Schwimmen in Metern, alle anderen in km
- Im CSV-Import: `if(type==='swim')` → keine Konversion, sonst `dist*1000`

### Share-Link System
- Token in `public_shares` Tabelle
- URL: `https://cpt-backfisch.github.io/athlete-coach?share=TOKEN`
- Kein Login nötig für Freunde
- RLS-Policy: Lesezugriff auf activities/races/past_results wenn Share-Token existiert
- Kommentare: `comments` Tabelle, insert für alle erlaubt

### Telegram / Webhook Integration
- Strava Webhook → `api/webhook.js` (Vercel) → Claude Haiku analysiert → Telegram-Nachricht
- Webhook-Subscription ID: 338947, aktiv
- `api/webhook.js` liest `coachPrompt` aus Supabase `settings` vor jeder Nachricht
- Wöchentliche Zusammenfassung: `api/weekly.js` (Vercel Cron `0 18 * * 0` = Sonntag 20:00 CEST)
- Vercel Env Vars (alle in Projekt `athlete-coach-proxy-rnuy`): `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_ATHLETE_REFRESH_TOKEN`, `CLAUDE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SUPABASE_SERVICE_KEY`
- Token und Chat ID nur in Supabase `settings`, nie im Code
- Vercel hat zwei Projekte: `athlete-coach-proxy-rnuy` (aktiv) und `athlete-coach-proxy` (alt, löschen)

### Strava Streams
- `loadStreams(a)` in `index.html`: prüft `streams` Tabelle in Supabase, fällt auf direkte Strava API zurück
- Strava Streams Endpoint: `GET https://www.strava.com/api/v3/activities/{id}/streams?keys=heartrate,latlng,velocity_smooth,cadence,altitude,time&key_by_type=true`
- Daten werden permanent in Supabase `streams` gecacht (UPSERT)
- `renderStreamChart(container, streams, type, a)` — type: `'hr'|'pace'|'alt'`
- `renderGPSTrack(container, streams)` — GPS-Track als SVG, Farbe nach HR-Intensität
