import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const where: any = { userId: session.userId };
  if (type) where.type = type;

  const sources = await prisma.audioSource.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ sources });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { type, name, urlOrPath } = await request.json();

    if (!type || !name || !urlOrPath) {
      return NextResponse.json({ error: 'type, name, and urlOrPath are required' }, { status: 400 });
    }

    if (!['YOUTUBE', 'RADIO', 'LOCAL'].includes(type)) {
      return NextResponse.json({ error: 'Invalid audio source type' }, { status: 400 });
    }

    const source = await prisma.audioSource.create({
      data: {
        userId: session.userId,
        type,
        name,
        urlOrPath,
      },
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    console.error('Create audio source error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
