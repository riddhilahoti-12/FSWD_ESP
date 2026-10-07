import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { RegisterInput, LoginInput } from '@missionx/shared';

function generateToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body as RegisterInput;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists',
        },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // SECURITY: Strictly enforce role = STUDENT regardless of request payload
    const user = await UserModel.create({
      name,
      email,
      passwordHash,
      role: 'STUDENT',
      stats: {
        xp: 0,
        missionsCompleted: 0,
        missionsStarted: 0,
        averageScore: 0,
      },
    });

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: error.message || 'Failed to register account',
      },
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: error.message || 'Failed to authenticate',
      },
    });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      message: 'Successfully logged out',
    },
  });
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user.toJSON(),
    },
  });
}
