# athlete.coach — Migrations-Sequenz Phase 1 (T1 MVP)

> **Zweck:** Implementierungs-Reihenfolge für die 47 launch-kritischen T1-Features.
> Abhängigkeiten zwischen Features bestimmen die Reihenfolge.
> Referenz für Feature-Details → siehe `feature-parity.md`.
>
> **Status-Legende:**
>
> | Symbol | Bedeutung           |
> | ------ | ------------------- |
> | ⏳     | Noch nicht begonnen |
> | 🔄     | In Arbeit           |
> | ✅     | Erledigt            |
>
> **Letztes Update:** 18.04.2026

---

## Übersicht

| Schicht             | Schritte                | Features        | Geschätzte Dauer       |
| ------------------- | ----------------------- | --------------- | ---------------------- |
| 0 — Fundament       | 1–2                     | 9               | 2–3 Tage               |
| 1 — Daten           | 3–4                     | 10              | 3–4 Tage               |
| 2 — Kern-Views      | 5–8                     | 20              | 8–12 Tage              |
| 🐛 Bug-Session A    | —                       | 2 Bugs          | 1–2 Tage               |
| 3 — Coach           | 9                       | 7               | 3–5 Tage               |
| 4 — Konfig & Social | 10–11                   | 16              | 4–6 Tage               |
| 🐛 Bug-Session B    | —                       | 1 Bug           | 0,5–1 Tag              |
| 5 — PWA             | 12                      | 1               | 1 Tag                  |
| **Gesamt**          | **12 + 2 Bug-Sessions** | **47 + 3 Bugs** | **~21–31 Arbeitstage** |

---

## Schicht 0 — Fundament

### Schritt 1: Auth ⏳

Ohne Auth geht nichts. Supabase-Client wird hier konfiguriert (URL + Publishable Key hartcodiert).

- [ ] 1.2 Email/Password-Login
- [ ] 1.4 Session-Wiederherstellung beim App-Start
- [ ] 1.5 Logout
- [ ] 1.6 Password-Reset (Supabase Email-Flow)

**Abhängigkeiten:** Keine (erster Schritt).
**Ergebnis:** User kann sich einloggen, Session bleibt erhalten, Logout und Passwort-Reset funktionieren.

### Schritt 2: Navigation + Layout-Shell ⏳

App-Shell mit Navigation und grundlegender Infrastruktur. Jede Seite, die danach kommt, hat ein Zuhause.

- [ ] 2.1 Hauptnavigation (Sidebar Desktop / Bottom-Nav Mobile)
- [ ] 2.3 Responsive Navigation (Bottom-Bar Mobile)
- [ ] 2.6 Toast-Notifications (shadcn Sonner)
- [ ] 13.5 Theme-Color Meta-Tag
- [ ] 13.6 Responsive Layout (Tailwind Mobile-first)

**Abhängigkeiten:** Auth (Schritt 1) — Navigation zeigt unterschiedliche States je nach Login.
**Ergebnis:** Navigierbare App-Shell, responsive auf iPhone und MacBook, Toast-System global verfügbar.

---

## Schicht 1 — Daten-Grundlage

### Schritt 3: Strava-Integration (Basis) ⏳

Daten müssen in die App, bevor man sie anzeigen kann. OAuth + Auto-Sync + CSV als Fallback.

- [ ] 10.3 Strava OAuth via Vercel-Proxy
- [ ] 10.6 Strava Trennen
- [ ] 10.14 Strava Auto-Sync beim App-Start (nur wenn letzter Sync >60 Min)
- [ ] 10.1 Strava CSV-Archiv-Import (Schwimm-Meter-Fix, Dedup)
- [ ] 13.12 Strava-Rate-Limit-Handler (Queue + Retry serverseitig)

**Abhängigkeiten:** Auth (Schritt 1) — Strava-Token wird pro User gespeichert.
**Ergebnis:** Aktivitäten fließen aus Strava in Supabase. Rate-Limit-Schutz aktiv.
**🔐 Sicherheit:** Strava Client Secret + Refresh Token nur in Vercel Env Vars, nie im Frontend.

### Schritt 4: Aktivitäten CRUD ⏳

Erstellen, Bearbeiten, Löschen von Aktivitäten. Pace-Formatierung wird hier als Util gebaut und überall wiederverwendet.

- [ ] 5.1 Aktivität manuell hinzufügen (Notizen sichtbar in Share-View)
- [ ] 5.2 Aktivität bearbeiten (Option A: voll editierbar, überschreibt Strava)
- [ ] 5.3 Aktivität löschen mit Bestätigung
- [ ] 5.4 Sportart-spezifische Pace-Formatierung (min/km, min:sec/100m, km/h)
- [ ] 5.5 Intensitäts-Dots-Visualisierung

**Abhängigkeiten:** Strava-Integration (Schritt 3) — importierte Aktivitäten sind erste Testdaten.
**Ergebnis:** Vollständiges CRUD für Aktivitäten. Pace-Utils als shared Code verfügbar.

---

## Schicht 2 — Kern-Views

### Schritt 5: Aktivitäten-Liste ⏳

Erste sichtbare Bestätigung, dass Daten korrekt fließen.

- [ ] 4.1 Zeitraum-Filter (4W, 12W, 6M, 1J, Jahr, Alles)
- [ ] 4.2 Sportart-Filter
- [ ] 4.4 Sortierung nach Datum (neueste zuerst)
- [ ] 4.6 Aktivitätszeile (+ Strava-Icon bei verknüpften, + Kommentar-Zähler)

**Abhängigkeiten:** Aktivitäten CRUD (Schritt 4) — Liste zeigt die gespeicherten Daten.
**Ergebnis:** Filterbare, sortierte Aktivitäten-Liste. Kommentar-Zähler initial leer (wird in Schritt 11 befüllt).

### Schritt 6: Aktivitäten-Detail (Basis) ⏳

Detail-View mit Strava-Streams. Caching-Logik wird hier gebaut und von allen weiteren Stream-Features wiederverwendet.

- [ ] 6.1 Detail-Screen Vollseite
- [ ] 6.2 Metadaten-Kacheln
- [ ] 6.4 Strava-Stream HF-Chart
- [ ] 6.5 Strava-Stream Pace-Chart
- [ ] 6.9 Streams in Supabase cachen (UPSERT)

**Abhängigkeiten:** Aktivitäten-Liste (Schritt 5) — Navigation von Liste zu Detail.
**Ergebnis:** Klick auf Aktivität öffnet Detail mit HR- und Pace-Charts. Streams werden nach erstem Laden gecacht.

### Schritt 7: Trainingsplan ⏳

Wochenrahmen + Wochenziele. Muss vor Dashboard stehen, weil die Belastungsampel darauf zugreift.

- [ ] 8.1 Wochenrahmen-Grid (7-Tage-Raster Mo–So)
- [ ] 8.2 Wochenrahmen bearbeiten
- [ ] 8.3 Wochenziele setzen (Lauf km/Sessions, Rad km/Sessions, Schwimm m/Sessions, Gesamt-Stunden)
- [ ] 8.5 Trainingsplan speichern (Auto-Save + Supabase `week_frame`)

**Abhängigkeiten:** Auth (Schritt 1) — Wochenziele sind pro User.
**Ergebnis:** Konfigurierbarer Wochenrahmen, Auto-Save. Input für Belastungsampel bereit.

### Schritt 8: Dashboard ⏳

Hauptseite der App. Hängt ab von Aktivitäten (Schritt 4), Filter-Logik (Schritt 5), Trainingsplan (Schritt 7).

- [ ] 3.1 Zeitraum-Filter (1W, 4W, 12W, 6M, 1J, Jahr, Alles)
- [ ] 3.2 Sportart-Filter (inkl. Sonstiges)
- [ ] 3.3 Wochenvolumen-Balkendiagramm
- [ ] 3.4 Wochen-Trainingsvolumen-KPI-Karten
- [ ] 3.5 Belastungsampel
- [ ] 3.7 Anstehende Events Kalenderjahr (initial leer, wird nach Schritt 9 befüllt)
- [ ] 3.12 Kommentare auf Dashboard (initial leer, wird nach Schritt 11 befüllt)

**Abhängigkeiten:** Trainingsplan (Schritt 7) — Ampel braucht Wochenziele. Aktivitäten (Schritt 4) — Charts brauchen Daten.
**Ergebnis:** Vollständiges Dashboard. Event-Kacheln und Kommentare zeigen zunächst Leer-States.

---

## Schicht 2.5 — Events

### Schritt 9: Events CRUD ⏳

Befüllt die Event-Kacheln auf dem Dashboard (3.7) und liefert Kontext für den Coach (Schritt 10).

- [ ] 7.1 Anstehende Wettkämpfe mit Countdown
- [ ] 7.3 Wettkampf anlegen (+ Event-Link URL, + optionale Startzeit)
- [ ] 7.4 Wettkampf bearbeiten
- [ ] 7.5 Wettkampf löschen
- [ ] 7.6 Vergangene Ergebnisse erfassen
- [ ] 7.7 Ergebnisse bearbeiten/löschen
- [ ] 7.8 Kombinierte Verlaufs-Liste

**Abhängigkeiten:** Auth (Schritt 1). Dashboard (Schritt 8) profitiert davon, ist aber nicht blockiert.
**Ergebnis:** Vollständiger Event-Workflow. Dashboard-Event-Kacheln werden lebendig.

---

## 🐛 Bug-Session A (zwischen Schritt 9 und 10) ⏳

Vor dem Bau des neuen Telegram-Coaches die bestehenden Telegram-Bugs in der Legacy-App verstehen, damit sie in der neuen App nicht wiederholt werden.

- [ ] **Bug 9.8:** Telegram-Push-Bewertung nach neuer Einheit funktioniert nicht. Diagnose: Webhook-Subscription aktiv? Token gültig? Vercel-Function-Logs prüfen.
- [ ] **Bug 9.13:** Wöchentlicher Telegram-Review nutzt falsche Wochen-Logik. Fix: Woche = Montag bis Sonntag (ISO 8601).

**Ergebnis:** Ursache dokumentiert, Fix-Strategie für neue App klar.

---

## Schicht 3 — Coach

### Schritt 10: Telegram + Coach ⏳

Telegram-Integration mit bidirektionalem Chat. Braucht Aktivitäten + Events als Kontext-Input.

- [ ] 9.2 Claude-API via Vercel-Proxy
- [ ] 9.3 Kontext-aware Coach-Nachrichten (8 Wochen Training, Events, Wochensummen)
- [ ] 9.7 Editierbarer System-Prompt (auf Coach-Konfig-Seite, Supabase `settings`)
- [ ] 9.8 Telegram-Push nach neuer Einheit (Haiku) — mit Bug-Fix aus Session A
- [ ] 9.9 Telegram-Verbindung testen
- [ ] 9.11 Bidirektionaler Telegram-Coach (Sonnet, Webhook mit Secret-Token-Verifizierung, voller Kontext pro Message)
- [ ] 9.13 Wöchentlicher Telegram-Review (Mo–So korrekt) — mit Bug-Fix aus Session A

**Abhängigkeiten:** Aktivitäten (Schritt 4) + Events (Schritt 9) — für Coach-Kontext. Bug-Session A — für saubere Implementierung.
**Ergebnis:** Vollständiger Telegram-Coach. Push nach Einheit, bidirektionaler Chat, wöchentlicher Review.
**💰 Kosten:** Ab hier laufende Claude-API-Kosten. Spend Limit setzen!
**🔐 Sicherheit:** Claude API Key + Telegram Bot Token + Chat ID nur in Vercel Env Vars. Webhook muss `X-Telegram-Bot-Api-Secret-Token` verifizieren.

---

## Schicht 4 — Konfig & Social

### Schritt 11: Einstellungen ⏳

- [ ] 11.2 Benutzername (Anzeigename)
- [ ] 11.6 Strava OAuth-Status-Anzeige
- [ ] 11.7 Strava Webhook registrieren
- [ ] 11.12 Telegram-Status-Anzeige
- [ ] 11.13 Share-Link generieren
- [ ] 11.14 Share-Link anzeigen + Copy-Funktion
- [ ] 11.15 Share-Link löschen
- [ ] 11.19 Account-Verwaltung (Passwort ändern + Email ändern + Account löschen)
- [ ] 11.20 Webhook-Health-Dashboard (letzte Zustellung + 7-Tage-Statistik)

**Abhängigkeiten:** Strava (Schritt 3) + Coach (Schritt 10) — Status-Anzeigen referenzieren deren State.
**Ergebnis:** Vollständige Einstellungen-Seite. Share-Links können generiert werden.

### Schritt 12: Share-View ⏳

- [ ] 12.1 Share-View Read-Only-Modus (`?share=TOKEN`)
- [ ] 12.2 Read-Only-Banner
- [ ] 12.3 Dashboard vollständig in Share-View
- [ ] 12.4 Kommentar schreiben ohne Login (Name + Nachricht + Datum-Anzeige)
- [ ] 12.5 Kommentare laden und anzeigen
- [ ] 12.6 Kommentar löschen (Owner) — mit Bug-Fix
- [ ] 12.8 Notfall-Kill-Switch: alle Share-Links sofort widerrufen

**Abhängigkeiten:** Share-Link (Schritt 11, 11.13) + Dashboard-Komponenten (Schritt 8).
**Ergebnis:** Freunde können über Share-Link lesen und kommentieren. Dashboard-Kommentare (3.12) und Aktivitätszeilen-Kommentar-Zähler (4.6) werden lebendig.

---

## 🐛 Bug-Session B (zwischen Schritt 12 und 13) ⏳

- [ ] **Bug 12.6:** Kommentar-Löschen funktioniert nicht. Vermuteter Bereich: RLS-Policy oder Owner-Check. Wird direkt im Rahmen von Schritt 12 adressiert — diese Session ist Puffer, falls der Fix dort nicht trivial war.

---

## Schicht 5 — PWA

### Schritt 13: PWA-Finalisierung ⏳

- [ ] 13.4 PWA-App-Icon (über vite-plugin-pwa) — ⚠️ Logo-Design noch ausstehend

**Abhängigkeiten:** Alle vorherigen Schritte. Logo-Design muss vor diesem Schritt abgeschlossen sein.
**Ergebnis:** App kann auf iPhone Home-Bildschirm installiert werden mit korrektem Icon.

---

## Gesamtfortschritt

| Schicht             | Status | Features erledigt |
| ------------------- | ------ | ----------------- |
| 0 — Fundament       | ⏳     | 0/9               |
| 1 — Daten           | ⏳     | 0/10              |
| 2 — Kern-Views      | ⏳     | 0/20              |
| 🐛 Bug-Session A    | ⏳     | 0/2               |
| 3 — Coach           | ⏳     | 0/7               |
| 4 — Konfig & Social | ⏳     | 0/16              |
| 🐛 Bug-Session B    | ⏳     | 0/1               |
| 5 — PWA             | ⏳     | 0/1               |
| **Gesamt**          | ⏳     | **0/66**          |

---

## Hinweise

- **T2/T3-Features** sind in dieser Datei nicht enthalten. Sie werden nach dem MVP-Launch oder während der Saison nachgezogen. Reihenfolge dafür wird in einer separaten Session geplant.
- **Nach jedem abgeschlossenen Schritt:** Checkbox hier abhaken UND die zugehörigen Features in `feature-parity.md` ebenfalls abhaken.
- **Umschalt-Tag-Ziel:** August/September 2026. Bei 2–3 Abenden/Woche sind 21–31 Arbeitstage realistisch (Start Mitte April → MVP Juli–August).
