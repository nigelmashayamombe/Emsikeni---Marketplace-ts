import jwt from 'jsonwebtoken';
import { AccessTokenPayload, ITokenService } from '../../application/interfaces/services/token-service.interface';

type JwtSettings = {
  accessSecret: string;
  accessExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
};

export class TokenService implements ITokenService {
  constructor(private readonly settings: JwtSettings) {}

  async signAccessToken(payload: AccessTokenPayload): Promise<string> {
    return jwt.sign(payload, this.settings.accessSecret, {
      expiresIn: this.settings.accessExpiresIn,
    });
  }

  async signRefreshToken(userId: string): Promise<string> {
    return jwt.sign({ sub: userId }, this.settings.refreshSecret, {
      expiresIn: this.settings.refreshExpiresIn,
    });
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return jwt.verify(token, this.settings.accessSecret) as AccessTokenPayload;
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string }> {
    return jwt.verify(token, this.settings.refreshSecret) as { sub: string };
  }
}


