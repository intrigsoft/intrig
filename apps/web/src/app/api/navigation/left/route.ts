import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/services/configs';

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
