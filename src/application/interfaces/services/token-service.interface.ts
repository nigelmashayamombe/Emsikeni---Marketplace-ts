export type AccessTokenPayload = {
  sub: string;
  role: string;
  status: string;
};

export interface ITokenService {
  signAccessToken(payload: AccessTokenPayload): Promise<string>;
  signRefreshToken(userId: string): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
  verifyRefreshToken(token: string): Promise<{ sub: string }>;
}


