import { describe, it } from "mocha";
import { expect } from "chai";
import {
  assertOrderRepositoryCommandPort,
  assertOrderRepositoryQueryPort,
} from "../../../modules/orders/ports/output/orderRepositoryPort.js";

describe("order repository port helpers", () => {
  it("accepts query-side repository methods", () => {
    expect(() =>
      assertOrderRepositoryQueryPort(
        {
          findAllSorted: async () => [],
          findById: async () => null,
        },
        ["findAllSorted", "findById"]
      )
    ).to.not.throw();
  });

  it("rejects write methods in the query-side assertion", () => {
    expect(() =>
      assertOrderRepositoryQueryPort(
        {
          create: async () => null,
        },
        ["create"]
      )
    ).to.throw("orderRepository query port must not require create");
  });
});
