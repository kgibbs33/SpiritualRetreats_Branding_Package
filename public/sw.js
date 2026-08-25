/**
 * Stub for GET /sw.js. Some browsers or stale localhost service-worker
 * registrations probe this URL; without a file here, Next serves 404
 * (static assets live under `public/` at the site root — Next.js docs).
 *
 * Inert: no fetch handler → no caching or offline interception.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
