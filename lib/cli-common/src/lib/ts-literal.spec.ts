import {typescript} from "./ts-literal";

describe("ts-literal", () => {
  it('should compile to typescript', async () => {
    const ts = typescript("./src/index.tsx")
    const a = ts`
      import React from 'react';
      import {createContext, useCallback, useContext, useMemo, useReducer} from "react";
      import {error, init, isPending, NetworkAction, NetworkState, pending, success} from "./network-state";
      import axios, {Axios, AxiosRequestConfig, CreateAxiosDefaults} from "axios";

      type GlobalState = Record<string, Record<string, Record<string, NetworkState<unknown>>>>;

      export interface ContextType {
        state: GlobalState,
        dispatch: React.Dispatch<NetworkAction<unknown>>
        axios: Record<string, Axios>
      }

      let Context = createContext<ContextType>({
        state: {},
        dispatch() {

        },
        axios: {}
      });

      function requestReducer(state: GlobalState, action: NetworkAction<unknown>): GlobalState {
        return {
          ...state,
          [action.source]: {
            ...(state[action.source] ?? {}),
            [action.operation]: {
              ...(state[action.source]?.[action.operation] ?? {}),
              [action.key]: action.state
            }
          }
        }
      }

      export interface IntrigProviderProps {
        configs?: Record<string, CreateAxiosDefaults>
        children: React.ReactNode
      }

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

        const contextValue = useMemo(() => ({state, dispatch, axios: axiosInstances}), [state, axiosInstances]);

        return <Context.Provider value={contextValue}>
          {children}
        </Context.Provider>
      }

      export function useAxiosInstance(source: string) {
        return useContext(Context).axios?.[source]!
      }

      export function useNetworkState<T>(key: string, operation: string, source: string): [NetworkState<T>, (request: AxiosRequestConfig) => void, clear: () => void] {
        const context = useContext(Context)

        const networkState = useMemo(() => {
          return (context.state?.[source]?.[operation]?.[key] as NetworkState<T>) ?? init()
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
            dispatch(pending())

            let response = await axios.request(request);

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

        }, [networkState, context.dispatch, context.axios?.[source]]);

        const clear = useCallback(() => {
          dispatch(init())
        }, [dispatch]);

        return [networkState, execute, clear]
      }
    `
    console.log((await a).content)
  });

  it('should allow default values', async () => {
    const ts = typescript('');
    const value = 1
    const content = ts`
      export const a = /*!*/5/*${value}*/;
    `

    expect((await content).content).toContain(`export const a = ${value};`)
  })
})
