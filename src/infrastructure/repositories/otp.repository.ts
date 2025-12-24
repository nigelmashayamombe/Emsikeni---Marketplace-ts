import { prisma } from '../../config/prisma';
import { IOtpRepository } from '../../application/interfaces/repositories/otp-repository.interface';
import { OtpType } from '../../domain/enums/otp-type.enum';

export class OtpRepository implements IOtpRepository {
  async createOtp(params: {
    userId: string;
    codeHash: string;
    type: OtpType;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.otp.create({ data: params });
  }

  async findValid(params: {
    userId: string;
    type: OtpType;
    expiresAfter: Date;
  }): Promise<any | null> {
    return prisma.otp.findFirst({
      where: {
        userId: params.userId,
        type: params.type,
        used: false,
        expiresAt: { gt: params.expiresAfter },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markUsed(id: string): Promise<void> {
    await prisma.otp.update({ where: { id }, data: { used: true } });
  }
}


