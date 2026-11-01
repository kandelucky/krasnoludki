// The offline copy of the app (installed on a phone, or a page opened before). Network first: online, every file
// comes fresh from the site (an update shows at once) and refreshes the copy; offline, the last copy answers.
// Only this site's own files — the top-10 server is another address and never passes through here.
var CACHE = "przypadki";
var CORE = ["./", "index.html", "lib/daisyui.css", "lib/daisyui-themes.css", "lib/tailwind.js", "theme-milioni.css",
  "sim-bridge.js", "Audiof/tap-a.ogg", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req, { cache: "no-cache" }).then(function (res) {
    if (res.status === 200) {          // a sound's partial answer (206) can't be stored — the precached copy stays
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) {
      return hit || (req.mode === "navigate" ? caches.match("./") : Response.error());
    });
  }));
});
