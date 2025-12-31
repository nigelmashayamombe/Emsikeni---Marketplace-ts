export interface IEmailService {
  sendEmailVerification(params: { to: string; token: string }): Promise<void>;
  sendAdminActivationRequest(params: {
    to: string;
    newAdminName: string;
    newAdminEmail: string;
  }): Promise<void>;
  sendApprovalNotification(params: {
    to: string;
    approved: boolean;
    role: string;
  }): Promise<void>;
}


