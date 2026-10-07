import dotenv from 'dotenv';
import path from 'path';

// Load from current working directory or root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/missionx',
  JWT_SECRET: process.env.JWT_SECRET || 'missionx_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || 'admin@missionx.edu',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'AdminPass123!',
  SEED_STUDENT_EMAIL: process.env.SEED_STUDENT_EMAIL || 'student@missionx.edu',
  SEED_STUDENT_PASSWORD: process.env.SEED_STUDENT_PASSWORD || 'StudentPass123!',
};
