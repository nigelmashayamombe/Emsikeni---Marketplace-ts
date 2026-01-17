import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    parentId: z.union([z.string().uuid(), z.string().length(0)]).nullable().optional().transform(e => e === "" ? null : e),
});

export const updateCategorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).optional(),
    parentId: z.union([z.string().uuid(), z.string().length(0)]).nullable().optional().transform(e => e === "" ? null : e),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
