# Feature-Parity-Checkliste — athlete.coach Legacy App

> **Zweck:** Vollständige Bestandsaufnahme aller Features der alten `index.html`.
> Grundlage für Migrations-Schritte 7–10 der Phase-1-React-Migration.
>
> **Prioritäten** werden von Sebastian gesetzt. Bis dahin steht alles auf `[Priorität: ?]`.
>
> **Legende:**
>
> | Wert       | Bedeutung                                                       |
> | ---------- | --------------------------------------------------------------- |
> | `muss`     | Feature muss 1:1 in die neue App übernommen werden              |
> | `kann weg` | Feature ist nicht mehr nötig / wird bewusst weggelassen         |
> | `Phase 2`  | Feature kommt erst in Phase 2 (Multi-User) oder später          |
> | `?`        | Noch nicht entschieden (Default-Wert bis Sebastian priorisiert) |
>
> **Format:** `- [ ] **Feature-Name** — Beschreibung · [Priorität: ?]`

---

## 1. Authentifizierung & Sessions

- [ ] **Supabase-Setup-Screen** — Erster-Start-Dialog zum Eintragen von Supabase URL und Anon Key, bevor der Rest der App startet. Erscheint wenn keine Supabase-Konfiguration vorhanden. · [Priorität: ?]
- [ ] **Email/Password-Login** — Login-Formular mit E-Mail, Passwort und Fehleranzeige via Supabase Auth. · [Priorität: ?]
- [ ] **Email/Password-Signup** — Registrierung neuer Accounts direkt aus dem Login-Screen. · [Priorität: ?]
- [ ] **Session-Wiederherstellung beim App-Start** — Supabase-Session wird automatisch beim Laden wiederhergestellt; kein erneutes Login nötig solange Session gültig. · [Priorität: ?]
- [ ] **Logout** — Abmelden via Supabase `signOut`, anschließend Weiterleitung zum Login-Screen. · [Priorität: ?]

---

## 2. Navigation & globales Layout

- [ ] **Topbar-Navigation mit 7 Seiten** — Horizontale Leiste mit Buttons für Dashboard, Coach, Einheiten, Events, Trainingsplan, Import, Einstellungen. Active-State wird hervorgehoben. · [Priorität: ?]
- [ ] **Kompakt-Modus (Nav-Label-Toggle)** — Button „⇔ Kompakt" klappt die Nav-Labels ein; nur Icons bleiben sichtbar. Zustand wird gespeichert. · [Priorität: ?]
- [ ] **Responsive Navigation** — Auf kleinen Screens (≤ 480 px) werden Nav-Labels automatisch ausgeblendet, nur Icons. · [Priorität: ?]
- [ ] **Aktivitäten-Badge in Topbar** — Pill mit Gesamtanzahl der Einheiten, aktualisiert sich nach jedem Import/Löschen. · [Priorität: ?]
- [ ] **Live-Datum in Topbar** — Aktuelles Datum und Uhrzeit werden in der Topbar angezeigt und jede Minute aktualisiert. · [Priorität: ?]
- [ ] **Toast-Notifications** — Einblendbare Status-Meldungen (Erfolg grün / Fehler orange), verschwinden automatisch nach 3 Sekunden. · [Priorität: ?]

---

## 3. Dashboard

- [ ] **Zeitraum-Filter** — Chips: 4W, 12W, 6M, 1J, Jahreszahl (z. B. „2026"), Alles. Steuert alle Dashboard-Charts und KPI-Karten. · [Priorität: ?]
- [ ] **Sportart-Filter** — Chips: Alle, Laufen, Rad, Schwimmen. Steuert Wochenvolumen-Chart und KPI-Karten. · [Priorität: ?]
- [ ] **Wochenvolumen-Balkendiagramm** — SVG-Chart: summierte Trainingszeit in Stunden pro Woche/Monat (granularitätsabhängig), farbcodiert nach Sportart, mit interaktivem Tooltip beim Hover. · [Priorität: ?]
- [ ] **Wochen-Trainingsvolumen-Karten (KPIs)** — Drei Karten Laufen / Rad / Schwimmen mit akkumulierter Distanz und Zeit im gewählten Zeitraum. · [Priorität: ?]
- [ ] **Belastungsampel** — Karte oben im Dashboard: zeigt grün/gelb/rot basierend darauf, ob die Wochenziel-Sportarten (aus Trainingsplan) bereits erfüllt sind. Text erklärt, welche Sportart noch fehlt. · [Priorität: ?]
- [ ] **Wochenfortschritts-Kreisring** — SVG-Kreis: zeigt prozentualen Fortschritt der laufenden Woche (geleistete Stunden vs. Wochenziel), Farbe entspricht Ampel-Status. · [Priorität: ?]
- [ ] **Nächste Events (bis zu 3)** — Kompakte Kacheln mit Countdown-Tagen, Sportart-Badge und Zielzeit für die nächsten anstehenden Wettkämpfe. · [Priorität: ?]
- [ ] **Wettkampf-Performance-Chart** — SVG-Linien-/Punktchart: Wettkampfzeiten vergangener Rennen als Zeitverlauf, nach Sportart gefärbt. · [Priorität: ?]
- [ ] **Kumulierte Jahres-Trainingszeit** — SVG-Chart: Kumulierte Trainingsstunden je Monat, Jahresvergleich mehrerer Jahre als überlagerte Linien, Sport-Filter-Buttons, SVG-Tooltip mit Datum und Stunden. · [Priorität: ?]
- [ ] **HF-Zonenverteilung** — Balkendiagramm: Prozentualer Anteil der Einheiten in 5 Herzfrequenz-Zonen (Basis: max HR aus Strava-Aktivitäten). · [Priorität: ?]
- [ ] **VO2max/VDOT-Schätzung** — Zeigt geschätzten VO2max-Wert nach Jack-Daniels-Formel; wird aus Wettkampfergebnissen oder Trainingsdaten mit hohem Tempo abgeleitet. · [Priorität: ?]
- [ ] **Kommentare auf dem Dashboard (Share-View)** — Unterhalb der Wettkampf-Performance-Chart werden in der Share-View neue Kommentare anderer angezeigt. · [Priorität: ?]

---

## 4. Aktivitäten — Liste

- [ ] **Aktivitätsliste mit Zeitraum-Filter** — Chips: 1M, 3M, 6M, 1J, Alles. Filtert die sichtbaren Einheiten. · [Priorität: ?]
- [ ] **Aktivitätsliste mit Sportart-Filter** — Chips: Alle, Laufen, Rad, Schwimmen, Triathlon, Sonstige. · [Priorität: ?]
- [ ] **Aktivitätsliste mit Textsuche** — Freitextsuche in Aktivitätsnamen, Echtzeit-Filterung während der Eingabe. · [Priorität: ?]
- [ ] **Aktivitätsliste sortiert nach Datum** — Immer neueste Einheit zuerst. · [Priorität: ?]
- [ ] **Aktivitäten-Anzahl-Anzeige** — Zeigt Anzahl der gefilterten Einheiten neben den Filterchips. · [Priorität: ?]
- [ ] **Aktivitätszeile** — Zeigt: Sportart-Farbpunkt, Name, Datum, Distanz (formatiert km/m), Dauer (h:mm), Pace (sportartspezifisch: /km, /100m, km/h), Ø Herzfrequenz, Intensitäts-Dots (5-Punkte). · [Priorität: ?]
- [ ] **Letzte 5 Einheiten im Import-Screen** — Kurze „Zuletzt importiert"-Liste auf der Import-Seite als schneller Überblick. · [Priorität: ?]

---

## 5. Aktivitäten — Erfassen & Bearbeiten

- [ ] **Aktivität manuell hinzufügen** — Modal mit Feldern: Datum, Sportart (Auswahl), Name, Distanz (m), Dauer (min), Ø Herzfrequenz, Höhenmeter, Intensität (1–5 mit Label), Notizen. · [Priorität: ?]
- [ ] **Aktivität bearbeiten** — Gleiche Felder wie beim Hinzufügen; vorhandene Werte vorausgefüllt. · [Priorität: ?]
- [ ] **Aktivität löschen** — Löschen mit Bestätigungs-Toast aus der Aktivitätsliste heraus. · [Priorität: ?]
- [ ] **Sportart-spezifische Pace-Formatierung** — Laufen: min/km; Schwimmen: min:sec/100m; Rad/Triathlon: km/h. · [Priorität: ?]
- [ ] **Intensitäts-Dots-Visualisierung** — 5 gefüllte/leere Punkte als kompaktes visuelles Intensitäts-Label in Listen und Detail. · [Priorität: ?]

---

## 6. Aktivitäten — Detail-Ansicht

- [ ] **Aktivitäts-Detail-Screen** — Eigene Vollseiten-Ansicht (kein Modal): Header mit Name, Datum, Sportart-Badge; Metadaten-Kacheln. · [Priorität: ?]
- [ ] **Metadaten-Kacheln** — Kacheln für Distanz, Gesamtdauer, Pace, Ø Herzfrequenz, Intensität, Höhenmeter. Nur sichtbar wenn Wert vorhanden. · [Priorität: ?]
- [ ] **Wetter-Widget** — Zeigt historische Wetterdaten zum Aktivitätszeitpunkt (Temperatur, Beschreibung, Wind via Open-Meteo API); wird asynchron nachgeladen und in der Aktivität gecacht. Nur wenn GPS-Koordinaten vorhanden. · [Priorität: ?]
- [ ] **Strava-Stream: Herzfrequenz-Chart** — SVG-Linienchart: Herzfrequenz über Zeit, wenn Strava HR-Stream vorhanden. · [Priorität: ?]
- [ ] **Strava-Stream: Pace-Chart** — SVG-Linienchart: Pace (velocity_smooth) über Zeit. · [Priorität: ?]
- [ ] **Strava-Stream: Kadenz-Chart** — SVG-Linienchart: Trittfrequenz (rpm für Rad, spm × 2 für Laufen), wenn vorhanden. · [Priorität: ?]
- [ ] **Strava-Stream: Höhenprofil-Chart** — SVG-Linienchart: Höhe in Metern über Zeit/Distanz, wenn vorhanden. · [Priorität: ?]
- [ ] **GPS-Track auf Leaflet-Karte** — Interaktive Karte (Leaflet + OSM, dynamisch geladen); Route als Linie, farbkodiert nach Herzfrequenz-Intensität; zoomt automatisch auf Bounding Box. · [Priorität: ?]
- [ ] **Strava-Streams gecacht in Supabase** — Nach erstem Laden werden Streams in der `streams`-Tabelle gespeichert (UPSERT); bei erneutem Öffnen kein API-Call nötig. · [Priorität: ?]

---

## 7. Events (Wettkämpfe & Ergebnisse)

- [ ] **Anstehende Wettkämpfe mit Countdown** — Liste bevorstehender Rennen: Datum-Block, Name, Ort, Ziel, Countdown in Tagen und Wochen. · [Priorität: ?]
- [ ] **Wettkampf-Zielprognose** — Schätzt erreichbare Zeit basierend auf Lauf-Pace der letzten 8 Wochen und Wettkampf-Distanz; wird neben dem Ziel angezeigt. · [Priorität: ?]
- [ ] **Wettkampf anlegen** — Modal: Name, Datum, Sportart, Ort, Zieltyp (Zeit h:mm:ss / Top-X-Prozent / Freitext), Notizen. · [Priorität: ?]
- [ ] **Wettkampf bearbeiten** — Gleiche Felder wie beim Anlegen, vorausgefüllt. · [Priorität: ?]
- [ ] **Wettkampf löschen** — Löschen aus der Events-Liste. · [Priorität: ?]
- [ ] **Vergangene Wettkampf-Ergebnisse erfassen** — Modal: Datum, Sportart, Name, Ort, Zielzeit, tatsächliche Zeit, Notizen/Splits. Getrennt von den „anstehenden" Races. · [Priorität: ?]
- [ ] **Vergangene Ergebnisse bearbeiten/löschen** — Bearbeitung und Löschen aus der kombinierten Verlaufs-Liste. · [Priorität: ?]
- [ ] **Kombinierte Verlaufs-Liste** — Vergangene Wettkämpfe (aus `races`) und vergangene Ergebnisse (aus `past_results`) zusammen sortiert nach Datum. · [Priorität: ?]

---

## 8. Trainingsplan

- [ ] **Wochenrahmen-Grid-Anzeige** — 7-Tage-Raster (Mo–So) mit Sport-Tags pro Tag (z. B. `run-easy`, `bike-long`, `rest`, `strength`). Anzeige auf der Events-Seite und im Plan. · [Priorität: ?]
- [ ] **Wochenrahmen bearbeiten** — Modal oder Inline: Tags per Klick hinzufügen und entfernen, Sport-Auswahl aus Vorschlägen. · [Priorität: ?]
- [ ] **Wochenziele setzen** — Numerische Zielfelder: Laufen (km, Sessions), Rad (km, Sessions), Schwimmen (m, Sessions), Gesamt-Stunden. Basis für Belastungsampel. · [Priorität: ?]
- [ ] **Unsaved-Changes-Indikator** — Visueller Hinweis (oranger Punkt + Text „Ungespeicherte Änderungen") solange Änderungen noch nicht gespeichert sind. · [Priorität: ?]
- [ ] **Trainingsplan speichern** — Lokales Speichern + Sync nach Supabase (`week_frame`-Tabelle). · [Priorität: ?]

---

## 9. Coach / KI-Chat

- [ ] **Coach-Chat-Interface** — Chat-Bubble-Verlauf mit User- und Bot-Nachrichten unterschiedlich gestylt (rechts/links, unterschiedliche Hintergrundfarben). · [Priorität: ?]
- [ ] **Claude-API-Direktverbindung via Proxy** — Nachrichten werden über den konfigurierten Vercel-Proxy an Claude Sonnet geschickt. · [Priorität: ?]
- [ ] **Kontext-aware Coach-Nachrichten** — Jede Nachricht enthält als Systemkontext: letzte 8 Wochen Training (Einheiten, Volumen), nächste Wettkämpfe, aktuelle Wochensummen. · [Priorität: ?]
- [ ] **Schnellfragen-Chips (Quick-Reply)** — Vordefinierte Frage-Buttons unter dem Eingabefeld, die mit einem Klick gesendet werden (z. B. „Wie sieht mein Training aus?"). · [Priorität: ?]
- [ ] **Coach-Nachrichtenhistorie** — Gesprächsverlauf wird in localStorage gespeichert und beim nächsten Öffnen wiederhergestellt. · [Priorität: ?]
- [ ] **Coach-Chat löschen** — Button zum Leeren der Gesprächshistorie. · [Priorität: ?]
- [ ] **Editierbarer System-Prompt** — Textarea in Coach-Seite: Anpassbarer Coach-Prompt, der an Claude und den Telegram-Webhook geschickt wird. Wird in Supabase `settings` gespeichert. · [Priorität: ?]
- [ ] **Telegram-Push-Bewertung nach neuer Einheit** — Nach jeder neuen Strava-Einheit wird automatisch eine kurze KI-Bewertung (Claude Haiku) via Telegram Bot gesendet. · [Priorität: ?]
- [ ] **Telegram-Verbindung testen** — Button zum Senden einer Test-Nachricht an den konfigurierten Telegram-Bot. · [Priorität: ?]
- [ ] **Typing-Indicator** — „Coach denkt nach…"-Anzeige mit Bot-Avatar während die KI antwortet. · [Priorität: ?]

---

## 10. Import

- [ ] **Strava CSV-Archiv-Import** — Drag-and-Drop-Zone + File-Picker für Strava-Aktivitäten-CSV; verarbeitet alle Zeilen, dedupliziert nach Namen+Datum, konvertiert Schwimmdistanzen korrekt von Metern (kein ×1000). · [Priorität: ?]
- [ ] **Strava API Sync (manuell)** — Button „Jetzt synchronisieren": lädt alle Aktivitäten aus Strava API (paginiert, bis keine mehr kommen), fügt neue hinzu, überspringt Duplikate. · [Priorität: ?]
- [ ] **Strava OAuth (App-Flow)** — Vollständiger OAuth2-Redirect-Flow über Vercel-Proxy; speichert Refresh Token für automatische Token-Erneuerung. · [Priorität: ?]
- [ ] **Strava manueller Access-Token** — Fallback: Access Token direkt einfügen (läuft alle 6h ab); nützlich ohne OAuth-Setup. · [Priorität: ?]
- [ ] **Strava Token erneuern** — Button „Token erneuern": tauscht Refresh Token gegen neuen Access Token via Vercel-Proxy. · [Priorität: ?]
- [ ] **Strava Trennen** — Entfernt gespeicherten Refresh Token und Access Token. · [Priorität: ?]
- [ ] **Strava Virtual-Ride-Distanz-Reparatur** — Sonderfunktion: korrigiert fehlerhafte Distanzwerte bei Rollentrainer-Einheiten (Strava liefert manchmal falsche Werte). · [Priorität: ?]
- [ ] **GPX-Import** — Einzelne oder mehrere GPX-Dateien einlesen; parst Track-Punkte, berechnet Distanz und Dauer, legt neue Aktivität an. · [Priorität: ?]
- [ ] **JSON-Import (Einzeldatei oder Array)** — Importiert eine JSON-Datei mit einer oder mehreren normalisierten Aktivitäten. · [Priorität: ?]
- [ ] **Daten-Export (JSON)** — Exportiert alle Aktivitäten, Wettkämpfe, Wochenrahmen und Profilname als JSON-Datei (Download). · [Priorität: ?]
- [ ] **Backup-Import** — Importiert eine zuvor exportierte JSON-Backup-Datei; überschreibt activities, races, weekFrame. · [Priorität: ?]
- [ ] **Demo-Daten laden** — Lädt ein vordefiniertes Set von Beispieldaten für Tests und Demos. · [Priorität: ?]
- [ ] **Alle Daten löschen** — Löscht alle Aktivitäten und Wettkämpfe lokal und in Supabase; braucht expliziten Klick. · [Priorität: ?]

---

## 11. Einstellungen

- [ ] **Supabase URL + Anon Key konfigurieren** — Felder zum Ändern der Supabase-Verbindung, auch nach dem initialen Setup. · [Priorität: ?]
- [ ] **Benutzername (Anzeigename)** — Freitext-Feld für den eigenen Namen, wird im Coach-Kontext und Export verwendet. · [Priorität: ?]
- [ ] **Claude API Key konfigurieren** — Passwort-Feld (masked); Key wird lokal gespeichert und für direkte Coach-API-Calls genutzt. · [Priorität: ?]
- [ ] **Vercel Proxy URL konfigurieren** — URL des Vercel-Proxy für Claude-API und Strava-OAuth. · [Priorität: ?]
- [ ] **Strava Client ID konfigurieren** — Numerisches Feld für die eigene Strava-App-Client-ID (für OAuth-Flow). · [Priorität: ?]
- [ ] **Strava OAuth-Status-Anzeige** — Grüner/grauer Status-Badge „verbunden / nicht verbunden" mit OAuth-Status. · [Priorität: ?]
- [ ] **Strava Webhook registrieren** — Registriert einen neuen Strava-Webhook via Vercel-Proxy; speichert Subscription ID. · [Priorität: ?]
- [ ] **Strava Webhook löschen** — Löscht bestehende Webhook-Subscription via Vercel-Proxy. · [Priorität: ?]
- [ ] **Strava Webhook-Status prüfen** — Prüft aktive Subscriptions bei Strava und zeigt Subscription ID an. · [Priorität: ?]
- [ ] **Telegram Bot Token konfigurieren** — Passwort-Feld für den Telegram Bot Token. · [Priorität: ?]
- [ ] **Telegram Chat ID konfigurieren** — Feld für die Telegram Chat ID. · [Priorität: ?]
- [ ] **Telegram-Status-Anzeige** — Grüner/grauer Status-Badge ob Telegram konfiguriert ist. · [Priorität: ?]
- [ ] **Share-Link generieren** — Erstellt einen zufälligen Token, speichert ihn in Supabase `public_shares`, kopiert den vollständigen Link in die Zwischenablage. · [Priorität: ?]
- [ ] **Share-Link anzeigen** — Readonly-Input-Feld mit vollständiger URL; Klick selektiert den Text. · [Priorität: ?]
- [ ] **Share-Link löschen** — Entfernt den Share-Token aus Supabase; Link wird ungültig. · [Priorität: ?]

---

## 12. Share-View & Kommentare

- [ ] **Share-View (Read-Only-Modus)** — Beim Öffnen mit `?share=TOKEN` im URL wird die App ohne Login geladen; Daten des verlinkten Nutzers werden aus Supabase gelesen. · [Priorität: ?]
- [ ] **Read-Only-Banner** — Farbiges Banner oben im Share-View: „Du schaust Sebastians Trainingslog — nur lesend". Navigation ist ausgeblendet. · [Priorität: ?]
- [ ] **Dashboard vollständig in Share-View** — Alle Dashboard-Charts und KPIs (Wochenvolumen, Events, Performance-Chart, etc.) sind in der Share-View sichtbar. · [Priorität: ?]
- [ ] **Kommentar schreiben (ohne Login)** — Formular unterhalb des Dashboards in der Share-View: Name + Nachricht, absenden ohne Authentifizierung. · [Priorität: ?]
- [ ] **Kommentare laden und anzeigen** — Kommentare werden aus Supabase `comments`-Tabelle geladen und chronologisch (neueste zuerst) angezeigt. · [Priorität: ?]
- [ ] **Kommentar löschen (Owner)** — Eingeloggter Owner kann Kommentare aus dem Dashboard-Kommentar-Bereich löschen. · [Priorität: ?]

---

## 13. Datenpersistenz & Infrastruktur

- [ ] **localStorage-Cache** — Alle Kerndaten (activities, races, weekFrame, settings, stravaToken, coachMessages) werden in `localStorage` mit Prefix `ac_` gespiegelt; App startet sofort aus Cache. · [Priorität: ?]
- [ ] **Hybrid-Sync (localStorage + Supabase)** — Bei jedem Speichervorgang wird sowohl localStorage als auch Supabase (UPSERT mit `user_id`) aktualisiert. Beim Start: Supabase-Daten werden geladen und Cache überschrieben. · [Priorität: ?]
- [ ] **BUILD-Timestamp-basiertes Cache-Busting** — Konstante `BUILD` im JS-Code wird bei jedem Deploy durch einen Unix-Timestamp ersetzt (automatisch via CI); erzwingt Cache-Invalidierung im Browser. · [Priorität: ?]
- [ ] **PWA-App-Icon** — Apple-Touch-Icon als inline base64 PNG im `<head>`; ermöglicht „Zum Home-Bildschirm hinzufügen" auf iOS. · [Priorität: ?]
- [ ] **Theme-Color Meta-Tag** — `<meta name="theme-color">` setzt Browser-Chrome-Farbe (#6c5ce7). · [Priorität: ?]
- [ ] **Responsive Layout (Mobile / Desktop)** — Einspaltig auf Mobile, breitere Darstellung auf Desktop; Breakpoints bei 480 px und 768 px. · [Priorität: ?]
