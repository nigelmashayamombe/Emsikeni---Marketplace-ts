import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { Role } from '../../domain/enums/role.enum';
import { validate } from '../../middlewares/validation.middleware';
import { updateOrderStatusSchema, createOrderSchema } from './orders.types';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get(
    '/orders/seller',
    requireRoles(Role.SELLER),
    ordersController.listSellerOrders
);

router.get(
    '/orders/seller/:id',
    requireRoles(Role.SELLER),
    ordersController.getOrderDetails
);

router.patch(
    '/orders/seller/:id/status',
    requireRoles(Role.SELLER),
    validate(updateOrderStatusSchema),
    ordersController.updateStatus
);

// --- Buyer Routes ---

// Place new order
// Allowing BUYER role.
router.post(
    '/orders/my',
    requireRoles(Role.BUYER),
    validate(createOrderSchema),
    ordersController.placeOrder
);

// List my orders
router.get(
    '/orders/my',
    requireRoles(Role.BUYER),
    ordersController.listMyOrders
);

// Get my order details
router.get(
    '/orders/my/:id',
    requireRoles(Role.BUYER),
    ordersController.getMyOrder
);

// --- Admin Routes ---
router.patch(
    '/orders/admin/:id/status',
    requireRoles(Role.ADMIN, Role.SUPER_ADMIN),
    validate(updateOrderStatusSchema),
    ordersController.updateStatusAdmin
);

export { router as ordersRouter };
