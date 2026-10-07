import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { MissionModel } from '../models/Mission';

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

  // 3. Seed First Mission: Rescue the Server Room
  const missionSlug = 'rescue-the-server-room';
  let mission = await MissionModel.findOne({ slug: missionSlug });
  if (!mission) {
    mission = await MissionModel.create({
      title: 'Rescue the Server Room',
      slug: missionSlug,
      domain: 'IoT / Embedded Systems',
      difficulty: 'Medium',
      description:
        'A critical campus datacenter cluster is triggering thermal overload alarms. Enter the server room, analyze live environmental telemetry, diagnose the cooling failure, and restore normal operations before automatic emergency shutdown occurs.',
      briefing:
        'The server room is overheating. Determine whether the cooling system is functioning correctly.',
      learningObjectives: [
        'Interpret temperature readings',
        'Interpret humidity readings',
        'Understand basic IoT sensor data',
        'Understand actuator behavior',
        'Apply basic embedded-system reasoning',
        'Make decisions from environmental telemetry',
      ],
      estimatedDuration: '10–15 min',
      thumbnail: '/images/missions/server-room.jpg',
      published: true,
      version: 1,
      createdBy: admin._id,
    });
    console.log(`[Seed] Created mission: "${mission.title}" (${missionSlug})`);
  } else {
    console.log(`[Seed] Mission already exists: "${mission.title}" (${missionSlug})`);
  }

  console.log('[Seed] Database seed completed successfully!');
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
