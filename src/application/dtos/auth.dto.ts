import { Role } from '../../domain/enums/role.enum';
import { DocumentType } from '../../domain/enums/document-type.enum';

export type RegisterUserInput = {
  email: string;
  phone: string;
  password: string;
  role: Role;
  fullName?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  nationalId?: string;
  documents?: Partial<Record<DocumentType, string>>;
  driver?: {
    licenseNumber?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleNumberPlate?: string;
  };
  files?: { [fieldname: string]: Express.Multer.File[] };
};

export type VerifyEmailInput = {
  token: string;
};

export type VerifyPhoneInput = {
  phone: string;
  code: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RefreshTokenInput = {
  refreshToken: string;
};

export type InviteAdminInput = {
  email: string;
  phone: string;
  fullName?: string;
};

export type AcceptAdminInvitationInput = {
  token: string;
  password: string;
  phone: string;
};

export type ApproveUserInput = {
  userId: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

