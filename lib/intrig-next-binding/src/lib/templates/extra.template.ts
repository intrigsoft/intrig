import {typescript} from "@intrig/cli-common";
import * as path from 'path'

export function extraTemplate(_path: string) {
  const ts = typescript(path.resolve(_path, "src", "extra.ts"))

  return ts`
  "use client"
import {
  error,
  init, IntrigHook,
  isError,
  isSuccess,
  isValidationError,
  NetworkState,
  pending,
  success
} from '@intrig/next/network-state';
import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from 'react';
import { useIntrigContext } from '@intrig/next/intrig-context';

/**
 * Converts a given hook into a promise-based function.
 *
 * @param {IntrigHook<P, B, T>} hook - The hook function to be converted.
 * @param {string} [key='default'] - An optional key to uniquely identify the hook instance.
 *
 * @return {[(...params: Parameters<ReturnType<IntrigHook<P, B, T>>[1]>) => Promise<T>, () => void]}
 * Returns a tuple containing a function that invokes the hook as a promise and a function to clear the state.
 */
export function useAsPromise<P, B, T>(hook: IntrigHook<P, B, T>, key: string = 'default'): [(...params: Parameters<ReturnType<IntrigHook<P, B, T>>[1]>) => Promise<T>, () => void] {
  const resolveRef = useRef<(value: T) => void>();
  const rejectRef = useRef<(reason?: any) => void>();

  let [state, dispatch, clear] = hook(key);

  useEffect(() => {
    if (isSuccess(state)) {
      resolveRef.current?.(state.data);
      clear();
    } else if (isError(state)) {
      rejectRef.current?.(state.error);
      clear()
    }
  }, [state]);

  const promiseFn = useCallback((...args: Parameters<ReturnType<IntrigHook<P, B, T>>[1]>) => {
    return new Promise<T>((resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;
      let dispatchState = (dispatch as any)(...args);
      if (isValidationError(dispatchState)) {
        reject(dispatchState.error);
      }
    });
  }, [dispatch]);

  return [
    promiseFn,
    clear
  ];
}

/**
 * A custom hook that manages and returns the network state of a promise-based function,
 * providing a way to execute the function and clear its state.
 *
 * @param fn The promise-based function whose network state is to be managed. It should be a function that returns a promise.
 * @param key An optional identifier for the network state. Defaults to 'default'.
 * @return A tuple containing the current network state, a function to execute the promise, and a function to clear the state.
 */
export function useAsNetworkState<T, F extends ((...args: any) => Promise<T>)>(fn: F, key: string = 'default'): [NetworkState<T>, (...params: Parameters<F>) => void, () => void] {
  let id = useId();

  let context = useIntrigContext();

  const networkState = useMemo(() => {
    return context.state?.[${"`promiseState:${id}:${key}}`"}] ?? init()
  }, [context.state?.[${"`promiseState:${id}:${key}}`"}]]);

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

/**
 * A custom hook that resolves the value from the provided hook's state and updates it whenever the state changes.
 *
 * @param {IntrigHook<P, B, T>} hook - The hook that provides the state to observe and resolve data from.
 * @param {string} [key='default'] - An optional key to be passed to the hook for specific state resolution.
 * @return {T | undefined} The resolved value from the hook's state or undefined if the state is not successful.
 */
export function useResolvedValue<P, B, T>(hook: IntrigHook<P, B, T>, key: string = 'default') {
  const [value, setValue] = useState<T>();

  let [state] = hook(key);

  useEffect(() => {
    if (isSuccess(state)) {
      setValue(state.data);
    } else {
      setValue(undefined);
    }
  }, []);

  return value
}


/**
 * A custom hook that resolves and caches the value from a successful state provided by the given hook.
 * The state is updated only when it is in a successful state.
 *
 * @param {IntrigHook<P, B, T>} hook - The hook that provides the state to observe and cache data from.
 * @param {string} [key='default'] - An optional key to be passed to the hook for specific state resolution.
 * @return {T | undefined} The cached value from the hook's state or undefined if the state is not successful.
 */
export function useResolvedCachedValue<P, B, T>(hook: IntrigHook<P, B, T>, key: string = 'default') {
  const [cachedValue, setCachedValue] = useState<T | undefined>();

  let [state] = hook(key);

  useEffect(() => {
    if (isSuccess(state)) {
      setCachedValue(state.data);
    }
    // Do not clear cached value if state is unsuccessful
  }, [state]);

  return cachedValue;
}
`
}
