import { describe, it, expect, beforeEach } from 'vitest';
import { JwtService, JwtPayload } from '../jwt.service';

describe('JwtService - Token Generation & Typing Tests', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long';
    process.env.JWT_REFRESH_SECRET =
      'test-refresh-secret-at-least-32-characters';
    jwtService = new JwtService();
  });

  it('should generate valid access token and decode strictly typed JwtPayload', () => {
    const token = jwtService.generateAccessToken(
      'user-123',
      'admin@example.com',
      'Admin',
    );
    expect(typeof token).toBe('string');

    const decoded = jwtService.verifyToken(token);
    expect(decoded).not.toBeNull();
    const payload = decoded as JwtPayload;
    expect(payload.sub).toBe('user-123');
    expect(payload.email).toBe('admin@example.com');
    expect(payload.role).toBe('Admin');
  });

  it('should generate valid refresh token with type refresh', () => {
    const refreshToken = jwtService.generateRefreshToken('user-123');
    expect(typeof refreshToken).toBe('string');

    const decoded = jwtService.verifyRefreshToken(refreshToken);
    expect(decoded).not.toBeNull();
    const payload = decoded as JwtPayload;
    expect(payload.sub).toBe('user-123');
    expect(payload.type).toBe('refresh');
  });

  it('should return null on invalid or tampered token', () => {
    const result = jwtService.verifyToken('invalid.token.signature');
    expect(result).toBeNull();
  });
});
