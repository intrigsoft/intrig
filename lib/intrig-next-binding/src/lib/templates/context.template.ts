import {CompiledOutput, IntrigSourceConfig, typescript} from "@intrig/cli-common";
import * as path from 'path'

export function contextTemplate(_path: string, apisToSync: IntrigSourceConfig[]) {
  const ts = typescript(path.resolve(_path, "src", "intrig-context.ts"))

  return ts`
  import { NetworkAction, NetworkState } from '@intrig/next-client/network-state';
import { AxiosProgressEvent } from 'axios';
import { ZodSchema } from 'zod';
import { createContext, useContext } from 'react';
import { DefaultConfigs } from '@intrig/next-client/intrig-provider';

type GlobalState = Record<string, NetworkState>;

interface RequestType<T = any> {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any; // This allows transformations, while retaining flexibility.
  originalData?: T; // Keeps track of the original data type.
  onUploadProgress?: (event: AxiosProgressEvent) => void;
  onDownloadProgress?: (event: AxiosProgressEvent) => void;
  signal?: AbortSignal;
  key: string;
}

/**
 * Defines the ContextType interface for managing global state, dispatching actions,
 * and holding a collection of Axios instances.
 *
 * @interface ContextType
 * @property {GlobalState} state - The global state of the application.
 * @property {React.Dispatch<NetworkAction<unknown>>} dispatch - The dispatch function to send network actions.
 * @property {Record<string, AxiosInstance>} axios - A record of Axios instances for making HTTP requests.
 */
export interface ContextType {
  state: GlobalState;
  filteredState: GlobalState;
  dispatch: React.Dispatch<NetworkAction<unknown>>;
  configs: DefaultConfigs;
  execute: <T>(request: RequestType, dispatch: (state: NetworkState<T>) => void, schema: ZodSchema<T> | undefined) => Promise<void>;
}

/**
 * Context object created using \`createContext\` function. Provides a way to share state, dispatch functions,
 * and axios instance across components without having to pass props down manually at every level.
 *
 * @type {ContextType}
 */
let Context = createContext<ContextType>({
  state: {},
  filteredState: {},
  dispatch() {},
  configs: {},
  async execute() {

  }
});

export function useIntrigContext() {
  return useContext(Context);
}

export {
  Context,
  GlobalState,
  RequestType,
}
`
}