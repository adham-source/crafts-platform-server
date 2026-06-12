import bcrypt from 'bcrypt';
import { UserModel, IUser } from '../models/user';
import { UserRole, RoleValue } from '../constants/roles';

class UserService {
  async create(data: { name: string; email: string; password: string; role?: RoleValue; craftSpecialty?: string[]; bio?: { ar?: string; en?: string } }): Promise<IUser> {
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || UserRole.BUYER,
      craftSpecialty: data.craftSpecialty || [],
      bio: data.bio || {}
    });
    return user;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async all(): Promise<IUser[]> {
    return UserModel.find().exec();
  }

  async addRefreshToken(userId: string, jtiHash: string) {
    return UserModel.findByIdAndUpdate(userId, { $push: { refreshTokens: { jtiHash } } }).exec();
  }

  async verifyRefreshToken(userId: string, jti: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) return false;

    for (const refreshToken of user.refreshTokens as any[]) {
      if (await bcrypt.compare(jti, refreshToken.jtiHash)) {
        return true;
      }
    }

    return false;
  }

  async removeRefreshToken(userId: string, jti: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) return;

    const remaining: any[] = [];
    for (const refreshToken of user.refreshTokens as any[]) {
      if (!(await bcrypt.compare(jti, refreshToken.jtiHash))) {
        remaining.push(refreshToken);
      }
    }
    user.refreshTokens = remaining as any;
    await user.save();
  }

  async revokeAllRefreshTokens(userId: string) {
    return UserModel.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } }).exec();
  }
}

export const userService = new UserService();
