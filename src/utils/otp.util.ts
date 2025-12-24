import crypto from 'crypto';

export const generateOtpCode = (digits = 6): string => {
  const max = 10 ** digits;
  const code = crypto.randomInt(0, max).toString().padStart(digits, '0');
  return code;
};

