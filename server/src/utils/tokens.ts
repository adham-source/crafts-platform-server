import jwt from 'jsonwebtoken';
import { config } from '../config';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

export function generateAccessToken(userId: string, email: string) {
  return jwt.sign({ sub: userId, email }, config.jwtSecret as string, { expiresIn: '15m' });
}

export async function generateRefreshToken(userId: string) {
  const jti = randomBytes(16).toString('hex');
  const token = jwt.sign({ sub: userId, jti, type: 'refresh' }, config.jwtSecret as string, { expiresIn: '30d' });
  const jtiHash = await bcrypt.hash(jti, config.saltRounds as number);
  return { token, jti, jtiHash };
}

export function generateEmailVerificationToken(userId: string) {
  return jwt.sign({ sub: userId, action: 'verify' }, config.jwtSecret as string, { expiresIn: '1d' });
}

export function generatePasswordResetToken(userId: string) {
  return jwt.sign({ sub: userId, action: 'reset' }, config.jwtSecret as string, { expiresIn: '1h' });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, config.jwtSecret as string);
}

export async function compareJti(jti: string, jtiHash: string) {
  return bcrypt.compare(jti, jtiHash);
}
