import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";

const ctx = createIntegrationTestContext();

test("admin product image uploads use configured object storage endpoint", async () => {
  const admin = await ctx.createAdmin();
  const previousUploadUrl = process.env.PRODUCT_IMAGE_UPLOAD_URL;
  const previousPublicUrl = process.env.PRODUCT_IMAGE_PUBLIC_URL;
  const previousFetch = globalThis.fetch;
  const calls = [];

  process.env.PRODUCT_IMAGE_UPLOAD_URL = "https://storage.internal/products/";
  process.env.PRODUCT_IMAGE_PUBLIC_URL = "https://cdn.example.test/products/";
  globalThis.fetch = async (url, options) => {
    calls.push({ url: url.toString(), options });
    return { ok: true };
  };

  try {
    const response = await ctx.client.agent
      .post("/api/products/uploads")
      .set(ctx.authHeadersFor(admin))
      .set("Content-Type", "image/png")
      .send(Buffer.from("png"))
      .expect(201);

    assert.match(response.body.url, /^https:\/\/cdn\.example\.test\/products\/.+\.png$/);
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /^https:\/\/storage\.internal\/products\/.+\.png$/);
    assert.equal(calls[0].options.method, "PUT");
    assert.equal(calls[0].options.headers["Content-Type"], "image/png");
  } finally {
    if (previousUploadUrl === undefined) {
      delete process.env.PRODUCT_IMAGE_UPLOAD_URL;
    } else {
      process.env.PRODUCT_IMAGE_UPLOAD_URL = previousUploadUrl;
    }
    if (previousPublicUrl === undefined) {
      delete process.env.PRODUCT_IMAGE_PUBLIC_URL;
    } else {
      process.env.PRODUCT_IMAGE_PUBLIC_URL = previousPublicUrl;
    }
    globalThis.fetch = previousFetch;
  }
});
