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

Alle Tabellen haben RLS aktiviert. Share-Policies erlauben Lesezugriff wenn Share-Token vorhanden.

---

## Implementierte Features
- Dashboard mit Zeitraum/Sport-Filter, KPI-Karten
- Wochenvolumen-Charts (Stunden + km) pro Sportart
- **Belastungsampel** — Ist vs. Soll-Stunden mit Ampelfarben
- Kumulierte Trainingszeit (Jahresvergleich SVG)
- VO2max-Schätzung (Jack Daniels VDOT)
- Wettkampf-Performance-Chart
- HRV-Zonenverteilung
- Events: Countdown + Prognose
- Vergangene Wettkämpfe mit Splits
- Strava CSV-Import (Schwimm-Fix: Meter nicht km)
- Read-Only Share-Link für Freunde (kein Login nötig)
- Kommentarfunktion im Share-Link (Name + Nachricht)
- Kommentare von Freunden sichtbar im eigenen Dashboard
- Telegram Coach-Nachrichten nach jedem Training (via Claude API)
- PWA-Icon (Triathlon-Fisch, Base64 eingebettet)
- Login-Screen mit Supabase Auth
- Datum/Uhrzeit in Topbar
- Responsive Layout (Mobile + Desktop)
- Auto Cache-Busting via BUILD-Timestamp in localStorage

---

## Offene Bugs / Priorität 1

### Strava OAuth funktioniert nicht
- Beim Klick auf "Mit Strava verbinden" passiert nichts
- Console zeigt: `redirect_uri invalid` (400 Bad Request von Strava)
- Strava App Callback-Domain ist auf `cpt-backfisch.github.io` gesetzt
- Client ID: `216084`
- Proxy URL: `https://athlete-coach-proxy-rnuy.vercel.app`
- Die `stravaOAuthStart()` Funktion in `index.html` baut die OAuth URL korrekt zusammen, aber Strava lehnt die redirect_uri ab
- Es gibt auch einen JavaScript Syntaxfehler der alles blockiert (`Uncaught SyntaxError: Unexpected token 'const'`) — Browser zeigt noch alte gecachte Version

---

## Feature Backlog (priorisiert)

1. **Strava Auto-Sync** — beim App-Start automatisch neue Einheiten von Strava laden (Option C: kein Webhook, kein Polling, nur beim Öffnen)
2. **Soziale Features** — Freunde können über Share-Link kommentieren, liken, reagieren. Bei neuen Kommentaren/Likes → Telegram-Benachrichtigung an Sebastian
3. **Strava Streams API** — sekündliche Rohdaten (HR-Kurve, GPS, Kadenz, Höhe) in Aktivitäts-Detailansicht
4. **Aktivitäts-Detailseite** — Klick auf Einheit → Charts, Karte, alle Details
5. **KI-Trainingsplan** — dynamisch basierend auf Wettkampfterminen und aktueller Form
6. **Wettkampf-Prognosen** — KI schätzt Zielzeiten pro Segment
7. **Wöchentliche Coach-Zusammenfassung** — jeden Montag automatisch per Telegram
8. **Pace-Rechner** — Zielzeit eingeben → Pace pro km
9. **Garmin FIT-Import** — für HRV-Daten
10. **PWA verbessern** — besseres iPhone-Erlebnis, Push Notifications

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
- Telegram Bot Token: `8650139968:AAGbuBf6WAfM_lGg6yYyOc9pUhnh-JWJdBs` ← nur in App, nie in Code!
- Telegram Chat ID: `8725020855`

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

### Telegram Integration
- Nach jedem Training → Claude API analysiert → sendet Bewertung per Telegram
- Trigger: nach Strava-Sync oder manuell erfasster Einheit
- Token und Chat ID nur in Supabase `settings`, nie im Code
