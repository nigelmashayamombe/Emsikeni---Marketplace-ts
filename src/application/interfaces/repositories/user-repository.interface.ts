import { AccountStatus } from '../../../domain/enums/account-status.enum';
import { Role } from '../../../domain/enums/role.enum';
import { DocumentType } from '../../../domain/enums/document-type.enum';

export type CreateUserDTO = {
  email: string;
  phone: string;
  passwordHash?: string;
  role: Role;
  status?: AccountStatus;
  isSuperAdmin?: boolean;
  fullName?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: Date;
  nationalId?: string;
  invitationId?: string | null;
};

export type UpdateUserDTO = Partial<Omit<CreateUserDTO, 'email' | 'role'>>;

export interface IUserRepository {
  count(): Promise<number>;
  create(data: CreateUserDTO): Promise<any>;
  findByEmail(email: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  findByPhone(phone: string): Promise<any | null>;
  setStatus(id: string, status: AccountStatus): Promise<void>;
  setVerification(
    id: string,
    flags: { emailVerified?: boolean; phoneVerified?: boolean },
  ): Promise<void>;
  addDocuments(
    userId: string,
    documents: { type: DocumentType; url: string }[],
  ): Promise<void>;
  setDriverDetail(
    userId: string,
    detail: {
      licenseNumber?: string;
      vehicleMake?: string;
      vehicleModel?: string;
      vehicleNumberPlate?: string;
    },
  ): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  findSuperAdmins(): Promise<any[]>;
}

