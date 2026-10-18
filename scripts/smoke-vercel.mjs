/**
 * Smoke test for the built deployment. Run `npm run build:vercel` first, then `npm run smoke:vercel`.
 * It loads the bundled function with require(), the way Vercel does, serves it on a local port, and
 * checks the endpoints and the static files. Exits non-zero on the first problem.
 */
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../.vercel/output/", import.meta.url));

function check(ok, message) {
  if (!ok) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`ok   ${message}`);
}

check(existsSync(`${out}static/index.html`), "static/index.html exists");
check(existsSync(`${out}config.json`), "config.json exists");
check(existsSync(`${out}functions/api.func/.vc-config.json`), ".vc-config.json exists");
for (const f of ["venues/smu.json", "published/muis-halal-smu.json", "upload/dishes.csv", "coupons/demo-coupons.json"]) {
  check(existsSync(`${out}functions/api.func/data/${f}`), `data/${f} shipped with the function`);
}

process.env.DEMO_COUPONS = "true";
check(existsSync(`${out}functions/api.func/index.js`), "function bundle index.js exists");
const handler = createRequire(import.meta.url)(`${out}functions/api.func/index.js`);
check(typeof handler === "function", "require() of the bundle returns the handler function");
const server = createServer(handler);
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const health = await fetch(`${base}/api/health`);
check(health.status === 200 && (await health.json()).ok === true, "GET /api/health returns ok");

const profile = { conditions: ["hypertension"], sodiumPreset: "singapore_2000", limits: {}, halalOnly: false, vegetarianOnly: false };
const match = await fetch(`${base}/api/match`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ profile, origin: { lat: 1.2956, lng: 103.8492 } }),
});
const matchBody = await match.json();
check(match.status === 200, "POST /api/match returns 200");
check(Array.isArray(matchBody.venues) && matchBody.venues.length > 0, `match returns venues (${matchBody.venues?.length})`);
check(Array.isArray(matchBody.closest), "match returns a closest list");

const bad = await fetch(`${base}/api/match`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: { conditions: ["flu"] }, origin: null }) });
check(bad.status === 400, "an invalid profile is rejected with 400");

const demo = await fetch(`${base}/api/demo/coupons`);
const demoBody = await demo.json();
check(demo.status === 200 && demoBody.demo === true && demoBody.coupons.length > 0, `GET /api/demo/coupons returns demo coupons (${demoBody.coupons?.length})`);

const missing = await fetch(`${base}/api/does-not-exist`);
check(missing.status === 404, "an unknown API path returns 404");

server.close();
console.log("All smoke checks passed.");
