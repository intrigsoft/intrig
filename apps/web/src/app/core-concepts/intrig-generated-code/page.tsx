import * as path from 'path'
import { Documentation } from '@/components/Documentation';
import content from '@/docs/intrig-generated-code.md'

export const dynamic = 'force-dynamic';

export default async function Index() {

  let filePath = path.resolve(process.cwd(), './docs/intrig-generated-code.md');

  return (
    <>
      <Documentation filePath={filePath} content={content}/>
    </>
  );
}