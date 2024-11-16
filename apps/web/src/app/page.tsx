import * as path from 'path';
import { Documentation } from '@/components/Documentation';

export const dynamic = 'force-dynamic';

export default async function Index() {

  let filePath = path.resolve(process.cwd(), '../../docs/insight/introduction.md');

  return (
    <>
      <Documentation filePath={filePath} />
    </>
  );
}
