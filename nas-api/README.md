# Kochwerk NAS-API 2

Die API bleibt mit Kochwerk 0.10.14 abwärtskompatibel und ergänzt für
Kochwerk 0.10.15 die getrennte Speicherung der Rezeptbilder.

## Datenstruktur

- `kochwerk.json`: nur Rezeptdaten und Bild-IDs
- `bilder/<sha256>.<endung>`: einzelne Bilddateien
- `sicherungen/`: automatische Sicherungen früherer Rezeptstände

Der Bilderordner wird beim ersten Bild-Upload automatisch im konfigurierten
Kochwerk-Datenordner erstellt. Bereits eingebettete Bilder werden durch die
App migriert. Vor der Migration bleibt die bisherige JSON-Datei unverändert.

## Sicherheitsregeln

- `kochwerk-config.php` wird nie in Git eingecheckt oder weitergegeben.
- Alle Status-, Daten- und Bildzugriffe benötigen den Kochwerk-Schlüssel.
- Bildnamen sind SHA-256-Prüfsummen; Uploads mit abweichendem Inhalt werden
  abgelehnt.
- Rezeptdaten und Bilder werden atomar geschrieben.
