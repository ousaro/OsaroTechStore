import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.resolve(__dirname, "../../../docs/openapi.yaml");

let spec = null;
let ajv = null;

export function loadOpenApiSpec() {
  if (spec) {return spec;}
  spec = yaml.load(fs.readFileSync(specPath, "utf8"));
  return spec;
}

export function getPathsRequiringAuth() {
  const s = loadOpenApiSpec();
  const result = [];
  for (const [route, methods] of Object.entries(s.paths)) {
    for (const [method, def] of Object.entries(methods)) {
      const requiresAuth = def.security?.some((sec) => sec.BearerAuth);
      result.push({ route, method: method.toUpperCase(), requiresAuth: !!requiresAuth });
    }
  }
  return result;
}

export function getSchemaForResponse(route, method, statusCode = "200") {
  const s = loadOpenApiSpec();
  const pathItem = s.paths[route];
  if (!pathItem) { return null; }
  const operation = pathItem[method.toLowerCase()];
  if (!operation) { return null; }
  const response = operation.responses?.[statusCode];
  if (!response) { return null; }
  return response.content?.["application/json"]?.schema || null;
}

export function validateResponseAgainstSchema(responseBody, schema) {
  if (!ajv) {
    ajv = new Ajv({ strict: false });
    ajv.addKeyword("example");
  }
  const validate = ajv.compile(schema);
  const valid = validate(responseBody);
  if (valid) { return { valid: true, errors: null }};
  return { valid: false, errors: validate.errors };
}

export function validateStatusCode(response, expectedStatus) {
  if (response.status !== expectedStatus) {
    return { valid: false, message: `Expected ${expectedStatus}, got ${response.status}` };
  }
  return { valid: true, message: null };
}
