import * as bcrypt from 'bcrypt';
import { Role } from './role.entity';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly roleId: string,
    public readonly status: string,
    public passwordHash: string,
    public readonly role?: Role,
    public readonly phone?: string,
    public readonly avatarUrl?: string,
  ) {}

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
