import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, it } from "mocha";
import { expect } from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesRoot = path.resolve(__dirname, "../../modules");

const importSpecifierPattern =
  /\b(?:import|export)\b[\s\S]*?\bfrom\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

const listJavaScriptFiles = (directoryPath) => {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const absolutePath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return listJavaScriptFiles(absolutePath);
    }

    return entry.isFile() && absolutePath.endsWith(".js") ? [absolutePath] : [];
  });
};

const resolveImportPath = (sourceFilePath, specifier) => {
  const candidatePath = path.resolve(path.dirname(sourceFilePath), specifier);

  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    return candidatePath;
  }

  if (fs.existsSync(`${candidatePath}.js`)) {
    return `${candidatePath}.js`;
  }

  if (fs.existsSync(path.join(candidatePath, "index.js"))) {
    return path.join(candidatePath, "index.js");
  }

  return null;
};

const getModuleName = (absoluteFilePath) => {
  const relativePath = path.relative(modulesRoot, absoluteFilePath);
  const [moduleName] = relativePath.split(path.sep);
  return moduleName;
};

describe("module boundary imports", () => {
  it("only allows cross-module imports through public-api.js", () => {
    const violations = [];
    const moduleFiles = listJavaScriptFiles(modulesRoot);

    for (const sourceFilePath of moduleFiles) {
      const sourceModuleName = getModuleName(sourceFilePath);
      const sourceFileContents = fs.readFileSync(sourceFilePath, "utf8");

      for (const match of sourceFileContents.matchAll(importSpecifierPattern)) {
        const specifier = match[1] || match[2];

        if (!specifier?.startsWith(".")) {
          continue;
        }

        const resolvedImportPath = resolveImportPath(sourceFilePath, specifier);

        if (!resolvedImportPath || !resolvedImportPath.startsWith(modulesRoot)) {
          continue;
        }

        const targetModuleName = getModuleName(resolvedImportPath);

        if (targetModuleName === sourceModuleName) {
          continue;
        }

        if (path.basename(resolvedImportPath) !== "public-api.js") {
          violations.push({
            source: path.relative(modulesRoot, sourceFilePath),
            specifier,
            target: path.relative(modulesRoot, resolvedImportPath),
          });
        }
      }
    }

    expect(violations).to.deep.equal([]);
  });
});
