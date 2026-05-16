
import mongoose from "mongoose";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const createMongoProvider = ({ uri, logger }) => {
  assertNonEmptyString(
    uri,
    "uri",
    "[MongoDB] MONGO_URI is required. " +
      "Set DATABASE_PROVIDER=mongo and MONGO_URI=<your-uri> in .env"
  );

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

  const getConnection = () => {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("[MongoDB] Connection is not open. Call connect() first.");
    }
    return mongoose.connection;
  };

  const getName = () => "mongo";

  return { connect, disconnect, getConnection, getName };
};
