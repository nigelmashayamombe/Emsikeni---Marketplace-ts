import { config } from './env';

export const jwtConfig = {
  accessSecret: config.jwt.accessSecret,
  accessExpiresIn: config.jwt.accessExpiresIn,
  refreshSecret: config.jwt.refreshSecret,
  refreshExpiresIn: config.jwt.refreshExpiresIn,
};

