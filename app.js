// Node.js entrypoint for Next.js on cPanel/Passenger
// Validated against Next.js Node server deployment docs.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS entrypoint */
const path = require("path");
const { createServer } = require("http");

// Ensure cwd is app root (Passenger/CloudLinux may start from elsewhere)
process.chdir(path.resolve(__dirname));

const next = require("next");
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      handle(req, res);
    });

    server.on("error", (err) => {
      console.error("[app.js] HTTP server error:", err);
      process.exit(1);
    });

    let shuttingDown = false;

    function shutdown(signal) {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log(`[app.js] ${signal} received — shutting down gracefully`);

      const forceExitTimer = setTimeout(() => {
        console.warn("[app.js] Drain timeout — forcing exit");
        process.exit(0);
      }, 25000);
      if (forceExitTimer.unref) forceExitTimer.unref();

      server.closeIdleConnections();
      server.close((err) => {
        if (err) {
          console.error("[app.js] Error during server.close():", err);
        } else {
          console.log("[app.js] Server closed cleanly");
        }
        clearTimeout(forceExitTimer);
        process.exit(0);
      });
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    server.listen(port, () => {
      console.log(`> Next.js app ready on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error starting Next.js server:", err);
    process.exit(1);
  });

process.on("uncaughtException", (err) => {
  console.error("[app.js] uncaughtException:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[app.js] unhandledRejection:", reason);
  process.exit(1);
});

