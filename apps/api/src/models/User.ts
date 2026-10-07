import { Schema, model, Document } from 'mongoose';
import { UserRole } from '@missionx/shared';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  stats: {
    xp: number;
    missionsCompleted: number;
    missionsStarted: number;
    averageScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN'],
      default: 'STUDENT',
      required: true,
    },
    stats: {
      xp: { type: Number, default: 0 },
      missionsCompleted: { type: Number, default: 0 },
      missionsStarted: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Method to safely return user object without password hash
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const UserModel = model<IUserDocument>('User', userSchema);
