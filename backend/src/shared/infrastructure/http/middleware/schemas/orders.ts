import { z } from "zod";

const orderItemSchema = z.object({
  product: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid product ID"),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  image: z.string().optional(),
});

const shippingAddressSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, "At least one order item is required"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().min(1),
  itemsPrice: z.number().nonnegative(),
  taxPrice: z.number().nonnegative().default(0),
  shippingPrice: z.number().nonnegative().default(0),
  totalPrice: z.number().positive(),
});
