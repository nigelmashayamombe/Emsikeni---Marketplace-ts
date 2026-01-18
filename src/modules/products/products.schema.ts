import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().nonnegative('Price must be non-negative'), // Expecting number from JSON, commonly handled as number in API
    quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
    categoryId: z.string().uuid('Invalid category ID'),
    images: z.array(z.string().url('Invalid image URL')).optional().default([]),
    status: z.enum([ProductStatus.DRAFT, ProductStatus.PENDING_REVIEW]).optional().default(ProductStatus.DRAFT),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    price: z.number().nonnegative().optional(),
    quantity: z.number().int().nonnegative().optional(),
    categoryId: z.string().uuid().optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum([ProductStatus.DRAFT, ProductStatus.PENDING_REVIEW]).optional(),
  }),
});

export const reviewProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    status: z.enum([ProductStatus.APPROVED, ProductStatus.REJECTED]),
    rejectionReason: z.string().optional(),
  }).refine((data) => {
    if (data.status === ProductStatus.REJECTED && !data.rejectionReason) {
      return false;
    }
    return true;
  }, {
    message: "Rejection reason is required when rejecting a product",
    path: ["rejectionReason"],
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ReviewProductInput = z.infer<typeof reviewProductSchema>['body'];
