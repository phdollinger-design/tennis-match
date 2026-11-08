# Tennis Match – Version 1 („Match“)

Eine kleine App für dein Tennis-Matchmanagement: Vor dem Match einen Plan machen und ruhig werden, nach dem Match ehrlich nachbereiten, und pro Gegner sehen, was du schon notiert hast.

Die App ist eine **Progressive Web App (PWA)**: reines HTML, CSS und JavaScript. Es gibt kein Framework, keinen Build-Schritt und keine externen Bibliotheken. Deine Daten bleiben im Browser auf deinem Gerät.

---

## 1. Die App auf dem MacBook starten

Die App braucht einen kleinen lokalen Webserver. Am einfachsten geht das mit dem Befehl `python3`, der auf jedem Mac vorhanden ist (wenn nicht: siehe Hinweis unten).

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

> **Wichtig zu den Daten:** iPhone-Apps vom Home-Bildschirm haben einen **eigenen Speicher**, getrennt von Safari. Deine Daten vom MacBook oder aus Safari sind dort nicht automatisch da. Nutze dafür **Einstellungen → Daten exportieren** (auf dem alten Gerät) und **Einstellungen → Daten importieren** (auf dem neuen Gerät).

### Änderungen später veröffentlichen
Wenn du etwas an der App änderst, lade die geänderten Dateien auf GitHub hoch (wie in Schritt C), die alten Dateien werden dabei ersetzt. Du musst nichts mehr hochzählen: Die App lädt bei bestehender Verbindung immer die neueste Version. Nach dem Hochladen kann es ein paar Minuten dauern, bis GitHub Pages die neue Version zeigt.

---

## 3. Welche Datei macht was?

| Datei | Aufgabe |
|---|---|
| `index.html` | Das Grundgerüst: Kopfzeile, Tab-Leiste unten, Formular-Fenster, Bestätigungen. |
| `style.css` | Das Aussehen: Farben (oben als Variablen), Abstände, Buttons, Animationen. |
| `app.js` | Die Bedienlogik: Tabs, Formulare, der Ablauf „Vor dem Match“, Atemübung, Einstellungen. |
| `storage.js` | Das Datenmodul: speichert und lädt alle Gegner und Matches im Browser. Nur hier wird gespeichert. |
| `manifest.json` | Die Installationsinfo: Name, Farben und Icons für den Home-Bildschirm. |
| `service-worker.js` | Macht die App offline nutzbar, indem er die Dateien speichert. |
| `icons/icon-192.png` und `icons/icon-512.png` | Das Tennisball-Icon in zwei Größen. |
| `README.md` | Diese Anleitung. |

---

## 4. So benutzt du die App

- **Vor dem Match:** Wähle einen Gegner (oder lege ihn schnell an), siehst seine Infos und deine letzten Notizen. Dann drei Matchplan-Punkte, eine kurze Atemübung und dein Satz gegen den Druck. „Bereit – los geht’s“ speichert das Match als geplant.
- **Nach dem Match:** Offene Matches antippen, Ergebnis in Sätzen eintragen (z. B. 6:4, 3:6, 10:7 mit Häkchen bei Match-Tiebreak), Art wählen, Matchplan bewerten und die drei Fragen beantworten.
- **Gegner:** Kartei mit Suche. Antippen zeigt Bilanz, Angaben, **Tipps für dich** und alle Matches gegen ihn. Die Tipps kommen aus deinen Notizen, deiner Bilanz und deinen letzten Matches. Im Schritt „Plan“ siehst du sie auch.
- **Training (Trainer-Modus):** Gib die Anzahl der Spieler, das Niveau (Anfänger oder Fortgeschritten), das Ziel (Aufschlag, Grundlinie, Netzspiel, Return, Kondition, Mental) und die Dauer ein. Die App erstellt eine Stunde mit Aufwärmen, Übungen, Spiel und Ausklang. Gefällt sie dir nicht, drückst du **„Neue Stunde (andere Übungen)“**. Mit „Stunde speichern“ bleibt sie erhalten.
- **Körper (Belastung):** Trage nach jedem Training oder Match Dauer, Intensität, Schlaf und Erholung ein. Die App zeigt deine Belastung der letzten 7 Tage und warnt bei viel Belastung oder wenig Schlaf.
- **LK:** Trage deine Leistungsklasse mit Datum ein. Der Verlauf zeigt die LK-Einträge zusammen mit deinen Matches. Die LK rechnet die App nicht selbst aus, sie kommt vom Verband.
- **Zahnrad oben rechts:** Satz gegen den Druck ändern, Daten exportieren und importieren, alle Daten löschen.

**Tipp:** Exportiere ab und zu eine Sicherung. So geht nichts verloren, auch wenn der Browser seine Daten löscht.

**Sicherungs-Erinnerung:** Ist deine letzte Sicherung 14 Tage oder älter, zeigt die App oben eine Erinnerung. Mit „In 3 Tagen“ schiebst du sie auf. Die Erinnerung erscheint nur, wenn du die App öffnest. Sie ist keine Benachrichtigung auf dem Handy.

---

## 5. Ideen für später

- **Mehr Übungen:** Die Übungsliste steht in `app.js` (Abschnitt „Trainer-Modus“). Dort kannst du neue Übungen mit einem Namen, einem Niveau (0 bis 2) und einem Text eintragen.
- **Tipps verfeinern:** Die Regeln für die Tipps stehen in der Funktion `tippsFuer` in `app.js`.
- **Eine echte KI-Auswertung** wäre möglich, braucht aber einen API-Schlüssel und Internet. Das ist bewusst nicht in dieser Version.
