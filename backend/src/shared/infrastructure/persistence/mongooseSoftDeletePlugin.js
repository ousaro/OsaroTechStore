export const softDeletePlugin = (schema) => {
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  });

  schema.pre(/^find/, function (next) {
    if (!this.getQuery().includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
    next();
  });

  schema.pre("findOneAndUpdate", function (next) {
    if (!this.getQuery().includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
    next();
  });

  schema.pre("countDocuments", function (next) {
    if (!this.getQuery().includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
    next();
  });
};

export const softDelete = async (model, id) =>
  model.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });

export const restore = async (model, id) =>
  model.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
