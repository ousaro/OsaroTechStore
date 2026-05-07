import { After, Before, Status } from "@cucumber/cucumber";
import { existsSync } from "node:fs";
import { chromium, request } from "playwright";
import { createMongoMemoryTestServer } from "../../shared/utils/mongoMemoryServer.js";
import { createTestApplication } from "../../shared/utils/testApp.js";
import { createStripeGatewayMock } from "../../shared/mocks/stripeGatewayMock.js";

Before(async function () {
  this.mongo = createMongoMemoryTestServer();
  const dbClient = await this.mongo.connect();
  this.stripeGateway = createStripeGatewayMock();
  this.application = createTestApplication({
    dbClient,
    paymentGateway: this.stripeGateway,
  });

  this.server = this.application.app.listen(0);
  await new Promise((resolve) => this.server.once("listening", resolve));
  const { port } = this.server.address();
  this.baseURL = `http://127.0.0.1:${port}`;

  this.api = await request.newContext({
    baseURL: this.baseURL,
    extraHTTPHeaders: { "content-type": "application/json" },
  });

  this.browser = await chromium.launch({
    headless: process.env.PLAYWRIGHT_HEADLESS !== "false",
    executablePath: existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : undefined,
  });
  this.page = await this.browser.newPage();
});

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, "image/png");
  }

  await this.api?.dispose();
  await this.browser?.close();
  await new Promise((resolve) => this.server?.close(resolve));
  await this.mongo?.disconnect();
});
