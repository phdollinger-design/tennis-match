/**
 * app.js – die Bedienlogik der Trainer-App.
 *
 * Aufbau dieser Datei:
 *  1. Feste Werte (Ziele, Niveaus, Standardübungen, Saison-Varianten)
 *  2. Zustand und kleine Helfer
 *  3. Übungen und Trainingsstunden erstellen
 *  4. Tab „Stunden“ (Erstellen, gespeicherte Stunden, Erinnerungen, Übergaben)
 *  5. Tab „Saison“ (Saisonpläne, Wochen bearbeiten)
 *  6. Tab „Übungen“ (alle Übungen ansehen, ändern, ergänzen)
 *  7. Einstellungen (Sicherung, Import, Löschen) und Start
 *
 * Alle Daten holt und speichert diese Datei über storage.js (als „Daten“ importiert).
 */

import * as Daten from './storage.js';

// ==========================================================================
// 1. FESTE WERTE
// ==========================================================================

const ZIELE = ['Aufschlag', 'Grundlinie', 'Netzspiel', 'Return', 'Kondition', 'Mental'];
const NIVEAUE = ['Anfänger', 'Fortgeschritten'];
const DAUERN = [60, 90, 120];
const GRUPPEN_WOCHEN = [8, 12, 16, 20];

// Das Spiel am Ende der Stunde, je Niveau (0 = Anfänger, 1 = Fortgeschritten)
const SPIELE = [
  'Punktespiel auf halbem Feld, ein Ballwechsel bis 3 Punkte.',
  'Kurzes Satzspiel bis 4 Spiele, mit einer Vorgabe für jeden Punkt.',
];

const TAB_TITEL = { stunden: 'Trainingsstunden', saison: 'Saisonplan', uebungen: 'Übungen' };

/**
 * Die Standardübungen. Jede Zeile: [Ziel, min, Name, Beschreibung].
 * min = 0: passt für Anfänger und Fortgeschritten. min = 1: nur für Fortgeschritten.
 * Die Liste kann in der App geändert werden (Tab „Übungen“).
 */
const STANDARD_UEBUNGEN_ROH = [
  ['Aufschlag', 0, 'Ziele treffen', 'Mit Körbchen oder Kreide Zielfelder markieren. 10 Aufschläge, Treffer zählen.'],
  ['Aufschlag', 0, 'Bewegung im Aufschlag', 'Ballwurf, Schwung, Treffpunkt. Erst langsam, dann Tempo steigern.'],
  ['Aufschlag', 0, 'Stand und Ballwurf', 'Ohne Schläger: Ballwurf üben, bis der Ball immer an derselben Stelle oben ist.'],
  ['Aufschlag', 0, 'Aufschlag-Rhythmus', 'Ballwurf, kurze Pause, Schlag. Immer gleich, 20 Aufschläge in Serie.'],
  ['Aufschlag', 1, 'Zweiter Aufschlag', 'Nur zweite Aufschläge. Ziel: 8 von 10 ins Feld.'],
  ['Aufschlag', 1, 'Aufschlag unter Druck', 'Satzball simulieren: 3 von 4 Aufschlägen müssen ins Feld.'],
  ['Aufschlag', 1, 'Aufschlag mit Ziel', 'Drei Zielzonen auf dem Feld. Jeder Treffer in eine Zone zählt einen Punkt.'],
  ['Aufschlag', 1, 'Aufschlag-Serie', 'Fünf Aufschläge in dieselbe Ecke, dann wechseln. Ziel: Trefferquote halten.'],
  ['Aufschlag', 1, 'Kick- und Slice-Aufschlag', 'Abwechselnd Slice und Kick. Ziel: beide ins Feld.'],

  ['Grundlinie', 0, 'Cross-Spiel', 'Cross-Bälle mit Partner, erst nur Vorhand, dann nur Rückhand.'],
  ['Grundlinie', 0, 'Drei-Zonen-Spiel', 'Ziele in drei Zonen: tief, Mitte, kurz. Treffer in der Zone zählt einen Punkt.'],
  ['Grundlinie', 0, 'Gleichmäßig spielen', 'Ballwechsel an der Grundlinie, Ziel: 20 Schläge ohne Fehler.'],
  ['Grundlinie', 0, 'Vorhand-Rückhand-Wechsel', 'Trainer wirft Bälle abwechselnd auf Vorhand und Rückhand. Sauber zurück in die Mitte.'],
  ['Grundlinie', 1, 'Richtungswechsel', 'Abwechselnd diagonal und längs spielen, Tempo langsam steigern.'],
  ['Grundlinie', 1, 'Eckenlaufen', 'Trainer spielt in die Ecken, du läufst und kehrst nach jedem Schlag in die Mitte zurück.'],
  ['Grundlinie', 1, 'Tempo-Wechsel', 'Abwechselnd langsamer Ball und harter Ball. Ziel: sauber bleiben bei beiden.'],
  ['Grundlinie', 1, 'Kurz-Lang-Spiel', 'Ein Ball kurz, der nächste lang. Wer den Rhythmus verliert, verliert den Punkt.'],

  ['Netzspiel', 0, 'Volley-Wand', 'Kurze Volleys an die Wand oder zum Partner. 30 Sekunden ohne Fehler zählen.'],
  ['Netzspiel', 0, 'Halbvolley üben', 'Bälle knapp über dem Boden am Netz kontrolliert zurückspielen.'],
  ['Netzspiel', 0, 'Schritt ans Netz', 'Nach jedem Schlag einen Schritt nach vorne, dann Volley aus der Mitte.'],
  ['Netzspiel', 1, 'Angriff nach tiefem Ball', 'Erst Grundlinie, dann ans Netz. Angriff nach jedem tiefen Ball.'],
  ['Netzspiel', 1, 'Zwei gegen einen am Netz', 'Zwei am Netz gegen einen auf der Grundlinie. Ziel: Punkt am Netz.'],
  ['Netzspiel', 1, 'Passierball-Abwehr', 'Ein Partner kommt ans Netz, du spielst Passierbälle. Ziel: Kontrolle.'],
  ['Netzspiel', 1, 'Volley-Ecken', 'Volleys in die Ecken, der Partner bewegt sich. Ziel: Feld öffnen.'],

  ['Return', 0, 'Return-Zone', 'Trainer schlägt Aufschläge, du gibst jeden Return ins Feld.'],
  ['Return', 0, 'Return mit Schritt', 'Einen Schritt nach vorne beim Return, Ball früh nehmen.'],
  ['Return', 0, 'Return-Stellung', 'Ausgangsposition üben: leicht vor der Grundlinie, Schläger früh oben.'],
  ['Return', 1, 'Return-Ziele', 'Return gezielt in drei Zonen, damit der Gegner unter Druck kommt.'],
  ['Return', 1, 'Zweiter-Aufschlag-Return', 'Nur Returns gegen zweite Aufschläge. Ziel: aggressiv und trotzdem sicher.'],
  ['Return', 1, 'Return-Winkel', 'Returns diagonal und längs abwechseln. Ziel: 7 von 10 treffen den Zielbereich.'],

  ['Kondition', 0, 'Intervall-Sprints', '30 Sekunden Sprint zu den Linien, 30 Sekunden gehen. 8 Runden.'],
  ['Kondition', 0, 'Koordinationsleiter', 'Schnelle Füße auf Leiter oder Hütchen, 20 Sekunden pro Übung.'],
  ['Kondition', 0, 'Seitwärts-Laufen', 'Seitschritte zwischen zwei Linien, 20 Sekunden hin und her. 5 Runden.'],
  ['Kondition', 1, 'Dauer-Rallye', 'Ballwechsel ohne Fehler so lange wie möglich, dann 30 Sekunden Pause.'],
  ['Kondition', 1, 'Spielnahe Belastung', 'Fünf Ballwechsel voll, dann 40 Sekunden Pause. 6 Serien.'],
  ['Kondition', 1, 'Antritt und Stopp', 'Start aus dem Stand, Sprint, abrupter Stopp. 10 Wiederholungen.'],

  ['Mental', 0, 'Punkt-Routine', 'Vor jedem Aufschlag immer gleich: Ball prellen, atmen, Ziel anschauen.'],
  ['Mental', 0, 'Fehler abhaken', 'Nach jedem Fehler: einmal atmen, kurz benennen, weiterspielen.'],
  ['Mental', 0, 'Positiv bleiben', 'Nach jedem gewonnenen Punkt einen Satz über dich sagen, der dir hilft.'],
  ['Mental', 0, 'Atmen vor dem Ball', 'Vor jedem Punkt einmal tief ausatmen. Im Training 20 Punkte in Folge.'],
  ['Mental', 1, 'Satzball-Spiel', 'Nur Matchsituationen spielen. Jeder Punkt zählt.'],
  ['Mental', 1, 'Druck-Tiebreak', 'Tiebreak spielen, Zuschauer simulieren, keine Ausreden.'],
  ['Mental', 1, 'Gegner-Analyse', 'Zwei spielen gegeneinander, die anderen beobachten und geben nach dem Punkt Feedback.'],
];

// Die Standardübungen als Objekte mit fester ID (std0, std1, ...)
const STANDARD_UEBUNGEN = STANDARD_UEBUNGEN_ROH.map(([ziel, min, name, text], i) =>
  ({ id: `std${i}`, ziel, min, name, text }));

/**
 * Saison-Varianten. Jede Phase bekommt einen Anteil am Gesamtplan und eine Liste von Zielen,
 * die der Reihe nach durchlaufen werden.
 */
const SAISON_VARIANTEN = [
  {
    id: 'ausgewogen', name: 'Ausgewogen',
    text: 'Gleichmäßig Technik, Kondition und Kopf. Gut als Standard.',
    phasen: [
      { name: 'Grundlagen', anteil: 0.3, ziele: ['Grundlinie', 'Kondition'] },
      { name: 'Aufbau', anteil: 0.3, ziele: ['Aufschlag', 'Return', 'Netzspiel'] },
      { name: 'Wettkampf', anteil: 0.25, ziele: ['Mental', 'Netzspiel', 'Grundlinie'] },
      { name: 'Feinschliff', anteil: 0.15, ziele: ['Aufschlag', 'Mental'] },
    ],
  },
  {
    id: 'turnier', name: 'Turnierfokus',
    text: 'Zuerst Kondition und Technik, kurz vor den Spielen viel Wettkampf und Kopf.',
    phasen: [
      { name: 'Grundlagen', anteil: 0.25, ziele: ['Kondition', 'Grundlinie'] },
      { name: 'Aufbau', anteil: 0.25, ziele: ['Aufschlag', 'Return'] },
      { name: 'Wettkampf', anteil: 0.5, ziele: ['Mental', 'Netzspiel', 'Return'] },
    ],
  },
  {
    id: 'aufschlag', name: 'Aufschlag-Projekt',
    text: 'Die Hälfte der Zeit geht in den Aufschlag, der Rest in Beine und Kopf.',
    phasen: [
      { name: 'Grundlagen', anteil: 0.25, ziele: ['Kondition', 'Grundlinie'] },
      { name: 'Aufschlag', anteil: 0.5, ziele: ['Aufschlag', 'Aufschlag', 'Return'] },
      { name: 'Wettkampf', anteil: 0.25, ziele: ['Mental', 'Aufschlag'] },
    ],
  },
  {
    id: 'kondition', name: 'Kondition-Schwerpunkt',
    text: 'Viel Bewegung und Ausdauer, Technik bleibt im Blick.',
    phasen: [
      { name: 'Kondition', anteil: 0.4, ziele: ['Kondition', 'Kondition', 'Grundlinie'] },
      { name: 'Technik', anteil: 0.3, ziele: ['Grundlinie', 'Netzspiel', 'Return'] },
      { name: 'Wettkampf', anteil: 0.3, ziele: ['Mental', 'Aufschlag', 'Kondition'] },
    ],
  },
  {
    id: 'anfaenger', name: 'Grundlagen (Anfänger)',
    text: 'Erst die Grundschläge sicher machen, dann Aufschlag und Netz.',
    phasen: [
      { name: 'Grundschläge', anteil: 0.4, ziele: ['Grundlinie', 'Grundlinie', 'Netzspiel'] },
      { name: 'Aufschlag', anteil: 0.3, ziele: ['Aufschlag', 'Return'] },
      { name: 'Spielen', anteil: 0.3, ziele: ['Mental', 'Netzspiel', 'Kondition'] },
    ],
  },
];

// ==========================================================================
// 2. ZUSTAND UND KLEINE HELFER
// ==========================================================================

let aktiverTab = 'stunden';                 // 'stunden', 'saison' oder 'uebungen'
let sheetZurueckFn = null;                  // Was der Knopf oben links im Formular tut
let toastTimer = null;                      // Timer für die kurze Meldung unten

// Der Trainer-Formular-Zustand (bleibt beim Tab-Wechsel erhalten)
const trainer = { gruppe: 4, niveau: 'Anfänger', ziel: 'Aufschlag', dauer: 60, plan: null };

// Saisonplan: welcher Plan offen ist, ob das Formular für einen neuen Plan offen ist, und seine Eingaben
let saisonAuswahl = null;
let saisonFormOffen = false;
let saisonForm = null;

// Übungen: aktiver Filter (Ziel oder 'Alle')
let uebungFilter = 'Alle';

/** Kürzel für document.getElementById – spart Tipparbeit. */
function $(id) {
  return document.getElementById(id);
}

/**
 * Baut ein HTML-Element, ohne innerHTML (sicherer, weil nichts als Code interpretiert wird).
 * Beispiel: el('button', { class: 'btn', onclick: fn }, 'Speichern')
 */
function el(tag, eigenschaften = {}, ...kinder) {
  const knoten = document.createElement(tag);
  for (const [name, wert] of Object.entries(eigenschaften)) {
    if (wert === undefined || wert === null || wert === false) continue;
    if (name === 'class') knoten.className = wert;
    else if (name === 'value') knoten.value = wert;
    else if (name === 'checked') knoten.checked = true;
    else if (name.startsWith('on') && typeof wert === 'function') {
      knoten.addEventListener(name.slice(2), wert);          // z. B. onclick -> "click"
    } else knoten.setAttribute(name, wert === true ? '' : wert);
  }
  for (const kind of kinder.flat()) {
    if (kind === undefined || kind === null || kind === false) continue;
    knoten.append(kind instanceof Node ? kind : document.createTextNode(String(kind)));
  }
  return knoten;
}

/** Ein Datum als Text im Format JJJJ-MM-TT (so wie ein Datumsfeld es braucht). */
function isoVon(d) {
  const monat = String(d.getMonth() + 1).padStart(2, '0');
  const tag = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${monat}-${tag}`;
}

/** Heutiges Datum im Format JJJJ-MM-TT. */
function heuteIso() {
  return isoVon(new Date());
}

/** Ein Datum um n Tage verschieben (Eingabe und Ergebnis im Format JJJJ-MM-TT). */
function addTage(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return isoVon(d);
}

/** Der nächste Montag als Datum (für den Start eines Saisonplans). */
function naechsterMontag() {
  const d = new Date();
  let diff = (8 - d.getDay()) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff);
  return isoVon(d);
}

/** Datum von JJJJ-MM-TT nach TT.MM.JJJJ (deutsche Schreibweise). */
function datumDe(iso) {
  if (!iso) return '';
  const [jahr, monat, tag] = iso.split('-');
  return `${tag}.${monat}.${jahr}`;
}

/** Eine tiefe Kopie (damit Änderungen im Formular nicht schon die gespeicherten Daten ändern). */
function kopie(wert) {
  return JSON.parse(JSON.stringify(wert));
}

/** Eine kurze, zufällige ID für Wochen und Übungen. */
function kurzId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Kurze Meldung unten am Bildschirm, verschwindet nach ca. 2 Sekunden. */
function zeigeToast(text) {
  const toast = $('toast');
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
}

/** Führt eine Speicher-Aktion aus. Klappt sie nicht, zeigt die App eine Meldung. */
function versuche(aktion) {
  try {
    aktion();
    return true;
  } catch (fehler) {
    console.error(fehler);
    zeigeToast(fehler.message || 'Da ist etwas schiefgelaufen.');
    return false;
  }
}

/** Ein beschriftetes Feld (Beschriftung oben, Eingabe darunter). */
function feld(beschriftung, eingabe) {
  return el('label', { class: 'feld' }, el('span', { class: 'label' }, beschriftung), eingabe);
}

/** Ein Hinweis-Kasten, z. B. „Noch keine Stunden“. */
function hinweis(text) {
  return el('p', { class: 'hinweis' }, text);
}

/** Eine Zeile mit Beschriftung und Text. */
function infoZeile(beschriftung, text) {
  return el('div', { class: 'zeile' },
    el('span', { class: 'label' }, beschriftung),
    el('p', {}, text));
}

/**
 * Auswahl-Chips: genau einer ist aktiv (grün).
 * optionen: [{ wert, label }], aktuell: der aktive Wert, onWahl: wird mit dem neuen Wert aufgerufen.
 */
function auswahl(optionen, aktuell, onWahl) {
  const knoepfe = [];
  const box = el('div', { class: 'auswahl' });
  for (const option of optionen) {
    const knopf = el('button', {
      type: 'button',
      class: 'chip' + (option.wert === aktuell ? ' aktiv' : ''),
      onclick() {
        knoepfe.forEach((k) => k.classList.remove('aktiv'));
        knopf.classList.add('aktiv');
        onWahl(option.wert);
      },
    }, option.label);
    knoepfe.push(knopf);
    box.append(knopf);
  }
  return box;
}

/** Die eigene Bestätigung in der App (statt des Browser-Dialogs). Gibt true zurück, wenn „Ja“. */
function fragen({ titel, text, ok = 'Ja', gefahr = false }) {
  return new Promise((aufloesen) => {
    $('dialog-titel').textContent = titel;
    $('dialog-text').textContent = text;

    const okKnopf = $('dialog-ok');
    okKnopf.textContent = ok;
    okKnopf.className = gefahr ? 'btn btn-gefahr' : 'btn btn-primaer';

    const schliessen = (antwort) => {
      $('dialog-hintergrund').hidden = true;
      aufloesen(antwort);
    };
    okKnopf.onclick = () => schliessen(true);
    $('dialog-abbrechen').onclick = () => schliessen(false);
    $('dialog-hintergrund').hidden = false;
  });
}

/** Öffnet das Formular-Fenster von unten. zurueck: was der Zurück-Knopf tut (oder null = schließen). */
function oeffneSheet(titel, inhalt, zurueck = null) {
  $('sheet-titel').textContent = titel;
  $('sheet-inhalt').replaceChildren(inhalt);
  $('sheet-inhalt').scrollTop = 0;
  sheetZurueckFn = zurueck;
  $('sheet-zurueck').textContent = zurueck ? '← Zurück' : 'Schließen';
  $('sheet-hintergrund').hidden = false;
}

/** Schließt das Formular-Fenster. */
function schliesseSheet() {
  $('sheet-hintergrund').hidden = true;
  $('sheet-inhalt').replaceChildren();
  sheetZurueckFn = null;
}

// ==========================================================================
// 3. ÜBUNGEN UND TRAININGSSTUNDEN ERSTELLEN
// ==========================================================================

/** Alle aktiven Übungen: die eigene Liste, oder – wenn nichts geändert wurde – die Standardliste. */
function uebungenAktiv() {
  return Daten.uebungenLesen() || STANDARD_UEBUNGEN;
}

/** Übungen zu einem Ziel, die für das Niveau passen (Niveau als Zahl: 0 oder 1). */
function passendeUebungen(ziel, niveauNummer) {
  return uebungenAktiv().filter((u) => u.ziel === ziel && u.min <= niveauNummer);
}

/** Mischt eine Liste zufällig (Fisher-Yates), damit jede neue Stunde anders ist. */
function mischen(liste) {
  const kopieListe = liste.slice();
  for (let i = kopieListe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopieListe[i], kopieListe[j]] = [kopieListe[j], kopieListe[i]];
  }
  return kopieListe;
}

/** Hinweis zur Gruppengröße. */
function gruppenHinweis(n) {
  if (n <= 1) return 'Einzeltraining: Übungen mit Ballmaschine oder Balleimer, ohne Gegner.';
  if (n <= 4) return `Kleine Gruppe (${n} Personen): Alle üben gleichzeitig, nach jeder Übung die Partner wechseln.`;
  return `Große Gruppe (${n} Personen): Bildet ${Math.ceil(n / 2)} Stationen zu zweit und wechselt nach jeder Übung.`;
}

/**
 * Erstellt eine Trainingsstunde aus Gruppe, Niveau, Ziel und Dauer.
 * Aufbau: Aufwärmen 10 Min, Übungen, Spiel 10 Min, Ausklang (der Rest).
 * Jeder Übungsblock merkt sich seine Übung (uebungId), damit man sie später tauschen kann.
 */
function trainingsplanErstellen({ gruppe, niveau, ziel, dauer }) {
  const niv = NIVEAUE.indexOf(niveau);
  const aufwaermen = 10;
  const spiel = 10;
  const haupt = dauer - aufwaermen - spiel - 10;          // 60 Min → 30 Min Übungen
  const pool = mischen(passendeUebungen(ziel, niv));
  // Höchstens 4 Übungen, mindestens 10 Min je Übung, nie mehr als vorhanden
  const anzahl = pool.length ? Math.min(4, pool.length, Math.max(1, Math.floor(haupt / 10))) : 0;
  const minuten = anzahl ? Math.floor(haupt / anzahl) : 0;

  const bloecke = [{ titel: 'Aufwärmen', minuten: aufwaermen, text: 'Locker einlaufen, Grundschläge über das Netz, dann Beweglichkeit.' }];
  for (let i = 0; i < anzahl; i++) {
    const u = pool[i];
    bloecke.push({ titel: `Übung ${i + 1}: ${u.name}`, minuten, text: u.text, uebungId: u.id });
  }
  if (!anzahl) {
    bloecke.push({ titel: 'Übungszeit', minuten: haupt, text: `Für „${ziel}“ ist noch keine Übung hinterlegt. Lege eine im Tab „Übungen“ an.` });
  }
  bloecke.push({ titel: 'Spiel', minuten: spiel, text: SPIELE[niv] });
  const verbraucht = aufwaermen + spiel + (anzahl ? minuten * anzahl : haupt);
  bloecke.push({
    titel: 'Ausklang',
    minuten: dauer - verbraucht,
    text: 'Auslaufen, dehnen, kurz besprechen: Was lief gut, was nehmen wir mit?',
  });

  return { datum: heuteIso(), gruppe, niveau, ziel, dauer, notizen: '', uebergaben: [], bloecke };
}

/** Erstellt eine neue Stunde mit möglichst anderen Übungen als die bisherige (bis zu 6 Versuche). */
function erstelleNeueStunde() {
  const ids = (p) => p.bloecke.map((b) => b.uebungId).filter(Boolean).sort().join('|');
  const alt = trainer.plan ? ids(trainer.plan) : '';
  let plan;
  for (let i = 0; i < 6; i++) {
    plan = trainingsplanErstellen({ ...trainer });
    if (ids(plan) !== alt) break;
  }
  trainer.plan = plan;
  render();
}

/** Eine Trainingsstunde als Karte mit allen Blöcken, Notizen und Übergaben. */
function stundeKarte(s) {
  const uebergaben = s.uebergaben || [];
  return el('div', { class: 'karte' },
    el('span', { class: 'label' }, `${s.dauer} Min · ${s.niveau} · ${s.ziel} · ${s.gruppe} Spieler`),
    el('p', { class: 'muted' }, gruppenHinweis(s.gruppe)),
    ...s.bloecke.map((b) => el('div', { class: 'zeile' },
      el('span', { class: 'label' }, `${b.minuten} Min · ${b.titel}`),
      el('p', {}, b.text))),
    s.notizen ? infoZeile('Notizen', s.notizen) : null,
    ...uebergaben.map((u) => infoZeile(`Übernommen: ${u.name}`,
      `${datumDe(u.datum)}${u.notiz ? ' · ' + u.notiz : ''}`)));
}

// ==========================================================================
// 4. TAB „STUNDEN“
// ==========================================================================

/** Der Tab „Stunden“: Erinnerungen, Stunde erstellen, gespeicherte Stunden und alle Erinnerungen. */
function ansichtStunden() {
  const heute = heuteIso();
  const alleErinnerungen = Daten.listeAlle('erinnerungen');
  const faellig = alleErinnerungen
    .filter((e) => !e.erledigt && e.datum <= heute)
    .sort((a, b) => a.datum.localeCompare(b.datum));

  return el('div', { class: 'stack' },
    faellig.length
      ? el('div', { class: 'karte erinnerung' },
        el('strong', {}, `${faellig.length} Erinnerung${faellig.length > 1 ? 'en' : ''} fällig`),
        ...faellig.map((e) => el('p', {}, `${datumDe(e.datum)}: ${e.text}`)))
      : null,

    el('p', { class: 'sektion-titel' }, 'Trainingsstunde'),
    trainer.plan ? stundeEntwurfKarte() : trainerFormular(),

    el('p', { class: 'sektion-titel' }, 'Gespeicherte Stunden'),
    ...gespeicherteStunden(),

    el('p', { class: 'sektion-titel' }, 'Erinnerungen'),
    el('button', { class: 'btn btn-sekundaer', onclick: () => oeffneErinnerung(null) }, '+ Erinnerung eintragen'),
    ...erinnerungsListe(alleErinnerungen));
}

/** Das Formular für eine neue Stunde: Gruppe, Niveau, Ziel, Dauer. */
function trainerFormular() {
  return el('div', { class: 'stack' },
    el('p', { class: 'muted' }, 'Gib deine Gruppe an. Dann bekommst du eine passende Trainingsstunde.'),
    feld('Anzahl Spieler', el('input', {
      class: 'input zahl', type: 'number', inputmode: 'numeric', min: '1', max: '30',
      value: String(trainer.gruppe),
      oninput(e) { trainer.gruppe = Math.max(1, Number(e.target.value) || 1); },
    })),
    el('span', { class: 'label' }, 'Niveau'),
    auswahl(NIVEAUE.map((n) => ({ wert: n, label: n })), trainer.niveau, (w) => { trainer.niveau = w; }),
    el('span', { class: 'label' }, 'Ziel'),
    auswahl(ZIELE.map((z) => ({ wert: z, label: z })), trainer.ziel, (w) => { trainer.ziel = w; }),
    el('span', { class: 'label' }, 'Dauer'),
    auswahl(DAUERN.map((d) => ({ wert: d, label: `${d} Min` })), trainer.dauer, (w) => { trainer.dauer = w; }),
    el('button', { class: 'btn btn-primaer', onclick: erstelleNeueStunde }, 'Trainingsstunde erstellen'));
}

/** Die fertige, noch nicht gespeicherte Stunde mit Knöpfen darunter. */
function stundeEntwurfKarte() {
  return el('div', { class: 'stack' },
    stundeKarte(trainer.plan),
    el('div', { class: 'stack' },
      el('button', { class: 'btn btn-primaer', onclick: () => stundeSpeichern(trainer.plan) }, 'Stunde speichern'),
      el('button', { class: 'btn btn-sekundaer', onclick: erstelleNeueStunde }, 'Neue Stunde (andere Übungen)'),
      el('button', {
        class: 'btn btn-sekundaer',
        onclick: () => oeffneStundeEditor(trainer.plan, {
          neu: true,
          nachSpeichern: () => { trainer.plan = null; },
        }),
      }, 'Bearbeiten (Übungen, Minuten, Text)')));
}

/** Speichert die Entwurf-Stunde direkt, ohne Bearbeiten. */
function stundeSpeichern(plan) {
  if (versuche(() => Daten.listeSpeichern('stunden', { ...kopie(plan), datum: heuteIso() }))) {
    trainer.plan = null;
    zeigeToast('Trainingsstunde gespeichert');
    render();
  }
}

/** Die gespeicherten Stunden als antippbare Karten. Zeigt auch, wer zuletzt übernommen hat. */
function gespeicherteStunden() {
  const liste = Daten.listeAlle('stunden');
  if (!liste.length) return [hinweis('Noch keine gespeicherte Stunde.')];
  return liste.map((s) => {
    const letzte = (s.uebergaben || [])[0];
    return el('button', { class: 'karte', onclick: () => oeffneStundeEditor(s, { neu: false }) },
      el('strong', { class: 'gegner-name' }, `${datumDe(s.datum)} · ${s.ziel} · ${s.dauer} Min`),
      el('span', { class: 'muted' },
        `${s.niveau} · ${s.gruppe} Spieler${letzte ? ` · zuletzt übernommen von ${letzte.name}` : ''}`));
  });
}

/**
 * Der Editor für eine Stunde: alles ist änderbar (Datum, Gruppe, Niveau, Ziel, Dauer,
 * Blöcke mit Titel, Minuten und Text, Übungen tauschen, Notizen und Übergaben).
 * vorlage: die Stunde (gespeichert oder neu). neu: true, wenn sie noch nicht gespeichert ist.
 */
function oeffneStundeEditor(vorlage, { neu = false, nachSpeichern = null } = {}) {
  const s = kopie(vorlage);
  s.datum = s.datum || heuteIso();
  s.notizen = s.notizen || '';
  s.uebergaben = s.uebergaben || [];
  s.bloecke = s.bloecke || [];
  s.gruppe = Number(s.gruppe) || 1;
  if (neu) delete s.id;

  const neueUebergabe = { name: '', datum: heuteIso(), notiz: '' };
  const fehler = el('p', { class: 'fehler' });
  const box = el('div', { class: 'stack' });

  const zeichne = () => box.replaceChildren(...bauEditor());

  /** Baut den Inhalt des Editors aus dem aktuellen Stand von s neu. */
  function bauEditor() {
    const summe = s.bloecke.reduce((a, b) => a + (Number(b.minuten) || 0), 0);
    return [
      feld('Datum', el('input', {
        class: 'input', type: 'date', value: s.datum,
        oninput(e) { s.datum = e.target.value; },
      })),
      feld('Anzahl Spieler', el('input', {
        class: 'input zahl', type: 'number', inputmode: 'numeric', min: '1', max: '30', value: String(s.gruppe),
        oninput(e) { s.gruppe = Math.max(1, Number(e.target.value) || 1); },
      })),
      el('span', { class: 'label' }, 'Niveau'),
      auswahl(NIVEAUE.map((n) => ({ wert: n, label: n })), s.niveau, (w) => { s.niveau = w; }),
      el('span', { class: 'label' }, 'Ziel'),
      auswahl(ZIELE.map((z) => ({ wert: z, label: z })), s.ziel, (w) => { s.ziel = w; }),
      el('span', { class: 'label' }, 'Dauer'),
      auswahl(DAUERN.map((d) => ({ wert: d, label: `${d} Min` })), s.dauer, (w) => { s.dauer = w; }),
      el('p', { class: 'muted' }, `Blöcke zusammen: ${summe} von ${s.dauer} Minuten${summe !== s.dauer ? ' (bitte anpassen)' : ''}`),

      el('p', { class: 'sektion-titel' }, 'Blöcke'),
      ...s.bloecke.map((b, i) => blockKarte(b, i)),
      el('button', {
        class: 'btn btn-sekundaer',
        onclick() { s.bloecke.push({ titel: 'Neuer Block', minuten: 10, text: '' }); zeichne(); },
      }, '+ Block hinzufügen'),

      feld('Notizen', el('textarea', {
        class: 'textarea', value: s.notizen, placeholder: 'z. B. Was lief gut, was nächstes Mal anders?',
        oninput(e) { s.notizen = e.target.value; },
      })),

      el('p', { class: 'sektion-titel' }, 'Übernommen von (Vertretung)'),
      ...s.uebergaben.map((u, i) => el('div', { class: 'karte' },
        el('strong', {}, u.name),
        el('p', { class: 'muted' }, `${datumDe(u.datum)}${u.notiz ? ' · ' + u.notiz : ''}`),
        el('button', {
          class: 'btn btn-text',
          onclick() { s.uebergaben.splice(i, 1); zeichne(); },
        }, 'Eintrag entfernen'))),
      uebergabeFormular(),

      fehler,
      el('button', { class: 'btn btn-primaer', onclick: speichern }, neu ? 'Stunde speichern' : 'Änderungen speichern'),
      !neu ? el('button', { class: 'btn btn-gefahr', onclick: () => stundeLoeschenMitFrage(s) }, 'Stunde löschen') : null,
    ];
  }

  /** Ein Block mit Titel, Minuten, Text und Knöpfen für Übung tauschen und entfernen. */
  function blockKarte(b, i) {
    return el('div', { class: 'karte' },
      feld('Titel', el('input', {
        class: 'input', type: 'text', value: b.titel,
        oninput(e) { b.titel = e.target.value; },
      })),
      feld('Minuten', el('input', {
        class: 'input zahl', type: 'number', inputmode: 'numeric', min: '0', max: '180', value: String(b.minuten),
        oninput(e) { b.minuten = Math.max(0, Number(e.target.value) || 0); },
      })),
      feld('Text', el('textarea', {
        class: 'textarea', value: b.text,
        oninput(e) { b.text = e.target.value; },
      })),
      el('div', { class: 'knopf-reihe' },
        b.uebungId ? el('button', {
          class: 'btn btn-sekundaer',
          onclick() { uebungTauschen(b); zeichne(); },
        }, 'Übung tauschen') : null,
        el('button', {
          class: 'btn btn-text',
          onclick() { s.bloecke.splice(i, 1); zeichne(); },
        }, 'Block entfernen')));
  }

  /** Tauscht die Übung eines Blocks gegen eine andere passende, die noch nicht in der Stunde ist. */
  function uebungTauschen(b) {
    const genutzt = s.bloecke.map((x) => x.uebungId).filter(Boolean);
    const niv = NIVEAUE.indexOf(s.niveau);
    const kandidaten = passendeUebungen(s.ziel, niv).filter((u) => !genutzt.includes(u.id));
    if (!kandidaten.length) { zeigeToast('Keine andere passende Übung vorhanden.'); return; }
    const neue = mischen(kandidaten)[0];
    const nummer = s.bloecke.filter((x) => x.uebungId).indexOf(b) + 1;
    b.uebungId = neue.id;
    b.titel = `Übung ${nummer}: ${neue.name}`;
    b.text = neue.text;
  }

  /** Das kleine Formular, um eine Übergabe (Vertretung) einzutragen. */
  function uebergabeFormular() {
    return el('div', { class: 'karte' },
      el('span', { class: 'label' }, 'Neue Übergabe'),
      feld('Wer hat übernommen?', el('input', {
        class: 'input', type: 'text', maxlength: '40', placeholder: 'z. B. Anna', value: neueUebergabe.name,
        oninput(e) { neueUebergabe.name = e.target.value; },
      })),
      feld('Datum', el('input', {
        class: 'input', type: 'date', value: neueUebergabe.datum,
        oninput(e) { neueUebergabe.datum = e.target.value; },
      })),
      feld('Notiz (optional)', el('input', {
        class: 'input', type: 'text', maxlength: '120', placeholder: 'z. B. Gruppe war motiviert',
        value: neueUebergabe.notiz,
        oninput(e) { neueUebergabe.notiz = e.target.value; },
      })),
      el('button', {
        class: 'btn btn-sekundaer',
        onclick() {
          if (!neueUebergabe.name.trim()) { zeigeToast('Bitte gib einen Namen ein.'); return; }
          s.uebergaben.unshift({ name: neueUebergabe.name.trim(), datum: neueUebergabe.datum, notiz: neueUebergabe.notiz.trim() });
          neueUebergabe.name = '';
          neueUebergabe.notiz = '';
          zeichne();
        },
      }, 'Übergabe eintragen'));
  }

  /** Prüft und speichert die Stunde. */
  function speichern() {
    fehler.textContent = '';
    if (!s.datum) { fehler.textContent = 'Bitte wähle ein Datum.'; return; }
    if (!s.bloecke.length) { fehler.textContent = 'Die Stunde braucht mindestens einen Block.'; return; }
    const eintrag = { ...s, notizen: s.notizen.trim() };
    if (versuche(() => Daten.listeSpeichern('stunden', eintrag))) {
      schliesseSheet();
      if (nachSpeichern) nachSpeichern();
      zeigeToast('Stunde gespeichert');
      render();
    }
  }

  zeichne();
  oeffneSheet(neu ? 'Neue Stunde' : 'Stunde bearbeiten', box, null);
}

/** Fragt nach, bevor eine gespeicherte Stunde gelöscht wird. */
async function stundeLoeschenMitFrage(s) {
  const ja = await fragen({
    titel: 'Stunde löschen?',
    text: 'Die gespeicherte Trainingsstunde wird gelöscht.',
    ok: 'Löschen',
    gefahr: true,
  });
  if (!ja) return;
  if (versuche(() => Daten.listeLoeschen('stunden', s.id))) {
    schliesseSheet();
    zeigeToast('Stunde gelöscht');
    render();
  }
}

/** Die Liste der Erinnerungen: offene zuerst, erledigte darunter. */
function erinnerungsListe(alle) {
  if (!alle.length) return [hinweis('Keine Erinnerungen. Trage zum Beispiel ein, wann du eine Stunde nachbereiten willst.')];
  const offen = alle.filter((e) => !e.erledigt).sort((a, b) => a.datum.localeCompare(b.datum));
  const erledigt = alle.filter((e) => e.erledigt);
  const karte = (e) => el('button', { class: 'karte', onclick: () => oeffneErinnerung(e) },
    el('strong', { class: 'gegner-name' }, `${datumDe(e.datum)}${e.erledigt ? ' · erledigt' : ''}`),
    el('span', { class: 'muted' }, e.text));
  return [...offen.map(karte), ...erledigt.map(karte)];
}

/** Formular für eine Erinnerung. e = null bedeutet „neu“. */
function oeffneErinnerung(e) {
  const f = { datum: e?.datum || heuteIso(), text: e?.text || '', erledigt: !!e?.erledigt };
  const fehler = el('p', { class: 'fehler' });
  const inhalt = el('div', { class: 'stack' },
    feld('Datum', el('input', {
      class: 'input', type: 'date', value: f.datum,
      oninput(ev) { f.datum = ev.target.value; },
    })),
    feld('Erinnerung', el('input', {
      class: 'input', type: 'text', maxlength: '120', placeholder: 'z. B. Schläger besaiten lassen',
      value: f.text, oninput(ev) { f.text = ev.target.value; },
    })),
    el('label', { class: 'check' },
      el('input', { type: 'checkbox', checked: f.erledigt, onchange(ev) { f.erledigt = ev.target.checked; } }),
      'Erledigt'),
    fehler,
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        if (!f.datum) { fehler.textContent = 'Bitte wähle ein Datum.'; return; }
        if (!f.text.trim()) { fehler.textContent = 'Bitte schreibe, woran du erinnert werden willst.'; return; }
        const eintrag = { id: e?.id, datum: f.datum, text: f.text.trim(), erledigt: f.erledigt };
        if (versuche(() => Daten.listeSpeichern('erinnerungen', eintrag))) {
          schliesseSheet();
          zeigeToast('Erinnerung gespeichert');
          render();
        }
      },
    }, 'Speichern'),
    e ? el('button', { class: 'btn btn-gefahr', onclick: () => erinnerungLoeschenMitFrage(e) }, 'Erinnerung löschen') : null);

  oeffneSheet(e ? 'Erinnerung bearbeiten' : 'Neue Erinnerung', inhalt, null);
}

/** Fragt nach, bevor eine Erinnerung gelöscht wird. */
async function erinnerungLoeschenMitFrage(e) {
  const ja = await fragen({ titel: 'Erinnerung löschen?', text: 'Die Erinnerung wird entfernt.', ok: 'Löschen', gefahr: true });
  if (!ja) return;
  if (versuche(() => Daten.listeLoeschen('erinnerungen', e.id))) {
    schliesseSheet();
    zeigeToast('Erinnerung gelöscht');
    render();
  }
}

// ==========================================================================
// 5. TAB „SAISON“
// ==========================================================================

/** Erzeugt die Wochen eines Saisonplans aus dem Formular. Jede 4. Woche ist eine leichte Woche. */
function saisonWochenErstellen(f) {
  const variante = SAISON_VARIANTEN.find((v) => v.id === f.variante) || SAISON_VARIANTEN[0];
  const n = f.wochen;
  const wochen = [];
  for (let i = 0; i < n; i++) {
    // In welcher Phase liegt diese Woche? (Mitte der Woche gegen die Anteile prüfen)
    const mitte = (i + 0.5) / n;
    let acc = 0;
    let phase = variante.phasen[variante.phasen.length - 1];
    for (const p of variante.phasen) {
      acc += p.anteil;
      if (mitte <= acc) { phase = p; break; }
    }
    const leicht = n >= 6 && i % 4 === 3;
    wochen.push({
      id: kurzId(),
      nr: i + 1,
      datum: addTage(f.start, i * 7),
      phase: leicht ? 'Leichte Woche' : phase.name,
      ziel: leicht ? 'Grundlinie' : phase.ziele[i % phase.ziele.length],
      dauer: leicht ? 60 : f.dauer,
      notiz: leicht ? 'Leichte Woche: Technik locker, Kondition kurz, mehr Dehnen.' : '',
      erledigt: false,
    });
  }
  return wochen;
}

/** Name einer Variante (aus der Liste oben). */
function variantenName(id) {
  return (SAISON_VARIANTEN.find((v) => v.id === id) || SAISON_VARIANTEN[0]).name;
}

/** Der Tab „Saison“: alle Pläne, oder der offene Plan mit seinen Wochen. */
function ansichtSaison() {
  const plaene = Daten.listeAlle('saisonplaene');
  const plan = saisonAuswahl ? plaene.find((p) => p.id === saisonAuswahl) : null;
  if (plan) return saisonPlanAnsicht(plan);
  saisonAuswahl = null;

  return el('div', { class: 'stack' },
    el('p', { class: 'muted' }, 'Ein Saisonplan verteilt die Ziele über viele Wochen. Jede Woche kannst du als Trainingsstunde übernehmen und anpassen.'),
    ...plaene.map((p) => el('button', {
      class: 'karte',
      onclick() { saisonAuswahl = p.id; render(); },
    },
      el('strong', { class: 'gegner-name' }, p.name),
      el('span', { class: 'muted' }, `${p.wochen.length} Wochen · ${variantenName(p.variante)} · Start ${datumDe(p.datum)}`))),
    plaene.length && !saisonFormOffen
      ? el('button', {
        class: 'btn btn-primaer',
        onclick() { saisonFormOffen = true; render(); },
      }, '+ Neuer Saisonplan')
      : null,
    (!plaene.length || saisonFormOffen) ? saisonFormular(plaene.length > 0) : null);
}

/** Das Formular für einen neuen Saisonplan. */
function saisonFormular(mitAbbrechen) {
  if (!saisonForm) {
    saisonForm = {
      name: `Saison ${new Date().getFullYear()}`,
      start: naechsterMontag(),
      wochen: 12,
      variante: 'ausgewogen',
      gruppe: trainer.gruppe,
      niveau: trainer.niveau,
      dauer: 60,
    };
  }
  const f = saisonForm;
  const fehler = el('p', { class: 'fehler' });
  const variante = SAISON_VARIANTEN.find((v) => v.id === f.variante) || SAISON_VARIANTEN[0];

  return el('div', { class: 'karte stack' },
    el('span', { class: 'label' }, 'Neuer Saisonplan'),
    feld('Name', el('input', {
      class: 'input', type: 'text', maxlength: '40', value: f.name,
      oninput(e) { f.name = e.target.value; },
    })),
    feld('Start (Montag)', el('input', {
      class: 'input', type: 'date', value: f.start,
      oninput(e) { f.start = e.target.value; },
    })),
    el('span', { class: 'label' }, 'Anzahl Wochen'),
    auswahl(GRUPPEN_WOCHEN.map((w) => ({ wert: w, label: `${w} Wochen` })), f.wochen, (w) => { f.wochen = w; }),
    el('span', { class: 'label' }, 'Variante'),
    auswahl(SAISON_VARIANTEN.map((v) => ({ wert: v.id, label: v.name })), f.variante, (w) => {
      f.variante = w;
      render();
    }),
    el('p', { class: 'muted' }, variante.text),
    feld('Anzahl Spieler', el('input', {
      class: 'input zahl', type: 'number', inputmode: 'numeric', min: '1', max: '30', value: String(f.gruppe),
      oninput(e) { f.gruppe = Math.max(1, Number(e.target.value) || 1); },
    })),
    el('span', { class: 'label' }, 'Niveau'),
    auswahl(NIVEAUE.map((n) => ({ wert: n, label: n })), f.niveau, (w) => { f.niveau = w; }),
    el('span', { class: 'label' }, 'Dauer der Stunden'),
    auswahl(DAUERN.map((d) => ({ wert: d, label: `${d} Min` })), f.dauer, (w) => { f.dauer = w; }),
    fehler,
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        if (!f.name.trim()) { fehler.textContent = 'Bitte gib einen Namen ein.'; return; }
        if (!f.start) { fehler.textContent = 'Bitte wähle einen Startmontag.'; return; }
        const plan = {
          name: f.name.trim(), datum: f.start, variante: f.variante,
          gruppe: f.gruppe, niveau: f.niveau, dauer: f.dauer,
          wochen: saisonWochenErstellen(f),
        };
        let neu = null;
        if (versuche(() => { neu = Daten.listeSpeichern('saisonplaene', plan); })) {
          saisonAuswahl = neu.id;
          saisonForm = null;
          saisonFormOffen = false;
          zeigeToast('Saisonplan erstellt');
          render();
        }
      },
    }, 'Saisonplan erstellen'),
    mitAbbrechen ? el('button', {
      class: 'btn btn-text',
      onclick() { saisonFormOffen = false; render(); },
    }, 'Abbrechen') : null);
}

/** Ein offener Saisonplan: Kopf, Wochen, und Knöpfe zum Ändern. */
function saisonPlanAnsicht(plan) {
  const erledigt = plan.wochen.filter((w) => w.erledigt).length;
  return el('div', { class: 'stack' },
    el('button', { class: 'btn btn-text', onclick() { saisonAuswahl = null; render(); } }, '← Alle Saisonpläne'),
    el('div', { class: 'bilanz-karte' },
      el('span', { class: 'label' }, plan.name),
      el('span', { class: 'bilanz-zahl' }, `${erledigt} / ${plan.wochen.length}`),
      el('span', { class: 'muted' }, `erledigte Wochen · ${variantenName(plan.variante)} · ${plan.gruppe} Spieler · ${plan.niveau}`)),
    el('div', { class: 'stack' },
      el('button', { class: 'btn btn-sekundaer', onclick: () => oeffneSaisonEinstellungen(plan) }, 'Plan bearbeiten (Name, Gruppe, Niveau)'),
      el('button', { class: 'btn btn-sekundaer', onclick: () => wocheHinzufuegen(plan) }, '+ Woche hinzufügen')),
    el('p', { class: 'sektion-titel' }, 'Wochen'),
    ...plan.wochen.map((w) => wochenKarte(plan, w)),
    el('button', { class: 'btn btn-gefahr', onclick: () => saisonLoeschenMitFrage(plan) }, 'Saisonplan löschen'));
}

/** Eine Woche im Plan: Datum, Phase, Ziel, Dauer und zwei Knöpfe. */
function wochenKarte(plan, w) {
  return el('div', { class: 'karte' },
    el('div', { class: 'kopfzeile' },
      el('strong', {}, `Woche ${w.nr} · ${datumDe(w.datum)}`),
      w.erledigt ? el('span', { class: 'badge sieg' }, 'erledigt') : null),
    el('p', { class: 'muted' }, `${w.phase} · ${w.ziel} · ${w.dauer} Min`),
    w.notiz ? el('p', { class: 'muted' }, w.notiz) : null,
    el('div', { class: 'knopf-reihe' },
      el('button', { class: 'btn btn-sekundaer', onclick: () => oeffneWoche(plan, w) }, 'Bearbeiten'),
      el('button', { class: 'btn btn-primaer', onclick: () => wocheAlsStunde(plan, w) }, 'Als Stunde')));
}

/** Eine Woche bearbeiten: Datum, Phase, Ziel, Dauer, Notiz, erledigt. */
function oeffneWoche(plan, w) {
  const f = kopie(w);
  const inhalt = el('div', { class: 'stack' },
    feld('Datum', el('input', { class: 'input', type: 'date', value: f.datum, oninput(e) { f.datum = e.target.value; } })),
    feld('Phase', el('input', { class: 'input', type: 'text', maxlength: '30', value: f.phase, oninput(e) { f.phase = e.target.value; } })),
    el('span', { class: 'label' }, 'Ziel'),
    auswahl(ZIELE.map((z) => ({ wert: z, label: z })), f.ziel, (wert) => { f.ziel = wert; }),
    el('span', { class: 'label' }, 'Dauer'),
    auswahl(DAUERN.map((d) => ({ wert: d, label: `${d} Min` })), f.dauer, (wert) => { f.dauer = wert; }),
    feld('Notiz', el('textarea', { class: 'textarea', value: f.notiz, oninput(e) { f.notiz = e.target.value; } })),
    el('label', { class: 'check' },
      el('input', { type: 'checkbox', checked: f.erledigt, onchange(e) { f.erledigt = e.target.checked; } }),
      'Diese Woche ist erledigt'),
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        const neuerPlan = { ...plan, wochen: plan.wochen.map((x) => (x.id === w.id ? { ...f, id: w.id, nr: w.nr } : x)) };
        if (versuche(() => Daten.listeSpeichern('saisonplaene', neuerPlan))) {
          schliesseSheet();
          zeigeToast('Woche gespeichert');
          render();
        }
      },
    }, 'Speichern'),
    el('button', {
      class: 'btn btn-gefahr',
      onclick: () => wocheLoeschenMitFrage(plan, w),
    }, 'Woche löschen'));
  oeffneSheet(`Woche ${w.nr}`, inhalt, null);
}

/** Löscht eine Woche aus dem Plan (nach Nachfrage). Die Nummern werden neu vergeben. */
async function wocheLoeschenMitFrage(plan, w) {
  const ja = await fragen({ titel: 'Woche löschen?', text: `Woche ${w.nr} wird aus dem Plan entfernt.`, ok: 'Löschen', gefahr: true });
  if (!ja) return;
  const wochen = plan.wochen.filter((x) => x.id !== w.id).map((x, i) => ({ ...x, nr: i + 1 }));
  if (versuche(() => Daten.listeSpeichern('saisonplaene', { ...plan, wochen }))) {
    schliesseSheet();
    zeigeToast('Woche gelöscht');
    render();
  }
}

/** Hängt eine neue Woche an das Ende des Plans an (eine Woche nach der letzten). */
function wocheHinzufuegen(plan) {
  const letzte = plan.wochen[plan.wochen.length - 1];
  const datum = letzte ? addTage(letzte.datum, 7) : plan.datum;
  const neueWoche = {
    id: kurzId(), nr: plan.wochen.length + 1, datum,
    phase: 'Zusatz', ziel: 'Grundlinie', dauer: plan.dauer || 60, notiz: '', erledigt: false,
  };
  if (versuche(() => Daten.listeSpeichern('saisonplaene', { ...plan, wochen: [...plan.wochen, neueWoche] }))) {
    zeigeToast('Woche hinzugefügt');
    render();
  }
}

/** Macht aus einer Saisonwoche eine Trainingsstunde und öffnet den Editor zum Anpassen und Speichern. */
function wocheAlsStunde(plan, w) {
  const entwurf = trainingsplanErstellen({ gruppe: plan.gruppe, niveau: plan.niveau, ziel: w.ziel, dauer: w.dauer });
  oeffneStundeEditor({
    ...entwurf,
    datum: w.datum,
    notizen: `Saisonplan „${plan.name}“, Woche ${w.nr} (${w.phase})${w.notiz ? ': ' + w.notiz : ''}`,
  }, { neu: true });
}

/** Name, Gruppe, Niveau und Dauer eines Plans ändern (die Wochen bleiben). */
function oeffneSaisonEinstellungen(plan) {
  const f = { name: plan.name, gruppe: plan.gruppe, niveau: plan.niveau, dauer: plan.dauer || 60 };
  const inhalt = el('div', { class: 'stack' },
    feld('Name', el('input', { class: 'input', type: 'text', maxlength: '40', value: f.name, oninput(e) { f.name = e.target.value; } })),
    feld('Anzahl Spieler', el('input', {
      class: 'input zahl', type: 'number', inputmode: 'numeric', min: '1', max: '30', value: String(f.gruppe),
      oninput(e) { f.gruppe = Math.max(1, Number(e.target.value) || 1); },
    })),
    el('span', { class: 'label' }, 'Niveau'),
    auswahl(NIVEAUE.map((n) => ({ wert: n, label: n })), f.niveau, (w) => { f.niveau = w; }),
    el('span', { class: 'label' }, 'Dauer der Stunden (für neue Wochen)'),
    auswahl(DAUERN.map((d) => ({ wert: d, label: `${d} Min` })), f.dauer, (w) => { f.dauer = w; }),
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        if (!f.name.trim()) { zeigeToast('Bitte gib einen Namen ein.'); return; }
        const neuerPlan = { ...plan, name: f.name.trim(), gruppe: f.gruppe, niveau: f.niveau, dauer: f.dauer };
        if (versuche(() => Daten.listeSpeichern('saisonplaene', neuerPlan))) {
          schliesseSheet();
          zeigeToast('Plan gespeichert');
          render();
        }
      },
    }, 'Speichern'));
  oeffneSheet('Plan bearbeiten', inhalt, null);
}

/** Fragt nach, bevor ein ganzer Saisonplan gelöscht wird. */
async function saisonLoeschenMitFrage(plan) {
  const ja = await fragen({
    titel: 'Saisonplan löschen?',
    text: `„${plan.name}“ wird mit allen Wochen gelöscht. Gespeicherte Stunden bleiben erhalten.`,
    ok: 'Löschen',
    gefahr: true,
  });
  if (!ja) return;
  if (versuche(() => Daten.listeLoeschen('saisonplaene', plan.id))) {
    saisonAuswahl = null;
    zeigeToast('Saisonplan gelöscht');
    render();
  }
}

// ==========================================================================
// 6. TAB „ÜBUNGEN“
// ==========================================================================

/** Alle Übungen, nach Ziel gefiltert. Antippen öffnet die Übung zum Ändern. */
function ansichtUebungen() {
  const alle = uebungenAktiv();
  const gefiltert = uebungFilter === 'Alle' ? alle : alle.filter((u) => u.ziel === uebungFilter);

  return el('div', { class: 'stack' },
    auswahl(['Alle', ...ZIELE].map((z) => ({ wert: z, label: z })), uebungFilter, (w) => {
      uebungFilter = w;
      render();
    }),
    el('button', { class: 'btn btn-primaer', onclick: () => oeffneUebung(null) }, '+ Neue Übung'),
    el('p', { class: 'muted' }, `${gefiltert.length} Übungen`),
    ...(gefiltert.length
      ? gefiltert.map((u) => el('button', { class: 'karte', onclick: () => oeffneUebung(u) },
        el('strong', { class: 'gegner-name' }, u.name),
        el('span', { class: 'muted' }, `${u.ziel} · ${u.min === 0 ? 'Beide Niveaus' : 'Nur Fortgeschritten'}`),
        el('span', { class: 'muted' }, u.text)))
      : [hinweis('Keine Übung für dieses Ziel. Lege eine neue an.')]),
    el('button', { class: 'btn btn-text', onclick: standardUebungenMitFrage },
      'Standardübungen wiederherstellen'));
}

/** Formular für eine Übung. u = null bedeutet „neu“. */
function oeffneUebung(u) {
  const f = { name: u?.name || '', ziel: u?.ziel || 'Aufschlag', min: u?.min ?? 0, text: u?.text || '' };
  const fehler = el('p', { class: 'fehler' });
  const inhalt = el('div', { class: 'stack' },
    feld('Name', el('input', {
      class: 'input', type: 'text', maxlength: '50', placeholder: 'z. B. Aufschlag mit Ziel',
      value: f.name, oninput(e) { f.name = e.target.value; },
    })),
    el('span', { class: 'label' }, 'Ziel'),
    auswahl(ZIELE.map((z) => ({ wert: z, label: z })), f.ziel, (w) => { f.ziel = w; }),
    el('span', { class: 'label' }, 'Niveau'),
    auswahl([{ wert: 0, label: 'Beide Niveaus' }, { wert: 1, label: 'Nur Fortgeschritten' }], f.min, (w) => { f.min = w; }),
    feld('Beschreibung (was macht man genau?)', el('textarea', {
      class: 'textarea', value: f.text,
      oninput(e) { f.text = e.target.value; },
    })),
    fehler,
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        if (!f.name.trim()) { fehler.textContent = 'Bitte gib einen Namen ein.'; return; }
        if (!f.text.trim()) { fehler.textContent = 'Bitte beschreibe kurz, was man macht.'; return; }
        const liste = uebungenAktiv().slice();
        if (u) {
          const i = liste.findIndex((x) => x.id === u.id);
          if (i !== -1) liste[i] = { ...liste[i], name: f.name.trim(), ziel: f.ziel, min: f.min, text: f.text.trim() };
        } else {
          liste.push({ id: 'u' + kurzId(), name: f.name.trim(), ziel: f.ziel, min: f.min, text: f.text.trim() });
        }
        if (versuche(() => Daten.uebungenSpeichern(liste))) {
          schliesseSheet();
          zeigeToast('Übung gespeichert');
          render();
        }
      },
    }, 'Speichern'),
    u ? el('button', { class: 'btn btn-gefahr', onclick: () => uebungLoeschenMitFrage(u) }, 'Übung löschen') : null);

  oeffneSheet(u ? 'Übung bearbeiten' : 'Neue Übung', inhalt, null);
}

/** Löscht eine Übung aus der Liste (nach Nachfrage). Gespeicherte Stunden behalten ihren Text. */
async function uebungLoeschenMitFrage(u) {
  const ja = await fragen({ titel: 'Übung löschen?', text: `„${u.name}“ wird aus der Übungsliste entfernt.`, ok: 'Löschen', gefahr: true });
  if (!ja) return;
  const liste = uebungenAktiv().filter((x) => x.id !== u.id);
  if (versuche(() => Daten.uebungenSpeichern(liste))) {
    schliesseSheet();
    zeigeToast('Übung gelöscht');
    render();
  }
}

/** Setzt die Übungsliste auf die Standardübungen zurück (nach Nachfrage). */
async function standardUebungenMitFrage() {
  const ja = await fragen({
    titel: 'Standardübungen wiederherstellen?',
    text: 'Alle Änderungen an den Übungen, auch eigene Übungen, gehen verloren.',
    ok: 'Wiederherstellen',
    gefahr: true,
  });
  if (!ja) return;
  if (versuche(() => Daten.uebungenZuruecksetzen())) {
    zeigeToast('Standardübungen sind wieder da');
    render();
  }
}

// ==========================================================================
// 7. EINSTELLUNGEN, SICHERUNG UND START
// ==========================================================================

/** Die Einstellungen (Zahnrad): Sichern, Wiederherstellen, Alles löschen. */
function oeffneEinstellungen() {
  const inhalt = el('div', { class: 'stack' },
    el('p', { class: 'sektion-titel' }, 'Daten sichern'),
    el('p', { class: 'muted' },
      'Lade regelmäßig eine Sicherung herunter. So geht nichts verloren, auch wenn der Browser seine Daten löscht.'),
    el('button', { class: 'btn btn-sekundaer', onclick: exportierenDatei }, 'Daten exportieren (Datei speichern)'),
    el('button', { class: 'btn btn-sekundaer', onclick: importierenStarten }, 'Daten importieren'),

    el('p', { class: 'sektion-titel' }, 'Gefahrenzone'),
    el('button', { class: 'btn btn-gefahr', onclick: alleDatenLoeschenMitFrage }, 'Alle Daten löschen'));

  oeffneSheet('Einstellungen', inhalt, null);
}

/** Lädt alle Daten als JSON-Datei herunter. */
function exportierenDatei() {
  const blob = new Blob([Daten.exportieren()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `trainer-sicherung-${heuteIso()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  Daten.einstellungSpeichern('letzteSicherung', new Date().toISOString());
  zeigeToast('Sicherung wird heruntergeladen');
  render();
}

/** Erinnerung an die Sicherung: erscheint, wenn die letzte Sicherung 14 Tage oder älter ist. */
function sicherungKarte() {
  const jetzt = Date.now();
  const aufgeschoben = Daten.einstellungLesen('erinnerungAufschieben');
  if (aufgeschoben && new Date(aufgeschoben).getTime() > jetzt) return null;

  const hatDaten = Daten.listeAlle('stunden').length > 0 || Daten.listeAlle('saisonplaene').length > 0
    || Daten.listeAlle('erinnerungen').length > 0 || Daten.uebungenLesen() !== null;
  if (!hatDaten) return null;

  const letzte = Daten.einstellungLesen('letzteSicherung');
  const tage = letzte ? Math.floor((jetzt - new Date(letzte).getTime()) / 86400000) : null;
  if (tage !== null && tage < 14) return null;

  return el('div', { class: 'karte erinnerung' },
    el('strong', {}, 'Zeit für eine Sicherung'),
    el('p', { class: 'muted' }, tage === null
      ? 'Du hast noch nie eine Sicherung gemacht.'
      : `Deine letzte Sicherung ist ${tage} Tage her.`),
    el('p', { class: 'muted' }, 'Auf dem iPhone gehen die Daten verloren, wenn du die App löschst. Eine Sicherung schützt dich davor.'),
    el('div', { class: 'knopf-reihe' },
      el('button', { class: 'btn btn-primaer', onclick: exportierenDatei }, 'Jetzt sichern'),
      el('button', {
        class: 'btn btn-sekundaer',
        onclick() {
          Daten.einstellungSpeichern('erinnerungAufschieben', new Date(Date.now() + 3 * 86400000).toISOString());
          render();
        },
      }, 'In 3 Tagen')));
}

/** Öffnet die Dateiauswahl, liest eine Sicherungsdatei und ersetzt die Daten (nach Nachfrage). */
function importierenStarten() {
  const datei = document.createElement('input');
  datei.type = 'file';
  datei.accept = '.json,application/json';
  document.body.append(datei);

  datei.onchange = async () => {
    const auswahlDatei = datei.files[0];
    datei.remove();
    if (!auswahlDatei) return;

    let text;
    try {
      text = await auswahlDatei.text();
    } catch {
      zeigeToast('Die Datei konnte nicht gelesen werden.');
      return;
    }

    const ja = await fragen({
      titel: 'Daten importieren?',
      text: 'Alle aktuellen Daten werden durch den Inhalt der Datei ersetzt.',
      ok: 'Importieren',
      gefahr: true,
    });
    if (!ja) return;

    if (versuche(() => Daten.importieren(text))) {
      trainer.plan = null;
      saisonAuswahl = null;
      saisonForm = null;
      saisonFormOffen = false;
      schliesseSheet();
      zeigeToast('Daten importiert');
      render();
    }
  };
  datei.click();
}

/** Löscht alle Daten – nur nach zwei Bestätigungen. */
async function alleDatenLoeschenMitFrage() {
  const erste = await fragen({
    titel: 'Alle Daten löschen?',
    text: 'Alle Stunden, Erinnerungen, Saisonpläne und Übungen werden entfernt.',
    ok: 'Weiter',
    gefahr: true,
  });
  if (!erste) return;

  const zweite = await fragen({
    titel: 'Wirklich ganz sicher?',
    text: 'Das lässt sich nicht rückgängig machen. Exportiere vorher lieber eine Sicherung.',
    ok: 'Ja, alles löschen',
    gefahr: true,
  });
  if (!zweite) return;

  if (versuche(() => Daten.alleLoeschen())) {
    trainer.plan = null;
    saisonAuswahl = null;
    saisonForm = null;
    saisonFormOffen = false;
    schliesseSheet();
    zeigeToast('Alle Daten gelöscht');
    render();
  }
}

/** Zeichnet den Inhalt des gerade gewählten Tabs neu. */
function render() {
  document.querySelectorAll('.tab').forEach((t) =>
    t.setAttribute('aria-selected', String(t.dataset.tab === aktiverTab)));

  $('titel').textContent = TAB_TITEL[aktiverTab];

  const ansichten = { stunden: ansichtStunden, saison: ansichtSaison, uebungen: ansichtUebungen };
  const ansicht = ansichten[aktiverTab]();

  $('inhalt').replaceChildren(...[sicherungKarte(), ansicht].filter(Boolean));
}

/** Richtet die festen Knöpfe ein (Tab-Leiste, Zahnrad, Formular-Fenster). */
function bindeKnoepfe() {
  document.querySelectorAll('.tab').forEach((knopf) => {
    knopf.addEventListener('click', () => {
      if (knopf.dataset.tab === aktiverTab) return;
      aktiverTab = knopf.dataset.tab;
      window.scrollTo({ top: 0 });
      render();
    });
  });

  $('btn-einstellungen').addEventListener('click', oeffneEinstellungen);

  $('sheet-zurueck').addEventListener('click', () => {
    if (sheetZurueckFn) sheetZurueckFn();
    else schliesseSheet();
  });
}

// Los geht’s: Knöpfe verbinden, Inhalt zeichnen, Offline-Modus einschalten
bindeKnoepfe();
render();

// Service Worker: macht die App offline nutzbar (siehe service-worker.js)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .catch((fehler) => console.warn('Offline-Modus konnte nicht starten:', fehler));
  });
}
