import { NextFunction, Request, Response } from 'express';
import { Role } from '../domain/enums/role.enum';
import { AppError } from '../shared/errors/app-error';

export const requireRoles =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError({ message: 'Unauthorized', statusCode: 401 });
    }
    if (!roles.includes(req.user.role as Role)) {
      throw new AppError({ message: 'Forbidden', statusCode: 403, code: 'FORBIDDEN' });
    }
    next();
  };

