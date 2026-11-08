/**
 * service-worker.js – macht die App offline nutzbar.
 *
 * Ein Service Worker ist ein kleines Hilfsprogramm des Browsers. Er speichert die
 * Dateien der App. Ist Internet da, lädt er immer die neueste Version aus dem Netz.
 * Ist kein Internet da, nimmt er die gespeicherte Version. So musst du beim Update
 * nichts mehr hochzählen.
 */

const CACHE_NAME = 'tennis-match-v3';

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

// Jede Anfrage abfangen: erst aus dem Netz (und dann speichern), sonst aus dem Speicher
self.addEventListener('fetch', (ereignis) => {
  // Nur GET-Anfragen behandeln
  if (ereignis.request.method !== 'GET') return;

  ereignis.respondWith(
    fetch(ereignis.request)
      .then((antwort) => {
        // Neueste Version gleich mitspeichern
        const kopie = antwort.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(ereignis.request, kopie));
        return antwort;
      })
      .catch(() =>
        // Kein Internet: gespeicherte Version nehmen, sonst die Startseite
        caches.match(ereignis.request).then((gespeichert) => gespeichert || caches.match('index.html'))
      )
  );
});
