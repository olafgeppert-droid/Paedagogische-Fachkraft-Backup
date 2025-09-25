# Pädagogische Dokumentation

Eine webbasierte Anwendung zur Dokumentation von Beobachtungen, Maßnahmen und Entwicklungen bei Kindern und Jugendlichen.

## Funktionen

- **Kinder-Verwaltung**: Anlegen, Bearbeiten und Verwalten von Kinderstammdaten
- **Protokollierung**: Erfassen von detaillierten, tagesaktuellen Einträgen
- **Dynamische Ansichten**: Wechsel zwischen kind- und tag-zentrierter Ansicht
- **Leistungsstarke Filterung**: Filtern nach Schuljahr, Schule, Klasse und Freitextsuche
- **Daten-Souveränität**: Vollständiger Export/Import aller Daten als JSON
- **Anpassbarkeit**: Verschiedene Farbschemata und Schriftgrößen
- **Offline-Fähigkeit**: Vollständige Funktionalität ohne Internetverbindung
- **Datenschutz**: Alle Daten werden lokal im Browser gespeichert

## Technologie

- React mit JavaScript (ES6+)
- IndexedDB für die Datenspeicherung
- Responsives Design für Desktop und Mobile
- Pure Client-Side App (kein Server benötigt)

## Installation und Verwendung

1. Repository klonen oder herunterladen
2. Alle Dateien in einen Webserver-Verzeichnis hochladen
3. `index.html` im Browser öffnen

### GitHub Pages

Um die App auf GitHub Pages zu hosten:

1. Repository auf GitHub erstellen
2. Alle Dateien hochladen
3. Das existierende GitHub Actions Workflow `.github/workflows/deploy.yml` wird automatisch die App bauen und auf GitHub Pages deployen, wenn Sie Änderungen in den `main`-Branch pushen.
4. Nach einigen Minuten ist die App unter `https://[username].github.io/[repository-name]` verfügbar.

## Datenstruktur

Die App speichert Daten in vier Kategorien:

1. **Stammdaten der Kinder**: Persönliche Informationen und schulische Zuordnung
2. **Protokolleinträge**: Beobachtungen, Maßnahmen und Bewertungen
3. **Stammdaten der Anwendung**: Schuljahre, Schulen und Klassen
4. **Anwendungseinstellungen**: Darstellungsoptionen und Benutzereinstellungen

## Datensicherheit

- Alle Daten werden ausschließlich lokal im Browser gespeichert
- Keine Datenübertragung an externe Server
- Export- und Import-Funktion zur Datensicherung und -migration

## Browserunterstützung

Die App unterstützt alle modernen Browser mit IndexedDB-Unterstützung:
- Chrome 58+
- Firefox 51+
- Safari 10+
- Edge 16+

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Details finden Sie in der `LICENSE`-Datei.

---

### Projekt-Dateistruktur:

```
pädagogische-dokumentation/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
├── .nojekyll
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── main.jsx
│   ├── app.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Toolbar.jsx
│   │   ├── Navigation.jsx
│   │   ├── MainContent.jsx
│   │   ├── StudentModal.jsx
│   │   ├── EntryModal.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── StatisticsModal.jsx
│   │   ├── HelpModal.jsx
│   │   ├── SearchModal.jsx
│   │   └── Nations.jsx
│   ├── utils/
│   │   └── colors.js         (Farb-Hilfsfunktionen)
│   └── database.js
├── styles/
│   ├── theme-variables.css
│   ├── layout-base.css
│   └── components-3d.css
└── public/                     (Falls statische Assets vorhanden sind)
