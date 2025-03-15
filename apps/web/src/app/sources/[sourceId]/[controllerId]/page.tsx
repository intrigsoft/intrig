import * as fs from 'fs'
import * as path from 'path'
import { Documentation } from '@/components/Documentation';
import { NextRequest } from 'next/server';
import { INTRIG_LOCATION } from '@/const/locations';

export const dynamic = 'force-dynamic';

export default async function Index({ params: {sourceId, controllerId}}: {params: {sourceId: string, controllerId: string}}) {

  const filePath = path.resolve(INTRIG_LOCATION, 'generated', 'src', sourceId, controllerId, 'doc.md');

  const content = fs.readFileSync(filePath, 'utf8');

  return (
    <>
      <Documentation filePath={filePath} content={content} />
    </>
  );
}
