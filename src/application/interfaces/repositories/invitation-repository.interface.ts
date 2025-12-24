export interface IInvitationRepository {
  create(params: {
    email: string;
    token: string;
    expiresAt: Date;
    invitedById?: string;
  }): Promise<any>;
  findByToken(token: string): Promise<any | null>;
  markAccepted(id: string): Promise<void>;
}

