
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('mysite-static-v3').then(function(cache) {
      return cache.addAll([
        'https://unpkg.com/leaflet@1.0.1/dist/leaflet.css',
        'bower_components/leaflet-usermarker-master/src/leaflet.usermarker.css',
        '//cdnjs.cloudflare.com/ajax/libs/maquette/2.4.1/maquette.min.js',
        'https://unpkg.com/leaflet@1.0.1/dist/leaflet.js',
        '//cdn.jsdelivr.net/pouchdb/6.0.7/pouchdb.min.js',
        'bower_components/leaflet-usermarker-master/src/leaflet.usermarker.js',
        // 'app.js'
        // etc
      ]);
    })
  );
});