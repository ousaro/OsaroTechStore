import { env } from "./config/env.js";
import { startApplication } from "./app/startApplication.js";

startApplication({
  mongoUri: env.mongoUri,
  port: env.port,
}).catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
