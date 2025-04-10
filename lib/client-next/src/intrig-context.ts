"use server"
import { NetworkAction, NetworkState } from '@intrig/next/network-state';
import { AxiosProgressEvent } from 'axios';
import { ZodSchema } from 'zod';
import { createContext, useContext } from 'react';
import { DefaultConfigs } from '@intrig/next/intrig-provider';

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
  dispatch: React.Dispatch<NetworkAction<unknown, unknown>>;
  configs: DefaultConfigs;
  execute: <T, E = unknown>(request: RequestType, dispatch: (state: NetworkState<T, E>) => void, schema: ZodSchema<T> | undefined, errorSchema: ZodSchema<E> | undefined) => Promise<void>;
}

/**
 * Context object created using `createContext` function. Provides a way to share state, dispatch functions,
 * and axios instance across components without having to pass props down manually at every level.
 *
 * @type {ContextType}
 */
const Context = createContext<ContextType>({
  state: {},
  filteredState: {},
  dispatch() {
    //noop
  },
  configs: {},
  async execute() {
    //noop
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
