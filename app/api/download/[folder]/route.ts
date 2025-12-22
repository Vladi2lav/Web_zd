import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export async function GET(request: NextRequest, { params }: { params: Promise<{ folder: string }> }) {
  const { folder } = await params;
  const folderPath = path.join(process.cwd(), 'public', 'zd', folder);

  if (!fs.existsSync(folderPath)) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
  }

  const archive = archiver('zip', { zlib: { level: 9 } });

  const chunks: Buffer[] = [];

  return new Promise<NextResponse>((resolve, reject) => {
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${folder}.zip"`,
        },
      }));
    });
    archive.on('error', reject);

    archive.directory(folderPath, false);
    archive.finalize();
  });
}