import * as path from 'path'
import * as fs from 'fs'
import { Documentation } from '@/components/Documentation';

export const dynamic = 'force-dynamic';

export default async function Index({params}: {params: {slug: string[]}}) {

  const filePath = path.resolve(process.cwd(), 'src', 'docs', 'core', ...params.slug, 'doc.md');

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  return (
    <>
      <Documentation filePath={filePath} content={content}/>
    </>
  );
}
