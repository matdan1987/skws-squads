# SKWS – Skywalkers · Squad-Meldung

Öffentliche Seite für die Last-War-Allianz SKWS: Mitglieder wählen ihren Namen und tragen T1 bis T3 (Pflicht) sowie optional T4 mit Truppentyp und Kampfkraft ein. Optional E-Mail für eine wöchentliche Erinnerung.

- Seite: https://matdan1987.github.io/skws-squads/
- Daten: Supabase-Projekt `skws-squads` (Zugriff nur über die Funktionen `get_init`, `save_entry`, `unsubscribe`; E-Mail-Adressen sind öffentlich nicht lesbar)
- 9 Sprachen: DE, EN, FR, ES, PT, IT, TR, RU, PL

## Aufbau

- `index.html` + `css/index.css` + `js/index-texte.js` (Übersetzungen, Konstanten) + `js/index.js` – Spielerseite
- `js/index-funk-texte.js` + `js/index-funk.js` – Funk auf der Spielerseite: Anmeldung mit PIN, Shoutboxen (Alle / Mentoren / R4-R5), Nachrichten mit Bestätigung
- `admin.html` + `css/admin.css` + `js/admin-1-core.js` … `js/admin-9-start.js` – Admin-Bereich, in dieser Reihenfolge geladen (gemeinsame globale Funktionen)
- `img/` – Allianz-Emblem und Logo

## Android-App

`android/` enthält eine schlanke App (WebView) für diese Seite inkl. Admin-Bereich, mit Speichern von CSV-Exporten nach `Downloads/SKWS`, Speichern von Plan-Bildern nach `Bilder/SKWS` (ab App 1.2), Bildauswahl für den Avatar-Upload (ab App 1.3), Handy-Erinnerung an offene Event-Anmeldungen kurz vor Anmeldeschluss (ab App 1.4) und Kopieren in die Zwischenablage.
Release-Build: `SKWS_KEYSTORE=… SKWS_KEYSTORE_PASSWORD=… gradle assembleRelease` im Ordner `android/` (Keystore liegt nicht im Repo).
Download: https://matdan1987.github.io/skws-squads/SKWS-Squads.apk
