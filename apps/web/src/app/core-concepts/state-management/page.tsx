import * as fs from 'fs'
import * as path from 'path'
import { Documentation } from '@/components/Documentation';
import content from '@/docs/state-management.md'

export const dynamic = 'force-dynamic';

export default async function Index() {

  let filePath = path.resolve(process.cwd(), './docs/state-management.md');

  return (
    <>
      <Documentation filePath={filePath} content={content} />
    </>
  );
}
