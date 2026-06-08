import mongoose from "mongoose";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const createMongoProvider = ({
  uri,
  logger,
  minPoolSize = 2,
  maxPoolSize = 10,
  debug = false,
  slowOpThresholdMs = 200,
}) => {
  assertNonEmptyString(
    uri,
    "uri",
    "[MongoDB] MONGO_URI is required. " +
      "Set DATABASE_PROVIDER=mongo and MONGO_URI=<your-uri> in .env"
  );

  const connect = async () => {
    await mongoose.connect(uri, {
      minPoolSize,
      maxPoolSize,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info({ msg: "MongoDB connected", uri: uri.replace(/\/\/.*@/, "//<credentials>@") });

    if (debug) {
      mongoose.set("debug", (collectionName, method, query, doc, options) => {
        logger.info({ msg: "Mongoose query", collection: collectionName, method, query, options });
      });
    }

    mongoose.plugin((schema) => {
      schema.pre("find", function () {
        const start = Date.now();
        this._mongoslowtimer = start;
      });
      schema.post("find", function (_result) {
        const duration = Date.now() - (this._mongoslowtimer || Date.now());
        if (duration > slowOpThresholdMs) {
          logger.warn({
            msg: "Slow query detected",
            collection: this.mongooseCollection?.name,
            durationMs: duration,
            thresholdMs: slowOpThresholdMs,
            filter: this.getFilter(),
          });
        }
      });
    });
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
