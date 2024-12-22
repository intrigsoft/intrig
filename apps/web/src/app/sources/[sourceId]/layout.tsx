import { DataTypeContextProvider } from '@/components/DataTypeViewer';
import { PropsWithChildren } from 'react';

export const dynamic = 'force-dynamic';

export default function Layout({ children, params: {sourceId} }: PropsWithChildren<{params: {sourceId: string}}>) {
  return <DataTypeContextProvider source={sourceId}>{children}</DataTypeContextProvider>
}
