export interface IEmailService {
  sendEmailVerification(params: { to: string; token: string }): Promise<void>;
  sendAdminInvitation(params: {
    to: string;
    invitationToken: string;
    invitedBy?: string;
  }): Promise<void>;
  sendApprovalNotification(params: {
    to: string;
    approved: boolean;
    role: string;
  }): Promise<void>;
}


