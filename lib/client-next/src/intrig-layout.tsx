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
