import { z } from "zod";

export const objectIdParam = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId"),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const moneySchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("USD"),
});
