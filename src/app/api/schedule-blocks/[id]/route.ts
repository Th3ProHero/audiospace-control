import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Verify the block belongs to a profile owned by the user
  const block = await prisma.scheduleBlock.findFirst({
    where: { id: params.id },
    include: { profile: true },
  });

  if (!block || block.profile.userId !== session.userId) {
    return NextResponse.json({ error: 'Schedule block not found' }, { status: 404 });
  }

  await prisma.scheduleBlock.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { audioSourceId, startTime, endTime, blockType, repeatDaily } = await request.json();

    // Verify the block belongs to the user
    const existingBlock = await prisma.scheduleBlock.findFirst({
      where: { id: params.id },
      include: { profile: true },
    });

    if (!existingBlock || existingBlock.profile.userId !== session.userId) {
      return NextResponse.json({ error: 'Schedule block not found' }, { status: 404 });
    }

    if (blockType && blockType !== 'MUSIC' && blockType !== 'ANNOUNCEMENT') {
      return NextResponse.json({ error: 'Invalid block type' }, { status: 400 });
    }

    const startD = startTime ? new Date(startTime) : new Date(existingBlock.startTime);
    const endD = endTime ? new Date(endTime) : new Date(existingBlock.endTime);

    if (startD.getTime() >= endD.getTime()) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
    }

    const finalBlockType = blockType || existingBlock.blockType;

    // Check for overlaps with other blocks of the same type (excluding this block itself)
    const overlappingBlocks = await prisma.scheduleBlock.findMany({
      where: {
        profileId: existingBlock.profileId,
        blockType: finalBlockType,
        id: { not: params.id },
      },
    });

    const hasOverlap = overlappingBlocks.some((b) => {
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return startD.getTime() < bEnd && bStart < endD.getTime();
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: `Schedule block overlaps with an existing ${finalBlockType} block` },
        { status: 409 }
      );
    }

    // If repeatDaily, delete this block and create 365 new ones
    if (repeatDaily) {
      const profileId = existingBlock.profileId;
      const srcId = audioSourceId || existingBlock.audioSourceId;

      await prisma.scheduleBlock.delete({ where: { id: params.id } });

      const blocksToInsert = [];
      for (let i = 0; i < 365; i++) {
        const s = new Date(startD);
        s.setDate(s.getDate() + i);
        const e = new Date(endD);
        e.setDate(e.getDate() + i);
        blocksToInsert.push({
          profileId,
          audioSourceId: srcId,
          startTime: s,
          endTime: e,
          blockType: finalBlockType,
        });
      }

      await prisma.scheduleBlock.createMany({ data: blocksToInsert });
      return NextResponse.json({ message: 'Created 365 repeating blocks' }, { status: 200 });
    }

    const updated = await prisma.scheduleBlock.update({
      where: { id: params.id },
      data: {
        ...(audioSourceId && { audioSourceId }),
        startTime: startD,
        endTime: endD,
        blockType: finalBlockType,
      },
      include: { audioSource: true },
    });

    return NextResponse.json({ block: updated });
  } catch (error) {
    console.error('Update schedule block error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
