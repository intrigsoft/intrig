import {createContext, useContext, useEffect, useMemo, useReducer} from "react";
import {NetworkAction, NetworkState} from "./network-state";
import axios, {Axios} from "axios";

type GlobalState = Record<string, NetworkState<unknown>>;

export interface ContextType {
  state: GlobalState,
  dispatch: React.Dispatch<NetworkAction<unknown>>
  axios?: Axios
}

let Context = createContext<ContextType>({
  state: {},
  dispatch() {

  },
  axios: undefined
});

function requestReducer(state: GlobalState, action: NetworkAction<unknown>) {
  return {
    ...state,
    [action.key]: action.state
  }
}

export interface IntrigProviderProps {
  baseURL: string
  headers?: {}
  children: React.ReactNode
}

export function IntrigProvider({children, baseURL, headers}: IntrigProviderProps) {
  const [state, dispatch] = useReducer(requestReducer, {} as GlobalState)

  const axiosInstance = useMemo(() => {
    return axios.create({
      headers,
      baseURL,
    });
  }, [baseURL, headers]);

  const contextValue = useMemo(() => ({state, dispatch, axiosInstance}), [state, axiosInstance]);

  return <Context.Provider value={contextValue}>
    {children}
  </Context.Provider>
}

export function useAxiosInstance() {
  return useContext(Context).axios!
}

export function useNetworkState<T>(key: string): [NetworkState<T>, (state: NetworkState<T>) => void] {
  const context = useContext(Context)

  const networkState = useMemo(() => {
    return context.state[key] as NetworkState<T>
  }, [context.state[key]]);

  return [networkState, (state: NetworkState<T>) => context.dispatch({key, state})]
}


