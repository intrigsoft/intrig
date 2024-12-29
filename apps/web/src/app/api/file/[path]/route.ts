import { NextRequest, NextResponse } from 'next/server';
import { fileContent } from '@/services/fileContent';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  return NextResponse.json({
    content: fileContent(params.path),
  });
}
