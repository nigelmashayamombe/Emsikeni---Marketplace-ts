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

  async sendAdminActivationRequest(params: {
    to: string;
    newAdminName: string;
    newAdminEmail: string;
  }): Promise<void> {
    const activateLink = `${this.settings.appBaseUrl}/api/v1/auth/approve-admin?email=${params.newAdminEmail}`; // This link might need to point to a frontend page or be an API call action button in email
    // For now, let's assume it points to a dashboard or just notifies the super admin
    await this.transporter.sendMail({
      from: this.settings.from,
      to: params.to,
      subject: 'New Admin Registration Requires Approval',
      text: `A new admin has registered.\nName: ${params.newAdminName}\nEmail: ${params.newAdminEmail}\n\nPlease login to the Super Admin dashboard to approve or decline this request.`,
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


