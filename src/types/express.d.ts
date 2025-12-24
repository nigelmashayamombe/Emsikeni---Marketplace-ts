import { AccessTokenPayload } from '../application/interfaces/services/token-service.interface';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
