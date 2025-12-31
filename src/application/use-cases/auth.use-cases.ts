import { randomUUID } from 'crypto';
import { AccountStatus } from '../../domain/enums/account-status.enum';
import { DocumentType } from '../../domain/enums/document-type.enum';
import { EmailTokenType } from '../../domain/enums/email-token-type.enum';
import { OtpType } from '../../domain/enums/otp-type.enum';
import { Role } from '../../domain/enums/role.enum';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { PhoneNumber } from '../../domain/value-objects/phone.vo';
import { IEmailTokenRepository } from '../interfaces/repositories/email-token-repository.interface';
import { IOtpRepository } from '../interfaces/repositories/otp-repository.interface';
import { IRefreshTokenRepository } from '../interfaces/repositories/refresh-token-repository.interface';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { IEmailService } from '../interfaces/services/email-service.interface';
import { IHashService } from '../interfaces/services/hash-service.interface';
import { IOtpService } from '../interfaces/services/otp-service.interface';
import { ITokenService } from '../interfaces/services/token-service.interface';
import {
  ApproveUserInput,
  LoginInput,
  RefreshTokenInput,
  RegisterUserInput,
  VerifyEmailInput,
  VerifyPhoneInput,
  Tokens,
} from '../dtos/auth.dto';
import { config } from '../../config/env';
import { IFileStorageService } from '../../application/interfaces/services/file-storage.interface';
import { AppError } from '../../shared/errors/app-error';
import { User } from '../../domain/entities/user.entity';

type Dependencies = {
  userRepo: IUserRepository;
  otpRepo: IOtpRepository;
  emailTokenRepo: IEmailTokenRepository;
  refreshTokenRepo: IRefreshTokenRepository;
  emailService: IEmailService;
  tokenService: ITokenService;
  otpService: IOtpService;
  hashService: IHashService;
  storageService: IFileStorageService;
  otpExpiryMinutes: number;
  refreshTokenTtlDays: number;
};

export class RegisterUserUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: RegisterUserInput): Promise<{ userId: string }> {
    // Check for duplicate user
    const email = Email.create(input.email);
    const existingByEmail = await this.deps.userRepo.findByEmail(email.getValue());
    if (existingByEmail) {
      throw new AppError({ message: 'Email already registered', statusCode: 409, code: 'DUPLICATE_EMAIL' });
    }
    const phone = PhoneNumber.create(input.phone);
    const existingByPhone = await this.deps.userRepo.findByPhone(phone.getValue());
    if (existingByPhone) {
      throw new AppError({ message: 'Phone already registered', statusCode: 409, code: 'DUPLICATE_PHONE' });
    }

    // Process File Uploads
    const uploadedDocs: Partial<Record<DocumentType, string>> = {};
    if (input.files) {
      for (const [fieldName, files] of Object.entries(input.files)) {
        if (files && files.length > 0) {
          const file = files[0];
          const url = await this.deps.storageService.save({
            buffer: file.buffer,
            mimeType: file.mimetype,
          });

          // Map field names to DocumentType
          // Assuming field names match DocumentType values (e.g., 'nationalId', 'proofOfResidence')
          // Or we have a mapping. For now, let's cast if it matches.
          if (Object.values(DocumentType).includes(fieldName as DocumentType)) {
            uploadedDocs[fieldName as DocumentType] = url;
          }
        }
      }
    }

    // Merge uploaded documents with any existing documents in input (logic requirement)
    // Actually, input.documents might be empty if we rely solely on uploads now.
    // Let's ensure requirements are checked against the final set of documents.

    const finalDocuments = { ...input.documents, ...uploadedDocs };

    const isFirstUser = (await this.deps.userRepo.count()) === 0;

    // SuperAdmin creation only allowed for first user
    if (input.role === Role.SUPER_ADMIN && !isFirstUser) {
      throw new AppError({
        message: 'SuperAdmin already exists',
        statusCode: 403,
        code: 'FORBIDDEN',
      });
    }

    const role = isFirstUser ? Role.SUPER_ADMIN : input.role;
    const isSuperAdmin = role === Role.SUPER_ADMIN;

    const password = Password.create(input.password);
    const passwordHash = await this.deps.hashService.hash(password.getValue());


    if (role === Role.BUYER) {
      const requiredBuyerFields = ['fullName', 'address', 'gender', 'dateOfBirth', 'nationalId'] as const;
      const missing = requiredBuyerFields.filter((field) => !input[field]);
      if (missing.length) {
        throw new AppError({
          message: `Missing required buyer fields: ${missing.join(', ')}`,
          statusCode: 400,
        });
      }
    }

    if (role === Role.SELLER || role === Role.DRIVER) {
      const requiredDocuments = [DocumentType.NATIONAL_ID, DocumentType.PROOF_OF_RESIDENCE, DocumentType.SELFIE];
      const driverDocuments =
        role === Role.DRIVER ? [DocumentType.DRIVER_LICENSE, DocumentType.VEHICLE_DOCUMENT] : [];
      const expectedDocs = [...requiredDocuments, ...driverDocuments];

      const missingDocs = expectedDocs.filter(doc => !finalDocuments[doc]);

      if (missingDocs.length > 0) {
        throw new AppError({
          message: `Missing required documents: ${missingDocs.join(', ')}`,
          statusCode: 400,
        });
      }

      if (role === Role.DRIVER && (!input.driver?.licenseNumber || !input.driver?.vehicleNumberPlate)) {
        throw new AppError({
          message: 'Driver license number and vehicle number plate are required',
          statusCode: 400,
        });
      }
    }

    const created = await this.deps.userRepo.create({
      email: email.getValue(),
      phone: phone.getValue(),
      passwordHash,
      role,
      status: AccountStatus.PENDING,
      isSuperAdmin,
      fullName: input.fullName,
      address: input.address,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      nationalId: input.nationalId,
    });

    if (!created?.id) {
      throw new AppError({ message: 'User creation failed', statusCode: 500 });
    }

    // Persist documents
    if (Object.keys(finalDocuments).length > 0) {
      const documentsToSave = Object.entries(finalDocuments).map(([type, url]) => ({
        type: type as DocumentType,
        url: url as string
      }));
      await this.deps.userRepo.addDocuments(created.id, documentsToSave);
    }

    // ... rest of the logic (driver details, tokens) - handled below by just keeping existing code or merging
    if (input.driver) {
      await this.deps.userRepo.setDriverDetail(created.id, input.driver);
    }

    // email token
    const emailToken = randomUUID();
    await this.deps.emailTokenRepo.create({
      userId: created.id,
      token: emailToken,
      type: EmailTokenType.EMAIL_VERIFICATION,
      expiresAt: this.addMinutes(this.deps.otpExpiryMinutes),
    });
    await this.deps.emailService.sendEmailVerification({
      to: email.getValue(),
      token: emailToken,
    });

    // phone OTP
    const phoneOtp = this.deps.otpService.generateCode();
    const phoneOtpHash = await this.deps.otpService.hashCode(phoneOtp);
    await this.deps.otpRepo.createOtp({
      userId: created.id,
      codeHash: phoneOtpHash,
      type: OtpType.PHONE,
      expiresAt: this.addMinutes(this.deps.otpExpiryMinutes),
    });
    await this.deps.otpService.sendOtp({
      phone: phone.getValue(),
      code: phoneOtp,
      type: OtpType.PHONE,
    });

    return { userId: created.id };
  }

  private addMinutes(minutes: number): Date {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }
}

export class VerifyEmailUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: VerifyEmailInput): Promise<void> {
    const tokenRecord = await this.deps.emailTokenRepo.findValid(
      input.token,
      EmailTokenType.EMAIL_VERIFICATION,
    );
    if (!tokenRecord) {
      throw new AppError({ message: 'Invalid or expired email token', statusCode: 400 });
    }

    const user = await this.deps.userRepo.findById(tokenRecord.userId);
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404 });
    }

    await this.deps.emailTokenRepo.markUsed(tokenRecord.id);
    await this.deps.userRepo.setVerification(user.id, { emailVerified: true });
    await this.tryActivateUser(user.id);
  }

  private async tryActivateUser(userId: string) {
    const user = await this.deps.userRepo.findById(userId);
    if (!user) return;
    const domainUser = User.create({
      ...user,
      email: Email.create(user.email),
      phone: PhoneNumber.create(user.phone),
    });
    if (domainUser.shouldAutoActivate()) {
      if (domainUser.role !== Role.ADMIN) {
        await this.deps.userRepo.setStatus(userId, AccountStatus.ACTIVE);
      }
    }
  }
}

export class VerifyPhoneUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: VerifyPhoneInput): Promise<void> {
    const phone = PhoneNumber.create(input.phone).getValue();
    const user = await this.deps.userRepo.findByPhone(phone);
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404 });
    }
    const otp = await this.deps.otpRepo.findValid({
      userId: user.id,
      type: OtpType.PHONE,
      expiresAfter: new Date(),
    });
    if (!otp) {
      throw new AppError({ message: 'Invalid or expired OTP', statusCode: 400 });
    }

    const isValid = await this.deps.otpService.compare(input.code, otp.codeHash);
    if (!isValid) {
      throw new AppError({ message: 'Incorrect OTP', statusCode: 400 });
    }

    await this.deps.otpRepo.markUsed(otp.id);
    await this.deps.userRepo.setVerification(user.id, { phoneVerified: true });
    await this.tryActivateUser(user.id);
  }

  private async tryActivateUser(userId: string) {
    const user = await this.deps.userRepo.findById(userId);
    if (!user) return;
    const domainUser = User.create({
      ...user,
      email: Email.create(user.email),
      phone: PhoneNumber.create(user.phone),
    });
    if (domainUser.shouldAutoActivate()) {
      if (domainUser.role !== Role.ADMIN) {
        await this.deps.userRepo.setStatus(userId, AccountStatus.ACTIVE);
      }
    }
  }
}

export class LoginUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: LoginInput): Promise<{ tokens: Tokens }> {
    const user = await this.deps.userRepo.findByEmail(input.email.toLowerCase());
    if (!user || !user.passwordHash) {
      throw new AppError({ message: 'Invalid credentials', statusCode: 401, code: 'UNAUTHORIZED' });
    }
    const passwordMatches = await this.deps.hashService.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new AppError({ message: 'Invalid credentials', statusCode: 401, code: 'UNAUTHORIZED' });
    }

    const domainUser = User.create({
      ...user,
      email: Email.create(user.email),
      phone: PhoneNumber.create(user.phone),
    });
    if (!domainUser.canLogin()) {
      throw new AppError({
        message: 'Account is not active. Complete verification/approval.',
        statusCode: 403,
        code: 'INACTIVE_ACCOUNT',
      });
    }

    const accessToken = await this.deps.tokenService.signAccessToken({
      sub: user.id,
      role: user.role,
      status: user.status,
    });
    const refreshToken = await this.deps.tokenService.signRefreshToken(user.id);
    await this.deps.refreshTokenRepo.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: this.addDays(this.deps.refreshTokenTtlDays),
    });

    return { tokens: { accessToken, refreshToken } };
  }

  private addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}

export class RefreshTokenUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: RefreshTokenInput): Promise<{ tokens: Tokens }> {
    const payload = await this.deps.tokenService.verifyRefreshToken(input.refreshToken);
    const stored = await this.deps.refreshTokenRepo.find(input.refreshToken);
    if (!stored || stored.userId !== payload.sub || stored.revoked || stored.expiresAt < new Date()) {
      throw new AppError({ message: 'Invalid refresh token', statusCode: 401 });
    }

    await this.deps.refreshTokenRepo.revoke(stored.id);

    const user = await this.deps.userRepo.findById(payload.sub);
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404 });
    }

    const accessToken = await this.deps.tokenService.signAccessToken({
      sub: user.id,
      role: user.role,
      status: user.status,
    });
    const refreshToken = await this.deps.tokenService.signRefreshToken(user.id);
    await this.deps.refreshTokenRepo.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: this.addDays(this.deps.refreshTokenTtlDays),
    });

    return { tokens: { accessToken, refreshToken } };
  }

  private addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}

export class ApproveAdminUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: ApproveUserInput): Promise<void> {
    const user = await this.deps.userRepo.findById(input.userId);
    if (!user || user.role !== Role.ADMIN) {
      throw new AppError({ message: 'Admin not found', statusCode: 404 });
    }
    await this.deps.userRepo.setStatus(user.id, AccountStatus.ACTIVE);
    await this.deps.emailService.sendApprovalNotification({
      to: user.email,
      approved: true,
      role: Role.ADMIN,
    });
  }
}

export class DeclineAdminUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: ApproveUserInput): Promise<void> {
    const user = await this.deps.userRepo.findById(input.userId);
    if (!user || user.role !== Role.ADMIN) {
      throw new AppError({ message: 'Admin not found', statusCode: 404 });
    }
    await this.deps.userRepo.setStatus(user.id, AccountStatus.DECLINED);
    await this.deps.emailService.sendApprovalNotification({
      to: user.email,
      approved: false,
      role: Role.ADMIN,
    });
  }
}

export class ApproveSellerUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: ApproveUserInput): Promise<void> {
    const user = await this.deps.userRepo.findById(input.userId);
    if (!user || user.role !== Role.SELLER) {
      throw new AppError({ message: 'Seller not found', statusCode: 404 });
    }
    await this.deps.userRepo.setStatus(user.id, AccountStatus.ACTIVE);
    await this.deps.emailService.sendApprovalNotification({
      to: user.email,
      approved: true,
      role: Role.SELLER,
    });
  }
}

export class DeclineSellerUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: ApproveUserInput): Promise<void> {
    const user = await this.deps.userRepo.findById(input.userId);
    if (!user || user.role !== Role.SELLER) {
      throw new AppError({ message: 'Seller not found', statusCode: 404 });
    }
    await this.deps.userRepo.setStatus(user.id, AccountStatus.DECLINED);
    await this.deps.emailService.sendApprovalNotification({
      to: user.email,
      approved: false,
      role: Role.SELLER,
    });
  }
}

export class ApproveDriverUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: ApproveUserInput): Promise<void> {
    const user = await this.deps.userRepo.findById(input.userId);
    if (!user || user.role !== Role.DRIVER) {
      throw new AppError({ message: 'Driver not found', statusCode: 404 });
    }
    await this.deps.userRepo.setStatus(user.id, AccountStatus.ACTIVE);
    await this.deps.emailService.sendApprovalNotification({
      to: user.email,
      approved: true,
      role: Role.DRIVER,
    });
  }
}

export class DeclineDriverUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(input: ApproveUserInput): Promise<void> {
    const user = await this.deps.userRepo.findById(input.userId);
    if (!user || user.role !== Role.DRIVER) {
      throw new AppError({ message: 'Driver not found', statusCode: 404 });
    }
    await this.deps.userRepo.setStatus(user.id, AccountStatus.DECLINED);
    await this.deps.emailService.sendApprovalNotification({
      to: user.email,
      approved: false,
      role: Role.DRIVER,
    });
  }
}


