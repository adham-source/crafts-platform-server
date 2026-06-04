import mongoose, { Document, Schema } from 'mongoose';
import { RoleValue } from '../constants/roles';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: RoleValue;
  isEmailVerified: boolean;
  isBlocked: boolean;
  passwordChangedAt?: Date;
  craftSpecialty: string[];
  bio: { ar?: string; en?: string };
  refreshTokens: Array<{ jtiHash: string; createdAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: { 
      type: String, 
      required: true, 
      select: false 
    },
    role: { 
      type: String, 
      required: true,
      index: true 
    },
    isEmailVerified: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true
    },
    passwordChangedAt: {
      type: Date
    },
    craftSpecialty: { 
      type: [String], 
      default: [] 
    },
    bio: {
      ar: { type: String, default: '', trim: true, maxlength: 500 },
      en: { type: String, default: '', trim: true, maxlength: 500 }
    },
    refreshTokens: [
      {
        jtiHash: { type: String, required: true },
        createdAt: { type: Date, default: () => new Date() }
      }
    ]
  },
  { 
    timestamps: true,
    versionKey: false
  }
);

UserSchema.pre<IUser>('save', async function () {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
