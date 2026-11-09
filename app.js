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

const TAB_TITEL = { stunden: 'Trainingsstunden', saison: 'Saisonplan', uebungen: 'Übungen', spieler: 'Spieler', konto: 'Konto' };

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

  // --- Erweiterung auf 120 Übungen (je Ziel 20) ---
  ['Aufschlag', 0, 'Ballwurf-Kontrolle', 'Ball 20 Mal hochwerfen und immer am gleichen Punkt fangen. Dann daraus einen Aufschlag machen.'],
  ['Aufschlag', 0, 'Beinarbeit im Aufschlag', 'Schrittfolge üben: Stand, Ballwurf, Beinschub. Erst ohne Schläger, dann mit Ball.'],
  ['Aufschlag', 0, 'Treffer am Körbchen', 'Ein Körbchen in die Aufschlagzone stellen. 10 Bälle, jeder Treffer im Körbchen ist ein Punkt.'],
  ['Aufschlag', 0, 'Zielwerfen mit Ball', 'Aufschlagbewegung ohne Schläger, Ball an ein Ziel an der Wand werfen. Danach dasselbe mit Schläger.'],
  ['Aufschlag', 1, 'Zweiter Aufschlag mit Kick', 'Zweiten Aufschlag mit Kick üben. Ziel: 7 von 10 ins Feld, Ball hoch über das Netz.'],
  ['Aufschlag', 1, 'Aufschlag-Spiel 1 gegen 1', 'Punktespiel nur über den Aufschlag. Wer den Aufschlag gewinnt, bekommt 1 Punkt. Bis 5 Punkte.'],
  ['Aufschlag', 1, 'Mitte, dann Ecke', 'Erst 5 Aufschläge in die Mitte, dann 5 in die Ecke. Ziel: beides ins Feld.'],
  ['Aufschlag', 1, 'Aufschlag und Schritt ans Netz', 'Nach jedem Aufschlag einen Schritt nach vorne zum Netz. Ziel: schneller am Netz sein.'],
  ['Aufschlag', 1, 'Aufschlag mit Spin', 'Hoher Ballwurf, Schläger früh oben, Treffpunkt vor dem Körper. 10 Aufschläge mit Spin.'],
  ['Aufschlag', 1, 'Aufschlag-Duell', 'Zwei Spieler schlagen abwechselnd auf. Wer den Punkt gewinnt, bekommt 1 Punkt. Bis 7 Punkte.'],
  ['Aufschlag', 1, 'Aufschlag unter Ablenkung', 'Partner steht am Netz und ruft „Jetzt“ kurz vor dem Schlag. Ziel: Ball trotzdem ins Feld.'],

  ['Grundlinie', 0, 'Vorhand im Stand', 'Vorhand aus dem Stand, der Partner wirft den Ball zu. 20 Schläge ohne Fehler.'],
  ['Grundlinie', 0, 'Rückhand im Stand', 'Wie Vorhand, aber mit Rückhand. Schulterdrehung betonen.'],
  ['Grundlinie', 0, 'Ballfolge an der Linie', 'Zwei Spieler an der Grundlinie, Ball hin und her. Ziel: 15 Schläge in Folge.'],
  ['Grundlinie', 0, 'Schlagen auf Zuruf', 'Der Partner wirft Bälle und ruft „Vorhand“ oder „Rückhand“. Du spielst nur den genannten Schlag.'],
  ['Grundlinie', 0, 'Quadrat-Treffer', 'Zwei Kreidequadrate in den Ecken. Ziel: Ball ins Quadrat. 10 Bälle je Seite.'],
  ['Grundlinie', 1, 'Kurze Bälle angreifen', 'Der Partner spielt kurze Bälle, du spielst sie hart und tief zurück.'],
  ['Grundlinie', 1, 'Dreieck-Laufweg', 'Laufweg: Grundlinie, Diagonale, Mitte. Nach jedem Schlag zurück in die Mitte.'],
  ['Grundlinie', 1, 'Lange Rallye', 'Ballwechsel ohne Ziel: 30 Schläge am Stück über das Netz, dann Pause.'],
  ['Grundlinie', 1, 'Vorhand-Duell', 'Zwei Spieler spielen nur Vorhand. Wer einen Rückhand-Schlag spielt, verliert den Punkt.'],
  ['Grundlinie', 1, 'Rückhand-Duell', 'Wie Vorhand-Duell, aber nur Rückhand. Ziel: sauber und tief.'],
  ['Grundlinie', 1, 'Hin und her', 'Der Trainer wirft Bälle weit auseinander. Du läufst, schlägst und kehrst in die Mitte zurück.'],
  ['Grundlinie', 1, 'Punktespiel Grundlinie', 'Nur Grundlinie, nur Cross oder Diagonal. Bis 10 Punkte.'],

  ['Netzspiel', 0, 'Volley-Ballwurf', 'Der Partner wirft Bälle zum Volley ans Netz. 10 Volleys rechts, 10 links.'],
  ['Netzspiel', 0, 'Schritt ans Netz', 'Vom Service-Bereich nach vorne laufen, den Ball abfangen und am Netz kontrollieren.'],
  ['Netzspiel', 0, 'Schläger in Position', 'Schläger vor dem Körper halten, Volley-Stop. Bei jedem Ballwechsel die Position halten.'],
  ['Netzspiel', 0, 'Volley-Partner', 'Zwei Spieler am Netz, Volleys hin und her. Ziel: 20 in Folge.'],
  ['Netzspiel', 0, 'Handgelenk stabil', 'Kurze Volleys mit ruhigem Handgelenk. Ziel: Ball über das Netz, nicht ins Netz.'],
  ['Netzspiel', 1, 'Stop-Volley', 'Kurz gespielte Volleys, die kaum über das Netz gehen. Der Partner muss nach vorne laufen.'],
  ['Netzspiel', 1, 'Lob-Abwehr am Netz', 'Der Partner spielt Lobs über dich. Du läufst rückwärts und spielst den Ball kontrolliert zurück.'],
  ['Netzspiel', 1, 'Aufschlag und Netz', 'Nach dem Aufschlag direkt ans Netz. Ziel: ersten Volley aus der Mitte spielen.'],
  ['Netzspiel', 1, 'Passierbälle', 'Der Partner kommt ans Netz, du spielst am Partner vorbei.'],
  ['Netzspiel', 1, 'Netzduell 2 gegen 2', 'Zwei Teams am Netz. Punkt nur über Volleys. Wer ins Netz spielt, verliert.'],
  ['Netzspiel', 1, 'Netzpunkte zählen doppelt', 'Nach jedem Aufschlag geht ein Spieler ans Netz. Netzpunkte zählen doppelt. Bis 7 Punkte.'],
  ['Netzspiel', 1, 'Halbvolley-Duell', 'Halbvolleys aus tiefen Bällen. Ziel: 6 von 10 sauber zurück.'],
  ['Netzspiel', 1, 'Smash nach dem Lob', 'Lob kommt, du läufst zurück und schlägst den Smash. Ziel: 8 von 10 ins Feld.'],

  ['Return', 0, 'Return aus der Mitte', 'Der Trainer schlägt Bälle aus der Mitte. Du gibst den Return mit einem Schritt zurück.'],
  ['Return', 0, 'Return-Stand', 'Stand vor der Grundlinie: Schläger früh nach hinten, Ball früh nehmen.'],
  ['Return', 0, 'Return ohne Aufschlag', 'Der Partner wirft den Ball leicht über das Netz. Du gibst den Return ins Feld.'],
  ['Return', 0, 'Return ins Körbchen', 'Körbchen an der Feldlinie aufstellen. Jeder Return ins Körbchen zählt.'],
  ['Return', 0, 'Return im Wechsel', 'Zwei Spieler: einer schlägt auf, einer returniert. Nach 10 Returns wechseln.'],
  ['Return', 1, 'Return mit Gegenlauf', 'Nach dem Return läufst du sofort ans Netz. Ziel: Punkt aus dem Netzspiel.'],
  ['Return', 1, 'Return auf den Körper', 'Der Trainer schlägt auf den Körper. Return mit wenig Ausholen, Ball ins Feld.'],
  ['Return', 1, 'Return in die Ecken', 'Returns diagonal in die Ecken. Ziel: 6 von 10 treffen eine Ecke.'],
  ['Return', 1, 'Returnspiel 1 gegen 1', 'Aufschläger und Returner spielen einen Punkt. Gewonnener Return = 1 Punkt. Bis 6 Punkte.'],
  ['Return', 1, 'Return in Bewegung', 'Auf Zuruf links oder rechts laufen und returnieren. 10 Bälle.'],
  ['Return', 1, 'Nur Vorhand-Return', 'Nur Vorhand-Returns. Ziel: Ball früh nehmen und tief zurück.'],
  ['Return', 1, 'Nur Rückhand-Return', 'Nur Rückhand-Returns, gleiches Ziel wie bei Vorhand.'],
  ['Return', 1, 'Return unter Druck', 'Nach drei Fehlern gibt es eine Serie Sprints. Ziel: 10 gute Returns in Folge.'],
  ['Return', 1, 'Zweiter Aufschlag returnieren', 'Nur zweite Aufschläge. Zwei Punkte für einen Return, der den Gegner unter Druck setzt.'],

  ['Kondition', 0, 'Laufen zu den Kegeln', 'Kegel rund um die Grundlinie. Nach jedem Zuruf zum nächsten Kegel laufen.'],
  ['Kondition', 0, 'Seitschritt-Kette', 'Seitschritte an der Grundlinie, 15 Sekunden. Dann 20 Sekunden Pause. 6 Runden.'],
  ['Kondition', 0, 'Hüpfen über die Linie', 'Beidbeinig über eine Linie hüpfen, 30 Sekunden. Dann Erholung.'],
  ['Kondition', 0, 'Dehnen und Atmen', 'Ruhige Dehnung, 2 Minuten. Pro Stellung 5 tiefe Atemzüge in den Bauch.'],
  ['Kondition', 0, 'Treppenlauf', 'Treppe oder Bank hoch und runter, 30 Sekunden. Dann locker gehen.'],
  ['Kondition', 0, 'Schnelle Füße', 'Kurze Schritte auf der Stelle, dann Richtungswechsel auf Zuruf.'],
  ['Kondition', 1, 'Dreieck-Sprints', 'Sprints um drei Kegel, 20 Sekunden Tempo, 40 Sekunden Gehen. 6 Serien.'],
  ['Kondition', 1, 'Ballwechsel-Serien', '10 Ballwechsel in Serie, dann 60 Sekunden Pause. 4 Serien.'],
  ['Kondition', 1, 'Burpee-Rallye', 'Nach jedem Punkt 5 Burpees. Ziel: sauber bleiben trotz Müdigkeit.'],
  ['Kondition', 1, 'Rückwärts-Sprints', 'Rückwärts zur Grundlinie und wieder zurück. 8 Wiederholungen.'],
  ['Kondition', 1, 'Kraft-Stationen', 'Drei Stationen: Ausfallschritte, Kniebeugen, Unterarmstütz, je 30 Sekunden. 3 Runden.'],
  ['Kondition', 1, 'Richtungs-Spiel', 'Rund um das Feld laufen, bei jedem Pfiff die Richtung wechseln. Wer zuerst müde ist, verliert.'],
  ['Kondition', 1, 'Schattenschläge', 'Schläge ohne Ball, 60 Sekunden, dann 30 Sekunden Pause. Fokus auf sauberer Technik.'],
  ['Kondition', 1, 'Fangspiel am Feldrand', 'Zwei Spieler: Wer den Ball am Feldrand zuerst fängt, gewinnt. 10 Runden.'],

  ['Mental', 0, 'Ruhige Blicke', 'Vor dem Aufschlag den Ball zweimal prellen und das Ziel anschauen. 15 Aufschläge so.'],
  ['Mental', 0, 'Sätze an mich selbst', 'Drei Sätze auf einem Zettel: Was ich kann, was ich will, was ich tue. Vor dem Training lesen.'],
  ['Mental', 0, 'Spaß am Ball', 'Ballwechsel ohne Wertung. Nur gute Schläge werden gelobt.'],
  ['Mental', 0, 'Pausen-Ritual', 'Nach jedem Punkt immer gleich: Ball aufheben, Schläger klopfen, dann weiter.'],
  ['Mental', 0, 'Fehler als Lernpunkt', 'Nach jedem Fehler kurz sagen, was du beim nächsten Mal anders machst. Dann weiterspielen.'],
  ['Mental', 1, 'Gedankenstopp', 'Kommt ein negativer Gedanke, laut „Stopp“ sagen und den nächsten Schlag konzentriert spielen.'],
  ['Mental', 1, 'Matchpunkt-Spiel', 'Spiel bis 4, jeder Punkt wie ein Matchball. Der Trainer gibt nach jedem Punkt ein Feedback.'],
  ['Mental', 1, 'Ballwechsel vorher denken', 'Vor dem Punkt den Ballwechsel im Kopf durchspielen, dann spielen, dann ehrlich bewerten.'],
  ['Mental', 1, 'Schlechter Start', 'Das Spiel startet mit 0:3. Ziel: aufholen, ohne die Ruhe zu verlieren.'],
  ['Mental', 1, 'Zuschauer-Simulation', 'Zwei Zuschauer am Rand, Geräusche. Ziel: den Ballwechsel trotz Ablenkung zu Ende spielen.'],
  ['Mental', 1, 'Schnelle Entscheidung', 'Nach jedem Ballwechsel ruft der Trainer „Weiter“ oder „Neu“. Du entscheidest in zwei Sekunden.'],
  ['Mental', 1, 'Satzball-Duell', 'Spiel bis 6, Satzball für beide. Wer ihn verwandelt, gewinnt.'],
  ['Mental', 1, 'Rückblick nach dem Spiel', 'Nach dem Spiel drei Fragen beantworten: Was lief gut, was war schwer, was nehme ich mit?'],
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
  const pool = nachAlter(passendeUebungen(ziel, niv));
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

// ==========================================================================
// 8. ABWECHSLUNG, SPIELER, TESTS UND KONTO
// ==========================================================================

/** Übungen, die lange nicht benutzt wurden, kommen zuerst (bei Gleichstand zufällig). */
function nachAlter(liste) {
  const zuletzt = {};
  for (const s of Daten.listeAlle('stunden')) {
    for (const b of s.bloecke || []) {
      if (b.uebungId && (!zuletzt[b.uebungId] || s.datum > zuletzt[b.uebungId])) zuletzt[b.uebungId] = s.datum;
    }
  }
  return mischen(liste).sort((a, b) => (zuletzt[a.id] || '').localeCompare(zuletzt[b.id] || ''));
}

// Basis-Tests. min = 0: für Anfänger und Fortgeschritten. min = 1: nur Fortgeschritten.
// hoeher = true: mehr ist besser. hoeher = false: weniger ist besser (z. B. Sekunden).
const TESTS = [
  { id: 'aufschlag-a', ziel: 'Aufschlag', min: 0, name: '10 Aufschläge', einheit: 'Treffer von 10', hoeher: true,
    anleitung: 'Du schlägst 10 Aufschläge. Zählt jeder Aufschlag, der im Feld landet.' },
  { id: 'aufschlag-f', ziel: 'Aufschlag', min: 1, name: 'Aufschlag mit Ziel', einheit: 'Punkte von 20', hoeher: true,
    anleitung: '20 Aufschläge. Jeder Treffer in die Zielzone ist 1 Punkt.' },
  { id: 'grundlinie-a', ziel: 'Grundlinie', min: 0, name: 'Ballwechsel ohne Fehler', einheit: 'Schläge ohne Fehler', hoeher: true,
    anleitung: 'Mit dem Partner Bälle an der Grundlinie wechseln. Zählt, wie viele Schläge du ohne Fehler schaffst.' },
  { id: 'grundlinie-f', ziel: 'Grundlinie', min: 1, name: 'Cross-Treffer', einheit: 'Treffer von 10', hoeher: true,
    anleitung: '10 Cross-Bälle in ein Zielfeld. Jeder Ball im Feld zählt.' },
  { id: 'netzspiel-a', ziel: 'Netzspiel', min: 0, name: 'Volley-Wand 30 Sekunden', einheit: 'Volleys ohne Fehler', hoeher: true,
    anleitung: '30 Sekunden Volleys an die Wand oder zum Partner. Zählt, wie viele ohne Fehler kommen.' },
  { id: 'netzspiel-f', ziel: 'Netzspiel', min: 1, name: 'Volleys in Folge', einheit: 'Volleys in Folge', hoeher: true,
    anleitung: 'Volley-Ballwechsel mit dem Partner am Netz. Zählt die längste Serie ohne Fehler.' },
  { id: 'return-a', ziel: 'Return', min: 0, name: '10 Returns ins Feld', einheit: 'Treffer von 10', hoeher: true,
    anleitung: 'Der Trainer schlägt 10 Aufschläge. Zählt jeder Return, der im Feld landet.' },
  { id: 'return-f', ziel: 'Return', min: 1, name: 'Returns gegen zweiten Aufschlag', einheit: 'Treffer von 10', hoeher: true,
    anleitung: '10 zweite Aufschläge. Zählt jeder Return, der im Feld landet.' },
  { id: 'kondition-a', ziel: 'Kondition', min: 0, name: '5 Sprints à 20 Meter', einheit: 'Sekunden gesamt', hoeher: false,
    anleitung: '5 Sprints über 20 Meter mit kurzer Pause. Gestoppt wird die Gesamtzeit. Weniger ist besser.' },
  { id: 'kondition-f', ziel: 'Kondition', min: 1, name: 'Dauer-Rallye', einheit: 'Schläge ohne Fehler', hoeher: true,
    anleitung: 'Ein Ballwechsel ohne Pause. Zählt, wie viele Schläge du ohne Fehler schaffst.' },
  { id: 'mental-a', ziel: 'Mental', min: 0, name: 'Punkt-Routine', einheit: 'Selbsteinschätzung von 1 bis 10', hoeher: true,
    anleitung: 'Spiel 10 Punkte mit der Punkt-Routine. Bewerte dich selbst von 1 bis 10: wie gut hast du die Routine eingehalten?' },
  { id: 'mental-f', ziel: 'Mental', min: 1, name: 'Satzball-Spiel', einheit: 'Punkte von 10', hoeher: true,
    anleitung: 'Spiel bis 10 Punkte gegen einen Partner. Zählt deine Punkte.' },
];

const TEST_PHASEN = ['Saisonstart', 'Zwischentest', 'Saisonende'];

/** Die Tests, die für ein Niveau gelten. Fortgeschrittene machen alle Tests. */
function testsFuer(niveau) {
  const niv = NIVEAUE.indexOf(niveau);
  return TESTS.filter((t) => t.min <= niv);
}

/** Eine Zahl aus Text (Komma oder Punkt). */
function zahlWert(text) {
  return Number(String(text).trim().replace(',', '.'));
}

/** Geld im deutschen Format, z. B. 30,00 €. */
function geld(betrag) {
  return `${Number(betrag || 0).toFixed(2).replace('.', ',')} €`;
}

/** Der Tab „Spieler“: alle Spieler, alphabetisch. */
function ansichtSpieler() {
  const liste = Daten.listeAlle('spieler').sort((a, b) => a.name.localeCompare(b.name, 'de'));
  return el('div', { class: 'stack' },
    el('p', { class: 'muted' }, 'Trage deine Spieler ein. Mit den Tests am Saisonstart und am Saisonende siehst du, wie sich jeder verbessert hat.'),
    el('button', { class: 'btn btn-primaer', onclick: () => oeffneSpieler(null) }, '+ Spieler'),
    ...(liste.length
      ? liste.map((s) => el('button', { class: 'karte', onclick: () => oeffneSpielerDetail(s.id) },
        el('strong', { class: 'gegner-name' }, s.name),
        el('span', { class: 'muted' }, `${s.niveau}${s.notiz ? ' · ' + s.notiz : ''}`)))
      : [hinweis('Noch keine Spieler.')]));
}

/** Formular für einen Spieler. s = null bedeutet „neu“. */
function oeffneSpieler(s) {
  const f = { name: s?.name || '', niveau: s?.niveau || 'Anfänger', notiz: s?.notiz || '' };
  const fehler = el('p', { class: 'fehler' });
  const inhalt = el('div', { class: 'stack' },
    feld('Name', el('input', { class: 'input', type: 'text', maxlength: '40', value: f.name, oninput(e) { f.name = e.target.value; } })),
    el('span', { class: 'label' }, 'Niveau'),
    auswahl(NIVEAUE.map((n) => ({ wert: n, label: n })), f.niveau, (w) => { f.niveau = w; }),
    feld('Notiz (optional)', el('input', { class: 'input', type: 'text', maxlength: '60', value: f.notiz, oninput(e) { f.notiz = e.target.value; } })),
    fehler,
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        if (!f.name.trim()) { fehler.textContent = 'Bitte gib einen Namen ein.'; return; }
        const eintrag = { id: s?.id, name: f.name.trim(), niveau: f.niveau, notiz: f.notiz.trim() };
        if (versuche(() => Daten.listeSpeichern('spieler', eintrag))) {
          schliesseSheet();
          zeigeToast('Spieler gespeichert');
          render();
        }
      },
    }, 'Speichern'),
    s ? el('button', { class: 'btn btn-gefahr', onclick: () => spielerLoeschenMitFrage(s) }, 'Spieler löschen') : null);
  oeffneSheet(s ? 'Spieler bearbeiten' : 'Neuer Spieler', inhalt, null);
}

/** Die Ansicht eines Spielers: alle Tests seines Niveaus mit Verlauf und Veränderung. */
function oeffneSpielerDetail(id) {
  const s = Daten.listePerId('spieler', id);
  if (!s) return;
  const ergebnisse = Daten.listeAlle('testergebnisse').filter((e) => e.spielerId === s.id);

  const tests = testsFuer(s.niveau).map((t) => {
    const liste = ergebnisse.filter((e) => e.testId === t.id).sort((a, b) => a.datum.localeCompare(b.datum));
    const kopf = el('strong', {}, t.name);
    if (!liste.length) {
      return el('div', { class: 'karte' }, kopf, el('span', { class: 'muted' }, `${t.einheit}: noch kein Ergebnis`));
    }
    const erste = liste[0];
    const letzte = liste[liste.length - 1];
    const diff = Math.round((letzte.wert - erste.wert) * 10) / 10;
    const besser = t.hoeher ? diff > 0 : diff < 0;
    const veraenderung = liste.length > 1
      ? el('p', {}, `Veränderung: ${diff > 0 ? '+' : ''}${String(diff).replace('.', ',')}${diff === 0 ? ' (gleich)' : besser ? ' (besser)' : ' (schlechter)'}`)
      : null;
    return el('div', { class: 'karte' }, kopf,
      el('span', { class: 'muted' }, t.einheit),
      ...liste.map((e) => el('div', { class: 'zeile' },
        el('span', { class: 'label' }, `${datumDe(e.datum)} · ${e.phase}`),
        el('p', {}, String(e.wert).replace('.', ',')),
        el('button', { class: 'btn btn-text', onclick: () => oeffneTestergebnis(s, e) }, 'Ändern'))),
      veraenderung);
  });

  const inhalt = el('div', { class: 'stack' },
    el('p', { class: 'muted' }, `${s.niveau}${s.notiz ? ' · ' + s.notiz : ''}`),
    el('p', { class: 'sektion-titel' }, 'Tests'),
    ...tests,
    el('button', { class: 'btn btn-primaer', onclick: () => oeffneTestergebnis(s, null) }, 'Testergebnis eintragen'),
    el('button', { class: 'btn btn-sekundaer', onclick: () => oeffneSpieler(s) }, 'Spieler bearbeiten'));
  oeffneSheet(s.name, inhalt, null);
}

/** Formular für ein Testergebnis. e = null bedeutet „neu“. */
function oeffneTestergebnis(s, e) {
  const tests = testsFuer(s.niveau);
  const f = {
    testId: e?.testId || tests[0].id,
    phase: e?.phase || 'Saisonstart',
    datum: e?.datum || heuteIso(),
    wert: e ? String(e.wert).replace('.', ',') : '',
  };
  const beschreibung = el('p', { class: 'muted' });
  const zeigeBeschreibung = () => {
    const t = TESTS.find((x) => x.id === f.testId);
    beschreibung.textContent = t ? `${t.anleitung} Gemessen wird: ${t.einheit}.` : '';
  };
  zeigeBeschreibung();
  const fehler = el('p', { class: 'fehler' });

  const inhalt = el('div', { class: 'stack' },
    el('span', { class: 'label' }, 'Test'),
    auswahl(tests.map((t) => ({ wert: t.id, label: t.name })), f.testId, (w) => { f.testId = w; zeigeBeschreibung(); }),
    beschreibung,
    el('span', { class: 'label' }, 'Zeitpunkt'),
    auswahl(TEST_PHASEN.map((p) => ({ wert: p, label: p })), f.phase, (w) => { f.phase = w; }),
    feld('Datum', el('input', { class: 'input', type: 'date', value: f.datum, oninput(ev) { f.datum = ev.target.value; } })),
    feld('Ergebnis', el('input', {
      class: 'input zahl', type: 'text', inputmode: 'decimal', placeholder: 'z. B. 7',
      value: f.wert, oninput(ev) { f.wert = ev.target.value; },
    })),
    fehler,
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        const wert = zahlWert(f.wert);
        if (f.wert.trim() === '' || Number.isNaN(wert) || wert < 0) { fehler.textContent = 'Bitte gib eine Zahl ein (0 oder mehr).'; return; }
        if (!f.datum) { fehler.textContent = 'Bitte wähle ein Datum.'; return; }
        const eintrag = { id: e?.id, spielerId: s.id, testId: f.testId, phase: f.phase, datum: f.datum, wert };
        if (versuche(() => Daten.listeSpeichern('testergebnisse', eintrag))) {
          schliesseSheet();
          zeigeToast('Ergebnis gespeichert');
          render();
        }
      },
    }, 'Speichern'),
    e ? el('button', { class: 'btn btn-gefahr', onclick: () => testergebnisLoeschenMitFrage(s, e) }, 'Ergebnis löschen') : null);

  oeffneSheet(`Test: ${s.name}`, inhalt, null);
}

/** Löscht ein Testergebnis (nach Nachfrage). */
async function testergebnisLoeschenMitFrage(s, e) {
  const ja = await fragen({ titel: 'Ergebnis löschen?', text: 'Dieses Testergebnis wird entfernt.', ok: 'Löschen', gefahr: true });
  if (!ja) return;
  if (versuche(() => Daten.listeLoeschen('testergebnisse', e.id))) {
    schliesseSheet();
    zeigeToast('Ergebnis gelöscht');
    render();
  }
}

/** Löscht einen Spieler samt allen Testergebnissen (nach Nachfrage). */
async function spielerLoeschenMitFrage(s) {
  const ja = await fragen({
    titel: 'Spieler löschen?',
    text: `„${s.name}“ und alle seine Testergebnisse werden gelöscht.`,
    ok: 'Löschen',
    gefahr: true,
  });
  if (!ja) return;
  if (versuche(() => {
    for (const e of Daten.listeAlle('testergebnisse').filter((x) => x.spielerId === s.id)) {
      Daten.listeLoeschen('testergebnisse', e.id);
    }
    Daten.listeLoeschen('spieler', s.id);
  })) {
    schliesseSheet();
    zeigeToast('Spieler gelöscht');
    render();
  }
}

// ---------- Konto: Freitage 14 bis 16 Uhr ----------

const KONTO_ARTEN = {
  uebernommen: 'Übernommen (ich habe gehalten)',
  vertreten: 'Abgegeben (andere hat gehalten)',
  ausgefallen: 'Ausgefallen (keine Stunde)',
  zahlung: 'Zahlung erhalten',
};

/** Die Einstellungen des Kontos: Satz je Stunde, Dauer in Stunden, Startdatum. */
function kontoEinstellungen() {
  return {
    satz: Number(Daten.einstellungLesen('kontoSatz')) || 15,
    dauer: Number(Daten.einstellungLesen('kontoDauer')) || 2,
    start: Daten.einstellungLesen('kontoStart'),
  };
}

/**
 * Rechnet alle Freitage ab dem Startdatum durch. Ein Freitag zählt automatisch als gegeben,
 * außer es gibt einen Eintrag dafür: „übernommen“ (mit eigener Dauer), „abgegeben“ oder „ausgefallen“.
 * Übernommene Stunden an anderen Tagen zählen zusätzlich. Zahlungen werden abgezogen.
 */
function kontoBerechnen() {
  const { satz, dauer, start } = kontoEinstellungen();
  const eintraege = Daten.listeAlle('kontoEintraege');
  const heute = heuteIso();
  const zeilen = [];

  if (start && start <= heute) {
    const ende = new Date(heute + 'T00:00:00');
    for (let d = new Date(start + 'T00:00:00'); d <= ende; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 5) continue;                       // nur Freitage
      const iso = isoVon(d);
      const am = eintraege.filter((e) => e.datum === iso);
      const aus = am.find((x) => x.art === 'ausgefallen' || x.art === 'vertreten');
      const uebern = am.find((x) => x.art === 'uebernommen');
      if (aus) {
        zeilen.push({ datum: iso, status: KONTO_ARTEN[aus.art], stunden: 0 });
      } else if (uebern) {
        zeilen.push({ datum: iso, status: 'Übernommen', stunden: Number(uebern.dauer) || dauer });
      } else {
        zeilen.push({ datum: iso, status: 'Gegeben (automatisch)', stunden: dauer, auto: true });
      }
    }
  }

  // Übernommene Stunden an Tagen, die kein gezählter Freitag sind
  const freitagsDaten = new Set(zeilen.map((z) => z.datum));
  for (const e of eintraege) {
    if (e.art === 'uebernommen' && !freitagsDaten.has(e.datum)) {
      zeilen.push({ datum: e.datum, status: 'Übernommen', stunden: Number(e.dauer) || dauer });
    }
  }
  zeilen.sort((a, b) => b.datum.localeCompare(a.datum));

  const stunden = zeilen.reduce((summe, z) => summe + z.stunden, 0);
  const verdient = stunden * satz;
  const bezahlt = eintraege
    .filter((e) => e.art === 'zahlung')
    .reduce((summe, e) => summe + (Number(e.betrag) || 0), 0);
  return { zeilen, stunden, verdient, bezahlt, offen: verdient - bezahlt };
}

/** Der Tab „Konto“: offener Betrag, alle Freitage und alle Einträge. */
function ansichtKonto() {
  if (!Daten.einstellungLesen('kontoStart')) Daten.einstellungSpeichern('kontoStart', heuteIso());
  const k = kontoBerechnen();
  const e = kontoEinstellungen();
  const eintraege = Daten.listeAlle('kontoEintraege');

  return el('div', { class: 'stack' },
    el('div', { class: 'bilanz-karte' },
      el('span', { class: 'label' }, 'Offen (noch nicht bezahlt)'),
      el('span', { class: 'bilanz-zahl' }, geld(k.offen)),
      el('span', { class: 'muted' }, `verdient ${geld(k.verdient)} · bezahlt ${geld(k.bezahlt)} · ${k.stunden} Std.`)),
    el('p', { class: 'muted' },
      `Freitags 14:00 bis 16:00 Uhr zählen automatisch als gegeben, solange du nichts einträgst. ${e.dauer} Std. à ${geld(e.satz)} je Stunde. Gezählt ab ${datumDe(e.start)}.`),
    el('button', { class: 'btn btn-primaer', onclick: () => oeffneKontoEintrag(null, null) }, '+ Eintrag (übernommen, Zahlung …)'),
    el('button', { class: 'btn btn-sekundaer', onclick: oeffneKontoEinstellungen }, 'Satz, Dauer und Startdatum ändern'),

    el('p', { class: 'sektion-titel' }, 'Stunden'),
    ...(k.zeilen.length
      ? k.zeilen.map((z) => el('button', { class: 'karte', onclick: () => oeffneKontoEintrag(null, z.datum) },
        el('strong', { class: 'gegner-name' }, `${datumDe(z.datum)} · ${z.status}`),
        el('span', { class: 'muted' }, `${z.stunden} Std. · ${geld(z.stunden * e.satz)}`)))
      : [hinweis('Noch keine Stunden gezählt. Prüfe das Startdatum unter „Satz, Dauer und Startdatum“.')]),

    el('p', { class: 'sektion-titel' }, 'Einträge und Zahlungen'),
    ...(eintraege.length
      ? eintraege.map((x) => el('button', { class: 'karte', onclick: () => oeffneKontoEintrag(x, null) },
        el('strong', { class: 'gegner-name' }, `${datumDe(x.datum)} · ${KONTO_ARTEN[x.art] || x.art}`),
        el('span', { class: 'muted' }, x.art === 'zahlung'
          ? geld(x.betrag)
          : `${x.dauer ? x.dauer + ' Std.' : ''}${x.notiz ? ' · ' + x.notiz : ''}`)))
      : [hinweis('Noch keine Einträge.')]));
}

/** Formular für einen Konto-Eintrag. x = null bedeutet „neu“, datumVorgabe füllt das Datum vor. */
function oeffneKontoEintrag(x, datumVorgabe) {
  const e0 = kontoEinstellungen();
  const f = {
    datum: x?.datum || datumVorgabe || heuteIso(),
    art: x?.art || 'uebernommen',
    dauer: String(x?.dauer ?? e0.dauer).replace('.', ','),
    betrag: x && x.betrag ? String(x.betrag).replace('.', ',') : '',
    notiz: x?.notiz || '',
  };
  const fehler = el('p', { class: 'fehler' });
  const inhalt = el('div', { class: 'stack' },
    feld('Datum', el('input', { class: 'input', type: 'date', value: f.datum, oninput(ev) { f.datum = ev.target.value; } })),
    el('span', { class: 'label' }, 'Art'),
    auswahl(Object.entries(KONTO_ARTEN).map(([wert, label]) => ({ wert, label })), f.art, (w) => { f.art = w; }),
    feld('Dauer in Stunden (bei „übernommen“)', el('input', {
      class: 'input zahl', type: 'text', inputmode: 'decimal', value: f.dauer,
      oninput(ev) { f.dauer = ev.target.value; },
    })),
    feld('Betrag in € (bei „Zahlung“)', el('input', {
      class: 'input zahl', type: 'text', inputmode: 'decimal', placeholder: 'z. B. 60', value: f.betrag,
      oninput(ev) { f.betrag = ev.target.value; },
    })),
    feld('Notiz (optional)', el('input', {
      class: 'input', type: 'text', maxlength: '80', value: f.notiz,
      oninput(ev) { f.notiz = ev.target.value; },
    })),
    fehler,
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        if (!f.datum) { fehler.textContent = 'Bitte wähle ein Datum.'; return; }
        const dauer = zahlWert(f.dauer) || 0;
        const betrag = zahlWert(f.betrag) || 0;
        if (f.art === 'uebernommen' && dauer <= 0) { fehler.textContent = 'Bitte gib die Dauer in Stunden ein.'; return; }
        if (f.art === 'zahlung' && betrag <= 0) { fehler.textContent = 'Bitte gib den Betrag ein.'; return; }
        const eintrag = { id: x?.id, datum: f.datum, art: f.art, dauer, betrag, notiz: f.notiz.trim() };
        if (versuche(() => Daten.listeSpeichern('kontoEintraege', eintrag))) {
          schliesseSheet();
          zeigeToast('Gespeichert');
          render();
        }
      },
    }, 'Speichern'),
    x ? el('button', { class: 'btn btn-gefahr', onclick: () => kontoEintragLoeschenMitFrage(x) }, 'Eintrag löschen') : null);
  oeffneSheet(x ? 'Eintrag bearbeiten' : 'Neuer Eintrag', inhalt, null);
}

/** Löscht einen Konto-Eintrag (nach Nachfrage). */
async function kontoEintragLoeschenMitFrage(x) {
  const ja = await fragen({ titel: 'Eintrag löschen?', text: 'Der Eintrag wird entfernt.', ok: 'Löschen', gefahr: true });
  if (!ja) return;
  if (versuche(() => Daten.listeLoeschen('kontoEintraege', x.id))) {
    schliesseSheet();
    zeigeToast('Eintrag gelöscht');
    render();
  }
}

/** Satz, Dauer und Startdatum des Kontos ändern. */
function oeffneKontoEinstellungen() {
  const e = kontoEinstellungen();
  const f = { satz: String(e.satz).replace('.', ','), dauer: String(e.dauer).replace('.', ','), start: e.start || heuteIso() };
  const inhalt = el('div', { class: 'stack' },
    feld('Satz in € je Stunde', el('input', {
      class: 'input zahl', type: 'text', inputmode: 'decimal', value: f.satz,
      oninput(ev) { f.satz = ev.target.value; },
    })),
    feld('Dauer einer Stunde in Stunden (14 bis 16 Uhr = 2)', el('input', {
      class: 'input zahl', type: 'text', inputmode: 'decimal', value: f.dauer,
      oninput(ev) { f.dauer = ev.target.value; },
    })),
    feld('Freitage zählen ab (Datum)', el('input', {
      class: 'input', type: 'date', value: f.start,
      oninput(ev) { f.start = ev.target.value; },
    })),
    el('button', {
      class: 'btn btn-primaer',
      onclick() {
        const satz = zahlWert(f.satz);
        const dauer = zahlWert(f.dauer);
        if (!(satz > 0) || !(dauer > 0) || !f.start) { zeigeToast('Bitte Satz, Dauer und Startdatum prüfen.'); return; }
        const ok = versuche(() => {
          Daten.einstellungSpeichern('kontoSatz', satz);
          Daten.einstellungSpeichern('kontoDauer', dauer);
          Daten.einstellungSpeichern('kontoStart', f.start);
        });
        if (ok) {
          schliesseSheet();
          zeigeToast('Gespeichert');
          render();
        }
      },
    }, 'Speichern'));
  oeffneSheet('Konto-Einstellungen', inhalt, null);
}

/** Zeichnet den Inhalt des gerade gewählten Tabs neu. */
function render() {
  document.querySelectorAll('.tab').forEach((t) =>
    t.setAttribute('aria-selected', String(t.dataset.tab === aktiverTab)));

  $('titel').textContent = TAB_TITEL[aktiverTab];

  const ansichten = { stunden: ansichtStunden, saison: ansichtSaison, uebungen: ansichtUebungen, spieler: ansichtSpieler, konto: ansichtKonto };
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
