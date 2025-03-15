import {
  BinaryFunctionHook,
  BinaryHookOptions,
  BinaryProduceHook,
  ConstantHook, IntrigHook, IntrigHookOptions, isSuccess, UnaryFunctionHook,
  UnaryHookOptions,
  UnaryProduceHook,
  UnitHook,
  UnitHookOptions
} from '@intrig/next/network-state';
import { useEffect, useState } from 'react';

/**
 * Resolves and caches the computed value of a given hook.
 *
 * @param {UnitHook<E>} hook - The hook to be resolved and cached. Represents a unit of work or computation.
 * @param {UnitHookOptions} options - Options to customize the behavior of the hook resolution and caching process.
 * @return {undefined} This function does not return a value.
 */
export function useResolvedCachedValue<E>(hook: UnitHook<E>, options: UnitHookOptions): undefined;

/**
 * Resolves and retrieves a cached value by utilizing a specified hook and options.
 *
 * @param {ConstantHook<T, E>} hook - The hook function used to compute or retrieve the cached value.
 * @param {UnitHookOptions} options - Options controlling the behavior or configuration of the hook.
 * @return {T | undefined} The resolved cached value or undefined if the value couldn't be determined.
 */
export function useResolvedCachedValue<T, E>(hook: ConstantHook<T, E>, options: UnitHookOptions): T | undefined;

/**
 * Resolves and caches the value produced by the specified hook.
 * This utility helps in managing hook-driven computational results within a component context by caching
 * and avoiding unnecessary recalculations when the inputs remain the same.
 *
 * @param {UnaryProduceHook<P, E>} hook - The hook function to execute, responsible for producing a resolved value.
 * @param {UnaryHookOptions<P>} options - The configuration options that control how the hook is executed.
 * @return {undefined} Returns undefined since the resolution and caching of the value are managed internally.
 */
export function useResolvedCachedValue<P, E>(hook: UnaryProduceHook<P, E>, options: UnaryHookOptions<P>): undefined;

/**
 * Resolves a cached value using the provided hook and options.
 *
 * @param {UnaryFunctionHook<P, T, E>} hook - A hook function that accepts parameters of type P,
 *                                           processes them, and returns a value of type T or possibly throws an error of type E.
 * @param {UnaryHookOptions<P>} options - Configuration settings or arguments required by the hook to retrieve the cached value.
 * @return {T | undefined} A value of type T if resolved successfully, or undefined if not available.
 */
export function useResolvedCachedValue<P, T, E>(hook: UnaryFunctionHook<P, T, E>, options: UnaryHookOptions<P>): T | undefined;

/**
 * Resolves and caches the value produced by the provided binary hook function.
 * This function ensures that the hook's resolved value is reused efficiently across invocations
 * based on the provided options.
 *
 * @param {BinaryProduceHook<P, B, E>} hook - A hook function that produces the binary value to be resolved and cached.
 * @param {BinaryHookOptions<P, B>} options - Configuration options for controlling the behavior of the hook and its caching mechanism.
 * @return {undefined} - Returns undefined as the resolution is managed internally via the hook's lifecycle.
 */
export function useResolvedCachedValue<P, B, E>(hook: BinaryProduceHook<P, B, E>, options: BinaryHookOptions<P, B>): undefined;

/**
 * A hook utility function that resolves and caches a value based on the given binary function hook and options.
 *
 * @param {BinaryFunctionHook<P, B, T, E>} hook - The binary function hook used to compute the value.
 * @param {BinaryHookOptions<P, B>} options - The options object containing parameters and configuration for the hook.
 * @return {T | undefined} The resolved and cached value, or undefined if it cannot be resolved.
 */
export function useResolvedCachedValue<P, B, T, E>(hook: BinaryFunctionHook<P, B, T, E>, options: BinaryHookOptions<P, B>): T | undefined;

// **Implementation**
export function useResolvedCachedValue<P, B, T, E>(hook: IntrigHook<P, B, T, E>, options: IntrigHookOptions<P, B>): T | undefined {
  const [cachedValue, setCachedValue] = useState<T | undefined>();

  const [state] = hook(options as any); // Ensure compatibility with different hook types

  useEffect(() => {
    if (isSuccess(state)) {
      setCachedValue(state.data);
    }
    // Do not clear cached value if state is unsuccessful
  }, [state]);

  return cachedValue;
}
