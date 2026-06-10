import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!profileId) {
    return NextResponse.json({ error: 'profileId required' }, { status: 400 });
  }

  // Verify profile belongs to user
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, userId: session.userId },
  });
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const whereClause: any = { profileId };
  if (start && end) {
    whereClause.startTime = { gte: new Date(start) };
    whereClause.endTime = { lte: new Date(end) };
  }

  const blocks = await prisma.scheduleBlock.findMany({
    where: whereClause,
    include: { audioSource: true },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json({ blocks });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { profileId, audioSourceId, startTime, endTime, blockType = 'MUSIC', repeatDaily = false } = await request.json();

    if (!profileId || !audioSourceId || !startTime || !endTime) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (blockType !== 'MUSIC' && blockType !== 'ANNOUNCEMENT') {
      return NextResponse.json({ error: 'Invalid block type' }, { status: 400 });
    }

    const startD = new Date(startTime);
    const endD = new Date(endTime);

    // Validate start < end
    if (startD.getTime() >= endD.getTime()) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
    }

    // Verify profile belongs to user
    const profile = await prisma.profile.findFirst({
      where: { id: profileId, userId: session.userId },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Verify audio source belongs to user
    const source = await prisma.audioSource.findFirst({
      where: { id: audioSourceId, userId: session.userId },
    });
    if (!source) {
      return NextResponse.json({ error: 'Audio source not found' }, { status: 404 });
    }

    // Generate the array of blocks to insert
    const blocksToInsert = [];
    const iterations = repeatDaily ? 365 : 1;

    for (let i = 0; i < iterations; i++) {
      const s = new Date(startD);
      s.setDate(s.getDate() + i);
      const e = new Date(endD);
      e.setDate(e.getDate() + i);
      
      blocksToInsert.push({
        profileId,
        audioSourceId,
        startTime: s,
        endTime: e,
        blockType,
      });
    }

    // Check for overlaps within this profile for the SAME blockType
    // E.g., MUSIC can overlap with ANNOUNCEMENT, but not with another MUSIC
    const existingBlocks = await prisma.scheduleBlock.findMany({
      where: { profileId, blockType },
    });

    for (const newBlock of blocksToInsert) {
      const hasOverlap = existingBlocks.some((block) => {
        const bStart = new Date(block.startTime).getTime();
        const bEnd = new Date(block.endTime).getTime();
        return newBlock.startTime.getTime() < bEnd && bStart < newBlock.endTime.getTime();
      });

      if (hasOverlap) {
        return NextResponse.json(
          { error: `Schedule block overlaps with an existing ${blockType} block` },
          { status: 409 }
        );
      }
    }

    // Insert all blocks
    if (blocksToInsert.length === 1) {
      const block = await prisma.scheduleBlock.create({
        data: blocksToInsert[0],
        include: { audioSource: true },
      });
      return NextResponse.json({ block }, { status: 201 });
    } else {
      await prisma.scheduleBlock.createMany({
        data: blocksToInsert,
      });
      return NextResponse.json({ message: `Created ${iterations} blocks` }, { status: 201 });
    }
  } catch (error) {
    console.error('Create schedule block error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
