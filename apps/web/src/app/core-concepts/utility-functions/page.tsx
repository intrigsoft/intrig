import * as fs from 'fs'
import * as path from 'path'
import { Documentation } from '@/components/Documentation';
import content from '@/docs/utility-functions.md'

export const dynamic = 'force-dynamic';

export default async function Index() {

  let filePath = path.resolve(process.cwd(), './docs/utility-functions.md');

  return (
    <>
      <Documentation filePath={filePath} content={content} />
    </>
  );
}
