import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../shared/errors/app-error';

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      ...req.body,
      ...req.query,
      ...req.params,
    });
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw new AppError({ message: 'Validation failed', statusCode: 400, details: { errors: details } });
    }
    req.body = result.data;
    next();
  };


