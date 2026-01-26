import { Router } from 'express';
import { productsController } from './products.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createProductSchema, updateProductSchema, reviewProductSchema, getProductSchema } from './products.schema';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { Role } from '../../domain/enums/role.enum';
import { productUploadMiddleware } from '../../middlewares/product-upload.middleware';

const router = Router();

// Seller Routes - Management
// Note: '/my' routes must come before '/:id' to avoid capturing
router.get(
    '/my',
    authMiddleware,
    requireRoles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN), // Admin might want to see all? Service filters by sellerId if passed, or my logic. listMyProducts forces sellerId=user.id. Admin using this route would see "their" products (likely none).
    productsController.listMyProducts
);

router.get(
    '/my/:id',
    authMiddleware,
    requireRoles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN),
    productsController.getMyProduct
);

// Admin Routes
router.patch(
    '/:id/review',
    authMiddleware,
    requireRoles(Role.ADMIN, Role.SUPER_ADMIN),
    validate(reviewProductSchema),
    productsController.review
);

// General - Create (Seller)
router.post(
    '/',
    authMiddleware,
    requireRoles(Role.SELLER),
    productUploadMiddleware,
    validate(createProductSchema),
    productsController.create
);

// Update
router.put(
    '/:id',
    authMiddleware,
    requireRoles(Role.SELLER),
    validate(updateProductSchema),
    productsController.update
);

// Delete
router.delete(
    '/:id',
    authMiddleware,
    requireRoles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN),
    productsController.delete
);

// Public Routes
router.get(
    '/:id',
    validate(getProductSchema),
    productsController.getPublic
);

router.get(
    '/',
    productsController.listPublic
);

export const productRouter = router;
