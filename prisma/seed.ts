import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // Clear existing
  await prisma.scheduleBlock.deleteMany();
  await prisma.audioSource.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@audiospace.local',
      password: hashedPassword,
      storageUsed: 0,
    },
  });
  console.log('[Seed] Created user:', user.email);

  // Create profiles
  const mallProfile = await prisma.profile.create({
    data: {
      userId: user.id,
      name: 'Mall Lobby',
    },
  });

  const zooProfile = await prisma.profile.create({
    data: {
      userId: user.id,
      name: 'Zoo Entrance',
    },
  });
  console.log('[Seed] Created profiles: Mall Lobby, Zoo Entrance');

  // Create audio sources
  const ytPlaylist1 = await prisma.audioSource.create({
    data: {
      userId: user.id,
      type: 'YOUTUBE',
      name: 'Lofi Hip Hop Radio',
      urlOrPath: 'jfKfPfyJRdk', // YouTube video ID
    },
  });

  const ytPlaylist2 = await prisma.audioSource.create({
    data: {
      userId: user.id,
      type: 'YOUTUBE',
      name: 'Jazz Cafe Music',
      urlOrPath: 'VMAPTo7RVCo', // YouTube video ID
    },
  });

  const radioJazz = await prisma.audioSource.create({
    data: {
      userId: user.id,
      type: 'RADIO',
      name: 'Smooth Jazz (KCSM)',
      urlOrPath: 'https://ice6.securenetsystems.net/KCSM',
    },
  });

  const radioLofi = await prisma.audioSource.create({
    data: {
      userId: user.id,
      type: 'RADIO',
      name: 'Lo-Fi Beats Radio',
      urlOrPath: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    },
  });

  const localMp3 = await prisma.audioSource.create({
    data: {
      userId: user.id,
      type: 'LOCAL',
      name: 'Ambient Nature Sounds',
      urlOrPath: 'ambient-nature.mp3',
    },
  });

  const localMp3_2 = await prisma.audioSource.create({
    data: {
      userId: user.id,
      type: 'LOCAL',
      name: 'Background Piano',
      urlOrPath: 'background-piano.mp3',
    },
  });

  console.log('[Seed] Created 6 audio sources');

  // Create schedule blocks using absolute DateTimes
  const now = new Date();
  
  // Helper to create date relative to today
  const createDate = (daysOffset: number, hours: number, minutes: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // Create schedule blocks for Mall Lobby (Today and Tomorrow)
  await prisma.scheduleBlock.createMany({
    data: [
      {
        profileId: mallProfile.id,
        audioSourceId: radioJazz.id,
        startTime: createDate(0, 8, 0),
        endTime: createDate(0, 12, 0),
        blockType: 'MUSIC',
      },
      {
        // 15 minute announcement overlapping the jazz music
        profileId: mallProfile.id,
        audioSourceId: localMp3.id,
        startTime: createDate(0, 10, 0),
        endTime: createDate(0, 10, 15),
        blockType: 'ANNOUNCEMENT',
      },
      {
        profileId: mallProfile.id,
        audioSourceId: ytPlaylist1.id,
        startTime: createDate(0, 12, 0),
        endTime: createDate(0, 17, 0),
        blockType: 'MUSIC',
      },
      {
        profileId: mallProfile.id,
        audioSourceId: radioLofi.id,
        startTime: createDate(0, 17, 0),
        endTime: createDate(0, 21, 0),
        blockType: 'MUSIC',
      },
    ],
  });

  // Create schedule blocks for Zoo Entrance
  await prisma.scheduleBlock.createMany({
    data: [
      {
        profileId: zooProfile.id,
        audioSourceId: ytPlaylist2.id,
        startTime: createDate(0, 9, 0),
        endTime: createDate(0, 18, 0),
        blockType: 'MUSIC',
      },
      {
        // Repeating announcements every hour
        profileId: zooProfile.id,
        audioSourceId: localMp3.id,
        startTime: createDate(0, 12, 0),
        endTime: createDate(0, 12, 5),
        blockType: 'ANNOUNCEMENT',
      },
      {
        profileId: zooProfile.id,
        audioSourceId: localMp3_2.id,
        startTime: createDate(0, 14, 0),
        endTime: createDate(0, 14, 5),
        blockType: 'ANNOUNCEMENT',
      },
    ],
  });

  console.log('[Seed] Created schedule blocks');
  console.log('[Seed] Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
