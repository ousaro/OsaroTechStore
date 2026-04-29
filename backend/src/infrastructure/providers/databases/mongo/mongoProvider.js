/**
 * MongoDB Provider.
 *
 * Manages the Mongoose connection lifecycle.
 * Exposes ONLY a raw connection/client — it does NOT know about
 * any domain repository. The composition root wires repositories.
 *
 * This is the fix for the original bug where mongoProvider imported
 * all 6 module repositories — inverting the dependency direction.
 */

import mongoose from "mongoose";

export const createMongoProvider = ({ uri, logger }) => {
  if (!uri) {
    throw new Error(
      "[MongoDB] MONGO_URI is required. " +
        "Set DATABASE_PROVIDER=mongo and MONGO_URI=<your-uri> in .env"
    );
  }

  const connect = async () => {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info({ msg: "MongoDB connected", uri: uri.replace(/\/\/.*@/, "//<credentials>@") });
  };

  const disconnect = async () => {
    await mongoose.disconnect();
    logger.info({ msg: "MongoDB disconnected" });
  };

  /**
   * Returns the raw mongoose connection.
   * Repository factories receive this — they do NOT receive the provider.
   * The composition root does: createMongooseOrderRepository(provider.getConnection())
   */
  const getConnection = () => {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("[MongoDB] Connection is not open. Call connect() first.");
    }
    return mongoose.connection;
  };

  return { connect, disconnect, getConnection };
};
