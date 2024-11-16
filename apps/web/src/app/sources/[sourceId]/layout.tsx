import { DataTypeContextProvider } from '@/components/DataTypeViewer';
import { PropsWithChildren } from 'react';

export default function Layout({ children, params: {sourceId} }: PropsWithChildren<{params: {sourceId: string}}>) {
  return <DataTypeContextProvider source={sourceId}>{children}</DataTypeContextProvider>
}
