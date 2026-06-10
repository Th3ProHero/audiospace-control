import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_STORAGE = 1024 * 1024 * 1024; // 1GB

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    if (!['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: mp3, wav, ogg, m4a, flac' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 50MB' }, { status: 400 });
    }

    // Check storage quota
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { storageUsed: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.storageUsed + file.size > MAX_STORAGE) {
      return NextResponse.json(
        { error: 'Storage quota exceeded. Maximum 1GB total' },
        { status: 413 }
      );
    }

    // Save file
    const storagePath = process.env.STORAGE_PATH || './storage';
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }

    // Generate safe filename
    const timestamp = Date.now();
    const safeName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(storagePath, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Update storage usage
    await prisma.user.update({
      where: { id: session.userId },
      data: { storageUsed: { increment: file.size } },
    });

    // Create audio source record
    const source = await prisma.audioSource.create({
      data: {
        userId: session.userId,
        type: 'LOCAL',
        name: file.name.replace(ext, ''),
        urlOrPath: safeName,
      },
    });

    return NextResponse.json({
      source,
      storageUsed: user.storageUsed + file.size,
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
