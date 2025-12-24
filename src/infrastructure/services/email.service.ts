import nodemailer from 'nodemailer';
import { IEmailService } from '../../application/interfaces/services/email-service.interface';

type EmailSettings = {
  from: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  appBaseUrl: string;
};

export class EmailService implements IEmailService {
  private readonly transporter: any;

  constructor(private readonly settings: EmailSettings) {
    this.transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: false,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });
  }

  async sendEmailVerification(params: { to: string; token: string }): Promise<void> {
    const verifyLink = `${this.settings.appBaseUrl}/api/v1/auth/verify-email?token=${params.token}`;
    await this.transporter.sendMail({
      from: this.settings.from,
      to: params.to,
      subject: 'Verify your email',
      text: `Verify your email using this link: ${verifyLink}`,
    });
  }

  async sendAdminInvitation(params: {
    to: string;
    invitationToken: string;
    invitedBy?: string;
  }): Promise<void> {
    const inviteLink = `${this.settings.appBaseUrl}/api/v1/auth/accept-invitation?token=${params.invitationToken}`;
    await this.transporter.sendMail({
      from: this.settings.from,
      to: params.to,
      subject: 'Admin invitation',
      text: `You have been invited to admin portal by ${params.invitedBy ?? 'system'}. Accept: ${inviteLink}`,
    });
  }

  async sendApprovalNotification(params: {
    to: string;
    approved: boolean;
    role: string;
  }): Promise<void> {
    const subject = params.approved ? 'Account approved' : 'Account declined';
    const text = params.approved
      ? `Your ${params.role} account has been approved and is now active.`
      : `Your ${params.role} account has been declined.`;
    await this.transporter.sendMail({
      from: this.settings.from,
      to: params.to,
      subject,
      text,
    });
  }
}


