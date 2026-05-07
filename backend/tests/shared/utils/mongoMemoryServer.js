import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export const createMongoMemoryTestServer = () => {
  let mongoServer;

  const connect = async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      dbName: `test_${process.pid}_${Date.now()}`,
      serverSelectionTimeoutMS: 5000,
    });
    return mongoose.connection;
  };

  const cleanup = async () => {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Cannot cleanup Mongo memory server before a connection is ready");
    }
    const { collections } = mongoose.connection;
    await Promise.all(
      Object.values(collections).map((collection) => collection.deleteMany({}))
    );
  };

  const disconnect = async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = undefined;
    }
  };

  return {
    connect,
    cleanup,
    disconnect,
    getUri: () => mongoServer?.getUri(),
    getConnection: () => mongoose.connection,
  };
};
