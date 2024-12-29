import { embeddedCodes } from '@/services/codeIndex';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { source: string } }) {
  return NextResponse.json(embeddedCodes[params.source]);
}
