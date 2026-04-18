import { env } from "./config/env.js";
import { createApp } from "./app/createApp.js";
import { startNewProductStatusScheduler } from "./modules/products/index.js";
import { connectMongo } from "./shared/infrastructure/persistence/connectMongo.js";

const start = async () => {
  await connectMongo(env.mongoUri);
  const app = createApp();
  startNewProductStatusScheduler();

  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
    console.log(`Swagger UI: http://localhost:${env.port}/api/docs`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
