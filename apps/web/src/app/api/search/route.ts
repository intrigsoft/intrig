import { search } from '@/services/flexIndex'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  let q = request.nextUrl.searchParams.get('q') ?? '';
  let size = request.nextUrl.searchParams.get('size');

  let results = search(q, size ? parseInt(size) : undefined);

  return NextResponse.json(results);
}
