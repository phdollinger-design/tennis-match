/**
 * service-worker.js – macht die App offline nutzbar.
 *
 * Ein Service Worker ist ein kleines Hilfsprogramm des Browsers. Er speichert die
 * Dateien der App beim ersten Öffnen. Danach kommt die App auch ohne Internet.
 *
 * WICHTIG: Ändert man eine Datei der App, muss man CACHE_NAME hochzählen
 * (z. B. 'tennis-match-v2'). Sonst bekommt das iPhone die neue Version nicht.
 */

const CACHE_NAME = 'tennis-match-v2';

// Alle Dateien, die zur App gehören
const DATEIEN = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'storage.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

// Installieren: alle Dateien in den Speicher legen
self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(DATEIEN))
  );
  self.skipWaiting();   // neue Version sofort übernehmen
});

// Aktivieren: alte Speicher-Versionen aufräumen
self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(namen.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Jede Anfrage abfangen: erst aus dem Speicher, sonst aus dem Netz (und dann speichern)
self.addEventListener('fetch', (ereignis) => {
  // Nur Anfragen an unsere eigene Seite behandeln
  if (ereignis.request.method !== 'GET') return;

  ereignis.respondWith(
    caches.match(ereignis.request).then((gespeichert) => {
      if (gespeichert) return gespeichert;

      return fetch(ereignis.request)
        .then((antwort) => {
          // Neue Dateien gleich mitspeichern
          const kopie = antwort.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(ereignis.request, kopie));
          return antwort;
        })
        .catch(() => caches.match('index.html'));   // offline und nicht gespeichert: Startseite
    })
  );
});
