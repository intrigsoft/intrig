import { NextRequest, NextResponse } from 'next/server';
import { reindex } from '@/services/flexIndex';

export async function GET(request: NextRequest) {
  reindex();

  return NextResponse.json({

  });
}
