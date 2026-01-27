import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const updateOrderStatusSchema = z.object({
    status: z.nativeEnum(OrderStatus),
});

export const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive()
    })).min(1, "Order must contain at least one item")
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
