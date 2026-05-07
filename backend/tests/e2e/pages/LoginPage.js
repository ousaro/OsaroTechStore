export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async open(url) {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async fillCredentials({ email, password }) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
  }
}
