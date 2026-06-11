import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // 1. Create or update demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@audiospace.local' },
    update: {}, // Don't override existing password if they changed it
    create: {
      email: 'admin@audiospace.local',
      password: hashedPassword,
      storageUsed: 0,
    },
  });
  console.log('[Seed] User secured:', user.email);

  // 2. Check if profiles exist, if not create default ones
  let mallProfile = await prisma.profile.findFirst({ where: { userId: user.id, name: 'Mall Lobby' } });
  if (!mallProfile) {
    mallProfile = await prisma.profile.create({ data: { userId: user.id, name: 'Mall Lobby' } });
    console.log('[Seed] Created default profile: Mall Lobby');
  }

  let zooProfile = await prisma.profile.findFirst({ where: { userId: user.id, name: 'Zoo Entrance' } });
  if (!zooProfile) {
    zooProfile = await prisma.profile.create({ data: { userId: user.id, name: 'Zoo Entrance' } });
    console.log('[Seed] Created default profile: Zoo Entrance');
  }

  // 3. Create audio sources if they don't exist
  const createAudioSourceIfNotExists = async (type: string, name: string, urlOrPath: string) => {
    let source = await prisma.audioSource.findFirst({ where: { userId: user.id, urlOrPath } });
    if (!source) {
      source = await prisma.audioSource.create({
        data: { userId: user.id, type, name, urlOrPath }
      });
      console.log(`[Seed] Created audio source: ${name}`);
    }
    return source;
  };

  const ytPlaylist1 = await createAudioSourceIfNotExists('YOUTUBE', 'Lofi Hip Hop Radio', 'jfKfPfyJRdk');
  const ytPlaylist2 = await createAudioSourceIfNotExists('YOUTUBE', 'Jazz Cafe Music', 'VMAPTo7RVCo');
  const radioJazz = await createAudioSourceIfNotExists('RADIO', 'Smooth Jazz (KCSM)', 'https://ice6.securenetsystems.net/KCSM');
  const radioLofi = await createAudioSourceIfNotExists('RADIO', 'Lo-Fi Beats Radio', 'https://streams.ilovemusic.de/iloveradio17.mp3');
  const localMp3 = await createAudioSourceIfNotExists('LOCAL', 'Ambient Nature Sounds', 'ambient-nature.mp3');
  const localMp3_2 = await createAudioSourceIfNotExists('LOCAL', 'Background Piano', 'background-piano.mp3');

  // 4. Create schedule blocks if none exist for the profiles
  const helperCreateDate = (daysOffset: number, hours: number, minutes: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const mallBlocksCount = await prisma.scheduleBlock.count({ where: { profileId: mallProfile.id } });
  if (mallBlocksCount === 0) {
    await prisma.scheduleBlock.createMany({
      data: [
        { profileId: mallProfile.id, audioSourceId: radioJazz.id, startTime: helperCreateDate(0, 8, 0), endTime: helperCreateDate(0, 12, 0), blockType: 'MUSIC' },
        { profileId: mallProfile.id, audioSourceId: localMp3.id, startTime: helperCreateDate(0, 10, 0), endTime: helperCreateDate(0, 10, 15), blockType: 'ANNOUNCEMENT' },
        { profileId: mallProfile.id, audioSourceId: ytPlaylist1.id, startTime: helperCreateDate(0, 12, 0), endTime: helperCreateDate(0, 17, 0), blockType: 'MUSIC' },
        { profileId: mallProfile.id, audioSourceId: radioLofi.id, startTime: helperCreateDate(0, 17, 0), endTime: helperCreateDate(0, 21, 0), blockType: 'MUSIC' },
      ],
    });
    console.log('[Seed] Created default schedule blocks for Mall Lobby');
  }

  const zooBlocksCount = await prisma.scheduleBlock.count({ where: { profileId: zooProfile.id } });
  if (zooBlocksCount === 0) {
    await prisma.scheduleBlock.createMany({
      data: [
        { profileId: zooProfile.id, audioSourceId: ytPlaylist2.id, startTime: helperCreateDate(0, 9, 0), endTime: helperCreateDate(0, 18, 0), blockType: 'MUSIC' },
        { profileId: zooProfile.id, audioSourceId: localMp3.id, startTime: helperCreateDate(0, 12, 0), endTime: helperCreateDate(0, 12, 5), blockType: 'ANNOUNCEMENT' },
        { profileId: zooProfile.id, audioSourceId: localMp3_2.id, startTime: helperCreateDate(0, 14, 0), endTime: helperCreateDate(0, 14, 5), blockType: 'ANNOUNCEMENT' },
      ],
    });
    console.log('[Seed] Created default schedule blocks for Zoo Entrance');
  }
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
