import {CompiledOutput, IntrigSourceConfig, typescript} from "@intrig/cli-common";
import * as path from 'path'

export function intrigLayoutTemplate(_path: string, apisToSync: IntrigSourceConfig[]): CompiledOutput {

  const ts = typescript(path.resolve(_path, "src", "intrig-layout.tsx"))
  return ts`
"use server"

import { headers } from 'next/headers';
import { DefaultConfigs, IntrigProvider } from './intrig-provider';

export default async function IntrigLayout({children, configs}: { children: React.ReactNode, configs?: DefaultConfigs}) {

  let headersData = await headers();
  let hydratedResponsesStr = headersData.get('INTRIG_HYDRATED');
  let hydratedResponses = hydratedResponsesStr ? JSON.parse(hydratedResponsesStr) : {}
  headersData.delete('INTRIG_HYDRATED');

  return <>
    <IntrigProvider configs={configs} initState={hydratedResponses}>
      {children}
    </IntrigProvider>
  </>
}
`
}
