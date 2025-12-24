import bcrypt from 'bcryptjs';
import { IOtpService } from '../../application/interfaces/services/otp-service.interface';
import { OtpType } from '../../domain/enums/otp-type.enum';
import { generateOtpCode } from '../../utils/otp.util';
import { config } from '../../config/env';

export class OtpService implements IOtpService {
  generateCode(digits = 6): string {
    return generateOtpCode(digits);
  }

  async hashCode(code: string): Promise<string> {
    return bcrypt.hash(code, 10);
  }

  async compare(code: string, hash: string): Promise<boolean> {
    return bcrypt.compare(code, hash);
  }

  async sendOtp(params: { phone: string; code: string; type: OtpType }): Promise<void> {
    if (config.sms?.apiUrl) {
      await fetch(config.sms.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.sms.apiKey ?? config.sms.apiKey}`,
        },
        body: JSON.stringify({
          to: params.phone,
          message: `${params.type} code: ${params.code}`,
          sender: config.sms.sender,
        }),
      });
      return;
    }
    // Fallback for environments without SMS provider
    // eslint-disable-next-line no-console
    console.info(`OTP for ${params.phone}: ${params.code}`);
  }
}


