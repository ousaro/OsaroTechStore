export class CheckoutPage {
  constructor(page) {
    this.page = page;
  }

  async openCheckout(url) {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async captureFailureEvidence() {
    return this.page.screenshot({ fullPage: true });
  }
}
