import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const MAX_STORAGE = 1024 * 1024 * 1024; // 1GB

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { storageUsed: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    used: user.storageUsed,
    total: MAX_STORAGE,
    percentage: Math.round((user.storageUsed / MAX_STORAGE) * 100),
  });
}
