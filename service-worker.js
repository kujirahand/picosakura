const CACHE_NAME = "picosakura-cache-v1";
const urlsToCache = [
  "./synth/js-synthesizer.js",
  "./synth/libfluidsynth-2.3.0-with-libsndfile.js",
  "./synth/picoaudio1.1.2_PicoAudio.min.js",
  "./synth/TimGM6mb.sf2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('Using cache for:', event.request.url)
        return response;
      }
      return fetch(event.request);
    }),
  );
});
