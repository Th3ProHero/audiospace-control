import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * Chunked MP3 streaming with strict Accept-Ranges support.
 * Implements proper 206 Partial Content for Safari/iOS/WebKit compatibility.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json({ error: 'file parameter required' }, { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const safeName = path.basename(fileName);
    const storagePath = process.env.STORAGE_PATH || './storage';
    const filePath = path.join(storagePath, safeName);

    // Check file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    // Determine MIME type
    const ext = path.extname(safeName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.flac': 'audio/flac',
    };
    const contentType = mimeTypes[ext] || 'audio/mpeg';

    if (range) {
      // --- STRICT Range request handling (Safari/iOS critical) ---
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range
      if (isNaN(start) || start < 0 || start >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      const clampedEnd = Math.min(end, fileSize - 1);
      const chunkSize = clampedEnd - start + 1;

      const stream = fs.createReadStream(filePath, { start, end: clampedEnd });

      const readableStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk: string | Buffer) => {
            controller.enqueue(new Uint8Array(Buffer.from(chunk)));
          });
          stream.on('end', () => {
            controller.close();
          });
          stream.on('error', (err) => {
            controller.error(err);
          });
        },
        cancel() {
          stream.destroy();
        },
      });

      return new NextResponse(readableStream, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(chunkSize),
          'Content-Range': `bytes ${start}-${clampedEnd}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      // --- Full file request ---
      const stream = fs.createReadStream(filePath);

      const readableStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk: string | Buffer) => {
            controller.enqueue(new Uint8Array(Buffer.from(chunk)));
          });
          stream.on('end', () => {
            controller.close();
          });
          stream.on('error', (err) => {
            controller.error(err);
          });
        },
        cancel() {
          stream.destroy();
        },
      });

      return new NextResponse(readableStream, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(fileSize),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Audio stream error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
