# Lexware Office PDF Uploader

Chrome-Erweiterung zum direkten Upload von PDF-Belegen in Lexware Office.

## Features

- PDF-Dateien mit einem Klick zu Lexware Office hochladen
- Mehrere Mandanten/Accounts verwalten
- Duplikat-Erkennung (optional überschreibbar)
- Upload-Historie pro Account

---

## Installation

### Chrome Web Store (Empfohlen)

Die einfachste Methode mit automatischen Updates:

**[Im Chrome Web Store installieren](https://chromewebstore.google.com/detail/lexware-office-pdf-upload/dooicgokdfcfhihndljfnilbkjbcenma)**

---

### Manuelle Installation (Entwicklermodus)

Für Entwickler oder wenn der Web Store nicht verfügbar ist.

#### 1. Repository herunterladen

```bash
git clone https://github.com/sima-rocks/Lexware-Office-PDF-Uploader.git
```

Oder als ZIP herunterladen und entpacken.

#### 2. Chrome Erweiterungen öffnen

Navigiere zu `chrome://extensions/` oder:

Menü (⋮) → Weitere Tools → Erweiterungen

#### 3. Entwicklermodus aktivieren

Schalte den Schalter **"Entwicklermodus"** oben rechts ein.

#### 4. Erweiterung laden

Klicke auf **"Entpackte Erweiterung laden"** und wähle den Ordner aus, in dem sich die `manifest.json` befindet.

#### 5. Fertig

Die Erweiterung erscheint nun in der Toolbar.

> **Hinweis:** Im Entwicklermodus zeigt Chrome beim Start eine Warnung an. Das ist normal. Für eine warnungsfreie Installation nutze den Chrome Web Store.

---

## Einrichtung

### API-Key erstellen

1. Bei [Lexware Office](https://app.lexware.de) anmelden
2. Einstellungen → Öffentliche API → Neuen Key erstellen
3. Key kopieren

### Profil anlegen

1. Extension-Icon klicken
2. Einstellungen öffnen
3. Name und API-Key eingeben
4. Speichern

> **Tipp:** Du kannst mehrere Profile für verschiedene Lexware Office Accounts anlegen.

---

## Verwendung

1. PDF im Browser öffnen (lokale Datei oder URL)
2. Extension-Icon klicken
3. Ziel-Account auswählen
4. Fertig - der Beleg erscheint im Lexware Office Posteingang

---

## Datenschutz

- Keine Datenerhebung durch die Extension
- API-Keys werden lokal im Browser gespeichert
- Kommunikation ausschließlich mit der offiziellen Lexware API (`api.lexware.io`)

---

## Technische Details

| Eigenschaft | Wert |
|-------------|------|
| Manifest | V3 |
| Berechtigungen | `storage`, `activeTab` |
| Host-Permissions | `api.lexware.io`, `file://*/*` |

---

## Support

Bei Fragen oder Problemen: [Issue erstellen](https://github.com/sima-rocks/Lexware-Office-PDF-Uploader/issues)

---

## Lizenz

MIT License - siehe [LICENSE](LICENSE)

## Autor

sima - Arian Mingo
