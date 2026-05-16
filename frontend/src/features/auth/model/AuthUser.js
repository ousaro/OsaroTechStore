export class AuthUser {
  constructor(raw) {
    this.id         = raw._id;
    this.firstName  = raw.firstName || "";
    this.lastName   = raw.lastName  || "";
    this.email      = raw.email     || "";
    this.picture    = raw.picture   || null;
    this.isAdmin    = Boolean(raw.admin);
    this.token      = raw.token     || null;
    this.createdAt  = raw.createdAt;
    Object.freeze(this);
  }

  get fullName() { return `${this.firstName} ${this.lastName}`.trim(); }

  withToken(token) {
    return new AuthUser({ ...this, token, admin: this.isAdmin });
  }

  toJSON() {
    return {
      _id: this.id, firstName: this.firstName, lastName: this.lastName,
      email: this.email, picture: this.picture, admin: this.isAdmin,
      token: this.token, createdAt: this.createdAt,
    };
  }
}
