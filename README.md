# FiveCheck

FiveCheck analysiert FiveM/CFX‑Server auf mögliche Fake‑Spieler/Bots.

Funktionsweise
Es erfasst Snapshots der Spielerliste und wendet Heuristiken an (Sequence Match, Ping Cluster, Name Pattern, Session Spike, Historical Fingerprint), daraus werden Bots‑Schätzung und Confidence berechnet.

Nutzung
Servername, CFX‑Join‑Link, IP oder Server‑ID einfügen, Scan starten, Indikatoren prüfen und Report vorbereiten.

Datenschutz
Keine Identifikatoren gespeichert; Snapshots nur kurz im Speicher; Endpoints werden ausgeblendet.

## Features
- Heuristik‑basierte Bewertung mit verständlichen Labels und Details
- Lokalisierung (Deutsch/Englisch) für UI‑Texte und Regelbeschreibungen
- Fortschrittsanzeige (Scan) und Ergebnis‑Gauge
- „Report vorbereiten“ kopiert Text und öffnet das Support‑Formular

## Voraussetzungen
- Node.js >= 18 (empfohlen: 18.17+)
- npm >= 9

## Installation
```bash
npm install
```

## Entwicklung starten
- Standard: `npm run dev` und im Browser `http://localhost:3000/` öffnen
- Windows‑Shortcut: Doppelklick auf `Run-FiveCheck.bat` (startet den Dev‑Server und öffnet automatisch den Browser)

```bash
npm run dev
# URL: http://localhost:3000/
```

## Produktion
```bash
npm run build
npm run start
```
`npm run start` startet den optimierten Produktionsserver. Stelle sicher, dass deine Hosting‑Umgebung Port und Firewall korrekt konfiguriert.

## Benutzung
- Sprache umschalten: Rechts oben zwischen Deutsch/Englisch wechseln
- Scan ausführen: Startet die Analyse und aktualisiert Fortschritt sowie Gauge
- Ergebnisse: Heuristik‑Regeln werden mit lokalisierten Labels/Details angezeigt
- Report vorbereiten: Kopiert den Report in die Zwischenablage und öffnet das Support‑Formular (aktuell `hc/en-us/requests/new`).
  - Hinweis: Eine dedizierte `hc/de/...`‑Variante für dieses Formular ist derzeit nicht verfügbar; Deutsch fällt auf `en-us` zurück.

## Tech‑Stack
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion, clsx

## Projektstruktur (Auszug)
```
src/
  app/
    layout.tsx        # App‑Layout, I18nProvider‑Mount
    page.tsx          # Hauptseite mit Scan, Gauge, Report‑Button
    globals.css       # Basis‑Styles
  components/
    Gauge.tsx         # Kreis‑Anzeige für Heuristik‑Score
    ScanProgress.tsx  # Fortschritt/Status des Scans
    Tooltip.tsx       # Tooltip‑Komponente
  lib/
    i18n.tsx          # I18n‑Provider, deterministische SSR‑Initialisierung
    heuristics.ts     # Heuristik‑Regeln und Aggregation
    types.ts          # Typdefinitionen (ScanResponse, HeuristicResult, ...)
```

## I18n Hinweise
- Die App initialisiert SSR‑seitig deterministisch mit `en` und lädt die gespeicherte Locale aus `localStorage` erst nach Mount. Dadurch werden Hydration‑Mismatches vermieden.
- Regeltexte (Labels/Details) sind lokalisiert; Platzhalter werden über einen Formatter gefüllt.

## Troubleshooting
- Port belegt: Wenn `3000` bereits verwendet wird, starte lokal mit anderem Port:
  ```bash
  npx next dev -p 3001
  ```
  oder passe das `dev`‑Script in `package.json` an.
- Browser öffnet nicht automatisch: Rufe direkt `http://localhost:3000/` auf und prüfe, ob der Dev‑Server läuft.
- Popup‑Blocker: Die Navigation des Report‑Buttons erfolgt als normale Link‑Navigation, daher keine Blocker.

## Mitwirken
- Issues und Pull Requests sind willkommen. Bitte halte dich an den bestehenden Code‑Stil und konzentriere Änderungen auf klar umrissene Aufgaben.

## Lizenz
- Open to use
