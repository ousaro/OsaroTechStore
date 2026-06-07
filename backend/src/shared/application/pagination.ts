export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  category?: string;
  status?: string;
  [key: string]: unknown;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const parsePagination = (query: Record<string, unknown>): PaginationParams => ({
  page: Math.max(Number(query.page) || 1, 1),
  limit: Math.min(Math.max(Number(query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT),
  sort: (query.sort as string) || undefined,
  order: (query.order as "asc" | "desc") === "desc" ? "desc" : "asc",
});

export const buildPaginationMeta = (total: number, params: PaginationParams): PaginationMeta => ({
  page: params.page,
  limit: params.limit,
  total,
  totalPages: Math.ceil(total / params.limit),
});

export const buildSkipLimit = (params: PaginationParams): { skip: number; limit: number } => ({
  skip: (params.page - 1) * params.limit,
  limit: params.limit,
});

export const buildSortOption = (
  params: PaginationParams,
  allowedFields: string[]
): Record<string, 1 | -1> => {
  if (!params.sort || !allowedFields.includes(params.sort)) {
    return { createdAt: -1 };
  }
  return { [params.sort]: params.order === "desc" ? -1 : 1 };
};
