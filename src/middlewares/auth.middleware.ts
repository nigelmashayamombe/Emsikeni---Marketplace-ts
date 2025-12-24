import { NextFunction, Request, Response } from 'express';
import { config } from '../config/env';
import { TokenService } from '../infrastructure/services/token.service';
import { AppError } from '../shared/errors/app-error';

const tokenService = new TokenService(config.jwt);

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError({ message: 'Missing authorization header', statusCode: 401, code: 'UNAUTHORIZED' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = await tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    throw new AppError({ message: 'Invalid or expired token', statusCode: 401, code: 'UNAUTHORIZED' });
  }
};

