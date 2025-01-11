import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/services/configs';
import { navs } from '@/services/flexIndex'
import path from 'path';
import { INTRIG_LOCATION } from '@/const/locations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log(navs);
  return NextResponse.json(navs.navs);
}
