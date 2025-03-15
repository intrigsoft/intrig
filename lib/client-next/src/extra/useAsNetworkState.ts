import { error, init, NetworkState, pending, success } from '@intrig/next/network-state';
import { useCallback, useId, useMemo } from 'react';
import { useIntrigContext } from '@intrig/next/intrig-context';

/**
 * A custom hook that integrates a promise-based operation with a network state management system.
 * Tracks the network state (e.g., pending, success, error) for a given asynchronous function.
 *
 * @param fn A promise-based function that performs an asynchronous operation.
 * @param key An optional string key to identify the network state uniquely. Defaults to 'default'.
 * @return A tuple containing:
 *         1. The current network state of the operation.
 *         2. A function to execute the provided asynchronous operation.
 *         3. A function to reset the network state back to the initial state.
 */
export function useAsNetworkState<T, F extends ((...args: any) => Promise<T>)>(fn: F, key = 'default'): [NetworkState<T>, (...params: Parameters<F>) => void, () => void] {
  const id = useId();

  const context = useIntrigContext();

  const networkState = useMemo(() => {
    return context.state?.[`promiseState:${id}:${key}}`] ?? init()
  }, [context.state?.[`promiseState:${id}:${key}}`]]);

  const dispatch = useCallback(
    (state: NetworkState<T>) => {
      context.dispatch({ key, operation: id, source: 'promiseState', state });
    },
    [key, context.dispatch]
  );

  const execute = useCallback((...args: Parameters<F>) => {
    dispatch(pending())
    return fn(...args).then(
      (data) => {
        dispatch(success(data))
      },
      (e) => {
        dispatch(error(e))
      }
    )
  }, []);

  const clear = useCallback(() => {
    dispatch(init())
  }, []);

  return [
    networkState,
    execute,
    clear
  ]
}
