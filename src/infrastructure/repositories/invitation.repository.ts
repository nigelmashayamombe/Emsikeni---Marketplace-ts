import { prisma } from '../../config/prisma';
import { IInvitationRepository } from '../../application/interfaces/repositories/invitation-repository.interface';

export class InvitationRepository implements IInvitationRepository {
  async create(params: {
    email: string;
    token: string;
    expiresAt: Date;
    invitedById?: string | undefined;
  }): Promise<any> {
    return prisma.invitation.create({ data: params });
  }

  async findByToken(token: string): Promise<any | null> {
    return prisma.invitation.findUnique({ where: { token } });
  }

  async markAccepted(id: string): Promise<void> {
    await prisma.invitation.update({
      where: { id },
      data: { accepted: true, acceptedAt: new Date() },
    });
  }
}


