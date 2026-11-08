/**
 * app.js – die Bedienlogik der Tennis-App (Version 1: Bereich „Match“).
 *
 * Aufbau dieser Datei:
 *  1. Feste Werte und Zustand
 *  2. Kleine Helfer (Elemente bauen, Datum, Meldungen)
 *  3. Ansichten der drei Tabs: Vor dem Match, Nach dem Match, Gegner
 *  4. Formulare (Gegner, Nachbereitung) und Einstellungen
 *  5. Start der App
 *
 * Alle Daten holt und speichert diese Datei über storage.js (als „Daten“ importiert).
 */

import * as Daten from './storage.js';

// ==========================================================================
// 1. FESTE WERTE UND ZUSTAND
// ==========================================================================

const SPIELSTILE = [
  'Grundlinienspieler',
  'Angreifer/Netzspieler',
  'Konterspieler',
  'Allrounder',
  'Aufschlagspieler',
];

const ARTEN = ['Medenspiel', 'Turnier', 'Training'];

// Die vier Schritte von „Vor dem Match“
const SCHRITTE = ['Gegner', 'Matchplan', 'Atemübung', 'Satz'];

// Beispiele, die in den leeren Matchplan-Feldern grau stehen
const BEISPIELE = [
  'Auf seine Rückhand spielen',
  'Kurze Bälle sofort angreifen',
  'Hoch und tief wechseln',
];

// Atemübung: 5 Runden, 4 Sekunden ein, 6 Sekunden aus
const ATEM_RUNDEN = 5;
const ATEM_EIN_MS = 4000;
const ATEM_AUS_MS = 6000;

// Trainer-Modus: Ziele, Niveaus, Dauer
const ZIELE = ['Aufschlag', 'Grundlinie', 'Netzspiel', 'Return', 'Kondition', 'Mental'];
const NIVEAUS = ['Anfänger', 'Fortgeschritten'];
const DAUERN = [60, 90, 120];
const KOERPER_TYPEN = ['Training', 'Match', 'Ruhetag'];

// Übungen je Ziel. min = ab welchem Niveau die Übung passt (0 Anfänger, 1 Fortgeschritten)
const UEBUNGEN = {
  Aufschlag: [
    { name: 'Ziele treffen', min: 0, text: 'Mit Körbchen oder Kreide Zielfelder markieren. 10 Aufschläge, Treffer zählen.' },
    { name: 'Bewegung im Aufschlag', min: 0, text: 'Ballwurf, Schwung, Treffpunkt. Erst langsam, dann Tempo steigern.' },
    { name: 'Stand und Ballwurf', min: 0, text: 'Ohne Schläger: Ballwurf üben, bis der Ball immer an derselben Stelle oben ist.' },
    { name: 'Zweiter Aufschlag', min: 1, text: 'Nur zweite Aufschläge. Ziel: 8 von 10 ins Feld.' },
    { name: 'Aufschlag unter Druck', min: 1, text: 'Satzball simulieren: 3 von 4 Aufschlägen müssen ins Feld.' },
    { name: 'Aufschlag mit Ziel', min: 1, text: 'Drei Zielzonen auf dem Feld. Jeder Treffer in eine Zone zählt einen Punkt.' },
  ],
  Grundlinie: [
    { name: 'Cross-Spiel', min: 0, text: 'Cross-Bälle mit Partner, erst nur Vorhand, dann nur Rückhand.' },
    { name: 'Drei-Zonen-Spiel', min: 0, text: 'Ziele in drei Zonen: tief, Mitte, kurz. Treffer in der Zone zählt einen Punkt.' },
    { name: 'Gleichmäßig spielen', min: 0, text: 'Ballwechsel an der Grundlinie, Ziel: 20 Schläge ohne Fehler.' },
    { name: 'Richtungswechsel', min: 1, text: 'Abwechselnd diagonal und längs spielen, Tempo langsam steigern.' },
    { name: 'Eckenlaufen', min: 1, text: 'Trainer spielt in die Ecken, du läufst und kehrst nach jedem Schlag in die Mitte zurück.' },
    { name: 'Tempo-Wechsel', min: 1, text: 'Abwechselnd langsamer Ball und harter Ball. Ziel: sauber bleiben bei beiden.' },
  ],
  Netzspiel: [
    { name: 'Volley-Wand', min: 0, text: 'Kurze Volleys an die Wand oder zum Partner. 30 Sekunden ohne Fehler zählen.' },
    { name: 'Halbvolley üben', min: 0, text: 'Bälle knapp über dem Boden am Netz kontrolliert zurückspielen.' },
    { name: 'Angriff nach tiefem Ball', min: 1, text: 'Erst Grundlinie, dann ans Netz. Angriff nach jedem tiefen Ball.' },
    { name: 'Zwei gegen einen am Netz', min: 1, text: 'Zwei am Netz gegen einen auf der Grundlinie. Ziel: Punkt am Netz.' },
  ],
  Return: [
    { name: 'Return-Zone', min: 0, text: 'Trainer schlägt Aufschläge, du gibst jeden Return ins Feld.' },
    { name: 'Return mit Schritt', min: 0, text: 'Einen Schritt nach vorne beim Return, Ball früh nehmen.' },
    { name: 'Return-Ziele', min: 1, text: 'Return gezielt in drei Zonen, damit der Gegner unter Druck kommt.' },
    { name: 'Zweiter-Aufschlag-Return', min: 1, text: 'Nur Returns gegen zweite Aufschläge. Ziel: aggressiv und trotzdem sicher.' },
  ],
  Kondition: [
    { name: 'Intervall-Sprints', min: 0, text: '30 Sekunden Sprint zu den Linien, 30 Sekunden gehen. 8 Runden.' },
    { name: 'Koordinationsleiter', min: 0, text: 'Schnelle Füße auf Leiter oder Hütchen, 20 Sekunden pro Übung.' },
    { name: 'Dauer-Rallye', min: 1, text: 'Ballwechsel ohne Fehler so lange wie möglich, dann 30 Sekunden Pause.' },
    { name: 'Spielnahe Belastung', min: 1, text: 'Fünf Ballwechsel voll, dann 40 Sekunden Pause. 6 Serien.' },
  ],
  Mental: [
    { name: 'Punkt-Routine', min: 0, text: 'Vor jedem Aufschlag immer gleich: Ball prellen, atmen, Ziel anschauen.' },
    { name: 'Fehler abhaken', min: 0, text: 'Nach jedem Fehler: einmal atmen, kurz benennen, weiterspielen.' },
    { name: 'Positiv bleiben', min: 0, text: 'Nach jedem gewonnenen Punkt einen Satz über dich sagen, der dir hilft.' },
    { name: 'Satzball-Spiel', min: 1, text: 'Nur Matchsituationen spielen. Jeder Punkt zählt.' },
    { name: 'Druck-Tiebreak', min: 1, text: 'Tiebreak spielen, Zuschauer simulieren, keine Ausreden.' },
  ],
};

// Das Spiel am Ende der Stunde, je Niveau
const SPIELE = [
  'Punktespiel auf halbem Feld, ein Ballwechsel bis 3 Punkte.',
  'Kurzes Satzspiel bis 4 Spiele, mit einer Vorgabe für jeden Punkt.',
];

// --- Zustand: was gerade auf dem Bildschirm passiert (nur im Speicher der Seite) ---
let aktiverTab = 'vor';          // welcher Tab offen ist: 'vor', 'nach' oder 'gegner'
let wiz = null;                  // Stand des geführten Ablaufs „Vor dem Match“
let atem = { timer: null, laeuft: false, fertig: false };  // Stand der Atemübung
let sheetZurueckFn = null;       // Was der Knopf oben links im Formular tut
let toastTimer = null;           // Timer für die kurze Meldung unten

/** Ein frischer Ablauf „Vor dem Match“ (ohne Gegner, Schritt 1). */
function neuerWizard() {
  return {
    schritt: 0,            // 0 bis 3 (siehe SCHRITTE)
    gegnerId: null,        // welcher Gegner gewählt ist
    neuerOffen: false,     // ist das Schnell-Formular „Neuer Gegner“ offen?
    datum: heuteIso(),     // Datum des Matches
    plan: ['', '', ''],    // die drei Matchplan-Punkte
    fertig: false,         // ist „Bereit – los geht’s“ gedrückt?
  };
}

// ==========================================================================
// 2. KLEINE HELFER
// ==========================================================================

/** Kürzel für document.getElementById – spart Tipparbeit. */
function $(id) {
  return document.getElementById(id);
}

/**
 * Baut ein HTML-Element, ohne innerHTML (sicherer, weil nichts als Code interpretiert wird).
 * Beispiel: el('button', { class: 'btn', onclick: fn }, 'Speichern')
 *  - Die erste Angabe ist der Name des Elements (button, p, div ...).
 *  - Dann kommen Eigenschaften wie class, onclick oder value.
 *  - Danach folgen die Inhalte (Text oder weitere Elemente).
 */
function el(tag, eigenschaften = {}, ...kinder) {
  const knoten = document.createElement(tag);
  for (const [name, wert] of Object.entries(eigenschaften)) {
    if (wert === undefined || wert === null || wert === false) continue;
    if (name === 'class') knoten.className = wert;
    else if (name === 'value') knoten.value = wert;          // Eingabefelder: Wert setzen
    else if (name === 'checked') knoten.checked = true;      // Kästchen angehakt
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

/** Heutiges Datum im Format JJJJ-MM-TT (so wie es ein Datumsfeld braucht). */
function heuteIso() {
  const d = new Date();
  const monat = String(d.getMonth() + 1).padStart(2, '0');
  const tag = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${monat}-${tag}`;
}

/** Datum von JJJJ-MM-TT nach TT.MM.JJJJ (deutsche Schreibweise). */
function datumDe(iso) {
  if (!iso) return '';
  const [jahr, monat, tag] = iso.split('-');
  return `${tag}.${monat}.${jahr}`;
}

/** Kurze Meldung unten am Bildschirm, verschwindet nach ca. 2 Sekunden. */
function zeigeToast(text) {
  const toast = $('toast');
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
}

/**
 * Führt eine Speicher-Aktion aus. Klappt sie nicht, zeigt die App eine Meldung.
 * Gibt true zurück, wenn alles geklappt hat.
 */
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

/** Ein Hinweis-Kasten, z. B. „Noch keine Gegner“. */
function hinweis(text) {
  return el('p', { class: 'hinweis' }, text);
}

/** Eine Zeile mit Beschriftung und Text (z. B. „Stärken: …“). */
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

/** Text für das Ergebnis eines Matches, z. B. „6:4, 3:6, 10:7 (Match-Tiebreak)“. */
function ergebnisText(m) {
  return (m.saetze || [])
    .map((s) => `${s.m}:${s.g}${s.tb ? ' (Match-Tiebreak)' : ''}`)
    .join(', ');
}

/** Ein Satzstand ist gültig, wenn er nach Tennisregeln passt (6:0 bis 7:6, bzw. Tiebreak bis 10). */
function satzGueltig(m, g, tiebreak) {
  if (m === g) return false;
  const hoch = Math.max(m, g);
  const tief = Math.min(m, g);
  if (tiebreak) return hoch >= 10 && hoch - tief >= 2;   // Match-Tiebreak: 10:8, 10:7, 12:10 ...
  if (hoch === 6) return tief <= 4;                       // 6:0 bis 6:4
  if (hoch === 7) return tief === 5 || tief === 6;        // 7:5 oder 7:6
  return false;
}

/**
 * Prüft die eingetragenen Sätze und berechnet Sieg oder Niederlage.
 * eingabe: drei Einträge { m, g, tb } als Text aus den Eingabefeldern.
 * Gibt entweder { fehler } oder { saetze, sieg } zurück.
 */
function pruefeErgebnis(eingabe) {
  const sets = [];
  for (let i = 0; i < 3; i++) {
    const roh = eingabe[i];
    const meineLeer = roh.m.trim() === '';
    const gegnerLeer = roh.g.trim() === '';
    if (meineLeer && gegnerLeer) { sets.push(null); continue; }   // Satz nicht gespielt
    if (meineLeer || gegnerLeer) return { fehler: `Bitte trage bei Satz ${i + 1} beide Zahlen ein.` };

    const m = Number(roh.m);
    const g = Number(roh.g);
    if (!Number.isInteger(m) || !Number.isInteger(g) || m < 0 || g < 0) {
      return { fehler: `Satz ${i + 1}: Bitte nur ganze Zahlen eintragen.` };
    }
    const tiebreak = i === 2 && roh.tb;
    if (!satzGueltig(m, g, tiebreak)) {
      return {
        fehler: tiebreak
          ? 'Ein Match-Tiebreak geht bis 10, z. B. 10:7.'
          : `Satz ${i + 1} (${m}:${g}) ist kein gültiger Satzstand. Bei einem Match-Tiebreak bitte das Kästchen anhaken.`,
      };
    }
    sets.push({ m, g, tb: tiebreak });
  }

  if (!sets[0] || !sets[1]) return { fehler: 'Bitte trage mindestens Satz 1 und Satz 2 ein.' };

  // Nach den ersten zwei Sätzen: wer hat wie viele gewonnen?
  const meineNachZweiSaetzen = [sets[0], sets[1]].filter((s) => s.m > s.g).length;

  if (meineNachZweiSaetzen === 1 && !sets[2]) {
    return { fehler: 'Nach zwei Sätzen steht es 1:1. Bitte trage den dritten Satz oder den Match-Tiebreak ein.' };
  }
  if (meineNachZweiSaetzen !== 1 && sets[2]) {
    return { fehler: 'Ein dritter Satz ist hier nicht nötig. Bitte lösche ihn.' };
  }

  // Gesamtergebnis: alle gespielten Sätze zusammen
  const meine = sets.filter((s) => s && s.m > s.g).length;
  const gegner = sets.filter((s) => s && s.g > s.m).length;
  return { saetze: sets.filter(Boolean), sieg: meine > gegner };
}

// ==========================================================================
// 3. DIE TABS
// ==========================================================================

/** Zeichnet den Inhalt des gerade gewählten Tabs neu. */
function render() {
  document.querySelectorAll('.tab').forEach((t) =>
    t.setAttribute('aria-selected', String(t.dataset.tab === aktiverTab)));

  const titel = {
    vor: 'Vor dem Match', nach: 'Nach dem Match', gegner: 'Gegner',
    training: 'Trainer-Modus', koerper: 'Körper', lk: 'LK-Verlauf',
  }[aktiverTab];
  $('titel').textContent = titel;

  const ansichten = {
    vor: ansichtVorMatch, nach: ansichtNachMatch, gegner: ansichtGegner,
    training: ansichtTraining, koerper: ansichtKoerper, lk: ansichtLk,
  };
  const ansicht = ansichten[aktiverTab]();

  $('inhalt').replaceChildren(...[erinnerungKarte(), ansicht].filter(Boolean));
}

// ---------- Tab 1: Vor dem Match (geführter Ablauf in 4 Schritten) ----------

/** Zeigt je nach Schritt die richtige Seite des Ablaufs. */
function ansichtVorMatch() {
  if (!wiz) wiz = neuerWizard();

  // Falls der gewählte Gegner inzwischen gelöscht wurde, zurück zur Auswahl
  if (wiz.gegnerId && !Daten.gegnerPerId(wiz.gegnerId)) {
    wiz.gegnerId = null;
    wiz.schritt = 0;
  }
  // Schritte 2 bis 4 brauchen einen Gegner
  if (!wiz.gegnerId) wiz.schritt = 0;

  if (wiz.fertig) return ansichtFertig();

  const schritt = [ansichtGegnerWahl, ansichtPlan, ansichtAtem, ansichtSatz][wiz.schritt];
  return el('div', { class: 'stack' }, fortschritt(), schritt());
}

/** Die Fortschrittsanzeige oben: Text und vier Balken. */
function fortschritt() {
  return el('div', { class: 'fortschritt' },
    el('p', { class: 'label' }, `Schritt ${wiz.schritt + 1} von ${SCHRITTE.length}: ${SCHRITTE[wiz.schritt]}`),
    el('div', { class: 'balken' },
      SCHRITTE.map((_, i) => el('span', { class: 'segment' + (i <= wiz.schritt ? ' an' : '') }))));
}

/** Die Knopfzeile unten: „Zurück“ (falls möglich) und der Weiter-Knopf. */
function fuss(weiterText, beiWeiter) {
  return el('div', { class: 'fuss' },
    wiz.schritt > 0
      ? el('button', { class: 'btn btn-sekundaer btn-zurueck', onclick: () => wizSchritt(wiz.schritt - 1) }, 'Zurück')
      : null,
    el('button', { class: 'btn btn-primaer', onclick: beiWeiter }, weiterText));
}

/** Springt zu einem anderen Schritt des Ablaufs (stoppt dabei die Atemübung). */
function wizSchritt(nummer) {
  atemStoppen();
  wiz.schritt = nummer;
  render();
}

/** Schritt 1: Gegner wählen oder schnell neu anlegen. */
function ansichtGegnerWahl() {
  // Schon ein Gegner gewählt? Dann zeigen wir seine Infos.
  if (wiz.gegnerId) {
    const g = Daten.gegnerPerId(wiz.gegnerId);
    return el('div', { class: 'stack' },
      el('div', { class: 'karte' },
        el('span', { class: 'label' }, 'Dein Gegner'),
        el('h2', {}, g.name),
        ...gegnerDetailZeilen(g)),
      letzteBegegnung(g),
      el('button', {
        class: 'btn btn-text',
        onclick() { wiz.gegnerId = null; render(); },
      }, 'Anderen Gegner wählen'),
      fuss('Weiter', () => wizSchritt(1)));
  }

  // Noch kein Gegner: Liste aller Gegner zum Antippen
  const liste = Daten.alleGegner();
  const box = el('div', { class: 'stack' },
    el('h2', {}, 'Wen spielst du?'));

  if (!liste.length && !wiz.neuerOffen) {
    box.append(hinweis('Deine Kartei ist noch leer. Lege hier schnell einen Gegner an.'));
  }
  for (const g of liste) {
    box.append(el('button', {
      class: 'karte gegner-wahl',
      onclick() { wiz.gegnerId = g.id; render(); },
    },
      el('strong', {}, g.name),
      el('span', { class: 'muted' }, [g.verein, g.spielstil].filter(Boolean).join(' · ') || 'Ohne Details')));
  }

  // Schnell-Formular für einen neuen Gegner (nur Name ist Pflicht)
  if (wiz.neuerOffen) {
    box.append(schnellGegnerFormular());
  } else {
    box.append(el('button', {
      class: 'btn btn-sekundaer',
      onclick() { wiz.neuerOffen = true; render(); },
    }, '+ Neuen Gegner schnell anlegen'));
  }

  // Ohne gewählten Gegner ist „Weiter“ noch nicht erlaubt
  box.append(fuss('Weiter', () => {
    if (!wiz.gegnerId) zeigeToast('Bitte wähle zuerst einen Gegner.');
    else wizSchritt(1);
  }));
  return box;
}

/** Das kleine Formular, um im Ablauf schnell einen Gegner anzulegen. */
function schnellGegnerFormular() {
  const daten = { name: '', spielstil: '' };
  const fehlerAnzeige = el('p', { class: 'fehler' });
  return el('div', { class: 'karte' },
    el('span', { class: 'label' }, 'Schnell anlegen'),
    feld('Name (Pflicht)', el('input', {
      class: 'input', type: 'text', placeholder: 'z. B. Max Mustermann',
      oninput(e) { daten.name = e.target.value; },
    })),
    el('span', { class: 'label' }, 'Spielstil (optional)'),
    auswahl(SPIELSTILE.map((s) => ({ wert: s, label: s })), '', (wert) => { daten.spielstil = wert; }),
    fehlerAnzeige,
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        if (!daten.name.trim()) { fehlerAnzeige.textContent = 'Bitte gib einen Namen ein.'; return; }
        let neu = null;
        if (versuche(() => {
          neu = Daten.gegnerSpeichern({ name: daten.name.trim(), spielstil: daten.spielstil });
        })) {
          wiz.gegnerId = neu.id;
          wiz.neuerOffen = false;
          render();
        }
      },
    }, 'Anlegen und auswählen'));
}

/** Schritt 2: Matchplan mit genau drei Punkten und dem Datum. */
function ansichtPlan() {
  const g = Daten.gegnerPerId(wiz.gegnerId);
  const letzt = Daten.letztesMatchMitPlan(g.id);

  return el('div', { class: 'stack' },
    el('h2', {}, `Dein Plan gegen ${g.name}`),
    tippsKarte(g),
    el('p', { class: 'muted' }, 'Drei kurze Punkte, die du auf dem Platz umsetzen willst.'),
    letzt
      ? el('button', {
        class: 'btn btn-sekundaer',
        onclick() {
          wiz.plan = [0, 1, 2].map((i) => letzt.matchplan[i] || '');
          render();
        },
      }, 'Punkte vom letzten Match übernehmen')
      : null,
    feld('Datum', el('input', {
      class: 'input', type: 'date', value: wiz.datum,
      oninput(e) { wiz.datum = e.target.value; },
    })),
    ...[0, 1, 2].map((i) => feld(`Punkt ${i + 1}`, el('input', {
      class: 'input', type: 'text', maxlength: '80',
      placeholder: BEISPIELE[i], value: wiz.plan[i],
      oninput(e) { wiz.plan[i] = e.target.value; },
    }))),
    fuss('Weiter', () => {
      if (!wiz.datum) { zeigeToast('Bitte wähle ein Datum.'); return; }
      if (wiz.plan.some((p) => !p.trim())) { zeigeToast('Bitte fülle alle drei Punkte aus.'); return; }
      wizSchritt(2);
    }));
}

/** Schritt 3: Atemübung mit animiertem Kreis. */
function ansichtAtem() {
  const bereit = !atem.laeuft && !atem.fertig;
  return el('div', { class: 'stack' },
    el('h2', {}, 'Atme durch'),
    el('p', { class: 'muted' }, `${ATEM_RUNDEN} Runden: 4 Sekunden einatmen, 6 Sekunden ausatmen.`),
    el('div', { class: 'atem-bereich' },
      el('div', { id: 'atem-kreis', class: 'atem-kreis' }),
      el('p', { id: 'atem-text', class: 'atem-text' },
        atem.fertig ? 'Geschafft. Du bist ruhig.' : (atem.laeuft ? '' : 'Bereit?')),
      el('p', { id: 'atem-runde', class: 'muted' }, atem.fertig ? 'Fertig' : '')),
    bereit ? el('button', { class: 'btn btn-primaer', onclick: atemStart }, 'Starten') : null,
    fuss(atem.fertig ? 'Weiter' : 'Überspringen', () => wizSchritt(3)));
}

/** Startet die Atemübung: Einatmen, Ausatmen, fünfmal. */
function atemStart() {
  atemStoppen();
  atem.laeuft = true;
  atem.fertig = false;
  render();            // zuerst den Kreis zeichnen ...
  atemPhase('ein', 1); // ... dann die erste Phase starten
}

/**
 * Eine Phase der Atemübung: „ein“ (Einatmen) oder „aus“ (Ausatmen).
 * Am Ende ruft sie sich selbst für die nächste Phase auf.
 */
function atemPhase(phase, runde) {
  const kreis = $('atem-kreis');
  const text = $('atem-text');
  const rundeAnzeige = $('atem-runde');
  if (!kreis) return;   // Die Ansicht ist nicht mehr offen – nichts tun

  // Die Animation: beim Einatmen wird der Kreis groß, beim Ausatmen klein
  kreis.style.transitionDuration = phase === 'ein' ? '4s' : '6s';
  kreis.classList.toggle('einatmen', phase === 'ein');
  kreis.classList.toggle('ausatmen', phase === 'aus');
  text.textContent = phase === 'ein' ? 'Einatmen' : 'Ausatmen';
  rundeAnzeige.textContent = `Runde ${runde} von ${ATEM_RUNDEN}`;

  atem.timer = setTimeout(() => {
    if (phase === 'ein') atemPhase('aus', runde);
    else if (runde < ATEM_RUNDEN) atemPhase('ein', runde + 1);
    else atemFertig();
  }, phase === 'ein' ? ATEM_EIN_MS : ATEM_AUS_MS);
}

/** Nach der letzten Runde: Übung ist fertig. */
function atemFertig() {
  atem.timer = null;
  atem.laeuft = false;
  atem.fertig = true;
  render();
}

/** Stoppt die Atemübung (Timer abbrechen). */
function atemStoppen() {
  clearTimeout(atem.timer);
  atem.timer = null;
  atem.laeuft = false;
}

/** Setzt die Atemübung für einen neuen Ablauf zurück. */
function atemZuruecksetzen() {
  atemStoppen();
  atem.fertig = false;
}

/** Schritt 4: der Satz gegen den Druck, groß. Mit dem Plan darunter. */
function ansichtSatz() {
  const g = Daten.gegnerPerId(wiz.gegnerId);
  return el('div', { class: 'stack' },
    el('p', { class: 'label' }, 'Dein Satz gegen den Druck'),
    el('p', { class: 'satz-gross' }, `„${Daten.satzLesen()}“`),
    el('p', { class: 'muted' }, 'Den Satz änderst du in den Einstellungen (Zahnrad oben rechts).'),
    el('div', { class: 'karte' },
      el('span', { class: 'label' }, `Dein Plan gegen ${g.name}`),
      el('ol', {}, wiz.plan.map((p) => el('li', {}, p)))),
    fuss('Bereit – los geht’s', matchStarten));
}

/** Speichert das Match als „geplant“ und zeigt die Bestätigung. */
function matchStarten() {
  if (!wiz.datum) { zeigeToast('Bitte wähle ein Datum.'); return; }
  const erfolg = versuche(() => {
    Daten.matchSpeichern({
      datum: wiz.datum,
      gegnerId: wiz.gegnerId,
      art: '',                              // wird erst bei der Nachbereitung gewählt
      matchplan: wiz.plan.map((p) => p.trim()),
      status: 'geplant',
      saetze: [],
      sieg: null,
      planAuswertung: [null, null, null],
      funktioniert: '',
      nichtFunktioniert: '',
      kopf: null,
    });
  });
  if (erfolg) {
    wiz.fertig = true;
    render();
  }
}

/** Bestätigung nach „Bereit – los geht’s“. */
function ansichtFertig() {
  const g = Daten.gegnerPerId(wiz.gegnerId);
  return el('div', { class: 'stack' },
    el('p', { class: 'satz-gross' }, 'Los geht’s!'),
    el('p', { class: 'muted' },
      `Dein Match gegen ${g ? g.name : 'deinen Gegner'} am ${datumDe(wiz.datum)} ist geplant.`),
    el('p', { class: 'muted' },
      'Nach dem Spiel trägst du das Ergebnis im Tab „Nach dem Match“ ein.'),
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        wiz = neuerWizard();
        atemZuruecksetzen();
        render();
      },
    }, 'Neues Match vorbereiten'));
}

/** Was man vorher über diesen Gegner notiert hat: Bilanz und letztes Match. */
function letzteBegegnung(g) {
  const b = Daten.bilanz(g.id);
  const letzt = Daten.letztesNachbereitetes(g.id);

  const box = el('div', { class: 'karte' },
    el('span', { class: 'label' }, 'Bisher gegen ihn'),
    el('p', {}, `Bilanz: ${b.siege} Siege – ${b.niederlagen} Niederlagen`));

  if (!letzt) {
    box.append(el('p', { class: 'muted' }, 'Ihr habt noch kein nachbereitetes Match gegeneinander gespielt.'));
    return box;
  }
  box.append(
    el('p', { class: 'muted' },
      `Letztes Match am ${datumDe(letzt.datum)}: ${ergebnisText(letzt)} (${letzt.sieg ? 'Sieg' : 'Niederlage'})`));
  if (letzt.funktioniert) box.append(infoZeile('Hat funktioniert', letzt.funktioniert));
  if (letzt.nichtFunktioniert) box.append(infoZeile('Hat nicht funktioniert', letzt.nichtFunktioniert));
  if (letzt.kopf) box.append(infoZeile('Mein Kopf', `${letzt.kopf} von 10`));
  return box;
}

// ---------- Tab 2: Nach dem Match ----------

/** Offene Matches oben, darunter alle vergangenen (nachbereiteten). */
function ansichtNachMatch() {
  const alle = Daten.alleMatches();
  const offen = alle.filter((m) => m.status === 'geplant');
  const vergangen = alle.filter((m) => m.status === 'nachbereitet');

  return el('div', { class: 'stack' },
    el('p', { class: 'sektion-titel' }, 'Offen zur Nachbereitung'),
    ...(offen.length ? offen.map((m) => matchKarte(m)) : [hinweis('Keine offenen Matches. Plane ein Match im Tab „Vor dem Match“.')]),
    el('p', { class: 'sektion-titel' }, 'Vergangene Matches'),
    ...(vergangen.length ? vergangen.map((m) => matchKarte(m)) : [hinweis('Noch keine nachbereiteten Matches.')]));
}

/**
 * Eine Karte für ein Match. Antippen öffnet die Nachbereitung.
 * zurueck: optional, was der Zurück-Knopf im Formular tun soll (z. B. zurück zum Gegner).
 */
function matchKarte(m, zurueck = null) {
  const g = Daten.gegnerPerId(m.gegnerId);
  const offen = m.status === 'geplant';
  return el('button', {
    class: 'karte',
    onclick: () => oeffneMatch(m.id, zurueck),
  },
    el('div', { class: 'kopfzeile' },
      el('strong', {}, g ? g.name : 'Unbekannter Gegner'),
      offen
        ? el('span', { class: 'badge offen' }, 'Offen')
        : el('span', { class: 'badge ' + (m.sieg ? 'sieg' : 'niederlage') }, m.sieg ? 'Sieg' : 'Niederlage')),
    el('p', { class: 'muted' }, `${datumDe(m.datum)} · ${m.art || 'Art offen'}`),
    offen
      ? el('p', { class: 'muted' }, 'Tippen, um das Ergebnis nachzutragen')
      : el('p', {}, ergebnisText(m)));
}

// ---------- Tab 3: Gegner (Kartei) ----------

/** Liste aller Gegner mit Suchfeld und Knopf „Neuer Gegner“. */
function ansichtGegner() {
  const liste = el('div', { class: 'stack' });

  // Zeichnet die Liste neu, je nachdem, was im Suchfeld steht
  function zeichneListe(suchtext) {
    const q = suchtext.trim().toLowerCase();
    const alle = Daten.alleGegner();
    const treffer = q
      ? alle.filter((g) => `${g.name} ${g.verein || ''}`.toLowerCase().includes(q))
      : alle;

    liste.replaceChildren();
    if (!alle.length) liste.append(hinweis('Noch keine Gegner. Lege deinen ersten Gegner an.'));
    else if (!treffer.length) liste.append(hinweis('Kein Gegner gefunden.'));
    for (const g of treffer) liste.append(gegnerKarte(g));
  }
  zeichneListe('');

  return el('div', { class: 'stack' },
    el('input', {
      class: 'input', type: 'search', placeholder: 'Gegner suchen …',
      'aria-label': 'Gegner suchen',
      oninput(e) { zeichneListe(e.target.value); },
    }),
    el('button', { class: 'btn btn-primaer', onclick: () => oeffneGegnerFormular(null) }, '+ Neuer Gegner'),
    liste);
}

/** Eine Karte in der Gegnerliste. */
function gegnerKarte(g) {
  const details = [g.spielstil, g.verein, g.lk ? `LK ${g.lk}` : ''].filter(Boolean).join(' · ');
  return el('button', { class: 'karte', onclick: () => oeffneGegnerDetail(g.id) },
    el('strong', { class: 'gegner-name' }, g.name),
    el('span', { class: 'muted' }, details || 'Noch keine Details'));
}

/** Die Angaben zu einem Gegner (Spielstil, Stärken, ...). Leere Felder werden weggelassen. */
function gegnerDetailZeilen(g) {
  const eintraege = [
    ['Spielstil', g.spielstil],
    ['Verein', g.verein],
    ['LK', g.lk ? `LK ${g.lk}` : ''],
    ['Stärken', g.staerken],
    ['Schwächen', g.schwaechen],
    ['Notizen', g.notizen],
  ].filter(([, wert]) => wert && String(wert).trim());

  if (!eintraege.length) return [hinweis('Noch keine Angaben. Bearbeite den Gegner, um Stärken und Schwächen einzutragen.')];
  return eintraege.map(([name, wert]) => infoZeile(name, wert));
}

// ==========================================================================
// 4. FORMULARE UND EINSTELLUNGEN
// ==========================================================================

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

/**
 * Die eigene Bestätigung in der App (statt des Browser-Dialogs).
 * Gibt ein Versprechen zurück: true, wenn der Nutzer „Ja“ drückt, sonst false.
 */
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

/** Formular zum Anlegen oder Bearbeiten eines Gegners. g = null bedeutet „neu“. */
function oeffneGegnerFormular(g) {
  const daten = {
    name: g?.name || '',
    verein: g?.verein || '',
    lk: g?.lk || '',
    spielstil: g?.spielstil || '',
    staerken: g?.staerken || '',
    schwaechen: g?.schwaechen || '',
    notizen: g?.notizen || '',
  };
  const fehlerAnzeige = el('p', { class: 'fehler' });

  const speichern = () => {
    if (!daten.name.trim()) { fehlerAnzeige.textContent = 'Bitte gib einen Namen ein.'; return; }
    const eintrag = {
      name: daten.name.trim(),
      verein: daten.verein.trim(),
      lk: daten.lk.trim(),
      spielstil: daten.spielstil,
      staerken: daten.staerken.trim(),
      schwaechen: daten.schwaechen.trim(),
      notizen: daten.notizen.trim(),
    };
    if (g) eintrag.id = g.id;
    if (versuche(() => Daten.gegnerSpeichern(eintrag))) {
      zeigeToast('Gegner gespeichert');
      render();
      if (g) oeffneGegnerDetail(g.id);   // zurück zur Detailansicht
      else schliesseSheet();
    }
  };

  const formular = el('div', { class: 'stack' },
    feld('Name (Pflicht)', el('input', {
      class: 'input', type: 'text', value: daten.name, placeholder: 'z. B. Max Mustermann',
      oninput(e) { daten.name = e.target.value; },
    })),
    feld('Verein', el('input', {
      class: 'input', type: 'text', value: daten.verein, placeholder: 'z. B. TC Musterstadt',
      oninput(e) { daten.verein = e.target.value; },
    })),
    feld('LK (optional)', el('input', {
      class: 'input', type: 'text', inputmode: 'numeric', value: daten.lk, placeholder: 'z. B. 14',
      oninput(e) { daten.lk = e.target.value; },
    })),
    el('span', { class: 'label' }, 'Spielstil'),
    auswahl(SPIELSTILE.map((s) => ({ wert: s, label: s })), daten.spielstil, (wert) => { daten.spielstil = wert; }),
    feld('Stärken', el('textarea', {
      class: 'textarea', value: daten.staerken, placeholder: 'Was kann er gut?',
      oninput(e) { daten.staerken = e.target.value; },
    })),
    feld('Schwächen', el('textarea', {
      class: 'textarea', value: daten.schwaechen, placeholder: 'Wo ist er verwundbar?',
      oninput(e) { daten.schwaechen = e.target.value; },
    })),
    feld('Freie Notizen', el('textarea', {
      class: 'textarea', value: daten.notizen,
      oninput(e) { daten.notizen = e.target.value; },
    })),
    fehlerAnzeige,
    el('button', { class: 'btn btn-primaer', onclick: speichern }, 'Speichern'));

  oeffneSheet(g ? 'Gegner bearbeiten' : 'Neuer Gegner', formular, g ? () => oeffneGegnerDetail(g.id) : null);
}

/** Detailansicht eines Gegners: Bilanz, Angaben, alle Matches gegen ihn. */
function oeffneGegnerDetail(id) {
  const g = Daten.gegnerPerId(id);
  if (!g) return;
  const b = Daten.bilanz(g.id);
  const matches = Daten.matchesVon(g.id);
  const zurueckZuGegner = () => oeffneGegnerDetail(g.id);

  const inhalt = el('div', { class: 'stack' },
    el('div', { class: 'bilanz-karte' },
      el('span', { class: 'label' }, 'Bilanz (Siege – Niederlagen)'),
      el('span', { class: 'bilanz-zahl' }, `${b.siege} – ${b.niederlagen}`)),
    el('div', { class: 'karte' }, ...gegnerDetailZeilen(g)),
    tippsKarte(g),
    el('p', { class: 'sektion-titel' }, 'Matches gegen ihn'),
    ...(matches.length
      ? matches.map((m) => matchKarte(m, zurueckZuGegner))
      : [hinweis('Noch keine Matches gegen ihn.')]),
    el('div', { class: 'knopf-reihe' },
      el('button', { class: 'btn btn-sekundaer', onclick: () => oeffneGegnerFormular(g) }, 'Bearbeiten'),
      el('button', { class: 'btn btn-gefahr', onclick: () => gegnerLoeschenMitFrage(g) }, 'Löschen')));

  oeffneSheet(g.name, inhalt, null);
}

/** Fragt nach, bevor ein Gegner gelöscht wird. Seine Matches bleiben erhalten. */
async function gegnerLoeschenMitFrage(g) {
  const ja = await fragen({
    titel: 'Gegner löschen?',
    text: `„${g.name}“ wird aus der Kartei entfernt. Seine Matches bleiben erhalten.`,
    ok: 'Löschen',
    gefahr: true,
  });
  if (!ja) return;
  if (versuche(() => Daten.gegnerLoeschen(g.id))) {
    schliesseSheet();
    zeigeToast('Gegner gelöscht');
    render();
  }
}

/** Öffnet die Nachbereitung eines Matches (oder das Bearbeiten eines alten). */
function oeffneMatch(id, zurueck = null) {
  const m = Daten.matchPerId(id);
  if (!m) return;
  oeffneSheet(m.status === 'geplant' ? 'Nachbereitung' : 'Match bearbeiten', matchFormular(m, zurueck), zurueck);
}

/**
 * Das Formular für die Nachbereitung: Ergebnis, Art, Matchplan-Auswertung und die drei Fragen.
 * Dasselbe Formular dient auch zum Bearbeiten eines bereits nachbereiteten Matches.
 */
function matchFormular(m, zurueck) {
  const g = Daten.gegnerPerId(m.gegnerId);

  // Zwischenspeicher für alle Eingaben. Erst beim Speichern wird geprüft.
  const f = {
    datum: m.datum || heuteIso(),
    art: m.art || '',
    saetze: [0, 1, 2].map((i) => {
      const s = (m.saetze || [])[i];
      return { m: s ? String(s.m) : '', g: s ? String(s.g) : '', tb: !!(s && s.tb) };
    }),
    plan: [0, 1, 2].map((i) => (m.planAuswertung || [])[i] || ''),
    funktioniert: m.funktioniert || '',
    nichtFunktioniert: m.nichtFunktioniert || '',
    kopf: m.kopf || 5,
  };

  // Zeigt live „Sieg“ oder „Niederlage“, sobald das Ergebnis passt
  const ergebnisAnzeige = el('p', { class: 'ergebnis' });
  const fehlerAnzeige = el('p', { class: 'fehler' });
  const aktualisiere = () => {
    const r = pruefeErgebnis(f.saetze);
    ergebnisAnzeige.textContent = r.fehler ? '' : `Ergebnis: ${r.sieg ? 'Sieg' : 'Niederlage'}`;
  };

  // Eine Zeile pro Satz: meine Spiele : Spiele des Gegners
  const satzZeilen = f.saetze.map((s, i) => el('div', { class: 'satz-zeile' },
    el('span', { class: 'satz-name' }, i === 2 ? 'Satz 3' : `Satz ${i + 1}`),
    el('input', {
      class: 'input zahl', type: 'number', inputmode: 'numeric', min: '0', max: '99',
      value: s.m, 'aria-label': `Satz ${i + 1}, meine Spiele`,
      oninput(e) { s.m = e.target.value; aktualisiere(); },
    }),
    el('span', { class: 'doppelpunkt' }, ':'),
    el('input', {
      class: 'input zahl', type: 'number', inputmode: 'numeric', min: '0', max: '99',
      value: s.g, 'aria-label': `Satz ${i + 1}, Spiele Gegner`,
      oninput(e) { s.g = e.target.value; aktualisiere(); },
    })));

  // Regler für den Kopf (1 bis 10)
  const kopfWert = el('span', { class: 'regler-wert' }, String(f.kopf));
  const regler = el('input', {
    class: 'regler', type: 'range', min: '1', max: '10', step: '1', value: String(f.kopf),
    oninput(e) { f.kopf = Number(e.target.value); kopfWert.textContent = String(f.kopf); },
  });

  const speichern = () => {
    fehlerAnzeige.textContent = '';
    if (!f.datum) { fehlerAnzeige.textContent = 'Bitte wähle ein Datum.'; return; }
    if (!f.art) { fehlerAnzeige.textContent = 'Bitte wähle die Art des Matches.'; return; }
    const r = pruefeErgebnis(f.saetze);
    if (r.fehler) { fehlerAnzeige.textContent = r.fehler; return; }

    const eintrag = {
      id: m.id,
      datum: f.datum,
      gegnerId: m.gegnerId,
      art: f.art,
      matchplan: m.matchplan || ['', '', ''],
      status: 'nachbereitet',
      saetze: r.saetze,
      sieg: r.sieg,
      planAuswertung: f.plan.map((p) => p || null),
      funktioniert: f.funktioniert.trim(),
      nichtFunktioniert: f.nichtFunktioniert.trim(),
      kopf: f.kopf,
    };
    if (versuche(() => Daten.matchSpeichern(eintrag))) {
      zeigeToast('Nachbereitung gespeichert');
      render();
      if (zurueck) zurueck();
      else schliesseSheet();
    }
  };

  aktualisiere();

  return el('div', { class: 'stack' },
    el('p', { class: 'muted' }, `Gegen ${g ? g.name : 'unbekannten Gegner'}`),
    feld('Datum', el('input', {
      class: 'input', type: 'date', value: f.datum,
      oninput(e) { f.datum = e.target.value; },
    })),
    el('span', { class: 'label' }, 'Art'),
    auswahl(ARTEN.map((a) => ({ wert: a, label: a })), f.art, (wert) => { f.art = wert; }),
    el('span', { class: 'label' }, 'Ergebnis (meine Spiele : Gegner)'),
    ...satzZeilen,
    el('label', { class: 'check' },
      el('input', {
        type: 'checkbox', checked: f.saetze[2].tb,
        onchange(e) { f.saetze[2].tb = e.target.checked; aktualisiere(); },
      }),
      'Dritter Satz ist Match-Tiebreak (bis 10)'),
    ergebnisAnzeige,
    el('span', { class: 'label' }, 'Matchplan: wie umgesetzt?'),
    ...[0, 1, 2].map((i) => el('div', { class: 'karte' },
      el('p', {}, `${i + 1}. ${(m.matchplan && m.matchplan[i]) || '–'}`),
      auswahl([
        { wert: 'ja', label: 'Ja' },
        { wert: 'teilweise', label: 'Teilweise' },
        { wert: 'nein', label: 'Nein' },
      ], f.plan[i], (wert) => { f.plan[i] = wert; }))),
    feld('Was hat funktioniert?', el('textarea', {
      class: 'textarea', value: f.funktioniert,
      oninput(e) { f.funktioniert = e.target.value; },
    })),
    feld('Was hat nicht funktioniert?', el('textarea', {
      class: 'textarea', value: f.nichtFunktioniert,
      oninput(e) { f.nichtFunktioniert = e.target.value; },
    })),
    el('div', { class: 'feld' },
      el('span', { class: 'label' }, 'Wie war mein Kopf? (1 bis 10)'),
      el('div', { class: 'reglerzeile' }, regler, kopfWert)),
    fehlerAnzeige,
    el('button', { class: 'btn btn-primaer', onclick: speichern }, 'Nachbereitung speichern'));
}

/** Die Einstellungen (Zahnrad): Satz, Sichern, Wiederherstellen, Alles löschen. */
function oeffneEinstellungen() {
  const satzFeld = el('textarea', { class: 'textarea', value: Daten.satzLesen(), maxlength: '200' });

  const inhalt = el('div', { class: 'stack' },
    el('p', { class: 'sektion-titel' }, 'Dein Satz gegen den Druck'),
    satzFeld,
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        const text = satzFeld.value.trim();
        if (!text) { zeigeToast('Bitte gib einen Satz ein.'); return; }
        if (versuche(() => Daten.satzSpeichern(text))) zeigeToast('Satz gespeichert');
      },
    }, 'Satz speichern'),

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
  link.download = `tennis-match-sicherung-${heuteIso()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  Daten.einstellungSpeichern('letzteSicherung', new Date().toISOString());   // für die Erinnerung
  zeigeToast('Sicherung wird heruntergeladen');
  render();   // Erinnerung verschwindet sofort
}

/** Erinnerung an die Sicherung: erscheint, wenn die letzte Sicherung 14 Tage oder älter ist. */
function erinnerungKarte() {
  const jetzt = Date.now();
  const aufgeschoben = Daten.einstellungLesen('erinnerungAufschieben');
  if (aufgeschoben && new Date(aufgeschoben).getTime() > jetzt) return null;

  const hatDaten = Daten.alleMatches().length > 0 || Daten.alleGegner().length > 0;
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
      wiz = neuerWizard();
      atemZuruecksetzen();
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
    text: 'Alle Gegner und alle Matches werden entfernt.',
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
    wiz = neuerWizard();
    atemZuruecksetzen();
    schliesseSheet();
    zeigeToast('Alle Daten gelöscht');
    render();
  }
}

// ==========================================================================
// 5. START DER APP
// ==========================================================================

/** Richtet die festen Knöpfe ein (Tab-Leiste, Zahnrad, Formular-Fenster). */
// ==========================================================================
// 5. TIPPS, TRAINER, KÖRPER, LK (alles offline, ohne Internet)
// ==========================================================================

/** Wie viele Tage ein Datum (JJJJ-MM-TT) her ist. Heute = 0. */
function tageSeit(iso) {
  if (!iso) return 9999;
  const heute = new Date(heuteIso() + 'T00:00:00');
  const tag = new Date(iso + 'T00:00:00');
  return Math.round((heute - tag) / 86400000);
}

/** Belastungspunkte eines Eintrags: Minuten mal Intensität (1 bis 10), geteilt durch 10. */
function belastungsPunkte(e) {
  return Math.round((Number(e.minuten) || 0) * (Number(e.intensitaet) || 0) / 10);
}

/** Tipps aus dem Körper-Tab: viel Belastung oder wenig Schlaf in der letzten Zeit. */
function koerperTipps() {
  const tipps = [];
  const letzte = Daten.listeAlle('belastung');
  const woche = letzte.filter((e) => tageSeit(e.datum) <= 7);
  const punkte = woche.reduce((summe, e) => summe + belastungsPunkte(e), 0);
  if (punkte >= 400) tipps.push('Du hattest in den letzten 7 Tagen viel Belastung. Plane vor dem Match lieber einen ruhigen Tag ein.');
  const schlaf = letzte.slice(0, 3).map((e) => Number(e.schlaf)).filter((s) => s > 0);
  if (schlaf.length && schlaf.reduce((a, b) => a + b, 0) / schlaf.length < 7) {
    tipps.push('Du schläfst in letzter Zeit unter 7 Stunden. Nimm dir vor dem Match ruhige Atemzüge.');
  }
  return tipps;
}

/** Tipps zu einem Gegner und zu dir, sortiert nach Taktik, Kopf, Körper und Training. */
function tippsFuer(g) {
  const t = { taktik: [], kopf: [], koerper: koerperTipps(), training: [] };

  // Notizen zum Gegner
  if (g.schwaechen && g.schwaechen.trim()) t.taktik.push(`Seine Schwächen laut deinen Notizen: ${g.schwaechen.trim()}. Spiel gezielt darauf.`);
  if (g.staerken && g.staerken.trim()) t.taktik.push(`Seine Stärken: ${g.staerken.trim()}. Nimm ihm diese Waffe, wenn du kannst.`);

  // Tipp je nach Spielstil
  const stilTipps = {
    'Grundlinienspieler': 'Er spielt von der Grundlinie: Nimm ihm mit Tempowechsel den Rhythmus und geh ab und zu ans Netz.',
    'Angreifer/Netzspieler': 'Er kommt ans Netz: Übe Passierbälle und halte den Lob sauber.',
    'Konterspieler': 'Er wartet auf deinen Fehler: Spiel geduldig und erzwinge den Punkt nicht zu früh.',
    'Aufschlagspieler': 'Er lebt vom Aufschlag: Nimm den Return früh und bring den Ball ins Spiel.',
    'Allrounder': 'Er wechselt viel: Halte deine eigene Linie und warte auf den passenden Ball.',
  };
  if (stilTipps[g.spielstil]) t.taktik.push(stilTipps[g.spielstil]);

  const spiele = Daten.matchesVon(g.id).filter((m) => m.status === 'nachbereitet');
  if (!spiele.length) {
    t.training.push('Nach dem nächsten Match trägst du das Ergebnis ein. Dann bekommst du hier Tipps aus deiner Bilanz.');
    return t;
  }

  // Bilanz und letzte Matches
  const b = Daten.bilanz(g.id);
  if (b.niederlagen > b.siege) t.taktik.push(`Du hast gegen ihn öfter verloren (${b.siege} : ${b.niederlagen}). Starte den Plan mit dem Punkt, den du sicher umsetzen kannst.`);
  const letzt = spiele[0];
  if (letzt.nichtFunktioniert) t.taktik.push(`Letztes Mal hat nicht geklappt: „${letzt.nichtFunktioniert}“. Probiere dieses Mal eine andere Idee.`);
  if (letzt.funktioniert) t.taktik.push(`Letztes Mal hat geklappt: „${letzt.funktioniert}“. Behalte das bei.`);
  if ((letzt.planAuswertung || []).filter((p) => p === 'nein').length >= 2) {
    t.taktik.push('Im letzten Match hat der Plan oft nicht geklappt. Nimm dieses Mal nur zwei Punkte und wiederhole sie.');
  }

  // Kopf: Druck, Atem, Serie von Niederlagen
  const koepfe = spiele.map((m) => m.kopf).filter((k) => typeof k === 'number');
  if (koepfe.length) {
    const schnitt = koepfe.reduce((a, c) => a + c, 0) / koepfe.length;
    if (schnitt < 5) t.kopf.push(`Dein Kopf war in deinen Matches im Schnitt bei ${schnitt.toFixed(1).replace('.', ',')} von 10. Plane die Atemübung fest ein.`);
    if (letzt.kopf && letzt.kopf < 4) t.kopf.push('Beim letzten Match warst du unter Druck. Starte mit der Atemübung und lies deinen Satz gegen den Druck.');
  }
  if (spiele.length >= 2 && spiele[0].sieg === false && spiele[1].sieg === false) {
    t.kopf.push('Zwei Niederlagen in Folge gegen ihn. Denk an deinen Satz und nicht an das alte Ergebnis.');
  }
  if (b.siege > 0 && b.niederlagen === 0) t.kopf.push('Du hast gegen ihn bisher gewonnen. Bleib konzentriert und spiel deinen Plan.');

  // Training: passende Ziele aus Schwächen und Notizen
  const text = `${g.schwaechen || ''} ${letzt.nichtFunktioniert || ''}`.toLowerCase();
  const zuZiel = [
    [/aufschlag/, 'Aufschlag'], [/return/, 'Return'], [/volley|netz/, 'Netzspiel'],
    [/vorhand|rückhand|grundlinie|tempo/, 'Grundlinie'], [/kondition|ausdauer|kraft|laufen/, 'Kondition'],
    [/kopf|nerv|druck|mental/, 'Mental'],
  ];
  for (const [muster, ziel] of zuZiel) {
    if (muster.test(text)) t.training.push(`Übe das Ziel „${ziel}“ im Trainer-Modus, damit du beim nächsten Mal besser vorbereitet bist.`);
  }

  return t;
}

/** Die Tipps als Karte, nach Abschnitten. Gibt null zurück, wenn es nichts zu sagen gibt. */
function tippsKarte(g) {
  const t = tippsFuer(g);
  const abschnitte = [['Taktik', t.taktik], ['Kopf', t.kopf], ['Körper', t.koerper], ['Training', t.training]]
    .filter(([, liste]) => liste.length);
  if (!abschnitte.length) return null;
  return el('div', { class: 'karte' },
    el('span', { class: 'label' }, 'Tipps für dich'),
    ...abschnitte.flatMap(([titel, liste]) => [
      el('p', { class: 'sektion-titel' }, titel),
      ...liste.map((x) => el('p', {}, `• ${x}`)),
    ]));
}

/** Ein Regler mit Anzeige des Wertes (z. B. Intensität 1 bis 10). */
function reglerFeld(beschriftung, min, max, start, onWahl) {
  const anzeige = el('span', { class: 'regler-wert' }, String(start));
  const regler = el('input', {
    class: 'regler', type: 'range', min: String(min), max: String(max), step: '1', value: String(start),
    'aria-label': beschriftung,
    oninput(e) {
      const wert = Number(e.target.value);
      anzeige.textContent = String(wert);
      onWahl(wert);
    },
  });
  return el('div', { class: 'feld' },
    el('span', { class: 'label' }, beschriftung),
    el('div', { class: 'reglerzeile' }, regler, anzeige));
}

// ---------- Tab: Training (Trainer-Modus) ----------

// Zustand des Trainer-Modus (bleibt beim Tab-Wechsel erhalten)
let trainer = { gruppe: 4, niveau: 'Anfänger', ziel: 'Aufschlag', dauer: 60, plan: null };

/** Hinweis zur Gruppengröße. */
function gruppenHinweis(n) {
  if (n <= 1) return 'Einzeltraining: Übungen mit Ballmaschine oder Balleimer, ohne Gegner.';
  if (n <= 4) return `Kleine Gruppe (${n} Personen): Alle üben gleichzeitig, nach jeder Übung die Partner wechseln.`;
  return `Große Gruppe (${n} Personen): Bildet ${Math.ceil(n / 2)} Stationen zu zweit und wechselt nach jeder Übung.`;
}

/** Mischt eine Liste zufällig (Fisher-Yates), damit jede neue Stunde anders ist. */
function mischen(liste) {
  const kopie = liste.slice();
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

/**
 * Erstellt eine Trainingsstunde aus Gruppe, Niveau, Ziel und Dauer.
 * Aufbau: Aufwärmen 10 Min, Übungen, Spiel 10 Min, Ausklang.
 */
function trainingsplanErstellen({ gruppe, niveau, ziel, dauer }) {
  const niv = NIVEAUS.indexOf(niveau);
  const aufwaermen = 10;
  const spiel = 10;
  const ausklang = 10;
  const haupt = dauer - aufwaermen - spiel - ausklang;      // 60 Min → 30 Min Übungen
  const passend = mischen(UEBUNGEN[ziel].filter((u) => u.min <= niv));
  // Höchstens so viele Übungen, wie es für das Niveau gibt (keine Wiederholungen)
  const anzahl = Math.min(4, passend.length, Math.max(1, Math.floor(haupt / 10)));
  const minuten = Math.floor(haupt / anzahl);

  const bloecke = [{ titel: 'Aufwärmen', minuten: aufwaermen, text: 'Locker einlaufen, Grundschläge über das Netz, dann Beweglichkeit.' }];
  for (let i = 0; i < anzahl; i++) {
    const u = passend[i];
    bloecke.push({ titel: `Übung ${i + 1}: ${u.name}`, minuten, text: u.text });
  }
  bloecke.push({ titel: 'Spiel', minuten: spiel, text: SPIELE[niv] });
  bloecke.push({ titel: 'Ausklang', minuten: dauer - aufwaermen - spiel - minuten * anzahl, text: 'Auslaufen, dehnen, kurz besprechen: Was lief gut, was nehmen wir mit?' });

  return { gruppe, niveau, ziel, dauer, gruppenHinweis: gruppenHinweis(gruppe), bloecke };
}

/** Eine fertige Trainingsstunde als Karte mit allen Blöcken. */
function trainingsstundeKarte(plan, mitSpeichern) {
  return el('div', { class: 'karte' },
    el('span', { class: 'label' }, `${plan.dauer} Min · ${plan.niveau} · ${plan.ziel}`),
    el('p', { class: 'muted' }, plan.gruppenHinweis),
    ...plan.bloecke.map((b) => el('div', { class: 'zeile' },
      el('span', { class: 'label' }, `${b.minuten} Min · ${b.titel}`),
      el('p', {}, b.text))),
    mitSpeichern
      ? el('div', { class: 'knopf-reihe' },
        el('button', { class: 'btn btn-primaer', onclick: () => speichereStunde(plan) }, 'Stunde speichern'),
        el('button', { class: 'btn btn-sekundaer', onclick: erstelleNeueStunde }, 'Neue Stunde'))
      : null);
}

/** Speichert die erstellte Stunde in der Liste „Gespeicherte Stunden“. */
function speichereStunde(plan) {
  const eintrag = { datum: heuteIso(), ...plan };
  if (versuche(() => Daten.listeSpeichern('trainingsstunden', eintrag))) {
    zeigeToast('Trainingsstunde gespeichert');
    render();
  }
}

/** Erstellt eine neue Stunde. Möglichst andere Übungen als die bisherige (bis zu 6 Versuche). */
function erstelleNeueStunde() {
  const namen = (p) => p.bloecke
    .filter((b) => b.titel.startsWith('Übung'))
    .map((b) => b.titel.replace(/^Übung \d+: /, ''))
    .sort()
    .join('|');
  const alt = trainer.plan ? namen(trainer.plan) : '';
  let plan;
  for (let i = 0; i < 6; i++) {
    plan = trainingsplanErstellen({ ...trainer });
    if (namen(plan) !== alt) break;
  }
  trainer.plan = plan;
  render();
}

/** Der Tab „Training“: Formular, fertige Stunde und gespeicherte Stunden. */
function ansichtTraining() {
  const gespeichert = Daten.listeAlle('trainingsstunden');
  return el('div', { class: 'stack' },
    el('p', { class: 'muted' }, 'Gib deine Gruppe an. Dann bekommst du eine passende Trainingsstunde.'),
    feld('Anzahl Spieler', el('input', {
      class: 'input zahl', type: 'number', inputmode: 'numeric', min: '1', max: '30',
      value: String(trainer.gruppe),
      oninput(e) { trainer.gruppe = Math.max(1, Number(e.target.value) || 1); },
    })),
    el('span', { class: 'label' }, 'Niveau'),
    auswahl(NIVEAUS.map((n) => ({ wert: n, label: n })), trainer.niveau, (w) => { trainer.niveau = w; }),
    el('span', { class: 'label' }, 'Ziel'),
    auswahl(ZIELE.map((z) => ({ wert: z, label: z })), trainer.ziel, (w) => { trainer.ziel = w; }),
    el('span', { class: 'label' }, 'Dauer'),
    auswahl(DAUERN.map((d) => ({ wert: d, label: `${d} Min` })), trainer.dauer, (w) => { trainer.dauer = w; }),
    el('button', { class: 'btn btn-primaer', onclick: erstelleNeueStunde },
      trainer.plan ? 'Neue Stunde (andere Übungen)' : 'Trainingsstunde erstellen'),
    trainer.plan ? trainingsstundeKarte(trainer.plan, true) : null,
    el('p', { class: 'sektion-titel' }, 'Gespeicherte Stunden'),
    ...(gespeichert.length
      ? gespeichert.map((s) => el('button', { class: 'karte', onclick: () => oeffneStunde(s) },
        el('strong', { class: 'gegner-name' }, `${s.ziel} · ${s.dauer} Min`),
        el('span', { class: 'muted' }, `${datumDe(s.datum)} · ${s.niveau} · ${s.gruppe} Spieler`)))
      : [hinweis('Noch keine gespeicherte Stunde.')]));
}

/** Eine gespeicherte Stunde im Formular-Fenster, mit Löschen. */
function oeffneStunde(s) {
  const inhalt = el('div', { class: 'stack' },
    trainingsstundeKarte(s, false),
    el('button', { class: 'btn btn-gefahr', onclick: () => stundeLoeschenMitFrage(s) }, 'Stunde löschen'));
  oeffneSheet(datumDe(s.datum), inhalt, null);
}

async function stundeLoeschenMitFrage(s) {
  const ja = await fragen({ titel: 'Stunde löschen?', text: 'Die gespeicherte Trainingsstunde wird gelöscht.', ok: 'Löschen', gefahr: true });
  if (!ja) return;
  if (versuche(() => Daten.listeLoeschen('trainingsstunden', s.id))) {
    schliesseSheet();
    zeigeToast('Stunde gelöscht');
    render();
  }
}

// ---------- Tab: Körper (Belastungs-Tracker) ----------

/** Der Tab „Körper“: Wochenbelastung, Ampel und Liste der Einträge. */
function ansichtKoerper() {
  const liste = Daten.listeAlle('belastung');
  const woche = liste.filter((e) => tageSeit(e.datum) <= 7);
  const punkte = woche.reduce((summe, e) => summe + belastungsPunkte(e), 0);
  const ampel = punkte >= 400 ? 'hoch' : punkte >= 200 ? 'mittel' : 'niedrig';

  return el('div', { class: 'stack' },
    el('div', { class: 'bilanz-karte' },
      el('span', { class: 'label' }, 'Belastung letzte 7 Tage'),
      el('span', { class: 'bilanz-zahl' }, `${punkte} Punkte`),
      el('span', { class: 'muted' }, `Belastung: ${ampel}`)),
    ...koerperTipps().map((t) => el('div', { class: 'karte' }, t)),
    el('button', { class: 'btn btn-primaer', onclick: () => oeffneBelastung(null) }, '+ Eintrag hinzufügen'),
    el('p', { class: 'sektion-titel' }, 'Einträge'),
    ...(liste.length
      ? liste.map((e) => el('button', { class: 'karte', onclick: () => oeffneBelastung(e) },
        el('strong', { class: 'gegner-name' }, `${datumDe(e.datum)} · ${e.typ}`),
        el('span', { class: 'muted' }, `${e.minuten || 0} Min · Intensität ${e.intensitaet} · Schlaf ${e.schlaf || '–'} h`)))
      : [hinweis('Noch keine Einträge. Trage nach jedem Training oder Match ein, wie du dich fühlst.')]));
}

/** Formular für einen Belastungs-Eintrag. e = null bedeutet „neu“. */
function oeffneBelastung(e) {
  const f = {
    datum: e?.datum || heuteIso(),
    typ: e?.typ || 'Training',
    minuten: e?.minuten ?? 60,
    intensitaet: e?.intensitaet ?? 6,
    schlaf: e?.schlaf ?? 7,
    erholung: e?.erholung ?? 5,
    notiz: e?.notiz || '',
  };

  const inhalt = el('div', { class: 'stack' },
    feld('Datum', el('input', { class: 'input', type: 'date', value: f.datum, oninput(ev) { f.datum = ev.target.value; } })),
    el('span', { class: 'label' }, 'Art'),
    auswahl(KOERPER_TYPEN.map((t) => ({ wert: t, label: t })), f.typ, (w) => { f.typ = w; }),
    feld('Dauer in Minuten', el('input', { class: 'input zahl', type: 'number', inputmode: 'numeric', min: '0', max: '600', value: String(f.minuten), oninput(ev) { f.minuten = Number(ev.target.value) || 0; } })),
    reglerFeld('Intensität (1 = locker, 10 = maximal)', 1, 10, f.intensitaet, (w) => { f.intensitaet = w; }),
    feld('Schlaf letzte Nacht (Stunden)', el('input', { class: 'input zahl', type: 'number', inputmode: 'decimal', min: '0', max: '14', step: '0.5', value: String(f.schlaf), oninput(ev) { f.schlaf = Number(ev.target.value) || 0; } })),
    reglerFeld('Wie erholt fühlst du dich? (1 = kaputt, 10 = super)', 1, 10, f.erholung, (w) => { f.erholung = w; }),
    feld('Notiz (optional)', el('input', { class: 'input', type: 'text', maxlength: '120', value: f.notiz, oninput(ev) { f.notiz = ev.target.value; } })),
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        if (!f.datum) { zeigeToast('Bitte wähle ein Datum.'); return; }
        const eintrag = { ...f, id: e?.id };
        if (versuche(() => Daten.listeSpeichern('belastung', eintrag))) {
          schliesseSheet();
          zeigeToast('Gespeichert');
          render();
        }
      },
    }, 'Speichern'),
    e ? el('button', { class: 'btn btn-gefahr', onclick: () => belastungLoeschenMitFrage(e) }, 'Eintrag löschen') : null);

  oeffneSheet(e ? 'Eintrag bearbeiten' : 'Neuer Eintrag', inhalt, null);
}

async function belastungLoeschenMitFrage(e) {
  const ja = await fragen({ titel: 'Eintrag löschen?', text: 'Der Eintrag wird gelöscht.', ok: 'Löschen', gefahr: true });
  if (!ja) return;
  if (versuche(() => Daten.listeLoeschen('belastung', e.id))) {
    schliesseSheet();
    zeigeToast('Eintrag gelöscht');
    render();
  }
}

// ---------- Tab: LK (LK-Verlauf) ----------

/** Wandelt „13,2“ in eine Zahl (13.2). */
function lkZahl(text) {
  return Number(String(text).replace(',', '.'));
}

/** Der Tab „LK“: Verlauf der eingetragenen LK, zusammen mit den Matches. */
function ansichtLk() {
  const lkEintraege = Daten.listeAlle('lk');
  const matches = Daten.alleMatches().filter((m) => m.status === 'nachbereitet');

  // Eine gemeinsame Liste aus LK-Einträgen und Matches, neueste zuerst
  const verlauf = [
    ...lkEintraege.map((e) => ({
      datum: e.datum, titel: `LK ${e.wert}`, text: e.anlass || 'LK-Eintrag',
      klick: () => oeffneLk(e),                    // LK-Einträge lassen sich antippen und ändern
    })),
    ...matches.map((m) => {
      const gegner = Daten.gegnerPerId(m.gegnerId);
      return {
        datum: m.datum,
        titel: m.sieg ? 'Sieg' : 'Niederlage',
        text: `${gegner ? gegner.name : 'Unbekannter Gegner'} · ${ergebnisText(m)}`,
      };
    }),
  ].sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));

  // Veränderung: neuester gegen ältesten LK-Wert
  const aelteste = lkEintraege[lkEintraege.length - 1];
  const neueste = lkEintraege[0];
  const veraenderung = lkEintraege.length >= 2
    ? (lkZahl(neueste.wert) - lkZahl(aelteste.wert)).toFixed(1).replace('.', ',')
    : null;

  const bilanzJahr = matches.filter((m) => tageSeit(m.datum) <= 365);
  const siege = bilanzJahr.filter((m) => m.sieg).length;

  return el('div', { class: 'stack' },
    el('div', { class: 'bilanz-karte' },
      el('span', { class: 'label' }, 'Aktuelle LK'),
      el('span', { class: 'bilanz-zahl' }, neueste ? neueste.wert : '–'),
      el('span', { class: 'muted' }, veraenderung !== null ? `Veränderung seit ${datumDe(aelteste.datum)}: ${veraenderung}` : (neueste ? 'Trage die nächste LK ein, dann siehst du die Veränderung.' : 'Trage deine LK ein, um den Verlauf zu sehen.')),
      el('span', { class: 'muted' }, `Matches letzte 12 Monate: ${siege} Siege, ${bilanzJahr.length - siege} Niederlage(n)`)),
    el('p', { class: 'muted' }, 'Die LK kommt vom Verband. Die App rechnet sie nicht selbst aus, sie zeigt nur deinen Verlauf.'),
    el('button', { class: 'btn btn-primaer', onclick: () => oeffneLk(null) }, '+ LK eintragen'),
    el('p', { class: 'sektion-titel' }, 'Verlauf'),
    ...(verlauf.length
      ? verlauf.map((v) => el(v.klick ? 'button' : 'div', { class: 'karte', onclick: v.klick || null },
        el('strong', { class: 'gegner-name' }, v.titel),
        el('span', { class: 'muted' }, `${datumDe(v.datum)} · ${v.text}`)))
      : [hinweis('Noch kein Verlauf. Trage deine erste LK ein.')]));
}

/** Formular für eine LK. e = null bedeutet „neu“. */
function oeffneLk(e) {
  const f = { datum: e?.datum || heuteIso(), wert: e?.wert || '', anlass: e?.anlass || '' };
  const inhalt = el('div', { class: 'stack' },
    feld('Datum', el('input', { class: 'input', type: 'date', value: f.datum, oninput(ev) { f.datum = ev.target.value; } })),
    feld('LK (z. B. 13,2)', el('input', { class: 'input', type: 'text', inputmode: 'decimal', maxlength: '5', placeholder: '13,2', value: f.wert, oninput(ev) { f.wert = ev.target.value; } })),
    feld('Anlass (optional)', el('input', { class: 'input', type: 'text', maxlength: '60', placeholder: 'z. B. Meldung Sommer', value: f.anlass, oninput(ev) { f.anlass = ev.target.value; } })),
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        const zahl = lkZahl(f.wert);
        if (!f.wert.trim() || Number.isNaN(zahl) || zahl < 1 || zahl > 30) {
          zeigeToast('Bitte gib eine LK zwischen 1 und 30 ein, z. B. 13,2.');
          return;
        }
        const eintrag = { id: e?.id, datum: f.datum, wert: zahl.toFixed(1).replace('.', ','), anlass: f.anlass.trim() };
        if (versuche(() => Daten.listeSpeichern('lk', eintrag))) {
          schliesseSheet();
          zeigeToast('LK gespeichert');
          render();
        }
      },
    }, 'Speichern'));
  oeffneSheet(e ? 'LK bearbeiten' : 'LK eintragen', inhalt, null);
}

function bindeKnoepfe() {
  // Tab-Leiste unten
  document.querySelectorAll('.tab').forEach((knopf) => {
    knopf.addEventListener('click', () => {
      if (knopf.dataset.tab === aktiverTab) return;
      atemStoppen();                 // Atemübung beenden, wenn man den Tab wechselt
      aktiverTab = knopf.dataset.tab;
      window.scrollTo({ top: 0 });
      render();
    });
  });

  // Zahnrad oben rechts
  $('btn-einstellungen').addEventListener('click', oeffneEinstellungen);

  // Oben links im Formular: „Schließen“ oder „← Zurück“
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
