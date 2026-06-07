import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../../..");
const srcRoot = path.join(backendRoot, "src");

const importPattern =
  /(?:import\s+(?:[^'"]+\s+from\s+)?|export\s+[^'"]+\s+from\s+|import\s*\()\s*["']([^"']+)["']/g;

const listFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    return entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".ts"))
      ? [fullPath]
      : [];
  });

const findImports = (filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  return [...source.matchAll(importPattern)].map((match) => match[1]);
};

const resolveImport = (fromFile, specifier) => {
  if (!specifier.startsWith(".")) return null;
  const resolved = path.resolve(path.dirname(fromFile), specifier);
  if (fs.existsSync(resolved)) return resolved;
  if (fs.existsSync(`${resolved}.js`)) return `${resolved}.js`;
  if (fs.existsSync(`${resolved}.ts`)) return `${resolved}.ts`;
  if (fs.existsSync(`${resolved}/index.js`)) return `${resolved}/index.js`;
  if (fs.existsSync(`${resolved}/index.ts`)) return `${resolved}/index.ts`;
  return null;
};

const layerFor = (filePath) => {
  const relative = path.relative(srcRoot, filePath);
  const segments = relative.split(path.sep);

  if (segments[0] === "shared") {
    const sharedLayer = segments[1];
    if (sharedLayer === "domain") return "domain";
    if (sharedLayer === "application") return "application";
    if (sharedLayer === "infrastructure") return "infrastructure";
    if (sharedLayer === "kernel") return "domain";
    return "shared";
  }

  if (segments[0] === "infrastructure") return "infrastructure";
  if (segments[0] === "app") return "infrastructure";

  if (segments[0] === "modules") {
    if (segments.includes("domain")) return "domain";
    if (segments.includes("application")) return "application";
    if (segments.includes("adapters")) return "infrastructure";
    if (segments.includes("ports")) return "application";
    return "module";
  }

  return "unknown";
};

test("domain layer must not import from application or infrastructure", () => {
  const violations = [];

  for (const filePath of listFiles(srcRoot)) {
    if (layerFor(filePath) !== "domain") continue;

    for (const specifier of findImports(filePath)) {
      const resolved = resolveImport(filePath, specifier);
      if (!resolved) continue;
      const targetLayer = layerFor(resolved);
      if (targetLayer === "application" || targetLayer === "infrastructure") {
        violations.push(
          `${path.relative(backendRoot, filePath)} imports from ${targetLayer}: ${specifier}`
        );
      }
    }
  }

  assert.deepEqual(violations, []);
});

test("application layer must not import from infrastructure", () => {
  const violations = [];

  for (const filePath of listFiles(srcRoot)) {
    if (layerFor(filePath) !== "application") continue;

    for (const specifier of findImports(filePath)) {
      const resolved = resolveImport(filePath, specifier);
      if (!resolved) continue;
      const targetLayer = layerFor(resolved);
      if (targetLayer === "infrastructure") {
        violations.push(
          `${path.relative(backendRoot, filePath)} imports from infrastructure: ${specifier}`
        );
      }
    }
  }

  assert.deepEqual(violations, []);
});

test("shared kernel (kernel/) must not import from outside domain", () => {
  const violations = [];
  const kernelDir = path.join(srcRoot, "shared", "kernel");

  const listKernelFiles = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listKernelFiles(fullPath);
      return entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".ts"))
        ? [fullPath]
        : [];
    });

  for (const filePath of listKernelFiles(kernelDir)) {
    for (const specifier of findImports(filePath)) {
      const resolved = resolveImport(filePath, specifier);
      if (!resolved) continue;
      const targetLayer = layerFor(resolved);
      if (targetLayer !== "domain" && targetLayer !== "shared") {
        violations.push(
          `${path.relative(backendRoot, filePath)} imports from non-domain: ${specifier} (${targetLayer})`
        );
      }
    }
  }

  assert.deepEqual(violations, []);
});
