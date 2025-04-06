## TODO: Cleanup Widget State Management

Ziel: Entfernen der allgemeinen `toggle/setState/getState`-Logik aus `Widget`, da sie nur noch für `darkMode` und ggf. `panel` gebraucht wird.

---

### ✅ Allgemeine Strategie

- Entferne `toggle`, `getState`, `setState` aus der `Widget`-Basisklasse.
- Falls `panel` weiterhin toggelbar bleiben soll, eigene Methoden direkt im Plugin implementieren.
- Behalte `enabled`-Status nur für `darkMode` und `panel` in `settings.options`.


### 📝 Plugin-spezifisch

- Entferne `canChangeState` und `defaultState` aus allen Plugins außer:
  - `darkMode`
  - `panel`
- Falls `enabled` geprüft wird (z. B. in `run()`), dort auch bereinigen.


### 📊 Settings/Options

- Reduziere gespeicherte Settings auf:
  ```js
  options = {
    darkMode: { enabled: true },
    panel: { enabled: false },
    version: "5.0.0"
  }
  ```
- Passe das Migrationsskript in `settings.js` an:
  - Entferne Altlasten wie `score`, `yourProgress`
  - Setze explizit `enabled` nur für `darkMode` und `panel`


### 📁 UI (Menü)

- Nur für `darkMode` und `panel` Checkboxes anzeigen
- Einfache Hilfsfunktion einführen:
  ```js
  const togglablePlugins = ["darkMode", "panel"];
  const isTogglable = (key) => togglablePlugins.includes(key);
  ```
- Menü-Komponenten entsprechend anpassen


### 🔢 Registry / App-Init

- Plugin-Initialisierung vereinfachen:
  - Keine Prüfung mehr auf `enabled` außer für `darkMode` und `panel`
  - Alle anderen Plugins einfach registrieren


### ✨ Nice to have

- JSDoc-Kommentare in `Widget`, `darkMode`, `panel` aktualisieren
- Kommentar im `Widget`-Code oder Plugin-Doku: Nur `darkMode` und `panel` sind toggelbar
- Review: Gibt es noch tote `enabled`-Checks z. B. in alten `if (...) plugin.enabled && ...`

---

Sobald das durch ist, ist die gesamte State-Verwaltung deutlich sauberer und leichter zu überblicken.

