export interface IRefreshTokenRepository {
  create(params: { userId: string; token: string; expiresAt: Date }): Promise<void>;
  find(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: Date; revoked: boolean } | null>;
  revoke(id: string): Promise<void>;
}


