export interface IdempotencyStore {
  isProcessed(key: string): Promise<boolean>;
  markProcessed(key: string, ttlSeconds?: number): Promise<void>;
}

const COLLECTION = "_idempotency";

interface IdempotencyDoc {
  key: string;
  processedAt: string;
  expiresAt: Date;
}

export const createMongoIdempotencyStore = (db: {
  collection: (name: string) => {
    findOne: (filter: Record<string, unknown>) => Promise<IdempotencyDoc | null>;
    updateOne: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      options: { upsert: boolean }
    ) => Promise<unknown>;
  };
}): IdempotencyStore => ({
  async isProcessed(key: string): Promise<boolean> {
    const doc = await db.collection(COLLECTION).findOne({ key });
    return doc !== null;
  },

  async markProcessed(key: string, ttlSeconds = 86400): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await db
      .collection(COLLECTION)
      .updateOne(
        { key },
        { $set: { key, processedAt: new Date().toISOString(), expiresAt } },
        { upsert: true }
      );
  },
});
