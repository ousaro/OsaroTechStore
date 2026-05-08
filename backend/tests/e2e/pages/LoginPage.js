// Frontend Playwright page object placeholder.
//
// Uncomment and wire this into the Cucumber steps once the storefront auth UI
// is ready and has stable selectors.
//
// export class LoginPage {
//   constructor(page) {
//     this.page = page;
//   }
//
//   async open() {
//     await this.page.goto("/login");
//   }
//
//   async signIn({ email, password }) {
//     await this.page.getByLabel(/email/i).fill(email);
//     await this.page.getByLabel(/password/i).fill(password);
//     await this.page.getByRole("button", { name: /sign in|login/i }).click();
//   }
//
//   async register({ firstName, lastName, email, password, confirmPassword }) {
//     await this.page.goto("/register");
//     await this.page.getByLabel(/first name/i).fill(firstName);
//     await this.page.getByLabel(/last name/i).fill(lastName);
//     await this.page.getByLabel(/email/i).fill(email);
//     await this.page.getByLabel(/^password$/i).fill(password);
//     await this.page.getByLabel(/confirm password/i).fill(confirmPassword);
//     await this.page.getByRole("button", { name: /create account|register/i }).click();
//   }
// }
