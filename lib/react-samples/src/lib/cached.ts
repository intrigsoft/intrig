import {init, isInit, isSuccess, NetworkState, NetworkStateResult, SuccessState} from "@intrig/client-react";
import {useEffect, useMemo, useState} from "react";
import {AxiosRequestConfig} from "axios";

export interface CachedNetworkState<T> extends NetworkState<T> {
  successData?: T;
}

export function isNetworkStateWithCache<T>(state: NetworkState<T>): state is CachedNetworkState<T> {
  return state.hasOwnProperty('successData');
}

export interface UseCachedProps<P, T> {
  hook: (key: string) => NetworkStateResult<P, T>;
}

export function useCached<P, T>({hook: useFn}: UseCachedProps<P, T>, key: string): [CachedNetworkState<T>, (request: P) => void, clear: () => void] {

  const [successState, setSuccessState] = useState<SuccessState<T>>() //TODO move to global cache

  let [state, dispatch, clear] = useFn(key);

  useEffect(() => {
    if (isSuccess(state)) {
      setSuccessState(state);
    } else if (isInit(state)) {
      setSuccessState(undefined);
    }
  }, [state]);

  const cachedState = useMemo(() => {
    return {
      ...(successState ?? init()),
      prev: successState?.data,
    }
  }, [successState, state]);

  return [cachedState, dispatch, clear];
}
