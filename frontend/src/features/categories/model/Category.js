export class Category {
  constructor(raw) {
    this.id = raw._id;
    this.name = raw.name || "";
    this.description = raw.description || "";
    this.createdAt = raw.createdAt;
    Object.freeze(this);
  }
}
