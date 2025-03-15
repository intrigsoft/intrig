import {
  BinaryFunctionHook,
  BinaryHookOptions,
  BinaryProduceHook,
  ConstantHook, IntrigHook, IntrigHookOptions, isError, isSuccess, isValidationError, UnaryFunctionHook,
  UnaryHookOptions,
  UnaryProduceHook,
  UnitHook,
  UnitHookOptions
} from '@intrig/next/network-state';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Transforms a unit hook into a promise, enabling asynchronous usage of the hook's lifecycle or events.
 *
 * @param {UnitHook<E>} hook - The unit hook to be used as a promise.
 * @param {UnitHookOptions} options - Configuration options for the unit hook.
 * @return {[() => Promise<never>, () => void]} A tuple containing a function that returns a promise resolving with the hook's completion
 * result or rejecting with an error, and a function to clean up the hook's resources when no longer needed.
 */
export function useAsPromise<E>(hook: UnitHook<E>, options: UnitHookOptions): [() => Promise<never>, () => void];

/**
 * Converts a constant hook into a promise-based interface that can be invoked and reset.
 *
 * @param {ConstantHook<T, E>} hook - The constant hook to be converted.
 * @param {UnitHookOptions} options - Configuration options for the hook behavior.
 * @return {[() => Promise<T>, () => void]} A tuple where the first element is a function that returns a promise resolving with the hook value, and the second element is a reset function.
 */
export function useAsPromise<T, E>(hook: ConstantHook<T, E>, options: UnitHookOptions): [() => Promise<T>, () => void];

/**
 * Wraps the provided hook function to return a promise-based API, offering more flexibility
 * in asynchronous operations. This utility converts the hook into a callable function that
 * returns a `Promise` and provides a way to clean up resources.
 *
 * @param {UnaryProduceHook<P, E>} hook - The hook function to be wrapped into a promise-based API.
 * @param {UnaryHookOptions<P>} [options] - Optional parameters to configure the behavior of the hook.
 * @return {[function(P): Promise<never>, function(): void]} Returns a tuple where the first element
 * is a function that takes the hook's parameters and returns a `Promise`, and the second element
 * is a cleanup function for resource management.
 */
export function useAsPromise<P, E>(hook: UnaryProduceHook<P, E>, options?: UnaryHookOptions<P>): [(params: P) => Promise<never>, () => void];

/**
 * Allows the usage of a hook's asynchronous behavior as a Promise.
 *
 * @param {UnaryFunctionHook<P, T, E>} hook - The hook function to be used as a Promise.
 * @param {UnaryHookOptions<P>} [options] - Optional configuration object for the hook.
 * @return {[function(P): Promise<T>, function(): void]} A tuple containing:
 *     - A function that accepts parameters and returns a Promise resolving to the hook's result.
 *     - A cleanup function to properly dispose of the hook when no longer needed.
 */
export function useAsPromise<P, T, E>(  hook: UnaryFunctionHook<P, T, E>, options?: UnaryHookOptions<P>): [(params: P) => Promise<T>, () => void];

/**
 * Converts a binary hook into a promise-based function, allowing the hook to be used asynchronously.
 *
 * @template P The type of the parameters for the hook.
 * @template B The type of the body for the hook.
 * @template E The type of the error handled by the hook.
 * @param {BinaryProduceHook<P, B, E>} hook The binary hook to be converted into a promise-based function.
 * @param {BinaryHookOptions<P, B>} [options] Optional configuration for the binary hook.
 * @return {[(body: B, params: P) => Promise<never>, () => void]} A tuple where the first element is a function that returns a promise and the second is a cleanup function.
 */
export function useAsPromise<P, B, E>(hook: BinaryProduceHook<P, B, E>, options?: BinaryHookOptions<P, B>): [(body: B, params: P) => Promise<never>, () => void];

/**
 * Wraps a binary function hook into a promise-based interface.
 *
 * @param {BinaryFunctionHook<P, B, T, E>} hook The binary function hook to be wrapped.
 * @param {BinaryHookOptions<P, B>} [options] Optional configuration options for the hook.
 * @return {[function(B, P): Promise<T>, function(): void]} Returns a tuple containing a function that invokes the hook and returns a promise, and a cleanup function to dispose of the hook's resources.
 */
export function useAsPromise<P, B, T, E>(hook: BinaryFunctionHook<P, B, T, E>, options?: BinaryHookOptions<P, B>): [(body: B, params: P) => Promise<T>, () => void];

// **Implementation**
export function useAsPromise<P, B, T, E>(
  hook: IntrigHook<P, B, T, E>,
  options?: IntrigHookOptions<P, B>
): [(...args: any[]) => Promise<T>, () => void] {  // <- Compatible return type
  const resolveRef = useRef<(value: T) => void>();
  const rejectRef = useRef<(reason?: any) => void>();

  const [state, dispatch, clear] = hook(options as any); // Casting to `any` to match all overloads

  useEffect(() => {
    if (isSuccess(state)) {
      resolveRef.current?.(state.data);
      clear();
    } else if (isError(state)) {
      rejectRef.current?.(state.error);
      clear();
    }
  }, [state]);

  const promiseFn = useCallback((...args: any[]) => {
    return new Promise<T>((resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;

      const dispatchState = (dispatch as any)(...args);
      if (isValidationError(dispatchState)) {
        reject(dispatchState.error);
      }
    });
  }, [dispatch]);

  return [promiseFn, clear];
}
