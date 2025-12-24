import { config } from '../../config/env';
import { AccountStatus } from '../../domain/enums/account-status.enum';
import { Role } from '../../domain/enums/role.enum';
import { AppError } from '../../shared/errors/app-error';
import {
  AcceptAdminInvitationUseCase,
  ApproveDriverUseCase,
  ApproveSellerUseCase,
  DeclineDriverUseCase,
  DeclineSellerUseCase,
  InviteAdminUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  VerifyEmailUseCase,
  VerifyPhoneUseCase,
} from '../../application/use-cases/auth.use-cases';
import { EmailTokenRepository } from '../../infrastructure/repositories/email-token.repository';
import { InvitationRepository } from '../../infrastructure/repositories/invitation.repository';
import { OtpRepository } from '../../infrastructure/repositories/otp.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { EmailService } from '../../infrastructure/services/email.service';
import { OtpService } from '../../infrastructure/services/otp.service';
import { TokenService } from '../../infrastructure/services/token.service';
import { HashService } from '../../infrastructure/services/hash.service';
import {
  AcceptAdminInvitationInput,
  ApproveUserInput,
  InviteAdminInput,
  LoginInput,
  RefreshTokenInput,
  RegisterUserInput,
  VerifyEmailInput,
  VerifyPhoneInput,
} from '../../application/dtos/auth.dto';

export class AuthService {
  private readonly registerUseCase: RegisterUserUseCase;
  private readonly verifyEmailUseCase: VerifyEmailUseCase;
  private readonly verifyPhoneUseCase: VerifyPhoneUseCase;
  private readonly loginUseCase: LoginUseCase;
  private readonly refreshUseCase: RefreshTokenUseCase;
  private readonly inviteAdminUseCase: InviteAdminUseCase;
  private readonly acceptInvitationUseCase: AcceptAdminInvitationUseCase;
  private readonly approveSellerUseCase: ApproveSellerUseCase;
  private readonly declineSellerUseCase: DeclineSellerUseCase;
  private readonly approveDriverUseCase: ApproveDriverUseCase;
  private readonly declineDriverUseCase: DeclineDriverUseCase;

  constructor() {
    const userRepo = new UserRepository();
    const otpRepo = new OtpRepository();
    const emailTokenRepo = new EmailTokenRepository();
    const invitationRepo = new InvitationRepository();
    const refreshTokenRepo = new RefreshTokenRepository();
    const tokenService = new TokenService(config.jwt);
    const emailService = new EmailService({
      from: config.email.from,
      smtpHost: config.email.smtpHost,
      smtpPort: config.email.smtpPort,
      smtpUser: config.email.smtpUser,
      smtpPassword: config.email.smtpPassword,
      appBaseUrl:
        config.nodeEnv === 'production'
          ? config.email.smtpHost
          : `http://localhost:${config.port}`,
    });
    const otpService = new OtpService();
    const hashService = new HashService();

    const deps = {
      userRepo,
      otpRepo,
      emailTokenRepo,
      invitationRepo,
      refreshTokenRepo,
      emailService,
      tokenService,
      otpService,
      hashService,
      otpExpiryMinutes: config.otpExpiryMinutes,
    refreshTokenTtlDays: config.refreshTokenTtlDays,
    };

    this.registerUseCase = new RegisterUserUseCase(deps);
    this.verifyEmailUseCase = new VerifyEmailUseCase(deps);
    this.verifyPhoneUseCase = new VerifyPhoneUseCase(deps);
    this.loginUseCase = new LoginUseCase(deps);
    this.refreshUseCase = new RefreshTokenUseCase(deps);
    this.inviteAdminUseCase = new InviteAdminUseCase(deps);
    this.acceptInvitationUseCase = new AcceptAdminInvitationUseCase(deps);
    this.approveSellerUseCase = new ApproveSellerUseCase(deps);
    this.declineSellerUseCase = new DeclineSellerUseCase(deps);
    this.approveDriverUseCase = new ApproveDriverUseCase(deps);
    this.declineDriverUseCase = new DeclineDriverUseCase(deps);
  }

  register(input: RegisterUserInput) {
    return this.registerUseCase.execute(input);
  }
  verifyEmail(input: VerifyEmailInput) {
    return this.verifyEmailUseCase.execute(input);
  }
  verifyPhone(input: VerifyPhoneInput) {
    return this.verifyPhoneUseCase.execute(input);
  }
  login(input: LoginInput) {
    return this.loginUseCase.execute(input);
  }
  refresh(input: RefreshTokenInput) {
    return this.refreshUseCase.execute(input);
  }
  inviteAdmin(input: InviteAdminInput, actorId: string) {
    return this.inviteAdminUseCase.execute(input, actorId);
  }
  acceptInvitation(input: AcceptAdminInvitationInput) {
    return this.acceptInvitationUseCase.execute(input);
  }
  approveSeller(input: ApproveUserInput) {
    return this.approveSellerUseCase.execute(input);
  }
  declineSeller(input: ApproveUserInput) {
    return this.declineSellerUseCase.execute(input);
  }
  approveDriver(input: ApproveUserInput) {
    return this.approveDriverUseCase.execute(input);
  }
  declineDriver(input: ApproveUserInput) {
    return this.declineDriverUseCase.execute(input);
  }
}

export const authService = new AuthService();
