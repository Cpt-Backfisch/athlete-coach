# athlete.coach — Design System

> **Zweck dieser Datei:** Single Source of Truth für das visuelle Design der App.
> Claude Code nutzt diese Datei als Referenz, wenn er Tailwind-Config, shadcn-Theme und Komponenten baut.
> Änderungen hier = Änderungen in der ganzen App.

**Erstellt:** 13.04.2026 (Design-Session zu Beginn Phase 1)
**Stack-Kontext:** Vite + React + TypeScript + Tailwind + shadcn/ui
**Bezieht sich auf:** `context.md` (Vision), `status.md` (Phasenplan)

---

## 1. Design-Philosophie

**Richtung:** „Offen & selbstbewusst" — moderne Produkt-Ästhetik im Stil von Linear, Superhuman, Vercel Dashboard.

**Leitprinzipien:**

- **Zahlen im Vordergrund.** KPI-Werte stehen frei im Raum, nicht in Box-Gittern. Typografie trägt das Design, nicht Rahmen.
- **Warm-kühl-Kontrast kontrolliert einsetzen.** Eine warme Akzentfarbe (Orange) gegen eine kühle Basis (Dunkelgrau) — aber nie beide gleichzeitig laut.
- **Clean ohne klinisch.** Weicher Hintergrund statt Reinweiß/Reinschwarz, leicht kräftige Schrift-Weights (500/600 statt 400).
- **Sportart-Identität durch Farbe.** Jede Disziplin bekommt eine eigene Farbe — die App erzählt allein durch den Farbverlauf, womit die Woche verbracht wurde.
- **State-of-the-art, aber nicht trendy.** Design-Entscheidungen sollen in 3 Jahren noch gut aussehen.

---

## 2. Farbsystem

Zwei getrennte Farbkategorien, die sich **nie vermischen**:

### 2.1 Sportart-Farben (kategorial)

| Sportart  | Dark-Mode               | Light-Mode             | Notiz                                            |
| --------- | ----------------------- | ---------------------- | ------------------------------------------------ |
| Laufen    | `#8E6FE0` Purple        | `#5B3DB8` Deep Purple  | Assoziation: Geschmeidigkeit, Rhythmus           |
| Schwimmen | `#3359C4` Electric Blue | `#2A47A0` Deep Blue    | Assoziation: Wasser                              |
| Rad       | `#FF7A1A` Orange        | `#D25F0F` Burnt Orange | Assoziation: Energie, Wärme                      |
| Sonstiges | `#B54A2E` Rost          | `#8A3721` Dark Rust    | Kraft, Core, alles, was nicht Kern-Triathlon ist |

**Regel:** Im Light-Mode werden die Farben leicht abgedunkelt und gesättigter, damit sie auf hellem Grund nicht flimmern. Diese Anpassung ist automatisch über CSS-Variablen — Claude Code definiert beide Sets und shadcn schaltet je nach Modus.

**Textfarben auf farbigen Flächen:** Wenn eine Sportart-Farbe als Hintergrund dient (Pill, Badge), nutze eine sehr helle oder sehr dunkle Version derselben Farbe, nie neutrales Grau.

### 2.2 Status-Farben (semantisch)

Getrenntes System für Zustände wie „Form", „Belastung", „Warnung":

| Status           | Dark-Mode | Light-Mode | Bedeutung                       |
| ---------------- | --------- | ---------- | ------------------------------- |
| Positiv / frisch | `#66d9a8` | `#0F6E56`  | Gute Form, Bereitschaft, Erfolg |
| Achtung          | `#F5B800` | `#A37300`  | Hohe Belastung, Vorsicht        |
| Warnung / rot    | `#E24B4A` | `#A32D2D`  | Überlastung, Fehler, Abbruch    |

**Regel:** Status-Farben dürfen nie mit Sportart-Farben verwechselt werden. Ein grüner Text = immer ein Zustand, nie eine Sportart.

### 2.3 Hintergrund & Text

| Rolle                          | Dark-Mode                   | Light-Mode          |
| ------------------------------ | --------------------------- | ------------------- |
| Haupt-Hintergrund (Background) | `#000000` echtes Schwarz    | `#FAFAF8` Off-White |
| Surface (Karten, Header)       | `#111111`                   | `#FFFFFF`           |
| Text primär                    | `#F5F5F7`                   | `#0A0A0B`           |
| Text sekundär (Labels, Meta)   | `#8F8F95`                   | `#737378`           |
| Text tertiär (Hints)           | `#6A6A70`                   | `#A8A8AE`           |
| Border subtil                  | `rgba(255,255,255,0.06)`    | `rgba(0,0,0,0.06)`  |
| Border deutlich                | `rgba(255,255,255,0.12)`    | `rgba(0,0,0,0.12)`  |

**Hintergrund bewusst asymmetrisch:** Dark-BG ist echtes Schwarz (#000000) für maximalen OLED-Kontrast und Akku-Effizienz. Cards (#111111) heben sich durch minimale Helligkeit ab. Light-BG bleibt Off-White (#FAFAF8) — weicher als Reinweiß, moderner.

### 2.4 Modus-Strategie

- **Default:** Dark-Mode — immer, unabhängig von OS-Einstellung.
- **Kein OS-Auto-Switch:** `prefers-color-scheme` wird bewusst ignoriert. Dark ist die primäre, optimierte Ansicht der App.
- **Manueller Toggle:** Sonne/Mond-Icon in Sidebar (Desktop) und Einstellungen-Seite (Mobile). Wechselt sofort ohne Reload.
- **Persistenz:** `localStorage['theme']` — 'dark' (Default, gesetzt beim ersten Load) oder 'light'. Auswahl überlebt Page-Reload.
- **Kein Flicker:** Inline-Script im `<head>` (vor React-Hydration) setzt `.dark`-Klasse synchron.

---

## 3. Typografie

### 3.1 Schriftfamilie

- **Sans-Serif (primär):** [Geist Sans](https://vercel.com/font) (von Vercel, Open Source, OFL-Lizenz)
  - Import: `@vercel/fonts` oder CDN `https://cdn.jsdelivr.net/npm/geist@latest/dist/fonts/geist-sans/`
  - Gründe: moderne Geometrie, leicht dynamischer Charakter, exzellente Zahlen-Glyphen, für UI optimiert
- **Monospace (für Zahlen und Codes):** Geist Mono (selbes Paket)
- **Fallback-Stack:** `'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### 3.2 Font-Weights

- **Regular:** 500 (ersetzt den typischen 400-Default)
- **Bold:** 600 (ersetzt den typischen 700-Default)
- **Nie 700 oder höher nutzen** — wirkt gegen Geists Charakter zu schwer.

### 3.3 Typografie-Skala

Basis für `tailwind.config.ts`:

| Rolle                     | Größe | Weight | Line-Height | Letter-Spacing    |
| ------------------------- | ----- | ------ | ----------- | ----------------- |
| Display (Hero-Zahl)       | 48px  | 600    | 1.0         | -0.02em           |
| H1 (Seiten-Titel)         | 28px  | 600    | 1.1         | -0.02em           |
| H2 (Sektion-Titel)        | 20px  | 600    | 1.2         | -0.01em           |
| H3 (Card-Titel)           | 15px  | 600    | 1.3         | 0                 |
| KPI-Wert                  | 26px  | 600    | 1.0         | -0.02em           |
| Body                      | 14px  | 500    | 1.5         | 0                 |
| Label / Caption           | 12px  | 500    | 1.4         | 0                 |
| Eyebrow (Uppercase-Label) | 10px  | 500    | 1.2         | 0.08em (Tracking) |

### 3.4 Zahlen-Regeln

- **Alle numerischen Werte:** `font-variant-numeric: tabular-nums` — globaler Default auf `body`, damit Zahlen überall in Listen/Tabellen fluchten. Kein manuelles `tabular-nums` pro Komponente nötig.
- **Monospace für pace/time/ID-artige Werte:** z. B. `4:39 /km`, `1:52 /100 m` in Geist Mono. Macht sie sofort als „gemessene Werte" lesbar.
- **Einheiten in Sekundär-Farbe und kleiner:** `54,7 km` → „54,7" in primärer Textfarbe, „km" in sekundärer Textfarbe und ca. 50 % der Zahlgröße.

### 3.5 Textformatierungs-Regeln

- **Satz-Case immer.** Nie Title Case, nie ALL CAPS (außer 10px-Eyebrow-Labels mit `letter-spacing: 0.08em`).
- **Kein Mid-sentence Bold** im UI. Bold ist für Überschriften und KPI-Werte reserviert.
- **Deutsch als Standard.** Zahlenformatierung: Dezimal-Komma (`54,7 km` nicht `54.7 km`). Datum: `Sa, 13. Apr.` Format.

---

## 4. Spacing & Layout

### 4.1 Spacing-Skala

Tailwind-Default-Skala (4px-Basis) nutzen:

- `gap-2` = 8px (enge Listen)
- `gap-3` = 12px (Standard-Elemente innerhalb eines Blocks)
- `gap-4` = 16px (Standard Zellen-Abstand)
- `gap-6` = 24px (zwischen Blöcken)
- `gap-8` = 32px (zwischen Sektionen)

### 4.2 Border-Radius

**Richtung: weich, aber nicht kindlich.**

| Rolle                           | Radius            | Variable             |
| ------------------------------- | ----------------- | -------------------- |
| Kleine Elemente (Input, Button) | 8px               | `--radius-sm`        |
| Karten, Surfaces, Modals        | 12px              | `--radius` (Default) |
| Hero-Elemente (große Banner)    | 16px              | `--radius-lg`        |
| Pills (Tags, Chips, Badges)     | 999px (voll rund) | `--radius-full`      |
| Avatare                         | 50 % (voll rund)  | —                    |

**Regel:** Pills/Chips haben immer `radius-full`, egal wie weich der Rest der App ist. Das ist Konvention und macht sie sofort als „Tag" lesbar.

### 4.3 Layout-Grid

- **Mobile:** Single Column, volle Breite mit 16px horizontalem Padding.
- **Tablet (ab 768px):** 2 Spalten für KPI-Reihen.
- **Desktop (ab 1024px):** 4 Spalten für KPI-Reihen, Sidebar 240px breit + Content-Bereich daneben.
- **Maximum-Width der Content-Spalte:** 1200px — wird bei sehr breiten Monitoren mittig zentriert.

### 4.4 Touch-Targets

Gemäß Apple HIG: **mindestens 44×44px** für jedes klickbare Element auf Mobile. Checkbox-Labels und kleine Icons haben unsichtbare Tap-Vergrößerung.

---

## 5. Komponenten-Prinzipien

### 5.1 Karten (Cards)

- Hintergrund: Surface-Farbe (`#1A1A1D` dark / `#FFFFFF` light)
- Border: `0.5px solid <border-subtil>`
- Keine Shadows. Kein Glow. Kein Gradient.
- Padding innen: 20–24px
- Radius: 12px (Standard)

### 5.2 KPI-Darstellung

Nach Design-Sprache „offen & selbstbewusst":

- **Kein Box-Hintergrund** um einzelne Zahlen. Zahlen stehen frei mit vertikalem Abstand zum Eyebrow-Label darüber.
- Grid-Layout (2 oder 4 Spalten je nach Breakpoint).
- Wichtigste Zahl bekommt Akzentfarbe (Sportart oder Status), Rest bleibt in Primär-Text.

### 5.3 Sportart-Indikator

Wenn Aktivitäten oder Kategorien angezeigt werden:

- **Listen-Einträge:** 3px breiter, 36px hoher vertikaler Strich links in Sportart-Farbe + dezentes farbiges Akzent-Element rechts (Pace, Zone).
- **Kacheln/Cards:** Kleiner runder Dot (8px) oder dünner Strich oben. Niemals die gesamte Karte in der Sportart-Farbe füllen — zu laut.
- **Charts:** Farbige Balken/Punkte direkt in der Sportart-Farbe. Legende immer sichtbar.

### 5.4 Filter-Chips

Aktiver Sportart-Filter zeigt Sportart-Identität durch Farbe:
- **Hintergrund:** Sportart-Farbe @ 13% Opacity (`${farbe}22` in Hex)
- **Border:** Sportart-Farbe @ 100%
- **Text:** Sportart-Farbe @ 100%
- Zeitraum-Filter und „Alle": Primary-Purple (gefüllt, Contrasting Foreground)

**Regel:** Nie die gesamte Fläche füllen. 13%/22%-Opacity hält die App ruhig während der Filter trotzdem sofort erkennbar ist.

### 5.5 Wort-Marke (Header)

**Aktuell (Variante B):** `athlete.coach` als Textlogo, der Punkt in Purple `#8E6FE0` hervorgehoben.

- Font: Geist Sans, 16px, Weight 600
- Punkt-Farbe im Dark-Mode: `#8E6FE0`, im Light-Mode: `#5B3DB8`
- **Logo-Slot links vom Text bereits im Header-Komponenten-Markup vorgesehen**, aber aktuell leer (kein Platzhalter-Kasten sichtbar). Sobald ein echtes Logo existiert, wird es dort eingefügt — ohne dass die Header-Struktur geändert werden muss.

**Empfohlene Logo-Spezifikation (Backlog):**

- Quadratisch, funktioniert auf 24×24px
- Einfarbig oder maximal zwei Farben
- Gut lesbar auf `#141416` und `#FAFAF8`
- Nimmt Purple `#8E6FE0` als Akzent auf (Kontinuität zum Wort-Marken-Punkt)

### 5.6 Navigation

**Hybrid: Sidebar auf Desktop, Bottom-Nav auf Mobile.**

- **Breakpoint-Switch:** Ab 768px Viewport-Breite → Sidebar, darunter → Bottom-Nav.
- Eine gemeinsame `<Navigation>`-Komponente rendert je nach Breakpoint anders.

**Sidebar (Desktop ≥ 768px):**

- Breite: 240px
- Position: links, sticky, scrollt nicht mit Content
- Inhalt: Wort-Marke oben, Navigations-Items, User-Avatar unten
- Aktiver Item-Zustand: leicht gefüllter Hintergrund in Purple (rgba-basiert), Text in Akzent-Purple, Weight 600

**Bottom-Nav (Mobile < 768px):**

- Position: fixed bottom, volle Breite
- Respektiert iOS Safe Area (`env(safe-area-inset-bottom)`)
- Max. 5 Items mit Icon + Label
- Aktiver Item-Zustand: Icon + Label in Purple, inaktiv in Sekundär-Farbe

**Haupt-Navigationspunkte (Phase 1):**

1. Home / Dashboard
2. Training / Aktivitäten
3. Events / Wettkämpfe
4. Coach (Chat)
5. Mehr / Einstellungen

### 5.7 Status-Indikatoren

Für „Form" (TSB), „Belastung", Trend-Arrows:

- Textfarbe in Status-Farbe
- Optional ein kleiner Dot (6×6px, `border-radius: 50%`) in Status-Farbe vor dem Text
- Nie Icons mit Emotion (kein 😊/😢) — nur dezente Indikatoren

---

## 6. Animationen & Micro-Interactions

Grundsatz: **weich und schnell.**

- **Hover-States:** 150ms Übergang, Opacity oder leichte Hintergrund-Änderung.
- **Click-Feedback:** `scale(0.98)` auf 100ms, besonders bei Buttons.
- **Page-Transitions:** Keine komplexen Route-Animationen. Ein einfaches Fade (200ms) reicht.
- **Zahlen-Animationen:** Wenn KPI-Werte sich durch Filter ändern, kurzes Count-Up (max 400ms) nur bei großen Zahlen — Pacetime u.ä. nicht animieren (wirkt unruhig).
- **Reduced-Motion respektieren:** `@media (prefers-reduced-motion: reduce)` deaktiviert alle nicht-essenziellen Animationen.

---

## 7. Barrierefreiheit (Basis)

- **Kontrast:** WCAG AA mindestens. Geists dünnere Weights (unter 500) nicht für Body-Text nutzen — Kontrast leidet.
- **Fokus-Zustände:** Sichtbare Fokus-Ringe in Purple (2px outline + 2px offset). Nie via `outline: none` wegoptimieren.
- **Semantisches HTML:** `<button>` für Aktionen, `<a>` für Navigation. `<nav>`, `<main>`, `<aside>` für Layout.
- **Screen-Reader-Labels:** Icons ohne Text bekommen `aria-label` auf Deutsch.
- **Tastatur-Navigation:** Jede Funktion per Keyboard erreichbar. Dialog/Modal-Fokus-Trap über shadcn.

---

## 8. shadcn/ui Theme-Mapping

Wenn Claude Code das shadcn-Theme konfiguriert, diese Werte als `cssVars` in `tailwind.config.ts` / `globals.css` setzen:

```css
@layer base {
  :root {
    --background: 60 11% 98%; /* #FAFAF8 */
    --foreground: 240 6% 4%; /* #0A0A0B */
    --card: 0 0% 100%;
    --card-foreground: 240 6% 4%;
    --primary: 258 54% 48%; /* Purple Light #5B3DB8 */
    --primary-foreground: 0 0% 100%;
    --secondary: 60 8% 94%;
    --muted: 60 8% 94%;
    --muted-foreground: 240 3% 44%;
    --accent: 24 86% 44%; /* Orange Light #D25F0F */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 58% 41%;
    --border: 240 6% 0% / 0.06;
    --input: 240 6% 0% / 0.06;
    --ring: 258 54% 48%;
    --radius: 12px;
  }

  .dark {
    --background: 0 0% 0%; /* #000000 */
    --foreground: 240 7% 97%; /* #F5F5F7 */
    --card: 0 0% 7%; /* #111111 */
    --card-foreground: 240 7% 97%;
    --primary: 258 62% 66%; /* Purple Dark #8E6FE0 */
    --primary-foreground: 240 5% 9%;
    --secondary: 240 6% 15%;
    --muted: 240 6% 15%;
    --muted-foreground: 240 4% 58%;
    --accent: 24 100% 55%; /* Orange Dark #FF7A1A */
    --accent-foreground: 240 5% 9%;
    --destructive: 0 71% 59%;
    --border: 0 0% 100% / 0.06;
    --input: 0 0% 100% / 0.06;
    --ring: 258 62% 66%;
  }
}
```

**Zusätzliche Custom-Variablen für Sportart-Farben** (werden nicht von shadcn-Standard abgedeckt):

```css
@layer base {
  :root {
    --sport-run: #5b3db8;
    --sport-swim: #2a47a0;
    --sport-bike: #d25f0f;
    --sport-other: #8a3721;
    --status-fresh: #0f6e56;
    --status-caution: #a37300;
    --status-overload: #a32d2d;
  }

  .dark {
    --sport-run: #8e6fe0;
    --sport-swim: #3359c4;
    --sport-bike: #ff7a1a;
    --sport-other: #b54a2e;
    --status-fresh: #66d9a8;
    --status-caution: #f5b800;
    --status-overload: #e24b4a;
  }
}
```

Als Tailwind-Utilities nutzbar machen in `tailwind.config.ts`:

```ts
extend: {
  colors: {
    sport: {
      run: 'var(--sport-run)',
      swim: 'var(--sport-swim)',
      bike: 'var(--sport-bike)',
      other: 'var(--sport-other)',
    },
    status: {
      fresh: 'var(--status-fresh)',
      caution: 'var(--status-caution)',
      overload: 'var(--status-overload)',
    },
  },
}
```

Nutzung dann z. B. `text-sport-run`, `bg-sport-bike/20`, `border-status-fresh`.

---

## 9. Was nicht in dieser Datei steht (bewusst)

- **Copy-Texte, UX-Microcopy:** Werden bei Komponenten-Bau geschrieben, nicht vorab definiert.
- **Icon-Set:** Lucide-Icons (via `lucide-react`) als Default. Konsistent, gut gewartet, passt zum Geist-Vibe. Wird erst bei Bedarf dokumentiert.
- **Konkrete Komponenten-Specs (Button-Varianten, Form-Feld-Zustände):** shadcn/ui-Defaults nutzen, Abweichungen erst dokumentieren, wenn nötig.
- **Logo-Design:** Backlog-Thema für nach Phase 1.

---

## 10. Änderungsregel

**Diese Datei ist stabil, aber nicht heilig.**

- Kleine Anpassungen (Farbnuancen, Radius-Feintuning): direkt hier ändern, Commit-Message `design: adjust <was>`.
- Große Anpassungen (Design-Sprache wechseln, neue Farb-Kategorie einführen): vorher Design-Session im Chat, Begründung in `status.md` unter „Letzte Änderungen" vermerken.
- **Jede Änderung hier ändert die ganze App.** Claude Code muss in dem Fall den Theme-File neu rendern und alle Komponenten gegen das neue Theme testen.

---

**Ende design.md**
