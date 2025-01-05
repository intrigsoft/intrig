import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/services/configs';
import path from 'path';
import { INTRIG_LOCATION } from '@/const/locations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {

  let intrigConfig = getConfig();

  return NextResponse.json([
    {
      title: 'Sources',
      links: intrigConfig.sources.map(a => ({
        title: a.id,
        href: `/sources/${a.id}`
      }))
    }
  ]);
}
