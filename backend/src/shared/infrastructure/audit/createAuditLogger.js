export const createAuditLogger = ({ dbClient }) => {
  const collection = dbClient.collection("audit_logs");

  return {
    async log({ action, actor, target, details, ip }) {
      await collection.insertOne({
        action,
        actor,
        target,
        details,
        ip,
        timestamp: new Date(),
      });
    },
  };
};
