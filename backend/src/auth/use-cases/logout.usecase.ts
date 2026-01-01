import { Injectable } from '@nestjs/common';

@Injectable()
export class LogoutUseCase {
  async execute(userId: string) {
    // Placeholder: Add refresh token to Redis blacklist here
    return true;
  }
}
