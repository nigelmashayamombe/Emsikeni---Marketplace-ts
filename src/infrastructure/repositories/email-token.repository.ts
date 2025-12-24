import { prisma } from '../../config/prisma';
import { IEmailTokenRepository } from '../../application/interfaces/repositories/email-token-repository.interface';
import { EmailTokenType } from '../../domain/enums/email-token-type.enum';

export class EmailTokenRepository implements IEmailTokenRepository {
  async create(params: {
    userId: string;
    token: string;
    type: EmailTokenType;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.emailToken.create({ data: params });
  }

  async findValid(token: string, type: EmailTokenType): Promise<any | null> {
    return prisma.emailToken.findFirst({
      where: {
        token,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async markUsed(id: string): Promise<void> {
    await prisma.emailToken.update({ where: { id }, data: { used: true } });
  }
}


