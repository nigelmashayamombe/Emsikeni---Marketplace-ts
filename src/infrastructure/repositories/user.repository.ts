import { prisma } from '../../config/prisma';
import { AccountStatus } from '../../domain/enums/account-status.enum';
import { Role } from '../../domain/enums/role.enum';
import { DocumentType } from '../../domain/enums/document-type.enum';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../../application/interfaces/repositories/user-repository.interface';

export class UserRepository implements IUserRepository {
  async count(): Promise<number> {
    return prisma.user.count();
  }

  async create(data: CreateUserDTO): Promise<any> {
    const user = await prisma.user.create({ data });
    return user;
  }

  async findByEmail(email: string): Promise<any | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByPhone(phone: string): Promise<any | null> {
    return prisma.user.findUnique({ where: { phone } });
  }

  async setStatus(id: string, status: AccountStatus): Promise<void> {
    await prisma.user.update({ where: { id }, data: { status } });
  }

  async setVerification(
    id: string,
    flags: { emailVerified?: boolean; phoneVerified?: boolean },
  ): Promise<void> {
    await prisma.user.update({ where: { id }, data: flags });
  }

  async addDocuments(
    userId: string,
    documents: { type: DocumentType; url: string }[],
  ): Promise<void> {
    if (!documents.length) return;
    await prisma.document.createMany({
      data: documents.map((d) => ({
        userId,
        type: d.type,
        url: d.url,
      })),
    });
  }

  async setDriverDetail(
    userId: string,
    detail: {
      licenseNumber?: string | undefined;
      vehicleMake?: string | undefined;
      vehicleModel?: string | undefined;
      vehicleNumberPlate?: string | undefined;
    },
  ): Promise<void> {
    await prisma.driverDetail.upsert({
      where: { userId },
      update: detail,
      create: { userId, ...detail },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async update(id: string, data: UpdateUserDTO): Promise<any> {
    return prisma.user.update({ where: { id }, data });
  }
  async findSuperAdmins(): Promise<any[]> {
    return prisma.user.findMany({ where: { role: Role.SUPER_ADMIN } });
  }
}


