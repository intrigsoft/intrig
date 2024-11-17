import { embeddedCodes } from '@/services/codeIndex';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { source: string } }) {
  return NextResponse.json(embeddedCodes[params.source]);
}
