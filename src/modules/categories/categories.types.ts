import { z } from 'zod';

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        parentId: z.string().uuid('Invalid parent ID').optional(),
    }),
});

export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(1).optional(),
        parentId: z.string().uuid().nullable().optional(),
    }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
