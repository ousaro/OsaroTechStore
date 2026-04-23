import { describe, it } from "mocha";
import { expect } from "chai";
import { resolveDatabaseStrategy } from "../../../infrastructure/providers/databases/databaseStrategies.js";

describe("database strategies", () => {
  it("builds the MongoDB repository bundle", () => {
    const databaseStrategy = resolveDatabaseStrategy({
      provider: "mongo",
      connection: "mongodb://127.0.0.1:27017/osarotechstore-test",
    });

    const repositories = databaseStrategy.createRepositories();

    expect(databaseStrategy.label).to.equal("MongoDB");
    expect(repositories.authUserRepository).to.be.an("object");
    expect(repositories.categoryRepository).to.be.an("object");
    expect(repositories.orderRepository).to.be.an("object");
    expect(repositories.paymentRepository).to.be.an("object");
    expect(repositories.productRepository).to.be.an("object");
    expect(repositories.userRepositoryFactory).to.be.a("function");
  });

  it("fails fast for unsupported database providers", async () => {
    const databaseStrategy = resolveDatabaseStrategy({
      provider: "postgres",
      connection: "postgres://localhost/osarotechstore",
    });

    let capturedError;

    try {
      await databaseStrategy.connect();
    } catch (error) {
      capturedError = error;
    }

    expect(capturedError).to.be.instanceOf(Error);
    expect(capturedError.message).to.equal("PostgreSQL database strategy is not implemented yet");
  });
});
