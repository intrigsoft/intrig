import { search } from '@/services/flexIndex'
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  const size = request.nextUrl.searchParams.get('size');

  const results = search(q, size ? parseInt(size) : undefined);

  return NextResponse.json(results);
}
