import { env } from "./infrastructure/config/env.js";
import { startApplication } from "./app/startApplication.js";

try {
  await startApplication({ port: env.port, env });
} catch (error) {
  console.error("[Fatal] Application failed to start:", error);
  process.exit(1);
}
