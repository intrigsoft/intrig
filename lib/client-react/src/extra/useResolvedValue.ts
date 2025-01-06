import {
  BinaryFunctionHook,
  BinaryHookOptions,
  BinaryProduceHook,
  ConstantHook, IntrigHook, IntrigHookOptions, isSuccess, UnaryFunctionHook,
  UnaryHookOptions,
  UnaryProduceHook,
  UnitHook,
  UnitHookOptions
} from '@intrig/react/network-state';
import { useEffect, useState } from 'react';

/**
 * A function that resolves the value provided by a unit hook based on specified options.
 *
 * @param {UnitHook<E>} hook - The unit hook function that provides the value to be resolved.
 * @param {UnitHookOptions} options - Configuration options to control how the unit hook is resolved.
 * @return {undefined} Returns undefined after resolving the unit hook value.
 */
export function useResolvedValue<E>(hook: UnitHook<E>, options: UnitHookOptions): undefined;

/**
 * Resolves the value of a given constant hook based on the provided options.
 *
 * @param {ConstantHook<T, E>} hook - The constant hook to be resolved.
 * @param {UnitHookOptions} options - The options used to configure the resolution of the hook value.
 * @return {T | undefined} The resolved value of the hook or undefined if the hook cannot be resolved.
 */
export function useResolvedValue<T, E>(hook: ConstantHook<T, E>, options: UnitHookOptions): T | undefined;
/**
 * This function is a utility hook that evaluates and resolves the value of the provided hook function.
 * It takes a hook function and its corresponding options as arguments to produce side effects or state updates.
 *
 * @param {UnaryProduceHook<P, E>} hook - A hook function that is responsible for creating or updating a state or effect.
 * @param {UnaryHookOptions<P>} options - Configuration options for the hook, such as parameters or behaviors.
 * @return {undefined} This function does not return a value; it operates through side effects or resolves implicitly.
 */
export function useResolvedValue<P, E>(hook: UnaryProduceHook<P, E>, options: UnaryHookOptions<P>): undefined;

/**
 * A custom hook that provides a resolved value based on the provided unary function hook and options.
 *
 * @param {UnaryFunctionHook<P, T, E>} hook - The primary unary function hook that processes the input and resolves a value.
 * @param {UnaryHookOptions<P>} options - The configuration object containing parameters for the unary hook execution.
 * @return {T | undefined} The resolved value of type T if successful, or undefined if no value is resolved.
 */
export function useResolvedValue<P, T, E>(hook: UnaryFunctionHook<P, T, E>, options: UnaryHookOptions<P>): T | undefined;

/**
 * A custom hook that processes a binary produce hook and its options to produce a resolved value.
 *
 * @param {BinaryProduceHook<P, B, E>} hook - The binary produce hook to be resolved.
 * @param {BinaryHookOptions<P, B>} options - The options provided to the binary hook for processing.
 * @return {undefined} Returns `undefined` after the hook is resolved.
 */
export function useResolvedValue<P, B, E>(hook: BinaryProduceHook<P, B, E>, options: BinaryHookOptions<P, B>): undefined;

/**
 * Resolves a value based on the provided binary function hook and options.
 *
 * @param {BinaryFunctionHook<P, B, T, E>} hook - The binary function hook that defines the logic to resolve the value.
 * @param {BinaryHookOptions<P, B>} options - Configuration options for the binary function hook.
 * @return {T | undefined} The resolved value of type T, or undefined if the resolution fails.
 */
export function useResolvedValue<P, B, T, E>(hook: BinaryFunctionHook<P, B, T, E>, options: BinaryHookOptions<P, B>): T | undefined;

// **Implementation**
export function useResolvedValue<P, B, T, E>(hook: IntrigHook<P, B, T, E>, options: IntrigHookOptions<P, B>): T | undefined {
  const [value, setValue] = useState<T | undefined>();

  let [state] = hook(options as any); // Ensure compatibility with different hook types

  useEffect(() => {
    if (isSuccess(state)) {
      setValue(state.data);
    } else {
      setValue(undefined);
    }
  }, [state]); // Add `state` to the dependency array to ensure updates

  return value;
}
