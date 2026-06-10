const fs = require("fs");
const path = require("path");

const sourceRoot = path.join(__dirname, "features");
const guardedFolders = new Set(["api", "model", "services"]);
const featureNames = new Set(
  fs
    .readdirSync(sourceRoot)
    .filter((entry) => fs.statSync(path.join(sourceRoot, entry)).isDirectory())
);

const listSourceFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    return /\.(js|jsx)$/.test(entry.name) ? [fullPath] : [];
  });

test("feature api, model, and service files do not import other feature internals", () => {
  const violations = [];

  for (const featureName of featureNames) {
    const featureRoot = path.join(sourceRoot, featureName);
    for (const folder of guardedFolders) {
      const folderPath = path.join(featureRoot, folder);
      if (!fs.existsSync(folderPath)) continue;

      for (const filePath of listSourceFiles(folderPath)) {
        const source = fs.readFileSync(filePath, "utf8");
        const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);

        for (const importPath of imports) {
          const importedFeature = importPath.match(/^\.\.\/\.\.\/([^/]+)/)?.[1];
          if (
            importedFeature &&
            importedFeature !== featureName &&
            featureNames.has(importedFeature)
          ) {
            violations.push(`${path.relative(__dirname, filePath)} imports ${importPath}`);
          }
        }
      }
    }
  }

  expect(violations).toEqual([]);
});
