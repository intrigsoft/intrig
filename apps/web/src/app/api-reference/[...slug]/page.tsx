import * as path from 'path'
import * as fs from 'fs'
import { Documentation } from '@/components/Documentation';

export const dynamic = 'force-dynamic';

export default async function Index({params}: {params: {slug: string[]}}) {

  let filePath = path.resolve(process.cwd(), 'src', 'docs', 'api-reference', ...params.slug, 'doc.md');

  if (!fs.existsSync(filePath)) {
    return null;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  return (
    <>
      <Documentation filePath={filePath} content={content}/>
    </>
  );
}
