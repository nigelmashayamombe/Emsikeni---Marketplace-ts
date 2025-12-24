import { OtpType } from '../../../domain/enums/otp-type.enum';

export interface IOtpService {
  generateCode(digits?: number): string;
  hashCode(code: string): Promise<string>;
  compare(code: string, hash: string): Promise<boolean>;
  sendOtp(params: { phone: string; code: string; type: OtpType }): Promise<void>;
}


