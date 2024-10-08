/**
 * Service Worker for picosakura
 */
const CACHE_NAME = "picosakura-cache-sakuramml0_1_37";
const urlsToCache = [
  // --- 以下はよく更新するのでキャッシュしない ---
  // "./synth/sakuramml_loader.mjs",
  // "./synth/soundfont_player.js",
  // --- ほとんど更新しないのでキャッシュする ---
  "./synth/js-synthesizer.js",
  "./synth/libfluidsynth-2.3.0-with-libsndfile.js",
  "./synth/picoaudio1.1.2_PicoAudio.min.js",
  "./synth/sakuramml_bg.wasm",
  "./synth/sakuramml.js",
  "./synth/fonts/TimGM6mb.sf2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener('activate', function (event) {
  console.log('Service Worker activated:', event);
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log("[service-worker] cache:", event.request.url);
        return response
      }
      console.log('[service-worker] fetch:', event.request.url)
      return fetch(event.request)
    })
  );
});
