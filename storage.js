/**
 * storage.js – das Datenmodul der App.
 *
 * Hier liegt ALLES, was mit dem Speichern zu tun hat. Die restliche App ruft nur
 * die Funktionen unten auf und weiß nicht, dass die Daten im Browser (localStorage)
 * liegen. Dadurch bleibt app.js übersichtlich.
 *
 * Aufbau der gespeicherten Daten (ein einziges JSON-Objekt):
 * {
 *   version: 1,
 *   gegner: [ { id, name, verein, lk, spielstil, staerken, schwaechen, notizen, erstelltAm } ],
 *   matches: [ { id, datum, gegnerId, art, matchplan, status, saetze, sieg,
 *                planAuswertung, funktioniert, nichtFunktioniert, kopf, erstelltAm } ],
 *   belastung: [ { id, datum, typ, minuten, intensitaet, schlaf, erholung, notiz } ],
 *   lk: [ { id, datum, wert, anlass } ],
 *   trainingsstunden: [ { id, datum, gruppe, niveau, ziel, dauer, bloecke } ],
 *   einstellungen: { satz }
 * }
 */

// Unter diesem Namen liegen alle Daten im Browser. "v1" = erste Version des Datenmodells.
const SCHLUESSEL = 'tennis-match-v1';

// Der Satz gegen den Druck, bevor man ihn selbst ändert.
const STANDARD_SATZ = 'Ich muss mich nicht beweisen. Ich spiele meinen Plan.';

/** Ein leerer Datenstand – wird benutzt, wenn noch nichts gespeichert ist. */
function leer() {
  return {
    version: 1,
    gegner: [],
    matches: [],
    belastung: [],        // Körper-Tab: Trainings- und Matchbelastung, Schlaf, Erholung
    lk: [],               // LK-Tab: eingetragene Leistungsklassen mit Datum
    trainingsstunden: [], // Training-Tab: gespeicherte Trainingsstunden
    einstellungen: { satz: STANDARD_SATZ },
  };
}

/** Liest alle Daten aus dem Browser. Ist etwas kaputt, kommt ein leerer Stand zurück. */
function lesen() {
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    if (!roh) return leer();
    const daten = JSON.parse(roh);
    return {
      ...leer(),
      ...daten,
      gegner: Array.isArray(daten.gegner) ? daten.gegner : [],
      matches: Array.isArray(daten.matches) ? daten.matches : [],
      belastung: Array.isArray(daten.belastung) ? daten.belastung : [],
      lk: Array.isArray(daten.lk) ? daten.lk : [],
      trainingsstunden: Array.isArray(daten.trainingsstunden) ? daten.trainingsstunden : [],
      einstellungen: { ...leer().einstellungen, ...(daten.einstellungen || {}) },
    };
  } catch (fehler) {
    console.error('Daten konnten nicht gelesen werden:', fehler);
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

/** Erzeugt eine zufällige, eindeutige ID für Gegner und Matches. */
function neueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------------
// GEGNER
// ---------------------------------------------------------------------------

/** Alle Gegner, alphabetisch sortiert (deutsche Sortierregeln, also auch Umlaute). */
export function alleGegner() {
  return lesen().gegner
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

/** Einen Gegner anhand seiner ID finden. Gibt null zurück, wenn es ihn nicht gibt. */
export function gegnerPerId(id) {
  return lesen().gegner.find((g) => g.id === id) || null;
}

/**
 * Speichert einen Gegner.
 * - Hat der Eintrag eine id, wird der bestehende Gegner geändert.
 * - Ohne id wird ein neuer Gegner angelegt.
 */
export function gegnerSpeichern(eintrag) {
  const daten = lesen();
  if (eintrag.id) {
    const i = daten.gegner.findIndex((g) => g.id === eintrag.id);
    if (i === -1) throw new Error('Dieser Gegner wurde nicht gefunden.');
    daten.gegner[i] = { ...daten.gegner[i], ...eintrag };
    schreiben(daten);
    return daten.gegner[i];
  }
  const neu = { ...eintrag, id: neueId(), erstelltAm: new Date().toISOString() };
  daten.gegner.push(neu);
  schreiben(daten);
  return neu;
}

/** Löscht einen Gegner. Seine Matches bleiben erhalten. */
export function gegnerLoeschen(id) {
  const daten = lesen();
  daten.gegner = daten.gegner.filter((g) => g.id !== id);
  schreiben(daten);
}

// ---------------------------------------------------------------------------
// MATCHES
// ---------------------------------------------------------------------------

/** Alle Matches, neueste zuerst (zuerst nach Datum, bei gleichem Datum nach Anlage). */
export function alleMatches() {
  return lesen().matches
    .slice()
    .sort((a, b) =>
      (b.datum || '').localeCompare(a.datum || '') ||
      (b.erstelltAm || '').localeCompare(a.erstelltAm || ''));
}

/** Alle Matches gegen einen bestimmten Gegner, neueste zuerst. */
export function matchesVon(gegnerId) {
  return alleMatches().filter((m) => m.gegnerId === gegnerId);
}

/** Ein Match anhand seiner ID finden. */
export function matchPerId(id) {
  return lesen().matches.find((m) => m.id === id) || null;
}

/** Speichert ein Match (neu oder geändert, genauso wie bei den Gegnern). */
export function matchSpeichern(eintrag) {
  const daten = lesen();
  if (eintrag.id) {
    const i = daten.matches.findIndex((m) => m.id === eintrag.id);
    if (i === -1) throw new Error('Dieses Match wurde nicht gefunden.');
    daten.matches[i] = { ...daten.matches[i], ...eintrag };
    schreiben(daten);
    return daten.matches[i];
  }
  const neu = { ...eintrag, id: neueId(), erstelltAm: new Date().toISOString() };
  daten.matches.push(neu);
  schreiben(daten);
  return neu;
}

/** Bilanz gegen einen Gegner: wie viele Matches gewonnen und verloren (nur nachbereitete). */
export function bilanz(gegnerId) {
  const nachbereitet = matchesVon(gegnerId).filter((m) => m.status === 'nachbereitet');
  return {
    siege: nachbereitet.filter((m) => m.sieg === true).length,
    niederlagen: nachbereitet.filter((m) => m.sieg === false).length,
  };
}

/** Das letzte Match gegen einen Gegner, aus dem Matchplan-Punkte stammen. */
export function letztesMatchMitPlan(gegnerId) {
  return matchesVon(gegnerId).find((m) =>
    Array.isArray(m.matchplan) && m.matchplan.some((p) => p && p.trim())) || null;
}

/** Das letzte nachbereitete Match gegen einen Gegner (für die Notizen). */
export function letztesNachbereitetes(gegnerId) {
  return matchesVon(gegnerId).find((m) => m.status === 'nachbereitet') || null;
}

// ---------------------------------------------------------------------------
// BELASTUNG, LK, TRAININGSSTUNDEN
// Alle drei Listen funktionieren gleich: Eintrag mit id = ändern, ohne id = neu.
// ---------------------------------------------------------------------------

/** Alle Einträge einer Liste ('belastung', 'lk' oder 'trainingsstunden'), neueste zuerst nach Datum. */
export function listeAlle(name) {
  return lesen()[name]
    .slice()
    .sort((a, b) => (b.datum || '').localeCompare(a.datum || '') ||
      (b.erstelltAm || '').localeCompare(a.erstelltAm || ''));
}

/** Speichert einen Eintrag in einer Liste (neu oder geändert). */
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
// EINSTELLUNGEN
// ---------------------------------------------------------------------------

/** Der Satz gegen den Druck. */
export function satzLesen() {
  return lesen().einstellungen.satz || STANDARD_SATZ;
}

/** Speichert einen neuen Satz gegen den Druck. */
export function satzSpeichern(text) {
  const daten = lesen();
  daten.einstellungen.satz = text;
  schreiben(daten);
}

// ---------------------------------------------------------------------------
// SICHERN, WIEDERHERSTELLEN, LÖSCHEN
// ---------------------------------------------------------------------------

/** Alle Daten als Text (JSON), zum Speichern in einer Datei. */
export function exportieren() {
  return JSON.stringify(lesen(), null, 2);
}

/** Ersetzt alle Daten durch den Inhalt einer Sicherungsdatei. Wirft einen Fehler, wenn die Datei nicht passt. */
export function importieren(text) {
  let daten;
  try {
    daten = JSON.parse(text);
  } catch {
    throw new Error('Die Datei ist kein gültiges JSON.');
  }
  if (!daten || !Array.isArray(daten.gegner) || !Array.isArray(daten.matches)) {
    throw new Error('Diese Datei passt nicht zur Tennis-App.');
  }
  schreiben({
    ...leer(),
    ...daten,
    einstellungen: { ...leer().einstellungen, ...(daten.einstellungen || {}) },
  });
}

/** Löscht ALLE Daten. Wird nur nach doppelter Bestätigung in der App aufgerufen. */
export function alleLoeschen() {
  localStorage.removeItem(SCHLUESSEL);
}
