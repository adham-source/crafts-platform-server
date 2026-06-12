import bcrypt from 'bcrypt';
import { config } from '../config';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = config.saltRounds;
  return bcrypt.hash(password + config.secretKey, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password + config.secretKey, hash);
}
