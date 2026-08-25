// Simple wrapper to keep backwards compatibility if anything calls server.js.
// The real entrypoint for Passenger/cPanel is app.js.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS re-export */
require("./app");

