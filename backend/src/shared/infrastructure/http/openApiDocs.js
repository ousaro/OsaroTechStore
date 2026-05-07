import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const backendRoot = path.resolve(path.dirname(currentFile), "../../../../");
const openApiPath = path.join(backendRoot, "docs/openapi.yaml");

const swaggerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OsaroTechStore API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/api-docs/openapi.yaml",
        dom_id: "#swagger-ui"
      });
    </script>
  </body>
</html>`;

export const registerOpenApiDocs = (app) => {
  app.get("/api-docs/openapi.yaml", async (_req, res, next) => {
    try {
      const spec = await readFile(openApiPath, "utf8");
      res.type("text/yaml").send(spec);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api-docs", (_req, res) => {
    res.type("html").send(swaggerHtml);
  });
};
