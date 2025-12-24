import { OtpType } from '../../../domain/enums/otp-type.enum';

export interface IOtpRepository {
  createOtp(params: {
    userId: string;
    codeHash: string;
    type: OtpType;
    expiresAt: Date;
  }): Promise<void>;
  findValid(params: {
    userId: string;
    type: OtpType;
    expiresAfter: Date;
  }): Promise<any | null>;
  markUsed(id: string): Promise<void>;
}

