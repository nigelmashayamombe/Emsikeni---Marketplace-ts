import { z } from 'zod';

export const adjustStockSchema = z.object({
  body: z.object({
    adjustment: z.number().int().refine((n) => n !== 0, {
      message: "Adjustment must be non-zero",
    }),
  }),
});

export const setStockSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0, {
      message: "Quantity must be non-negative",
    }),
  }),
});

export const updateLowStockThresholdSchema = z.object({
  body: z.object({
    threshold: z.number().int().min(0, {
      message: "Threshold must be non-negative",
    }),
  }),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>['body'];
export type SetStockInput = z.infer<typeof setStockSchema>['body'];
export type UpdateLowStockThresholdInput = z.infer<typeof updateLowStockThresholdSchema>['body'];
