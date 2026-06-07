#!/usr/bin/env node

import { MongoClient } from "mongodb";
import { migrate, migrateDown, create } from "./runner.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/osarotechstore";

const main = async () => {
  const command = process.argv[2];

  if (command === "create") {
    const name = process.argv[3];
    if (!name) {
      console.error("Usage: node migrations/migrate.js create <migration-name>");
      process.exit(1);
    }
    await create(name);
    return;
  }

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();

  try {
    if (command === "down") {
      const steps = parseInt(process.argv[3] || "1", 10);
      await migrateDown(db, steps);
      console.log("Migration(s) rolled back successfully.");
    } else {
      await migrate(db);
      console.log("All migrations applied successfully.");
    }
  } finally {
    await client.close();
  }
};

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
