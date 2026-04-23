# athlete.coach — Projektkontext

> **Zweck dieser Datei:** Langlebiger Projektkontext für Claude-Chat-Sessions in der Claude App.
> Ändert sich nur, wenn sich die _Vision_, _Architektur_ oder _Rahmenbedingungen_ ändern.
> Tagesaktueller Stand → siehe `status.md`. Anweisungen für Claude Code → siehe `CLAUDE.md`.

---

## 1. Wer & Warum

**Sebastian Hofherr** (GitHub: `Cpt-Backfisch`, sebastian.hofherr@gmail.com), Triathlet aus Frankfurt, baut **athlete.coach** als persönliche KI-gestützte Endurance-Coach-App. Kein starrer Trainingsplan-Generator, sondern flexibles Coaching auf Basis echter Trainingsdaten — primär für Sebastian selbst, mit kontrolliertem Zugang für Freunde.

### Sportliche Saison 2026 (Motivation für Featureplanung)

| Datum  | Wettkampf                       | Ziel     | Ergebnis   |
| ------ | ------------------------------- | -------- | ---------- |
| 22.03. | Halbmarathon Hamburg            | 1:37     | ✅ 1:38:57 |
| 01.05. | Eschborn–Frankfurt Rad (105 km) | Ankommen | —          |
| 12.07. | Olympischer Triathlon Hamburg   | 2:20     | —          |
| 02.08. | Mitteldistanz Frankfurt         | 4:45     | —          |
| 25.10. | Marathon Frankfurt              | 3:50     | —          |

---

## 2. Großes Ziel der App (Vision)

athlete.coach soll werden:

1. **State-of-the-art Frontend**, optimiert für Laptop _und_ Mobile.
2. **Hervorragende UI/UX** — schnell, klar, freudvoll zu bedienen.
3. **Sicher** im Umgang mit API Keys und persönlichen Daten.
4. **Bidirektionaler Claude-Coach über Telegram** — Sebastian kann mit dem Coach chatten, nicht nur Push-Bewertungen empfangen.
5. **Soziale Komponente in zwei Ausbaustufen:**
   - **Phase 1 (Solo + Lese-Freunde):** Sebastian hat Login, sieht/macht alles. Freunde kommen über einen gesicherten Zugangslink rein, können lesen _und_ interagieren (Kommentare, Likes).
   - **Phase 2 (Multi-User):** Freunde können sich registrieren und die App selbst als Athleten nutzen.

---

## 3. Architektur (Stand heute)

| Schicht            | Technologie                                                                                                                                                                                                                                       | URL / Repo                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Frontend           | Vite + React + TypeScript + Tailwind CSS + shadcn/ui — gebaut über GitHub Actions, deployed auf GitHub Pages unter `/athlete-coach/app/`. Legacy `index.html` weiterhin unter `/athlete-coach/` (wird nach Feature-Parity-Verifikation abgelöst). | `github.com/Cpt-Backfisch/athlete-coach`        |
| Hosting            | GitHub Pages                                                                                                                                                                                                                                      | `https://cpt-backfisch.github.io/athlete-coach` |
| Datenbank + Auth   | Supabase (Email/Password, RLS aktiv)                                                                                                                                                                                                              | `https://cpzdqgrqodvwtnqmusso.supabase.co`      |
| Serverless Backend | Vercel Functions                                                                                                                                                                                                                                  | `https://athlete-coach-proxy-rnuy.vercel.app`   |
| Proxy-Repo         | GitHub                                                                                                                                                                                                                                            | `github.com/Cpt-Backfisch/athlete-coach-proxy`  |
| Trainingsdaten     | Strava OAuth + Webhook + Streams API                                                                                                                                                                                                              | —                                               |
| KI                 | Anthropic Claude API (Haiku für Auto-Bewertungen, Sonnet für Chat)                                                                                                                                                                                | —                                               |
| Notifications      | Telegram Bot                                                                                                                                                                                                                                      | —                                               |

### Supabase-Tabellen

`activities`, `races`, `past_results`, `week_frame`, `strava_token`, `settings`, `public_shares`, `comments`, `streams` — alle mit RLS. Share-Policies erlauben Lesezugriff bei gültigem Share-Token. `coach_messages` noch nicht angelegt (bidirektionaler Chat nutzt aktuell keinen DB-Verlauf).

### Vercel-Functions

- `api/webhook.js` — Strava Webhook → Claude Haiku → Telegram (Subscription-ID 338947)
- `api/weekly.js` — Cron `0 18 * * 0` (So 20:00 CEST) → Wochenzusammenfassung
- `api/strava.js` — OAuth-Token-Tausch

---

## 4. Was es heute schon kann

Dashboard mit KPI-Karten, Zeitraum/Sport-Filtern, Wochenvolumen-Charts, Belastungsampel, Jahres-Trainingszeit-Vergleich, VO2max/VDOT-Schätzung, Wettkampf-Performance-Chart, HF-Zonenverteilung (5 Zonen nach max HR). Events mit Countdown und Prognose, vergangene Wettkämpfe mit Splits. Strava CSV-Import (mit Schwimm-Meter-Fix), Strava OAuth + Webhook, Strava Streams (Pace, Kadenz, Höhe, GPS-Track auf Leaflet-Karte, in Supabase gecacht). Editierbarer Coach-Prompt. Read-Only Share-Link für Freunde inkl. Kommentarfunktion. PWA-Icon, Responsive Layout, Auto Cache-Busting via BUILD-Timestamp.

> ⚠️ **Architektonische Schuld:** Das gesamte Frontend liegt in _einer_ `index.html` mit ~3500 Zeilen. Das ist der zentrale Grund für Phase 1 der Roadmap (siehe `status.md`).

⚠️ Die React-Migration (Phase 1) ist feature-complete. Die neue App läuft unter `/athlete-coach/app/`. Die Single-File-Schuld (`index.html`) ist damit aufgelöst — Legacy-App bleibt bis zur Verifikation parallel aktiv.

---

## 5. Sicherheitsregeln (gelten IMMER)

🔐 **Niemals in GitHub committen oder in Markdown-Dateien notieren:**

- Claude API Key
- Strava Client Secret
- Telegram Bot Token & Chat ID
- Supabase Service Role Key

✅ **Öffentlich/sicher im Code:**

- Supabase URL
- Supabase Publishable Key (Prefix `sb_publishable_`)
- Strava Client ID (`216084`)
- Vercel Proxy URL

🔒 **Nur in Supabase `settings`-Tabelle oder Vercel Env Vars:**

- Claude API Key, Telegram Token + Chat ID, Strava Client Secret, Strava Refresh Token, Supabase Service Key

**Regel für Claude:** Vor jeder Aktion, die etwas potenziell öffentlich machen könnte (Commit, Push, neue Datei mit Inhalt), explizit warnen.

---

## 6. Kostenbewusstsein

Sebastian möchte vor jeder kostenrelevanten Entscheidung gewarnt werden.

| Dienst         | Kosten heute                  | Risiko bei Skalierung                     |
| -------------- | ----------------------------- | ----------------------------------------- |
| GitHub Pages   | 0 €                           | —                                         |
| Supabase Free  | 0 € (bis 500 MB)              | bei Wachstum auf Pro $25/Monat            |
| Vercel Hobby   | 0 €                           | bei kommerzieller Nutzung Pflicht-Upgrade |
| Claude API     | ~0,001–0,003 € pro Coach-Push | Chat-Volumen kann das vervielfachen       |
| Telegram Bot   | 0 €                           | —                                         |
| GitHub Actions | 0 € (Public Repos)            | bei Private Repo: 2000 Min/Monat frei     |

**Regel für Claude:** Bei jedem neuen Feature, das einen kostenpflichtigen Dienst berührt, ungefragt eine Kostenschätzung mitliefern.

---

## 7. Rahmenbedingungen / Constraints

- **Firmenrechner blockt GitHub API** → Claude kann von dort nicht auto-pushen. Pushes laufen vom MacBook (Claude Code im Terminal) oder per GitHub Desktop.
- **Solo-Projekt**, kein Team — Prozesse sollen leichtgewichtig bleiben, aber professionell genug für saubere Wartung.
- **Sprache:** Deutsch in Chat, Code-Kommentare und UI-Texte auf Deutsch.
- **Nicht-technische Zielgruppe (Freundin):** wichtige Architekturentscheidungen sollen visuell erklärbar bleiben.

---

## 8. Verweise auf andere Dokumente

- `status.md` — aktueller Stand, offene Punkte, To-dos, Phasenplan (ändert sich häufig)
- `CLAUDE.md` — Anweisungen für Claude Code im Terminal (technische Details, Workflow)
- `index.html` — die App selbst
