import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, it } from "mocha";
import { expect } from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesRoot = path.resolve(__dirname, "../../modules");

const compositionFiles = [
  "auth/composition.js",
  "categories/composition.js",
  "orders/composition.js",
  "payments/composition.js",
  "products/composition.js",
  "users/composition.js",
];

describe("composition root dependencies", () => {
  it("keeps module composition files free from concrete output adapter construction", () => {
    const violations = compositionFiles.flatMap((relativePath) => {
      const filePath = path.join(modulesRoot, relativePath);
      const source = fs.readFileSync(filePath, "utf8");
      const hasConcreteOutputImport =
        source.includes('/adapters/output/') ||
        source.includes('from "./adapters/output/') ||
        source.includes('from "../adapters/output/');

      return hasConcreteOutputImport ? [relativePath] : [];
    });

    expect(violations).to.deep.equal([]);
  });
});
