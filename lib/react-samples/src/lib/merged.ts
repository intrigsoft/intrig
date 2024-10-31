import {init, InitState, isInit, isSuccess, NetworkState, NetworkStateResult, SuccessState} from "@intrig/client-react";
import {useCallback, useEffect, useMemo, useReducer} from "react";

export interface MergedNetworkState<T> extends NetworkState<T> {
  merged?: T[];
}

export function isMergedNetworkState<T>(state: NetworkState<T>): state is MergedNetworkState<T> {
  return state.hasOwnProperty('merged');
}

export interface UseAccumulatedProps<P, U, T> {
  hook: (key: string) => NetworkStateResult<P, U>
  list: (data: U) => T[]
  id: (data: T) => string
}

export function useMerged<P, U, T>({hook: useFn, list, id}: UseAccumulatedProps<P, U, T>, key: string): [MergedNetworkState<T>, (request: P) => void, () => void] {

  const reducer = useCallback((state: T[], action: SuccessState<U> | InitState<U>): T[] => {
    if (isInit(action)) {
      return []
    } else if (isSuccess(action)) {
      return [...state, ...list(action.data)]
        .filter((item, index, self) => {
          return self.findIndex((t) => id(t) === id(item)) === index;
        });
    }
    return state;

  }, []);

  let [merged, merge] = useReducer(reducer, []);

  let [state, dispatch, clear] = useFn(key);

  useEffect(() => {
    if (isSuccess(state) || isInit(state)) {
      merge(state)
    }
  }, [state]);

  const mergedState = useMemo(() => {
    return {
      ...state,
      merged
    }
  }, [merged, state]);

  return [
    mergedState,
    dispatch,
    clear
  ]

}
