import { ReactClientComponentEditor } from '@/components/ReactClientComponentEditor';
import path from 'path';
import { INTRIG_LOCATION } from '@/const/locations';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export default async function Page({ params: {sourceId, controllerId, endpoint}}: {params: {sourceId: string, controllerId: string, endpoint: string}}) {

  const filePath = path.resolve(INTRIG_LOCATION, 'generated', 'src', sourceId, controllerId, endpoint, 'metainfo.json');

  const content = fs.readFileSync(filePath, 'utf8');

  const config = JSON.parse(content)

  return <>
    <ReactClientComponentEditor config={config} />
  </>
}
