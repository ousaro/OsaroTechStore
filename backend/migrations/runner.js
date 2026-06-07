import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));

const COLLECTION = "_migrations";

const getRanMigrations = async (db) => {
  try {
    const docs = await db.collection(COLLECTION).find().sort({ _id: 1 }).toArray();
    return new Set(docs.map((d) => d.name));
  } catch {
    return new Set();
  }
};

const markRan = (db, name) =>
  db.collection(COLLECTION).insertOne({ name, ranAt: new Date().toISOString() });

const markRolledBack = (db, name) => db.collection(COLLECTION).deleteOne({ name });

export const migrate = async (db) => {
  const files = readdirSync(__dirname)
    .filter((f) => f.match(/^\d+-.+\.js$/))
    .sort();

  const ran = await getRanMigrations(db);

  for (const file of files) {
    if (ran.has(file)) continue;
    const migration = await import(`./${file}`);
    console.log(`  → Running migration: ${file}`);
    await migration.up(db);
    await markRan(db, file);
    console.log(`  ✓ ${file}`);
  }
};

export const migrateDown = async (db, steps = 1) => {
  const files = readdirSync(__dirname)
    .filter((f) => f.match(/^\d+-.+\.js$/))
    .sort()
    .reverse();

  const ran = await getRanMigrations(db);
  let count = 0;

  for (const file of files) {
    if (count >= steps) break;
    if (!ran.has(file)) continue;
    const migration = await import(`./${file}`);
    console.log(`  → Rolling back: ${file}`);
    if (migration.down) await migration.down(db);
    await markRolledBack(db, file);
    console.log(`  ✓ Rolled back: ${file}`);
    count++;
  }
};

export const create = async (name) => {
  const { writeFileSync } = await import("node:fs");
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const filename = `${timestamp}-${name.replace(/\s+/g, "-")}.js`;
  const template = `// Migration: ${name}\n\nexport const up = async (db) => {\n  // TODO: implement\n};\n\nexport const down = async (db) => {\n  // TODO: implement\n};\n`;
  writeFileSync(join(__dirname, filename), template, "utf-8");
  console.log(`  Created migration: ${filename}`);
};
