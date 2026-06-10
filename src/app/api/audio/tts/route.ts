import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';
import * as fs from 'fs/promises';
import path from 'path';
import * as googleTTS from 'google-tts-api';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, name } = await req.json();

    if (!text || !name) {
      return NextResponse.json({ error: 'Faltan campos requeridos (text, name)' }, { status: 400 });
    }

    if (text.length > 150) {
      return NextResponse.json({ error: 'El texto no puede exceder los 150 caracteres' }, { status: 400 });
    }

    // Generar Base64 de Google TTS
    const audioBase64 = await googleTTS.getAudioBase64(text, {
      lang: 'es',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Convertir Base64 a Buffer
    const buffer = Buffer.from(audioBase64, 'base64');

    // Preparar el archivo local
    const storagePath = process.env.STORAGE_PATH || './storage';
    const uploadsDir = path.resolve(process.cwd(), storagePath);
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const fileName = `tts-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    const filePath = path.join(uploadsDir, fileName);

    // Guardar el archivo
    await fs.writeFile(filePath, buffer);

    // Registrar en la base de datos
    const source = await prisma.audioSource.create({
      data: {
        userId: user.userId,
        type: 'LOCAL',
        name: `[Voz] ${name}`,
        urlOrPath: fileName,
      },
    });

    return NextResponse.json({ success: true, source }, { status: 201 });

  } catch (error: any) {
    console.error('Error generating TTS:', error);
    return NextResponse.json({ error: 'Error interno al generar el audio' }, { status: 500 });
  }
}
