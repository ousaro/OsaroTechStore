import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, it } from "mocha";
import { expect } from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesRoot = path.resolve(__dirname, "../../modules");
const moduleLayers = new Set(["domain", "application", "ports", "adapters"]);

const importSpecifierPattern =
  /\b(?:import|export)\b[\s\S]*?\bfrom\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

const disallowedLayerDependencies = {
  domain: new Set(["application", "ports", "adapters"]),
  application: new Set(["adapters"]),
  ports: new Set(["application", "adapters"]),
  adapters: new Set([]),
};

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

const getModuleMetadata = (absoluteFilePath) => {
  const relativePath = path.relative(modulesRoot, absoluteFilePath);
  const [moduleName, moduleLayer] = relativePath.split(path.sep);

  return {
    moduleName,
    moduleLayer,
    relativePath,
  };
};

describe("module layer dependencies", () => {
  it("keeps domain, application, ports, and adapters aligned with inward dependencies", () => {
    const violations = [];
    const moduleFiles = listJavaScriptFiles(modulesRoot);

    for (const sourceFilePath of moduleFiles) {
      const sourceMetadata = getModuleMetadata(sourceFilePath);

      if (!moduleLayers.has(sourceMetadata.moduleLayer)) {
        continue;
      }

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

        const targetMetadata = getModuleMetadata(resolvedImportPath);

        if (targetMetadata.moduleName !== sourceMetadata.moduleName) {
          continue;
        }

        if (!moduleLayers.has(targetMetadata.moduleLayer)) {
          continue;
        }

        if (
          disallowedLayerDependencies[sourceMetadata.moduleLayer].has(
            targetMetadata.moduleLayer
          )
        ) {
          violations.push({
            source: sourceMetadata.relativePath,
            specifier,
            target: targetMetadata.relativePath,
          });
        }
      }
    }

    expect(violations).to.deep.equal([]);
  });
});
