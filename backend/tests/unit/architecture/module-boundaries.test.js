import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const srcRoot = path.join(backendRoot, "src");
const modulesRoot = path.join(srcRoot, "modules");

const importPattern =
  /(?:import\s+(?:[^'"]+\s+from\s+)?|export\s+[^'"]+\s+from\s+|import\s*\()\s*["']([^"']+)["']/g;

const listJavaScriptFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJavaScriptFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".js") ? [fullPath] : [];
  });

const findImports = (filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  return [...source.matchAll(importPattern)].map((match) => match[1]);
};

const resolveImport = (fromFile, specifier) => {
  if (!specifier.startsWith(".")) return null;

  const resolved = path.resolve(path.dirname(fromFile), specifier);
  return path.extname(resolved) ? resolved : `${resolved}.js`;
};

const moduleNameFor = (filePath) => {
  const relative = path.relative(modulesRoot, filePath);
  return relative.split(path.sep)[0];
};

test("feature modules do not import each other's internals directly", () => {
  const violations = [];

  for (const filePath of listJavaScriptFiles(modulesRoot)) {
    const sourceModule = moduleNameFor(filePath);

    for (const specifier of findImports(filePath)) {
      const resolved = resolveImport(filePath, specifier);
      if (!resolved || !resolved.startsWith(modulesRoot)) continue;

      const targetModule = moduleNameFor(resolved);
      if (targetModule !== sourceModule) {
        violations.push(
          `${path.relative(backendRoot, filePath)} imports ${specifier} from ${targetModule}`
        );
      }
    }
  }

  assert.deepEqual(violations, []);
});
