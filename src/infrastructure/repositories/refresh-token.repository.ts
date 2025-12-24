import { prisma } from '../../config/prisma';
import { IRefreshTokenRepository } from '../../application/interfaces/repositories/refresh-token-repository.interface';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(params: { userId: string; token: string; expiresAt: Date }): Promise<void> {
    await prisma.refreshToken.create({ data: params });
  }

  async find(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: Date; revoked: boolean } | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async revoke(id: string): Promise<void> {
    await prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
  }
}


