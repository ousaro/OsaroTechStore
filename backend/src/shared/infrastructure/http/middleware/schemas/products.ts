import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  countInStock: z.number().int().nonnegative().default(0),
  image: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, "Comment is required").max(1000),
});
