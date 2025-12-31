import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validation.middleware';
import {
  approveSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
} from './auth.types';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { Role } from '../../domain/enums/role.enum';

const router = Router();

router.post('/auth/register', validate(registerSchema), authController.register);
router.post('/auth/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/auth/verify-phone', validate(verifyPhoneSchema), authController.verifyPhone);
router.post('/auth/login', validate(loginSchema), authController.login);
router.post('/auth/refresh', validate(refreshSchema), authController.refresh);

router.post(
  '/auth/approve-admin',
  authMiddleware,
  requireRoles(Role.SUPER_ADMIN),
  validate(approveSchema),
  authController.approveAdmin,
);

router.post(
  '/auth/decline-admin',
  authMiddleware,
  requireRoles(Role.SUPER_ADMIN),
  validate(approveSchema),
  authController.declineAdmin,
);

router.post(
  '/auth/approve-seller',
  authMiddleware,
  requireRoles(Role.ADMIN, Role.SUPER_ADMIN),
  validate(approveSchema),
  authController.approveSeller,
);

router.post(
  '/auth/decline-seller',
  authMiddleware,
  requireRoles(Role.ADMIN, Role.SUPER_ADMIN),
  validate(approveSchema),
  authController.declineSeller,
);

router.post(
  '/auth/approve-driver',
  authMiddleware,
  requireRoles(Role.ADMIN, Role.SUPER_ADMIN),
  validate(approveSchema),
  authController.approveDriver,
);

router.post(
  '/auth/decline-driver',
  authMiddleware,
  requireRoles(Role.ADMIN, Role.SUPER_ADMIN),
  validate(approveSchema),
  authController.declineDriver,
);

export { router as apiRouter };
