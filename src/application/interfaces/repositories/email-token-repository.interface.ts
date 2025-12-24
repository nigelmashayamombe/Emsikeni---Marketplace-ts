import { EmailTokenType } from '../../../domain/enums/email-token-type.enum';

export interface IEmailTokenRepository {
  create(params: {
    userId: string;
    token: string;
    type: EmailTokenType;
    expiresAt: Date;
  }): Promise<void>;
  findValid(token: string, type: EmailTokenType): Promise<any | null>;
  markUsed(id: string): Promise<void>;
}

