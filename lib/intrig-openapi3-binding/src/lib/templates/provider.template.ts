import {CompiledOutput, typescript} from "@intrig/cli-common";
import * as path from 'path'

export function providerTemplate(_path: string): CompiledOutput {
  const ts = typescript(path.resolve(_path, "src", "lib", "intrig-provider.tsx"))
  return ts`
import {createContext, PropsWithChildren, useCallback, useContext, useMemo, useReducer, useState} from "react";
import {
  error,
  ErrorState,
  ErrorWithContext,
  init,
  isError,
  isPending,
  NetworkAction,
  NetworkState,
  pending, Progress,
  success
} from "./network-state";
import axios, {Axios, AxiosRequestConfig, CreateAxiosDefaults} from "axios";

type GlobalState = Record<string, NetworkState>;

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
  state: GlobalState,
  filteredState: GlobalState,
  dispatch: React.Dispatch<NetworkAction<unknown>>
  axios: Record<string, Axios>
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
  dispatch() {

  },
  axios: {}
});

/**
 * Handles state updates for network requests based on the provided action.
 *
 * @param {GlobalState} state - The current state of the application.
 * @param {NetworkAction<unknown>} action - The action containing source, operation, key, and state.
 * @return {GlobalState} - The updated state after applying the action.
 */
function requestReducer(state: GlobalState, action: NetworkAction<unknown>): GlobalState {
  return {
    ...state,
    [\`${"${action.source}:${action.operation}:${action.key}"}\`]: action.state
  }
}

export interface IntrigProviderProps {
  configs?: Record<string, CreateAxiosDefaults>
  children: React.ReactNode
}

/**
 * IntrigProvider is a context provider component that sets up global state management
 * and provides Axios instances for API requests.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the provider.
 * @param {Object} [props.configs={}] - Configuration object for Axios instances.
 * @param {Object} [props.configs.defaults={}] - Default configuration for Axios.
 * @param {Object} [props.configs.petstore={}] - Configuration specific to the petstore API.
 * @return {JSX.Element} A context provider component that wraps the provided children.
 */
export function IntrigProvider({children, configs = {}}: IntrigProviderProps) {
  const [state, dispatch] = useReducer(requestReducer, {} as GlobalState)

  const axiosInstances: Record<string, Axios> = useMemo(() => {
    return {
      "petstore": axios.create({
        ...(configs.defaults ?? {}),
        ...(configs['petstore'] ?? {})
      })
    };
  }, [configs]);

  const contextValue = useMemo(() => ({state, dispatch, axios: axiosInstances, filteredState: state}), [state, axiosInstances]);

  return <Context.Provider value={contextValue}>
    {children}
  </Context.Provider>
}

export interface StatusTrapProps {
  type: 'pending' | 'error' | 'pending + error'
  propagate?: boolean
}

/**
 * StatusTrap component is used to track and manage network request states.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The child elements to be rendered.
 * @param {string} props.type - The type of network state to handle ("error", "pending", "pending + error").
 * @param {boolean} [props.propagate=true] - Whether to propagate the event to the parent context.
 * @return {React.ReactElement} The context provider component with filtered state and custom dispatch.
 */
export function StatusTrap({children, type, propagate = true}: PropsWithChildren<StatusTrapProps>) {
  const ctx = useContext(Context)

  const [requests, setRequests] = useState<string[]>([])

  const shouldHandleEvent = useCallback((state: NetworkState) => {
    switch (type) {
      case "error":
        return isError(state);
      case "pending":
        return isPending(state);
      case "pending + error":
        return isPending(state) || isError(state);
      default:
        return false;
    }
  }, [type]);

  const dispatch = useCallback(
    (event: NetworkAction<any>) => {
      if (!event.handled) {
        if (shouldHandleEvent(event.state)) {
          setRequests((prev) => [...prev, event.key]);
          if (!propagate) {
            ctx.dispatch({
              ...event,
              handled: true,
            });
            return;
          }
        } else {
          setRequests((prev) => prev.filter((k) => k !== event.key));
        }
      }
      ctx.dispatch(event);
    },
    [ctx, propagate, shouldHandleEvent]);

  const filteredState = useMemo(() => {
    return Object.fromEntries(Object.entries(ctx.state).filter(([key]) => requests.includes(key)))
  }, [ctx.state, requests]);

  return <Context.Provider value={{
    ...ctx,
    dispatch,
    filteredState
  }}>
    {children}
  </Context.Provider>
}

/**
 * Manages the state of network requests, including their progress and responses.
 *
 * @param {string} key - The unique key to identify the network request.
 * @param {string} operation - The operation associated with the network request.
 * @param {string} source - The source or origin of the network request.
 * @param {number|undefined} debounceDelay - The debounce delay in milliseconds to avoid excessive requests.
 * @return {[NetworkState<T>, (request: AxiosRequestConfig) => void, () => void]} An array containing the current network state, a function to execute the network request, and a function to clear the current request state.
 */
export function useNetworkState<T>(key: string, operation: string, source: string, debounceDelay: number = 0): [NetworkState<T>, (request: AxiosRequestConfig) => void, clear: () => void] {
  const context = useContext(Context)

  const [abortController, setAbortController] = useState<AbortController>()

  const networkState = useMemo(() => {
    return (context.state?.[\`${"${source}:${operation}:${key}"}\`] as NetworkState<T>) ?? init()
  }, [context.state[key]]);

  const dispatch = useCallback((state: NetworkState<T>) => {
    context.dispatch({key, operation, source, state})
  }, [key, operation, source, context.dispatch]);

  const axios = useMemo(() => {
    return context.axios?.[source]!
  }, [context.axios]);

  const execute = useCallback(async (request: AxiosRequestConfig) => {
    //TODO implement debounce
    if (isPending(networkState)) {
      return
    }

    try {
      let abortController = new AbortController();
      setAbortController(abortController);
      dispatch(pending())

      let response = await axios.request({
        ...request,
        onUploadProgress(event) {
          dispatch(pending({
            type: 'upload',
            loaded: event.loaded,
            total: event.total
          }))
          request.onUploadProgress?.(event)
        },
        onDownloadProgress(event) {
          dispatch(pending({
            type: 'download',
            loaded: event.loaded,
            total: event.total
          }))
          request.onDownloadProgress?.(event)
        },
        signal: abortController.signal,

      });

      if (response.status === 200) {
        //TODO validate
        dispatch(success(response.data))
      } else {
        dispatch(error(response.data ?? response.statusText, response.status))
      }
    } catch (e: any) {
      if (e.response) {
        dispatch(error(e.response.data, e.response.status))
      } else {
        dispatch(error(e))
      }
    }

  }, [networkState, context.dispatch, axios]);

  const deboundedExecute = useMemo(() => debounce(execute, debounceDelay ?? 0), [execute])

  const clear = useCallback(() => {
    dispatch(init())
    setAbortController(abortController => {
      abortController?.abort()
      return undefined;
    })
  }, [dispatch, abortController]);

  return [networkState, deboundedExecute, clear]
}

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: any;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}


/**
 * Handles central error extraction from the provided context.
 * It filters the state to retain error states and maps them to a structured error object with additional context information.
 * @return {Object[]} An array of objects representing the error states with context information such as source, operation, and key.
 */
export function ueCentralErrorHandling() {
  const ctx = useContext(Context)

  return useMemo(() => {
    return Object.entries(ctx.filteredState)
      .filter(([, state]) => isError(state))
      .map(([k, state]) => {
        let [source, operation, key] = k.split(':');
        return {
          ...state as ErrorState<unknown>,
          source,
          operation,
          key
        } satisfies ErrorWithContext;
      })
  }, [ctx.filteredState])
}

/**
 * Uses central pending state handling by aggregating pending states from context.
 * It calculates the overall progress of pending states if any, or returns an initial state otherwise.
 *
 * @return {NetworkState} The aggregated network state based on the pending states and their progress.
 */
export function useCentralPendingStateHandling() {
  const ctx = useContext(Context)

  const result: NetworkState = useMemo(() => {
    let pendingStates = Object.values(ctx.filteredState)
      .filter(isPending);
    if (!pendingStates.length) {
      return init()
    }

    let progress = pendingStates
      .filter(a => a.progress)
      .reduce((progress, current) => {
        return {
          total: progress.total + (current.progress?.total ?? 0),
          loaded: progress.loaded + (current.progress?.loaded ?? 0)
        }
      }, {total: 0, loaded: 0} satisfies Progress);
    return pending(!!progress.total ? progress : undefined)
  }, [ctx.filteredState]);

  return result;
}

  `
}
