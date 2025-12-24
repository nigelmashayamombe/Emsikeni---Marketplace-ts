import { NextFunction, Request, Response } from 'express';
import { AppError } from '../shared/errors/app-error';

// Centralized error handler to avoid leaking internals
export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : 'Internal server error';
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const details = isAppError ? err.details : undefined;

  if (!isAppError) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    success: false,
    code,
    message,
    ...(details ? { details } : {}),
  });
};

