/**
 * Builds the deployment in Vercel's Build Output API format (https://vercel.com/docs/build-output-api/v3):
 *
 *   .vercel/output/static/                      the Vite site
 *   .vercel/output/functions/api.func/          one function: the Express API bundled into index.js,
 *                                               plus a copy of the data files it reads
 *   .vercel/output/config.json                  routes /api/* to the function
 *
 * Run it with `npm run build:vercel`. Vercel runs it as the Build Command; it also works locally.
 * Any failure stops the build with a non-zero exit code.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = `${root}.vercel/output`;
const fn = `${out}/functions/api.func`;

/** Data folders the function reads at runtime. Raw downloads, archives and research stay out. */
const DATA_FOLDERS = ["venues", "published", "upload", "coupons"];

await rm(out, { recursive: true, force: true });

console.log("1/4 Building the site");
// Run the tools with node directly: no shell, so it behaves the same on Windows, macOS and Vercel.
const tool = (path) => {
  const full = `${root}node_modules/${path}`;
  if (!existsSync(full)) throw new Error(`Missing ${full}. Run npm install first.`);
  return full;
};
const frontend = `${root}src/frontend`;
execFileSync(process.execPath, [tool("typescript/bin/tsc"), "-p", "tsconfig.json"], { cwd: frontend, stdio: "inherit" });
execFileSync(process.execPath, [tool("vite/bin/vite.js"), "build"], { cwd: frontend, stdio: "inherit" });
await cp(`${root}src/frontend/dist`, `${out}/static`, { recursive: true });

console.log("2/4 Bundling the API");
await build({
  entryPoints: [`${root}src/backend/app/vercel-entry.ts`],
  outfile: `${fn}/index.js`,
  bundle: true,
  platform: "node",
  // CommonJS, because Vercel may load the function with require(), which cannot load an ES module
  // that uses top-level await. A CommonJS file works however it is loaded.
  format: "cjs",
  target: "node22",
  // The source uses import.meta.url to find the data folder; give it the equivalent in CommonJS.
  banner: { js: 'const __importMetaUrl = require("node:url").pathToFileURL(__filename).href;' },
  define: { "import.meta.url": "__importMetaUrl" },
  // Make the file export the handler function itself, not an object holding it.
  footer: { js: "module.exports = module.exports.default;" },
  logLevel: "info",
});

console.log("3/4 Copying data files");
for (const folder of DATA_FOLDERS) {
  await cp(`${root}data/${folder}`, `${fn}/data/${folder}`, { recursive: true });
}

console.log("4/4 Writing Vercel config");
// The repository's own package.json says "type": "module". Say plainly that this folder is CommonJS,
// so the bundle is read the same way here and on Vercel.
await writeFile(`${fn}/package.json`, JSON.stringify({ type: "commonjs" }, null, 2));
await writeFile(
  `${fn}/.vc-config.json`,
  JSON.stringify({ runtime: "nodejs22.x", handler: "index.js", launcherType: "Nodejs" }, null, 2),
);
await mkdir(out, { recursive: true });
await writeFile(
  `${out}/config.json`,
  JSON.stringify({ version: 3, routes: [{ src: "^/api/(.*)$", dest: "/api" }, { handle: "filesystem" }] }, null, 2),
);

console.log(`Done. Output in ${out}`);
