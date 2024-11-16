import * as fs from 'fs'
import * as path from 'path'
import { Documentation } from '@/components/Documentation';
import { NextRequest } from 'next/server';
import { GENERATED_LOCATION } from '@/const/locations';

export const dynamic = 'force-dynamic';

export default async function Index({ params: {sourceId, controllerId, endpoint}}: {params: {sourceId: string, controllerId: string, endpoint: string}} & NextRequest) {

  let filePath = path.resolve(GENERATED_LOCATION, 'generated', 'src', sourceId, controllerId, endpoint, 'doc.md');

  let content = fs.readFileSync(filePath, 'utf8');

  return (
    <>
      <Documentation filePath={filePath} content={content} />
    </>
  );
}
