import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const profiles = await prisma.profile.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Profile name is required' }, { status: 400 });
    }

    const profile = await prisma.profile.create({
      data: {
        userId: session.userId,
        name: name.trim(),
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
