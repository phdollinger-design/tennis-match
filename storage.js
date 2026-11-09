/**
 * storage.js – das Datenmodul der Trainer-App.
 *
 * Hier liegt alles, was mit dem Speichern zu tun hat. app.js ruft nur die Funktionen
 * unten auf. Die Daten liegen im Browser (localStorage) auf deinem Gerät.
 *
 * Aufbau der gespeicherten Daten (ein einziges JSON-Objekt):
 * {
 *   version: 1,
 *   stunden:         [ { id, datum, gruppe, niveau, ziel, dauer, bloecke, notizen, uebergaben, erstelltAm } ],
 *   erinnerungen:    [ { id, datum, text, erledigt, erstelltAm } ],
 *   saisonplaene:    [ { id, name, datum, variante, gruppe, niveau, dauer, wochen, erstelltAm } ],
 *   spieler:         [ { id, name, niveau, notiz, erstelltAm } ],
 *   testergebnisse:  [ { id, spielerId, testId, phase, datum, wert, erstelltAm } ],
 *   kontoEintraege:  [ { id, datum, art, dauer, betrag, notiz, erstelltAm } ],
 *   uebungen:        null oder [ { id, name, ziel, min, text } ]   // null = Standardübungen aus app.js
 *   einstellungen:   { letzteSicherung, erinnerungAufschieben, kontoSatz, kontoDauer, kontoStart, favoriten, hinweisAus }
 * }
 */

// Unter diesem Namen liegen alle Daten. Ein defekter Stand wird unter SCHLUESSEL + '-defekt' gesichert.
const SCHLUESSEL = 'tennis-trainer-v1';

// Die Listen, die es im Datenmodell gibt
const LISTEN = ['stunden', 'erinnerungen', 'saisonplaene', 'spieler', 'testergebnisse', 'kontoEintraege'];

/** Ein leerer Datenstand – wird benutzt, wenn noch nichts gespeichert ist. */
function leer() {
  const daten = { version: 1, uebungen: null, einstellungen: {} };
  for (const name of LISTEN) daten[name] = [];
  return daten;
}

/** Liest alle Daten aus dem Browser. Ist etwas kaputt, wird es gesichert und ein leerer Stand zurückgegeben. */
function lesen() {
  let roh = null;
  try {
    roh = localStorage.getItem(SCHLUESSEL);
    if (!roh) return leer();
    const daten = JSON.parse(roh);
    const ergebnis = { ...leer(), ...daten, einstellungen: { ...(daten.einstellungen || {}) } };
    for (const name of LISTEN) ergebnis[name] = Array.isArray(daten[name]) ? daten[name] : [];
    ergebnis.uebungen = Array.isArray(daten.uebungen) ? daten.uebungen : null;
    return ergebnis;
  } catch (fehler) {
    console.error('Daten konnten nicht gelesen werden:', fehler);
    try {
      if (roh) localStorage.setItem(SCHLUESSEL + '-defekt', roh);   // Kopie retten, bevor etwas überschrieben wird
    } catch {
      // Speicher voll oder gesperrt: dann ist nichts mehr zu retten
    }
    return leer();
  }
}

/** Schreibt alle Daten in den Browser. Klappt das nicht, wird ein Fehler geworfen. */
function schreiben(daten) {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(daten));
  } catch (fehler) {
    console.error('Speichern fehlgeschlagen:', fehler);
    throw new Error('Konnte nicht speichern. Ist der Browser-Speicher voll oder ist „Privat“ aktiv?');
  }
}

/** Erzeugt eine zufällige, eindeutige ID. */
function neueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------------
// LISTEN (Stunden, Erinnerungen, Saisonpläne, Spieler, Testergebnisse, Konto)
// Alle funktionieren gleich: Eintrag mit id = ändern, ohne id = neu.
// ---------------------------------------------------------------------------

/** Alle Einträge einer Liste, neueste zuerst nach Datum. */
export function listeAlle(name) {
  return lesen()[name]
    .slice()
    .sort((a, b) => (b.datum || '').localeCompare(a.datum || '') ||
      (b.erstelltAm || '').localeCompare(a.erstelltAm || ''));
}

/** Einen Eintrag anhand seiner ID finden. Gibt null zurück, wenn es ihn nicht gibt. */
export function listePerId(name, id) {
  return lesen()[name].find((e) => e.id === id) || null;
}

/** Speichert einen Eintrag in einer Liste (neu oder geändert). Gibt den gespeicherten Eintrag zurück. */
export function listeSpeichern(name, eintrag) {
  const daten = lesen();
  const liste = daten[name];
  if (eintrag.id) {
    const i = liste.findIndex((e) => e.id === eintrag.id);
    if (i === -1) throw new Error('Dieser Eintrag wurde nicht gefunden.');
    liste[i] = { ...liste[i], ...eintrag };
    schreiben(daten);
    return liste[i];
  }
  const neu = { ...eintrag, id: neueId(), erstelltAm: new Date().toISOString() };
  liste.push(neu);
  schreiben(daten);
  return neu;
}

/** Löscht einen Eintrag aus einer Liste. */
export function listeLoeschen(name, id) {
  const daten = lesen();
  daten[name] = daten[name].filter((e) => e.id !== id);
  schreiben(daten);
}

// ---------------------------------------------------------------------------
// ÜBUNGEN
// ---------------------------------------------------------------------------

/** Die eigene Übungsliste. null bedeutet: noch nichts geändert, es gelten die Standardübungen. */
export function uebungenLesen() {
  return lesen().uebungen;
}

/** Speichert die komplette Übungsliste (nach jeder Änderung). */
export function uebungenSpeichern(liste) {
  const daten = lesen();
  daten.uebungen = liste;
  schreiben(daten);
}

/** Verwirft alle eigenen Übungen und nimmt wieder die Standardübungen. */
export function uebungenZuruecksetzen() {
  const daten = lesen();
  daten.uebungen = null;
  schreiben(daten);
}

// ---------------------------------------------------------------------------
// EINSTELLUNGEN
// ---------------------------------------------------------------------------

/** Liest eine Einstellung (z. B. 'letzteSicherung'). Gibt null zurück, wenn es sie nicht gibt. */
export function einstellungLesen(name) {
  const wert = lesen().einstellungen[name];
  return wert === undefined ? null : wert;
}

/** Speichert eine Einstellung. */
export function einstellungSpeichern(name, wert) {
  const daten = lesen();
  daten.einstellungen[name] = wert;
  schreiben(daten);
}

// ---------------------------------------------------------------------------
// SICHERN, WIEDERHERSTELLEN, LÖSCHEN
// ---------------------------------------------------------------------------

/** Alle Daten als Text (JSON), zum Speichern in einer Datei. */
export function exportieren() {
  return JSON.stringify(lesen(), null, 2);
}

/**
 * Ersetzt alle Daten durch den Inhalt einer Sicherungsdatei.
 * Gibt eine Zusammenfassung zurück, z. B. { stunden: 3, spieler: 2 }.
 * Wirft einen Fehler, wenn die Datei nicht zur App passt.
 */
export function importieren(text) {
  let daten;
  try {
    daten = JSON.parse(text);
  } catch {
    throw new Error('Die Datei ist kein gültiges JSON.');
  }
  if (!daten || typeof daten !== 'object' || !Array.isArray(daten.stunden)) {
    throw new Error('Diese Datei passt nicht zur Trainer-App.');
  }
  for (const name of LISTEN) {
    if (daten[name] !== undefined && !Array.isArray(daten[name])) {
      throw new Error(`In der Datei ist „${name}“ fehlerhaft.`);
    }
  }
  const ergebnis = { ...leer(), ...daten, einstellungen: { ...(daten.einstellungen || {}) } };
  for (const name of LISTEN) ergebnis[name] = Array.isArray(daten[name]) ? daten[name] : [];
  ergebnis.uebungen = Array.isArray(daten.uebungen) ? daten.uebungen : null;
  schreiben(ergebnis);

  const zusammenfassung = {};
  for (const name of LISTEN) zusammenfassung[name] = ergebnis[name].length;
  return zusammenfassung;
}

/** Löscht ALLE Daten. Wird nur nach doppelter Bestätigung in der App aufgerufen. */
export function alleLoeschen() {
  localStorage.removeItem(SCHLUESSEL);
}
