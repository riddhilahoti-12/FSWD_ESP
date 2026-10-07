import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { MissionModel } from '../models/Mission';
import { ALL_MISSION_DEFINITIONS } from '../services/mission/MissionRegistry';

export async function runSeed(): Promise<void> {
  console.log('[Seed] Starting database seed...');
  await connectDB();

  // 1. Seed Admin User
  const adminEmail = env.SEED_ADMIN_EMAIL.toLowerCase();
  let admin = await UserModel.findOne({ email: adminEmail });
  if (!admin) {
    const adminPasswordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
    admin = await UserModel.create({
      name: 'MissionX Admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      stats: {
        xp: 1000,
        missionsCompleted: 5,
        missionsStarted: 5,
        averageScore: 98,
      },
    });
    console.log(`[Seed] Created admin account: ${adminEmail}`);
  } else {
    console.log(`[Seed] Admin account already exists: ${adminEmail}`);
  }

  // 2. Seed Demo Student User
  const studentEmail = env.SEED_STUDENT_EMAIL.toLowerCase();
  let student = await UserModel.findOne({ email: studentEmail });
  if (!student) {
    const studentPasswordHash = await bcrypt.hash(env.SEED_STUDENT_PASSWORD, 10);
    student = await UserModel.create({
      name: 'Alex Rivera',
      email: studentEmail,
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      stats: {
        xp: 250,
        missionsCompleted: 0,
        missionsStarted: 1,
        averageScore: 0,
      },
    });
    console.log(`[Seed] Created student account: ${studentEmail}`);
  } else {
    console.log(`[Seed] Student account already exists: ${studentEmail}`);
  }

  // 3. Seed All 5 Playable Missions
  const thumbnails: Record<string, string> = {
    'rescue-the-server-room': '/images/missions/server-room.jpg',
    'signal-in-the-lab': '/images/missions/signal-lab.jpg',
    'lost-sensor-network': '/images/missions/sensor-network.jpg',
    'power-grid-calibration': '/images/missions/power-grid.jpg',
    'smart-greenhouse-mystery': '/images/missions/greenhouse.jpg',
  };

  for (const def of ALL_MISSION_DEFINITIONS) {
    const existing = await MissionModel.findOne({ slug: def.slug });
    if (!existing) {
      await MissionModel.create({
        title: def.title,
        slug: def.slug,
        domain: def.domain,
        difficulty: def.difficulty,
        description: def.description,
        briefing: def.briefing,
        learningObjectives: def.learningObjectives,
        estimatedDuration: def.estimatedDuration,
        thumbnail: thumbnails[def.slug] || '/images/missions/default.jpg',
        published: true,
        version: def.version || 1,
        createdBy: admin._id,
      });
      console.log(`[Seed] Created mission: "${def.title}" (${def.slug})`);
    } else {
      // Ensure latest metadata is synchronized
      await MissionModel.updateOne(
        { slug: def.slug },
        {
          $set: {
            title: def.title,
            domain: def.domain,
            difficulty: def.difficulty,
            description: def.description,
            briefing: def.briefing,
            learningObjectives: def.learningObjectives,
            estimatedDuration: def.estimatedDuration,
            thumbnail: thumbnails[def.slug] || '/images/missions/default.jpg',
            published: true,
          },
        }
      );
      console.log(`[Seed] Synchronized mission: "${def.title}" (${def.slug})`);
    }
  }

  console.log('[Seed] Database seed completed successfully for all 5 missions!');
}

// Execute directly if run as a script
if (require.main === module) {
  runSeed()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed Error]', err);
      await mongoose.disconnect();
      process.exit(1);
    });
}
