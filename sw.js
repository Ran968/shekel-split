// Bump CACHE on every deploy that changes app-shell files, so clients pick up the update.
var CACHE = "shekel-v7";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./firebase-config.js",
  "./cloud.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  // Never cache rate lookups — always go to the network so conversions stay current.
  if (url.hostname.indexOf("frankfurter.app") >= 0) return;

  // Cross-origin (e.g. Google Fonts on other hosts): let the browser handle it normally.
  if (url.origin !== location.origin) return;

  // App shell: cache-first, refresh the cache in the background when online.
  e.respondWith(
    caches.match(req).then(function(cached){
      var network = fetch(req).then(function(res){
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
        return res;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
