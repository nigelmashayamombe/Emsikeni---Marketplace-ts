import dotenv from 'dotenv';

dotenv.config();

type JwtConfig = {
  accessSecret: string;
  accessExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
};

type EmailConfig = {
  from: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
};

export type AppConfig = {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  appBaseUrl: string;
  jwt: JwtConfig;
  email: EmailConfig;
  otpExpiryMinutes: number;
  refreshTokenTtlDays: number;
  sms?: {
    apiUrl: string;
    apiKey: string;
    sender?: string;
  };
};

const requireEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: requireEnv('DATABASE_URL'),
  appBaseUrl: process.env.APP_BASE_URL ?? `http://localhost:${Number(process.env.PORT ?? 3000)}`,
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '2d',
  },
  email: {
    from: process.env.EMAIL_FROM ?? 'ultimateg090@gmail.com',
    smtpHost: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpUser: requireEnv('SMTP_USER'),
    smtpPassword: requireEnv('SMTP_PASSWORD'),
  },
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES ?? 10),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 2),
  sms: process.env.SMS_API_URL && process.env.SMS_API_KEY
    ? {
      apiUrl: process.env.SMS_API_URL,
      apiKey: process.env.SMS_API_KEY,
      sender: process.env.SMS_SENDER,
    }
    : undefined,
};

