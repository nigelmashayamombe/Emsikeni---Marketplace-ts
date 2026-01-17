import { Router } from 'express';
import { categoriesController } from './categories.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createCategorySchema, updateCategorySchema } from './categories.types';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { Role } from '../../domain/enums/role.enum';

const router = Router();

// Public: View all categories
router.get('/categories', categoriesController.getAll);

// Admin: Create, Update, Delete
router.post(
    '/categories',
    authMiddleware,
    requireRoles(Role.ADMIN, Role.SUPER_ADMIN),
    validate(createCategorySchema),
    categoriesController.create,
);

router.put(
    '/categories/:id',
    authMiddleware,
    requireRoles(Role.ADMIN, Role.SUPER_ADMIN),
    validate(updateCategorySchema),
    categoriesController.update,
);

router.delete(
    '/categories/:id',
    authMiddleware,
    requireRoles(Role.ADMIN, Role.SUPER_ADMIN),
    categoriesController.delete,
);

export { router as categoriesRouter };
