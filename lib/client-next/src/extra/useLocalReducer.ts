import { useIntrigContext } from '@intrig/next/intrig-context';
import { useCallback, useMemo } from 'react';
import { error, init, isInit, isSuccess, NetworkState, success } from '@intrig/next/network-state';

export interface LocalReducerOptions<T> {
  initState?: T;
  key?: string;
}

function isPromise<T>(item: any): item is Promise<T> {
  return !!item && typeof item.then === 'function' && typeof item.catch === 'function';
}

export function useLocalReducer<T, E, F extends (event: E, curState?: T) => T | Promise<T>>(fn: F, options: LocalReducerOptions<T>) {
  const context = useIntrigContext();

  const key = useMemo(() => {
    return options.key ?? 'default';
  }, []);

  const networkState: NetworkState<T> = useMemo(() => {
    return context.state?.[`localState:reduce:${key}`] ?? init()
  }, [context.state?.[`localState:reduce:${key}`]]);

  const dispatch = useCallback(
    (state: NetworkState<T>) => {
      context.dispatch({ key, operation: 'reduce', source: 'localState', state });
    },
    [key, context.dispatch]
  );

  const execute = useCallback((event: E) => {
    try {
      if (isSuccess(networkState)) {
        const data = fn(event, networkState.data);
        if (isPromise(data)) {
          dispatch(init());
          data.then(data => dispatch(success(data)));
        } else {
          dispatch(success(data));
        }
      } else if (isInit(networkState)) {
        const data1 = fn(event, options.initState);
        if (isPromise(data1)) {
          dispatch(init());
          data1.then(data => dispatch(success(data)));
        } else {
          dispatch(success(data1));
        }
      }
    } catch (e) {
      dispatch(error(e));
    }
  }, [networkState, dispatch, fn]);

  const clear = useCallback(() => {
    dispatch(init())
  }, []);

  return [networkState, execute, clear]
}
