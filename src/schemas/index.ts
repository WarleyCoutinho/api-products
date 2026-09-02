import z from "zod";

import { ProductStatus } from "../generated/prisma/enums.js";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const ProductSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  priceInCents: z.number().min(0),
  status: z.enum(ProductStatus),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const CreateProductBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  priceInCents: z.number().min(0),
  status: z.enum(ProductStatus).optional(),
});

export const UpdateProductBodySchema = CreateProductBodySchema.partial();

export const ListProductsQuerySchema = z.object({
  status: z.enum(ProductStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const ListProductsSchema = z.object({
  data: z.array(ProductSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
