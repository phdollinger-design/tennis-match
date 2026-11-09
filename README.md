# Tennis Match – Trainer-App

Eine kleine App für deine Trainingsarbeit: Trainingsstunden erstellen und anpassen, einen Saisonplan über viele Wochen führen, eigene Übungen pflegen und Erinnerungen setzen. Notiere, wer deine Stunde übernommen hat.

Die App ist eine **Progressive Web App (PWA)**: reines HTML, CSS und JavaScript. Es gibt kein Framework, keinen Build-Schritt und keine externen Bibliotheken. Deine Daten bleiben im Browser auf deinem Gerät.

---

## 1. Die App auf dem MacBook starten

1. Öffne das **Terminal** (Cmd + Leertaste, dann „Terminal“ eintippen).
2. Wechsle in den Projektordner:

```bash
cd ~/Desktop/Tennis-App
```

3. Starte den Server:

```bash
python3 -m http.server 8000
```

4. Öffne im Browser (Safari oder Chrome) die Adresse: **http://localhost:8000**
5. Zum Beenden: im Terminal `Ctrl + C` drücken.

> **Hinweis:** Falls `python3` nicht gefunden wird, installiere die Entwickler-Werkzeuge mit `xcode-select --install` (einmalig, dauert etwas) und versuche den Befehl erneut.

---

## 2. Die App kostenlos online stellen (GitHub Pages)

So kannst du die App auf dem iPhone öffnen und auf den Home-Bildschirm legen. Dafür brauchst du einen kostenlosen GitHub-Account.

### Schritt A: GitHub-Account anlegen
1. Gehe auf **https://github.com** und klicke auf „Sign up“.
2. Folge den Schritten (E-Mail, Passwort, Benutzername).

### Schritt B: Neues Repository anlegen
1. Klicke oben rechts auf das **+** und dann auf **New repository**.
2. Name: z. B. `tennis-match`.
3. Wähle **Public** (bei GitHub Pages in der kostenlosen Version nötig).
4. Klicke auf **Create repository**.

### Schritt C: Dateien hochladen
1. Klicke im neuen Repository auf **uploading an existing file**.
2. Ziehe **alle Dateien und den Ordner `icons`** aus `Tennis-App` in das Fenster.
   - Wichtig: Der Ordner `icons` muss mit hochgeladen werden.
   - Die Datei `README.md` darf mit hoch, schadet nicht.
3. Klicke unten auf **Commit changes**.

### Schritt D: GitHub Pages einschalten
1. Klicke im Repository auf **Settings** (Zahnrad-Symbol oben).
2. Links auf **Pages**.
3. Bei „Source“ auswählen: **Deploy from a branch**.
4. Bei „Branch“: **main** und **/ (root)** wählen, dann **Save**.
5. Nach ein bis zwei Minuten erscheint oben die Adresse, etwa:
   `https://DEIN-NAME.github.io/tennis-match/`

### Schritt E: Auf dem iPhone installieren
1. Öffne die Adresse in **Safari** auf dem iPhone (nicht in Chrome: nur Safari kann Web-Apps installieren).
2. Tippe unten auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben).
3. Wähle **„Zum Home-Bildschirm“** und dann **„Hinzufügen“**.
4. Das Tennisball-Icon erscheint auf dem Home-Bildschirm. Tippe darauf: Die App startet im Vollbild, ohne Browserleiste.

> **Wichtig zu den Daten:** iPhone-Apps vom Home-Bildschirm haben einen **eigenen Speicher**, getrennt von Safari. Deine Daten vom MacBook oder aus Safari sind dort nicht automatisch da. Nutze dafür **Einstellungen (Zahnrad) → Daten exportieren** auf dem alten Gerät und **Einstellungen → Daten importieren** auf dem neuen Gerät.

### Änderungen später veröffentlichen
Wenn du etwas an der App änderst, lade die geänderten Dateien auf GitHub hoch (wie in Schritt C), die alten Dateien werden dabei ersetzt. Die App lädt bei bestehender Verbindung immer die neueste Version. Nach dem Hochladen kann es ein paar Minuten dauern, bis GitHub Pages die neue Version zeigt.

---

## 3. Welche Datei macht was?

| Datei | Aufgabe |
|---|---|
| `index.html` | Das Grundgerüst: Kopfzeile, Tab-Leiste unten, Formular-Fenster, Bestätigungen. |
| `style.css` | Das Aussehen: Farben (oben als Variablen), Abstände, Buttons. |
| `app.js` | Die Bedienlogik: die drei Tabs, Übungsliste, Stunden-Generator, Saisonpläne. |
| `storage.js` | Das Datenmodul: speichert und lädt alles im Browser. Nur hier wird gespeichert. |
| `manifest.json` | Die Installationsinfo: Name, Farben und Icons für den Home-Bildschirm. |
| `service-worker.js` | Macht die App offline nutzbar, indem er die Dateien speichert. |
| `icons/icon-192.png` und `icons/icon-512.png` | Das Tennisball-Icon in zwei Größen. |
| `README.md` | Diese Anleitung. |

---

## 4. So benutzt du die App

Die App hat drei Tabs unten:

- **Stunden:** Gib Anzahl der Spieler, Niveau (Anfänger oder Fortgeschritten), Ziel (Aufschlag, Grundlinie, Netzspiel, Return, Kondition, Mental) und Dauer ein. Dann erstellt die App eine Stunde mit Aufwärmen, Übungen, Spiel und Ausklang.
  - **Neue Stunde (andere Übungen):** Gefällt dir die Stunde nicht, bekommst du andere Übungen.
  - **Bearbeiten:** Du kannst Titel, Minuten und Text jedes Blocks ändern, eine Übung tauschen, Blöcke entfernen oder hinzufügen.
  - **Übergabe:** Trag ein, wer deine Stunde übernommen hat (Name, Datum, Notiz). Das steht dann auch in der Liste.
  - **Gespeicherte Stunden:** Antippen öffnet die Stunde zum Ändern oder Löschen.
  - **Erinnerungen:** Trag ein Datum und einen Text ein (z. B. „Bälle bestellen“). Fällige Erinnerungen stehen oben im Tab.
- **Saison:** Erstelle einen Saisonplan mit 8, 12, 16 oder 20 Wochen. Wähle eine Variante (z. B. Ausgewogen, Turnierfokus, Aufschlag-Projekt, Kondition-Schwerpunkt, Grundlagen für Anfänger). Jede 4. Woche ist eine leichte Woche.
  - **Bearbeiten:** Datum, Phase, Ziel, Dauer, Notiz und „erledigt“ jeder Woche ändern.
  - **Als Stunde:** Macht aus einer Woche eine Trainingsstunde, die du vor dem Speichern anpassen kannst.
  - **Woche hinzufügen / löschen**, **Plan bearbeiten**, **Saisonplan löschen**.
- **Übungen:** Alle Übungen nach Ziel. Antippen ändert eine Übung, „+ Neue Übung“ legt eine an. Mit „Standardübungen wiederherstellen“ kommt die ursprüngliche Liste zurück (eigene Übungen gehen dabei verloren).

**Tipp:** Exportiere ab und zu eine Sicherung (Zahnrad oben rechts). So geht nichts verloren, auch wenn der Browser seine Daten löscht.

**Sicherungs-Erinnerung:** Ist deine letzte Sicherung 14 Tage oder älter, zeigt die App oben eine Erinnerung. Mit „In 3 Tagen“ schiebst du sie auf. Die Erinnerung erscheint nur, wenn du die App öffnest. Sie ist keine Benachrichtigung auf dem Handy.

---

## 5. Ideen für später

- **Mehr Übungen:** Am einfachsten im Tab „Übungen“ hinzufügen. Die Standardübungen stehen oben in `app.js` (Liste `STANDARD_UEBUNGEN_ROH`).
- **Saison-Varianten:** Die Varianten stehen in `app.js` (Liste `SAISON_VARIANTEN`).
- **Datenschutz:** Alles bleibt auf deinem Gerät. Es gibt keine Anmeldung und keinen Server.
