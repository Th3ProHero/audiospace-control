import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const source = await prisma.audioSource.findFirst({
    where: { id: params.id, userId: session.userId },
  });

  if (!source) {
    return NextResponse.json({ error: 'Audio source not found' }, { status: 404 });
  }

  // If local file, delete from storage and update storage usage
  if (source.type === 'LOCAL') {
    const storagePath = process.env.STORAGE_PATH || './storage';
    const filePath = path.join(storagePath, source.urlOrPath);
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        // Update user storage
        await prisma.user.update({
          where: { id: session.userId },
          data: { storageUsed: { decrement: stats.size } },
        });
      }
    } catch (err) {
      console.error('File deletion error:', err);
    }
  }

  await prisma.audioSource.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
