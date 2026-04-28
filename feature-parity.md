# Feature-Parity-Checkliste — athlete.coach Phase-1-Migration

> **Zweck:** Vollständige, priorisierte Feature-Liste als Grundlage für Migrations-Schritte 7–10.
> Erstellt aus der Legacy-App-Analyse (PR #12) und der Opus-Priorisierungs-Session vom 15.04.2026.
>
> **Legende Priorität:**
>
> | Wert       | Bedeutung                                                    |
> | ---------- | ------------------------------------------------------------ |
> | `muss`     | Feature wird in Phase 1 implementiert                        |
> | `kann weg` | Feature entfällt bewusst in der neuen App                    |
> | `Phase 2`  | Feature kommt erst in Phase 2 (Multi-User) oder separatem PR |
> | `später`   | Entscheidung noch offen, nicht Teil dieser Migration         |
>
> **Tier-Einteilung (nur für `muss`-Features):**
>
> | Tier | Bedeutung                                               |
> | ---- | ------------------------------------------------------- |
> | T1   | MVP — launch-kritisch, ohne ist die App nicht produktiv |
> | T2   | Polish — wertsteigernd, nicht launchblockierend         |
> | T3   | Advanced — anspruchsvoll, kann nach Launch nachkommen   |
>
> **Format:** `- [ ] **Feature-Name** — Beschreibung · [Priorität: muss · T1] · [Begründung: kurz, max 1 Satz]`

---

## 1. Authentifizierung & Sessions

- [ ] **1.1 Supabase-Setup-Screen** — Erster-Start-Dialog für Supabase URL + Anon Key. · [Priorität: kann weg] · [Begründung: App ist Single-Tenant, Supabase wird hartcodiert]
- [x] **1.2 Email/Password-Login** — Login-Formular mit E-Mail und Passwort via Supabase Auth. · [Priorität: muss · T1] · [Begründung: Pflicht für Datenzugriff]
- [ ] **1.3 Email/Password-Signup** — Registrierung neuer Accounts aus dem Login-Screen. · [Priorität: Phase 2] · [Begründung: In Phase 1 nur Sebastian, Freunde via Share-Link]
- [x] **1.4 Session-Wiederherstellung** — Supabase-Session beim App-Start automatisch wiederherstellen. · [Priorität: muss · T1] · [Begründung: UX-Pflicht für Mobile-Nutzung]
- [x] **1.5 Logout** — Abmelden via Supabase `signOut`, Weiterleitung zum Login-Screen. · [Priorität: muss · T1] · [Begründung: Standard-Anforderung]
- [ ] **1.6 Password-Reset (Supabase Email-Flow)** _(neu)_ — E-Mail-basierter Passwort-Reset über Supabase. · [Priorität: muss · T1] · [Begründung: Recovery ohne Reset wäre fatal]

---

## 2. Navigation & Layout

- [x] **2.1 Hauptnavigation Sidebar Desktop / Bottom-Nav Mobile** — Hybrid-Navigation: Sidebar auf Desktop, Bottom-Bar auf Mobile (umformuliert von Topbar). · [Priorität: muss · T1] · [Begründung: Grundgerüst]
- [ ] **2.2 Kompakt-Modus Nav-Toggle** — Button zum Ein-/Ausklappen der Nav-Labels. · [Priorität: kann weg] · [Begründung: Mobile-first löst das automatisch]
- [x] **2.3 Responsive Navigation Bottom-Bar Mobile** — Bottom-Navigation für kleine Screens. · [Priorität: muss · T1] · [Begründung: iPhone ist Hauptgerät]
- [ ] **2.4 Aktivitäten-Badge in Topbar** — Pill mit Gesamtanzahl der Einheiten. · [Priorität: kann weg] · [Begründung: Info auf Aktivitäten-Seite reicht]
- [ ] **2.5 Live-Datum in Topbar** — Aktuelles Datum und Uhrzeit in der Topbar. · [Priorität: kann weg] · [Begründung: iPhone zeigt Datum nativ]
- [x] **2.6 Toast-Notifications** — Einblendbare Status-Meldungen (Erfolg/Fehler), verschwinden nach 3 Sekunden. · [Priorität: muss · T1] · [Begründung: Pflicht für Feedback] ✅ via PR #46

---

## 3. Dashboard

- [x] **3.1 Zeitraum-Filter (1W, 4W, 12W, 6M, 1J, Jahr, Alles)** — Chips steuern alle Dashboard-Charts und KPI-Karten. · [Priorität: muss · T1] · [Begründung: Kerninteraktion] ✅ via PR #44 (Segmented Control F7)
- [x] **3.2 Sportart-Filter inkl. „Sonstiges"** — Chips: Alle, Laufen, Rad, Schwimmen, Sonstiges. · [Priorität: muss · T1] · [Begründung: Triathlon-Mix erfordert Trennung] ✅ via PR #44 (KPI-Filter-Buttons F6 + Volume-Chart-Klick F8)
- [x] **3.3 Wochenvolumen-Balkendiagramm** — SVG-Chart: Trainingsstunden pro Woche/Monat, farbcodiert nach Sportart, mit Tooltip. · [Priorität: muss · T1] · [Begründung: Hauptchart]
- [x] **3.4 Wochen-Trainingsvolumen-KPI-Karten (Lauf/Rad/Schwimm)** — Drei Karten mit akkumulierter Distanz und Zeit im gewählten Zeitraum. · [Priorität: muss · T1] · [Begründung: täglicher Blick]
- [x] **3.5 Belastungsampel** — Grün/Gelb/Rot basierend auf Wochenziel-Sportarten; Text erklärt fehlende Sportart. · [Priorität: muss · T1] · [Begründung: direktes Feedback]
- [x] **3.6 Wochenfortschritts-Kreisring** — SVG-Kreis: Fortschritt der laufenden Woche (geleistete vs. Ziel-Stunden). · [Priorität: muss · T2] · [Begründung: visuelle Ergänzung zur Ampel] ✅ via PR #45 (WeekGoalCard F1)
- [x] **3.7 Anstehende Events (adaptive Darstellung je nach Anzahl)** — Bevorstehende Wettkämpfe mit Countdown-Tagen; Darstellung passt sich an Anzahl an. · [Priorität: muss · T1] · [Begründung: Saison-kritisch]
- [ ] **3.8 Wettkampf-Performance-Chart** — SVG: Wettkampfzeiten vergangener Rennen als Zeitverlauf, nach Sportart gefärbt. · [Priorität: muss · T2] · [Begründung: Motivationsanker]
- [x] **3.9 Kumulierte Jahres-Trainingszeit** — SVG-Chart: kumulierte Stunden je Monat, Jahresvergleich als überlagerte Linien, Tooltip. · [Priorität: muss · T2] · [Begründung: Endurance-Vergleich] ✅ via PR #41 + S2 (lokale Jahr-Pills F10 PR #44)
- [ ] **3.10 HF-Zonenverteilung** _(braucht Stream-Auswertung)_ — Balkendiagramm: Anteil der Einheiten in 5 HF-Zonen (nach max HR). · [Priorität: muss · T2] · [Begründung: Trainingssteuerung]
- [ ] **3.11 VO2max/VDOT-Schätzung** — VO2max nach Jack-Daniels-Formel aus Wettkampfergebnissen oder Trainingsdaten. · [Priorität: muss · T2] · [Begründung: Zielzeit-Kalibrierung]
- [x] **3.12 Kommentare auf Dashboard (Share-View)** — Kommentare von Freunden werden unterhalb des Dashboards in der Share-View angezeigt. · [Priorität: muss · T1] · [Begründung: Kern Phase-1-Vision]
- [ ] **3.13 Likes/Emoji-Reaktionen auf Kommentare** _(neu)_ — Freunde können auf Einheiten oder Kommentare mit Emoji reagieren. · [Priorität: muss · T2] · [Begründung: soziale Komponente]
- [ ] **3.14 Telegram-Ping bei neuem Kommentar/Like (Spam-Schutz serverseitig)** _(neu)_ — Benachrichtigung an Sebastian bei neuer Interaktion; Spam-Schutz verhindert Flood. · [Priorität: muss · T2] · [Begründung: Erinnerung an Interaktion]
- [ ] **3.15 Streak-Counter** _(neu)_ — Zeigt aktuelle Trainings-Streak in Tagen oder Wochen. · [Priorität: muss · T2] · [Begründung: Motivationsanker]
- [ ] **3.16 Training Load TSS/TRIMP** _(neu)_ — Berechnung von Trainingsbelastung via TSS oder TRIMP als Metrik. · [Priorität: muss · T3] · [Begründung: State-of-the-Art Belastungsmetric]
- [ ] **3.17 ACWR Workload Ratio** _(neu, baut auf 3.16)_ — Acute/Chronic Workload Ratio als Verletzungsrisiko-Indikator. · [Priorität: muss · T3] · [Begründung: Verletzungsrisiko]
- [ ] **3.18 Race-Day-View** _(neu)_ — Am Wettkampftag spezielle Dashboard-Sicht mit relevantem Content (Wetter, Zielzeit, Checkliste). · [Priorität: muss · T2] · [Begründung: Produkt-Highlight]

---

## 4. Aktivitäten — Liste

- [x] **4.1 Zeitraum-Filter (4W, 12W, 6M, 1J, Jahr, Alles)** — Chips filtern die Aktivitätsliste; kein 1W da Dashboard das übernimmt. · [Priorität: muss · T1] · [Begründung: konsistent zu Dashboard]
- [x] **4.2 Sportart-Filter** — Chips: Alle, Laufen, Rad, Schwimmen, Triathlon, Sonstige. · [Priorität: muss · T1] · [Begründung: Pflicht]
- [ ] **4.3 Textsuche** — Freitextsuche in Aktivitätsnamen, Echtzeit-Filterung. · [Priorität: muss · T2] · [Begründung: schnelles Finden]
- [x] **4.4 Sortierung nach Datum (neueste zuerst)** — Feste Sortierung; kein Toggle. · [Priorität: muss · T1] · [Begründung: Standard-Erwartung]
- [ ] **4.5 Aktivitäten-Anzahl-Anzeige neben Filtern** — Zeigt Anzahl der gefilterten Einheiten. · [Priorität: muss · T2] · [Begründung: null Aufwand]
- [x] **4.6 Aktivitätszeile (+ Strava-Icon, + Kommentar-Zähler)** — Zeile mit Sportart-Dot, Name, Datum, Distanz, Dauer, Pace, HF, Intensitäts-Dots; Strava-Icon bei verknüpften Einheiten; Kommentar-Zähler bei Share-Kommentaren. · [Priorität: muss · T1] · [Begründung: Liste ist Kern]
- [ ] **4.7 „Letzte 5 Einheiten" im Import-Screen** — Kurze Zuletzt-importiert-Liste. · [Priorität: kann weg] · [Begründung: redundant]

---

## 5. Aktivitäten — Erfassen & Bearbeiten

- [x] **5.1 Manuell hinzufügen (Notizen sichtbar in Share-View)** — Modal: Datum, Sport, Name, Distanz, Dauer, HF, Höhenmeter, Intensität 1–5, Notizen. · [Priorität: muss · T1] · [Begründung: für Trainings ohne Strava]
- [x] **5.2 Bearbeiten (voll editierbar, lokale Änderungen überschreiben Strava)** — Alle Felder editierbar; lokale Änderungen bleiben bei nächstem Strava-Sync erhalten. · [Priorität: muss · T1] · [Begründung: Strava-Daten oft fehlerhaft]
- [x] **5.3 Löschen mit Bestätigung** — Löschen aus der Liste mit Bestätigungs-Dialog. · [Priorität: muss · T1] · [Begründung: Pflicht]
- [x] **5.4 Sportart-spezifische Pace-Formatierung** — Laufen: min/km; Schwimmen: min:sec/100m; Rad/Tri: km/h. · [Priorität: muss · T1] · [Begründung: absolute Pflicht für Triathlet] ✅ via PR #43 (format.ts S1)
- [x] **5.5 Intensitäts-Dots-Visualisierung** — 5 gefüllte/leere Punkte als kompaktes Intensitäts-Label. · [Priorität: muss · T1] · [Begründung: clean]
- [ ] **5.6 Notizen als Markdown** _(neu)_ — Notizen in Aktivitäten werden als Markdown gerendert. · [Priorität: Phase 2] · [Begründung: nice-to-have]
- [ ] **5.7 Schwimm-Eingabe als Bahnen × Beckenlänge** _(später entscheiden)_ — Eingabehilfe für Bahn-Schwimmen statt Meter. · [Priorität: später] · [Begründung: wartet auf Sebastians Entscheidung]

---

## 6. Aktivitäten — Detail-Ansicht

- [x] **6.1 Detail-Screen Vollseite** — Eigene Vollseiten-Ansicht; kein Modal. · [Priorität: muss · T1] · [Begründung: Grundgerüst]
- [x] **6.2 Metadaten-Kacheln** — Kacheln für Distanz, Dauer, Pace, Ø HF, Intensität, Höhenmeter; nur sichtbar wenn Wert vorhanden. · [Priorität: muss · T1] · [Begründung: Pflicht]
- [ ] **6.3 Wetter-Widget (Open-Meteo historisch)** — Temperatur, Beschreibung, Wind zum Aktivitätszeitpunkt; asynchron geladen und gecacht; nur mit GPS-Koordinaten. · [Priorität: muss · T2] · [Begründung: kostenlos, im Nachgang interessant]
- [x] **6.4 Strava-Stream: Herzfrequenz-Chart** — SVG-Linienchart: HF über Zeit. · [Priorität: muss · T1] · [Begründung: Kernwert]
- [x] **6.5 Strava-Stream: Pace-Chart** — SVG-Linienchart: Pace (velocity_smooth) über Zeit. · [Priorität: muss · T1] · [Begründung: Kernwert]
- [ ] **6.6 Strava-Stream: Kadenz-Chart** — SVG-Linienchart: rpm (Rad) / spm×2 (Laufen). · [Priorität: muss · T2] · [Begründung: Laufökonomie]
- [ ] **6.7 Strava-Stream: Höhenprofil-Chart** — SVG-Linienchart: Höhe in Metern über Zeit. · [Priorität: muss · T2] · [Begründung: Rad/Trail wichtig]
- [ ] **6.8 GPS-Track auf Leaflet (HF-farbcodiert)** — Interaktive Karte; Route farbcodiert nach HF-Intensität; zoomt auf Bounding Box. · [Priorität: muss · T2] · [Begründung: Signature-Feature]
- [x] **6.9 Streams in Supabase cachen (UPSERT)** — Nach erstem Laden werden Streams in `streams`-Tabelle gespeichert; kein API-Call bei erneutem Öffnen. · [Priorität: muss · T1] · [Begründung: spart API-Calls]
- [ ] **6.10 Lap-Splits-Anzeige** _(neu)_ — Tabelle mit automatischen oder manuellen Lap-Splits aus Strava. · [Priorität: muss · T2] · [Begründung: Intervallanalyse]
- [ ] **6.11 Synchronisiertes Multi-Chart (Serien ein-/ausblendbar)** _(neu)_ — Alle Stream-Charts auf gemeinsamer Zeitachse; Serien per Toggle ein-/ausblendbar. · [Priorität: muss · T3] · [Begründung: starkes Analyse-Tool]
- [ ] **6.12 Strava-Segmente** _(neu)_ — Zeigt Strava-Segment-Ergebnisse auf der Detail-Seite. · [Priorität: muss · T3] · [Begründung: Strava-Strecken-Spaß]
- [ ] **6.13 Streckenvergleich (selbe Route über Zeit)** _(neu)_ — Vergleich mehrerer Aktivitäten auf derselben Strecke. · [Priorität: Phase 2] · [Begründung: komplexer Algorithmus]

---

## 7. Events (Wettkämpfe & Ergebnisse)

- [x] **7.1 Anstehende Wettkämpfe mit Countdown** — Liste bevorstehender Rennen: Datum-Block, Name, Ort, Ziel, Countdown in Tagen und Wochen. · [Priorität: muss · T1] · [Begründung: täglicher Blick]
- [ ] **7.2 Wettkampf-Zielprognose** — Schätzung erreichbarer Zeit aus Lauf-Pace der letzten 8 Wochen und Wettkampf-Distanz. · [Priorität: muss · T2] · [Begründung: motivierender Realitäts-Check]
- [x] **7.3 Wettkampf anlegen (+ Event-Link URL, + optionale Startzeit)** — Modal: Name, Datum, Sport, Ort, Zieltyp (Zeit/Top-X%/Freitext), optionale Startzeit, Event-Link-URL, Notizen. · [Priorität: muss · T1] · [Begründung: Pflicht]
- [x] **7.4 Wettkampf bearbeiten** — Alle Felder editierbar, vorausgefüllt. · [Priorität: muss · T1] · [Begründung: Zielzeiten ändern sich]
- [x] **7.5 Wettkampf löschen** — Löschen aus der Events-Liste. · [Priorität: muss · T1] · [Begründung: Pflicht]
- [x] **7.6 Vergangene Ergebnisse erfassen** — Modal: Datum, Sport, Name, Ort, Zielzeit, tatsächliche Zeit, Notizen/Splits. · [Priorität: muss · T1] · [Begründung: für Performance-Historie]
- [x] **7.7 Ergebnisse bearbeiten/löschen** — Bearbeiten und Löschen aus der kombinierten Verlaufs-Liste. · [Priorität: muss · T1] · [Begründung: Pflicht]
- [x] **7.8 Kombinierte Verlaufs-Liste** — Vergangene Rennen und Ergebnisse zusammen nach Datum sortiert. · [Priorität: muss · T1] · [Begründung: Performance-Historie]
- [ ] **7.9 Tapering-Hinweis (automatisch T-X Tage vor Event)** _(neu)_ — Hinweis auf Tapering-Phase erscheint automatisch wenn Event in definierten Tagen. · [Priorität: muss · T2] · [Begründung: hoher Nutzwert]
- [ ] **7.10 Rennbericht/Post-Race-Reflexion (strukturiert, fließt in Coach-Kontext)** _(neu)_ — Strukturiertes Formular nach einem Rennen; Inhalt fließt in Coach-Kontext. · [Priorität: muss · T2] · [Begründung: Saisonanalyse Gold wert]
- [ ] **7.11 Wettkampf-Wetter-Vorschau (10 Tage vor Event, Open-Meteo)** _(neu)_ — Wetter-Vorschau für den Wettkampfort; aktiv in den letzten 10 Tagen vor dem Rennen. · [Priorität: muss · T2] · [Begründung: kostenlos]
- [ ] **7.12 Strukturierte Triathlon-Splits (Schwimm/T1/Rad/T2/Lauf/Gesamt)** _(neu)_ — Eingabe und Anzeige von Triathlon-Segment-Zeiten. · [Priorität: muss · T2] · [Begründung: bessere Auswertung]

---

## 8. Trainingsplan

- [x] **8.1 Wochenrahmen-Grid (7-Tage-Raster)** — Mo–So-Raster mit Sport-Tags pro Tag; füttert Belastungsampel. · [Priorität: muss · T1] · [Begründung: füttert Belastungsampel]
- [x] **8.2 Wochenrahmen bearbeiten** — Tags per Klick hinzufügen und entfernen. · [Priorität: muss · T1] · [Begründung: Pflicht]
- [x] **8.3 Wochenziele setzen** — Numerische Zielfelder: km/Sessions pro Sport, Gesamt-Stunden; Basis für Ampel. · [Priorität: muss · T1] · [Begründung: Basis für Ampel + Heatmap]
- [ ] **8.4 Unsaved-Changes-Indikator** — Visueller Hinweis bei ungespeicherten Änderungen. · [Priorität: kann weg] · [Begründung: Auto-Save löst das]
- [x] **8.5 Trainingsplan speichern als Auto-Save** — Speichert automatisch nach jeder Änderung lokal + Supabase. · [Priorität: muss · T1] · [Begründung: UX-Standard]
- [ ] **8.6 Periodisierung nach Saisonzielen** _(neu, konzeptionell komplex, eigene Design-Session nötig)_ — Trainingsplan-Periodisierung über mehrere Wochen/Phasen basierend auf Saisonzielen. · [Priorität: muss · T3] · [Begründung: anspruchsvoll wegen überlappender Phasen]
- [ ] **8.7 Jahres-Zielerreichungs-Heatmap** _(neu, braucht Überarbeitung Ampel-/Ziel-Logik)_ — Kalender-Heatmap der Trainingszielerreichung über das Jahr. · [Priorität: muss · T2] · [Begründung: starkes Visual]

---

## 9. Coach / KI

- [ ] **9.1 Coach-Chat-Interface (Web-Bubbles)** — Chat-Bubble-Interface im Browser. · [Priorität: kann weg] · [Begründung: Telegram-only Strategie]
- [x] **9.2 Claude-API via Vercel-Proxy** — Alle Claude-Calls über konfigurierten Vercel-Proxy; kein API Key im Frontend. · [Priorität: muss · T1] · [Begründung: hält API Key sicher]
- [ ] **9.3 Kontext-aware Coach-Nachrichten (8 Wochen, Events, Wochensummen)** — Systemkontext enthält letzte 8 Wochen Training, nächste Wettkämpfe, aktuelle Wochensummen. · [Priorität: muss · T1] · [Begründung: Kern]
- [ ] **9.4 Schnellfragen-Chips als Telegram-Bot-Keyboard (nicht Web)** — Vordefinierte Fragen als Telegram Inline-Keyboard-Buttons. · [Priorität: muss · T2] · [Begründung: Quick-Access]
- [ ] **9.5 Coach-Historie in localStorage** — Gesprächsverlauf in localStorage. · [Priorität: kann weg] · [Begründung: wird durch Supabase coach_messages ersetzt]
- [ ] **9.6 Coach-Chat löschen / Historie leeren** — Reset der Coach-Gesprächshistorie. · [Priorität: muss · T2] · [Begründung: Reset-Möglichkeit]
- [x] **9.7 Editierbarer System-Prompt** — Textarea für anpassbaren Coach-Prompt; gespeichert in Supabase `settings`. · [Priorität: muss · T1] · [Begründung: Sebastian tunet aktiv]
- [ ] **9.8 Telegram-Push-Bewertung nach neuer Einheit (Haiku)** ⚠️ **aktuell defekt — Bug fixen** — Automatische KI-Kurzbewertung via Telegram nach jeder neuen Strava-Einheit. · [Priorität: muss · T1] · [Begründung: täglich genutzt]
- [x] **9.9 Telegram-Verbindung testen** — Testnachricht an konfigurierten Bot senden. · [Priorität: muss · T1] · [Begründung: Token/Chat-ID-Validierung]
- [ ] **9.10 Typing-Indicator** — „Coach denkt nach…"-Anzeige. · [Priorität: kann weg] · [Begründung: entfällt mit Telegram-only, Bot zeigt typing nativ]
- [ ] **9.11 Bidirektionaler Telegram-Coach (Sonnet, Webhook mit Secret-Token-Verifizierung)** _(neu)_ — Echter Chat via Telegram: Webhook mit Secret-Token-Verifizierung, voller Kontext pro Message, Sonnet. · [Priorität: muss · T1] · [Begründung: Kern Phase-1-Vision]
- [ ] **9.12 Read-only Web-Ansicht der Coach-Historie** _(neu)_ — Lesbare Darstellung der Coach-Gesprächshistorie in der Web-App für Laptop-Nachschlagen. · [Priorität: muss · T2] · [Begründung: Laptop-Nachschlagen]
- [ ] **9.13 Wöchentlicher Telegram-Review (Mo–So korrekte Wochen-Logik!)** _(neu)_ ⚠️ **Bug in Wochen-Logik fixen** — Automatischer Wochenzusammenfassungs-Push; Woche muss ISO 8601 (Mo–So) sein. · [Priorität: muss · T1] · [Begründung: existiert produktiv]

---

## 10. Import

- [x] **10.1 Strava CSV-Archiv-Import (Schwimm-Meter-Fix, Dedup)** — Datei-Drop-Zone für Strava-Aktivitäten-CSV; Schwimm-Distanz in Metern (kein ×1000); Deduplizierung nach Name+Datum. · [Priorität: muss · T1] · [Begründung: Initial-Befüllung + Nachzug]
- [ ] **10.2 Strava API Sync manuell** — Button „Jetzt synchronisieren". · [Priorität: kann weg] · [Begründung: durch 10.14 Auto-Sync ersetzt]
- [x] **10.3 Strava OAuth via Vercel-Proxy** — Vollständiger OAuth2-Flow über Vercel-Proxy; speichert Refresh Token. · [Priorität: muss · T1] · [Begründung: Grundvoraussetzung]
- [ ] **10.4 Strava manueller Access-Token** — Fallback: Access Token direkt einfügen. · [Priorität: kann weg] · [Begründung: Sicherheitsrisiko]
- [ ] **10.5 Strava Token erneuern Button** — Manuelles Token-Refresh. · [Priorität: kann weg] · [Begründung: soll automatisch im Hintergrund passieren]
- [x] **10.6 Strava Trennen** — Entfernt Refresh Token und Access Token. · [Priorität: muss · T1] · [Begründung: Pflicht für Debug/Account-Wechsel]
- [x] **10.7 Strava Virtual-Ride-Distanz-Reparatur (Rollentrainer-Fix)** — Korrigiert fehlerhafte Distanzwerte bei Rollentrainer-Einheiten. · [Priorität: muss · T2] · [Begründung: Winter-Sessions relevant] ✅ via PR #47 (Radrolle-Erkennung F2)
- [ ] **10.8 GPX-Import** — Einzelne oder mehrere GPX-Dateien; parst Track-Punkte. · [Priorität: kann weg] · [Begründung: Strava deckt alles ab]
- [ ] **10.9 JSON-Import** — Importiert JSON-Datei mit einer oder mehreren normalisierten Aktivitäten. · [Priorität: kann weg] · [Begründung: Entwickler-Feature, nie produktiv]
- [ ] **10.10 Komplett-Export & -Import (Aktivitäten + Wettkämpfe + Settings ohne Secrets, JSON, bidirektional)** _(verschmolzen aus Export-JSON + Backup-Import + Einstellungs-Export)_ — Vollständiger Daten-Export und -Import als JSON; Settings ohne Secrets. · [Priorität: muss · T2] · [Begründung: Datensouveränität]
- [ ] **10.12 Demo-Daten laden** — Lädt vordefiniertes Testdaten-Set. · [Priorität: kann weg] · [Begründung: Entwickler-Feature]
- [ ] **10.13 Alle Daten löschen** — Löscht alle Daten lokal und in Supabase. · [Priorität: Phase 2] · [Begründung: DSGVO-relevant ab Multi-User]
- [ ] **10.14 Strava Auto-Sync beim App-Start (nur wenn letzter Sync >60 Min her)** _(neu)_ — Automatischer Sync beim Öffnen der App; überspringt wenn Sync <60 Min zurückliegt. · [Priorität: muss · T1] · [Begründung: ersetzt manuellen Button]
- [ ] **10.15 Strava Re-Sync einzelner Aktivität (Button auf Activity-Detail)** _(neu)_ — Einzelne Aktivität aus Strava neu laden und überschreiben. · [Priorität: muss · T2] · [Begründung: nachträgliche Strava-Korrekturen]
- [ ] **10.16 Backfill-Bereich (gezieltes Nachladen Zeiträume von Strava)** _(neu)_ — Interface zum gezielten Nachladen eines Zeitraums von Strava. · [Priorität: muss · T2] · [Begründung: Historie-Lücken füllen]
- [ ] **10.17 Import-Historie/Log** _(neu)_ — Protokoll der letzten Import-Vorgänge mit Zeitstempel und Ergebnis. · [Priorität: muss · T2] · [Begründung: Transparenz]

---

## 11. Einstellungen

- [ ] **11.1 Supabase URL + Anon Key konfigurieren** — Felder zum Ändern der Supabase-Verbindung. · [Priorität: kann weg] · [Begründung: wird hartcodiert]
- [x] **11.2 Benutzername (Anzeigename)** — Freitext für den eigenen Namen; wird im Coach-Kontext genutzt. · [Priorität: muss · T1] · [Begründung: wird im Coach-Kontext genutzt]
- [ ] **11.3 Claude API Key konfigurieren** — Passwort-Feld für Claude API Key. · [Priorität: kann weg] · [Begründung: wandert in Vercel Env Vars]
- [ ] **11.4 Vercel Proxy URL konfigurieren** — URL des Vercel-Proxy. · [Priorität: kann weg] · [Begründung: hartcodiert]
- [ ] **11.5 Strava Client ID konfigurieren** — Numerisches Feld für Strava-App-Client-ID. · [Priorität: kann weg] · [Begründung: hartcodiert (216084)]
- [x] **11.6 Strava OAuth-Status-Anzeige** — Status-Badge „verbunden / nicht verbunden". · [Priorität: muss · T1] · [Begründung: Verbindungs-Status sichtbar]
- [ ] **11.7 Strava Webhook registrieren** — Registriert Strava-Webhook via Vercel-Proxy; speichert Subscription ID. · [Priorität: muss · T1] · [Begründung: ohne Webhook keine Auto-Bewertungen]
- [ ] **11.8 Strava Webhook löschen** — Löscht bestehende Webhook-Subscription. · [Priorität: muss · T2] · [Begründung: für Debug/Re-Registrierung]
- [ ] **11.9 Strava Webhook-Status prüfen** — Prüft aktive Subscriptions; zeigt Subscription ID an. · [Priorität: muss · T2] · [Begründung: Statusanzeige]
- [ ] **11.10 Telegram Bot Token** — Passwort-Feld für Telegram Bot Token. · [Priorität: kann weg] · [Begründung: wandert in Vercel Env Vars]
- [ ] **11.11 Telegram Chat ID** — Feld für Telegram Chat ID. · [Priorität: kann weg] · [Begründung: wandert in Vercel Env Vars]
- [x] **11.12 Telegram-Status-Anzeige** — Status-Badge ob Telegram konfiguriert. · [Priorität: muss · T1] · [Begründung: Status sichtbar (kein Secret)]
- [x] **11.13 Share-Link generieren** — Erstellt zufälligen Token, speichert in Supabase `public_shares`, kopiert URL in Clipboard. · [Priorität: muss · T1] · [Begründung: Kernfeature Phase 1]
- [x] **11.14 Share-Link anzeigen + Copy-Funktion** — Readonly-Input mit vollständiger URL; Klick kopiert. · [Priorität: muss · T1] · [Begründung: Pflicht]
- [x] **11.15 Share-Link löschen** — Entfernt Share-Token aus Supabase; Link wird ungültig. · [Priorität: muss · T1] · [Begründung: Revoke-Möglichkeit]
- [ ] **11.16 Coach-Prompt-Editor mit Versions-Historie (10 Versionen, rollback-fähig)** _(neu)_ — Prompt-Editor mit Historisierung; bis zu 10 Versionen rollback-fähig. · [Priorität: muss · T2] · [Begründung: Prompt-Tuning ist Sebastians Hebel]
- [ ] **11.18 Theme-Wahl (Light / Dark / System)** _(neu)_ — Umschalten zwischen Light, Dark und System-Präferenz. · [Priorität: muss · T2] · [Begründung: User-Kontrolle]
- [x] **11.19 Account-Verwaltung: Passwort ändern + Email ändern + Account löschen** _(neu)_ — Self-Service-Verwaltung via Supabase. · [Priorität: muss · T1] · [Begründung: Self-Service-Standard]
- [ ] **11.20 Webhook-Health-Dashboard (letzte erfolgreiche Zustellung + 7-Tage-Statistik)** _(neu)_ — Übersicht: wann zuletzt erfolgreich Webhook zugestellt + 7-Tage-Erfolgsrate. · [Priorität: muss · T1] · [Begründung: sieht Ausfälle proaktiv]

---

## 12. Share-View & Kommentare

- [x] **12.1 Share-View Read-Only-Modus (`?share=TOKEN` ohne Login)** — App öffnet ohne Login; Daten des verlinkten Nutzers werden aus Supabase gelesen. · [Priorität: muss · T1] · [Begründung: Fundament]
- [x] **12.2 Read-Only-Banner** — Banner: „Du schaust Sebastians Trainingslog — nur lesend"; Navigation ausgeblendet. · [Priorität: muss · T1] · [Begründung: UX-Pflicht]
- [x] **12.3 Dashboard vollständig in Share-View** — Alle Charts und KPIs des Dashboards sichtbar in der Share-View. · [Priorität: muss · T1] · [Begründung: Wert für Freunde] ✅ vollständige Chart-Parität via PR #45 (B1)
- [x] **12.4 Kommentar schreiben ohne Login (Name + Nachricht + Datum-Anzeige)** — Kommentarformular ohne Authentifizierung; Datum wird angezeigt. · [Priorität: muss · T1] · [Begründung: Kern]
- [x] **12.5 Kommentare laden und anzeigen** — Kommentare aus Supabase `comments`; neueste zuerst. · [Priorität: muss · T1] · [Begründung: gehört zu 12.4]
- [ ] **12.6 Kommentar löschen (Owner)** ⚠️ **Bug fixen** — Eingeloggter Owner kann Kommentare löschen; aktuell defekt. · [Priorität: muss · T1] · [Begründung: defekt in Legacy und neuer App]
- [ ] **12.7 Share-View-Besucher-Tracking (anonyme Zählung)** _(neu)_ — Anonyme Zählung der Share-View-Aufrufe ohne Personendaten. · [Priorität: muss · T2] · [Begründung: Interesse-Indikator]
- [ ] **12.8 Notfall-Kill-Switch: alle Share-Links sofort widerrufen** _(neu)_ — Ein Button widerruft alle aktiven Share-Links sofort. · [Priorität: muss · T1] · [Begründung: Sicherheits-Nettohaken]

---

## 13. Datenpersistenz & Infrastruktur

- [ ] **13.1 localStorage-Cache** — Spiegeln aller Kerndaten in localStorage. · [Priorität: kann weg] · [Begründung: wird durch TanStack Query ersetzt]
- [ ] **13.2 Hybrid-Sync localStorage + Supabase** — Bei jedem Speichervorgang beide Schichten aktualisieren. · [Priorität: kann weg] · [Begründung: Komplexitäts-Hotspot, raus]
- [ ] **13.3 BUILD-Timestamp Cache-Busting** — Unix-Timestamp im JS-Code für Cache-Invalidierung. · [Priorität: kann weg] · [Begründung: vite-plugin-pwa macht es richtig]
- [ ] **13.4 PWA-App-Icon (über vite-plugin-pwa)** _(Logo-Design noch ausstehend)_ — PWA-Icon für iPhone Home-Bildschirm via vite-plugin-pwa. · [Priorität: muss · T1] · [Begründung: iPhone Home-Bildschirm]
- [ ] **13.5 Theme-Color Meta-Tag** — `<meta name="theme-color">` für Browser-Chrome-Farbe. · [Priorität: muss · T1] · [Begründung: schöne PWA-Integration]
- [x] **13.6 Responsive Layout** — Mobile-first mit Tailwind; Breakpoints für Desktop. · [Priorität: muss · T1] · [Begründung: Tailwind Mobile-first]
- [ ] **13.7 Offline-Fähigkeit (PWA Service Worker, read-only)** _(neu)_ — Service Worker cached die App-Shell; Daten read-only offline verfügbar. · [Priorität: muss · T2] · [Begründung: Training unterwegs]
- [ ] **13.8 Error Boundary mit Faultier 🦥** _(neu)_ — Freundlicher Fehler-Screen: „Uff, ich habe die Balance verloren. Einmal durchatmen: [Neu laden]". · [Priorität: muss · T2] · [Begründung: freundliche Fehler-UX]
- [ ] **13.9 Performance-Monitoring (Vercel Speed Insights)** _(neu)_ — Vercel Speed Insights einbinden; kostenlos im Hobby-Plan. · [Priorität: muss · T2] · [Begründung: Production-Insights]
- [x] **13.10 Loading-Skeletons (shadcn Skeleton-Komponenten)** _(neu)_ — Skeleton-Platzhalter während Daten geladen werden. · [Priorität: muss · T2] · [Begründung: UX-Uplift] ✅ via PR #46 (KpiCardSkeleton + BarChartSkeleton)
- [ ] **13.11 Version-Anzeige im Footer (dezent, Hover zeigt Build-Info)** _(neu)_ — Dezente Versions-Anzeige (grau, Opacity ~0.4); Hover zeigt Build-Details. · [Priorität: muss · T2] · [Begründung: Debug-Hilfe ohne UI-Störung]
- [ ] **13.12 Strava-Rate-Limit-Handler (Queue + Retry-Logik serverseitig)** _(neu)_ — Rate-Limit-Handling in der Vercel Function: Queue + exponentielles Retry. · [Priorität: muss · T1] · [Begründung: sonst Backfill unzuverlässig]

---

## 14. Neue Features (implementiert S2–S5, kein Legacy-Äquivalent)

> Diese Features wurden während der Polish-Phase neu entwickelt und haben keinen Eintrag in der ursprünglichen Parity-Liste.

- [x] **F9 KPI-Stagger-Animation** — Stagger-Animation beim ersten Mount der KPI-Kacheln; prefers-reduced-motion sicher. · [Priorität: muss · T2] ✅ via PR #46
- [x] **F12 Splash-Screen** — Kalt-Start-Erkennung mit Zoom+Fade-Animation; prefers-reduced-motion-Fallback. · [Priorität: muss · T2] ✅ via PR #46
- [x] **PR3-P2 Empty States** — Leerzustände an 6 Stellen (Aktivitäten-Liste, Aktivitäten-Detail, Events-offen, Events-vergangen, Kommentare, Dashboard). · [Priorität: muss · T2] ✅ via PR #46
- [x] **PR3-P5 Pull-to-Refresh** — Native Pull-to-Refresh ohne Extra-Paket (~0 KB). · [Priorität: muss · T2] ✅ via PR #46
- [x] **PR3-P6 Hover/Tap-States** — Hover-Shadow auf Cards, gesamte Card klickbar (kein Layout-Shift). · [Priorität: muss · T2] ✅ via PR #46
- [x] **PR3-P1 Comments-Sheet** — Kommentare als shadcn Sheet auf Desktop (scrollbar, besser für Formular + Liste). · [Priorität: muss · T2] ✅ via PR #46
- [x] **F3 Orts-Erkennung** — `location_city` aus Strava als Aktivitätstitel-Suffix; `titleEditedByUser`-Flag verhindert Überschreiben manueller Edits; Radrolle-Suffix hat Vorrang. · [Priorität: muss · T2] ✅ via PR #47
- [x] **F4/F13 Athletenprofil-Modal** — Profil-Button in Sidebar (Desktop) und MobileHeader (Mobile); Avatar-Placeholder (`avatar_transparent.png` ausstehend); 4 Skill-Balken 1–10 editierbar; Personal Bests aus `past_results`; Saison-Stats. · [Priorität: muss · T2] ✅ via PR #47
- [x] **F11 Sebi-vs-Nico-Chart** — Dashboard-Chart „Sebi & Nico gegen die Tausend": 3 Linien (Sebi kumulierte Lauf-km, Nico manuelle Einträge mit Dots, 1.000-km-Ziel gestrichelt); Import-Modal mit Validierung. · [Priorität: muss · T2] ✅ via PR #47

---

## Migrations-Tracking

> Diese Datei ist **Living Doc** während der Migration. Jede umgesetzte Feature-Implementierung
> hakt die Checkbox ab. Status pro Tier wird beim Mergen eines Feature-PRs hochgezählt.
> Im PR-Body des Feature-PRs auf die zugehörige Feature-ID referenzieren (z. B. „Implementiert: 3.5, 3.6").

| Tier                     | Erledigt | Gesamt                                                  |
| ------------------------ | -------- | ------------------------------------------------------- |
| **T1 (MVP)**             | 43       | ~55 (ursprünglich 47; durch neue T1-Features gewachsen) |
| **T2 (Polish)**          | 13       | 34+                                                     |
| **T3 (Advanced)**        | 0        | 5                                                       |
| **Phase 2**              | —        | 4                                                       |
| **kann weg**             | —        | 24                                                      |
| **später**               | —        | 1                                                       |
| **Gesamt (alle Felder)** | —        | 115+                                                    |

> **Hinweis:** T1-Gesamtzahl ist seit dem initialen Zählen (47, PR #14) durch neue `_(neu)_`-Features gewachsen.
> T1-MVP-Migration (PRs #16–#29) ist abgeschlossen.
> T2-Polish-Block S1–S5 (PRs #43–#47): 9 neue T2-Features in Sektion 14 + 4 bestehende T2-Einträge abgehakt.
> Ursprüngliche Tracking-Anmerkung: 6 Einträge wurden verschmolzen oder entfallen (10.10 + 10.11 + 11.17 → 10.10;
> 10.11 und 11.17 existieren nicht mehr als separate Zeilen), daher 115 statt 121 Zeilen.

---

## Bug-Backlog

> Diese Bugs sind unabhängig von der Migration zu behandeln — entweder in der alten App fixen
> oder spätestens bei Übernahme in die neue App adressieren.

- ⚠️ **Bug 9.8** — **Telegram-Push-Bewertung nach neuer Einheit funktioniert nicht.** Vermuteter Bereich: Webhook-Subscription abgelaufen, Strava-Token abgelaufen oder Vercel-Function-Fehler. Vor oder spätestens bei Migration diagnostizieren und fixen.
- ⚠️ **Bug 9.13** — **Wöchentlicher Telegram-Review nutzt falsche Wochen-Logik.** Korrekte Logik: Woche = Montag bis Sonntag (ISO 8601), nicht beliebiges 7-Tages-Fenster. ISO-8601-Code aus `WeekGoalCard.tsx` (PR #45) kann wiederverwendet werden. Fix bei Migration in neue App.
- ⚠️ **Bug 12.6** — **Kommentar-Löschen durch Owner funktioniert nicht.** Vermuteter Bereich: RLS-Policy oder Owner-Check in Supabase. Fix bei Migration in neue App.
