import * as path from 'path';
import { Documentation } from '@/components/Documentation';
import content from '@/docs/introduction.md'

export const dynamic = 'force-dynamic';

export default async function Index() {

  const filePath = path.resolve(process.cwd(), './src/docs/introduction.md');

  return (
    <>
      <Documentation filePath={filePath} content={content} />
    </>
  );
}
