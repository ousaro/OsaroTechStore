interface SoftDeleteDoc {
  isDeleted?: boolean;
  deletedAt?: Date | null;
  save(): Promise<unknown>;
  constructor: {
    findByIdAndUpdate: (
      id: string,
      update: Record<string, unknown>,
      options: Record<string, unknown>
    ) => Promise<unknown>;
  };
}

type ModelWithSoftDelete = {
  find: (filter?: Record<string, unknown>) => {
    sort: (s: Record<string, unknown>) => {
      skip: (n: number) => { limit: (n: number) => Promise<unknown[]> };
    };
  };
  findById: (id: string) => Promise<unknown>;
  findByIdAndUpdate: (
    id: string,
    update: Record<string, unknown>,
    options: Record<string, unknown>
  ) => Promise<unknown>;
  findOneAndUpdate: (
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: Record<string, unknown>
  ) => Promise<unknown>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
};

export const addSoftDeleteFields = {
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
};

export const applySoftDeleteToFindAll = (
  model: ModelWithSoftDelete,
  query: Record<string, unknown> = {}
) => model.find({ ...query, isDeleted: { $ne: true } });

export const applySoftDeleteToFindById = (model: ModelWithSoftDelete, id: string) =>
  model.findById(id);

export const applySoftDeleteToDelete = async (model: ModelWithSoftDelete, id: string) =>
  model.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });

export const applySoftDeleteToRestore = async (model: ModelWithSoftDelete, id: string) =>
  model.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
