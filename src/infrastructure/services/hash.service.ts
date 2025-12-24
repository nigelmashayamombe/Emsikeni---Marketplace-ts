import bcrypt from 'bcryptjs';
import { IHashService } from '../../application/interfaces/services/hash-service.interface';

export class HashService implements IHashService {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, 12);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}


