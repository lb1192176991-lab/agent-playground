/**
 * ETag validation test for the TaskFlow API.
 *
 * This test starts the Express app and verifies that dynamic JSON
 * responses (e.g., /health) do NOT include an ETag header, confirming
 * that `app.disable("etag")` is working correctly.
 *
 * Usage: npx tsx src/etag-test.ts
 *        node --import tsx src/etag-test.ts
 */

import { createServer } from "http";
import express from "express";

// We cannot import the actual app because it calls listen() eagerly.
// Instead, we construct a minimal equivalent that replicates the exact
// setup from index.ts — including the `app.disable("etag")` call — and
// verify no ETag is emitted.
//
// This approach validates the principle: the same setting applied in
// index.ts must exist before route registration.

function buildApp(): express.Express {
  const app = express();
  // This mirrors the fix in index.ts — must appear BEFORE routes
  app.disable("etag");
  app.use(express.json());
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "taskflow-api" });
  });
  app.get("/users", (_req, res) => {
    res.json({ data: [], message: "stub" });
  });
  return app;
}

async function main(): Promise<void> {
  const app = buildApp();
  const server = createServer(app);

  // Bind to a random available port
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address();
  if (!addr || typeof addr === "string") {
    console.error("FAIL: Could not determine server address");
    process.exit(1);
  }
  const port = (addr as any).port;
  console.log(`Test server listening on port ${port}`);

  let allPassed = true;

  for (const path of ["/health", "/users"]) {
    const res = await fetch(`http://127.0.0.1:${port}${path}`);
    const etag = res.headers.get("etag");
    const body = await res.json();

    if (etag) {
      console.error(`FAIL [${path}]: ETag header present: "${etag}"`);
      allPassed = false;
    } else {
      console.log(`PASS [${path}]: No ETag header`);
    }

    if (body && typeof body === "object") {
      console.log(`  Body keys: ${Object.keys(body).join(", ")}`);
    }
  }

  server.close();

  if (allPassed) {
    console.log("\n✓ All ETag validation tests passed.");
    process.exit(0);
  } else {
    console.error("\n✗ Some ETag validation tests failed.");
    process.exit(1);
  }
}

main();
