/**
 * State of an asynchronous call. Network state follows the state diagram given below.
 *
 *
 * <pre>
 *                 ┌──────┐
 *   ┌─────────────► Init ◄────────────┐
 *   │             └▲────┬┘            │
 *   │              │    │             │
 *   │           Reset  Execute        │
 * Reset            │    │           Reset
 *   │           ┌──┴────┴──┐          │
 *   │      ┌────► Pending  ◄────┐     │
 *   │      │    └──┬────┬──┘    │     │
 *   │   Execute    │    │    Execute  │
 *   │      │       │    │       │     │
 *   │      │ OnSuccess OnError  │     │
 *   │ ┌────┴──┐    │    │    ┌──┴───┐ │
 *   └─┤Success◄────┘    └────►Error ├─┘
 *     └───────┘              └──────┘
 *
 * </pre>
 */
export interface NetworkState<T = unknown> {
  state: 'init' | 'pending' | 'success' | 'error';
}

/**
 * Network call is not yet started
 */
export interface InitState<T> extends NetworkState<T> {
  state: 'init';
}

/**
 * Checks whether the state is init state
 * @param state
 */
export function isInit<T>(state: NetworkState<T>): state is InitState<T> {
  return state.state === 'init';
}

/**
 * Initializes a new state.
 *
 * @template T The type of the state.
 * @return {InitState<T>} An object representing the initial state.
 */
export function init<T>(): InitState<T> {
  return {
    state: 'init',
  };
}

/**
 * Network call is not yet completed
 */
export interface PendingState<T> extends NetworkState<T> {
  state: 'pending';
  progress?: Progress;
}

/**
 * Interface representing progress information for an upload or download operation.
 *
 * @typedef {object} Progress
 *
 * @property {'upload' | 'download'} type - The type of the operation.
 *
 * @property {number} loaded - The amount of data that has been loaded so far.
 *
 * @property {number} [total] - The total amount of data to be loaded (if known).
 */
export interface Progress {
  type?: 'upload' | 'download';
  loaded: number;
  total?: number;
}

/**
 * Checks whether the state is pending state
 * @param state
 */
export function isPending<T>(state: NetworkState<T>): state is PendingState<T> {
  return state.state === 'pending';
}

/**
 * Generates a PendingState object with a state of "pending".
 *
 * @return {PendingState<T>} An object representing the pending state.
 */
export function pending<T>(
  progress: Progress | undefined = undefined
): PendingState<T> {
  return {
    state: 'pending',
    progress,
  };
}

/**
 * Network call is completed with success state
 */
export interface SuccessState<T> extends NetworkState<T> {
  state: 'success';
  data: T;
}

/**
 * Checks whether the state is success response
 * @param state
 */
export function isSuccess<T>(state: NetworkState<T>): state is SuccessState<T> {
  return state.state === 'success';
}

/**
 * Creates a success state object with the provided data.
 *
 * @param {T} data - The data to be included in the success state.
 * @return {SuccessState<T>} An object representing a success state containing the provided data.
 */
export function success<T>(data: T): SuccessState<T> {
  return {
    state: 'success',
    data,
  };
}

/**
 * Network call is completed with error response
 */
export interface ErrorState<T> extends NetworkState<T> {
  state: 'error';
  error: any;
  statusCode?: number;
  request?: any;
}

/**
 * Checks whether the state is error state
 * @param state
 */
export function isError<T>(state: NetworkState<T>): state is ErrorState<T> {
  return state.state === 'error';
}

/**
 * Constructs an ErrorState object representing an error.
 *
 * @param {any} error - The error object or message.
 * @param {string} [statusCode] - An optional status code associated with the error.
 * @return {ErrorState<T>} An object representing the error state.
 */
export function error<T>(
  error: any,
  statusCode?: number,
  request?: any
): ErrorState<T> {
  return {
    state: 'error',
    error,
    statusCode,
    request,
  };
}

/**
 * Represents an error state with additional contextual information.
 *
 * @typedef {Object} ErrorWithContext
 * @template T
 * @extends ErrorState<T>
 *
 * @property {string} source - The origin of the error.
 * @property {string} operation - The operation being performed when the error occurred.
 * @property {string} key - A unique key identifying the specific error instance.
 */
export interface ErrorWithContext<T = unknown> extends ErrorState<T> {
  source: string;
  operation: string;
  key: string;
}

/**
 * Represents an action in the network context.
 *
 * @template T - The type of data associated with the network action
 *
 * @property {NetworkState<any>} state - The current state of the network action
 * @property {string} key - The unique identifier for the network action
 */
export interface NetworkAction<T> {
  key: string;
  source: string;
  operation: string;
  state: NetworkState<T>;
  handled?: boolean;
}

type HookWithKey = {
  key: string;
}

export type DeleteHook<P> = ((key?: string) => [NetworkState<never>, (params: P) => void, () => void]) & HookWithKey;
export type DeleteHookOp<P> = ((key?: string) => [NetworkState<never>, (params?: P) => void, () => void]) & HookWithKey;
export type GetHook<P, T> = ((key?: string) => [NetworkState<T>, (params: P) => void, () => void]) & HookWithKey;
export type GetHookOp<P, T> = ((key?: string) => [NetworkState<T>, (params?: P) => void, () => void]) & HookWithKey;
export type PostHook<P, T, B> = ((key?: string) => [NetworkState<T>, (body: B, params: P) => void, () => void]) & HookWithKey;
export type PostHookOp<P, T, B> = ((key?: string) => [NetworkState<T>, (body: B, params?: P) => void, () => void]) & HookWithKey;
export type PutHook<P, T, B> = ((key?: string) => [NetworkState<T>, (body: B, params: P) => void, () => void]) & HookWithKey;
export type PutHookOp<P, T, B> = ((key?: string) => [NetworkState<T>, (body: B, params?: P) => void, () => void]) & HookWithKey;

export type IntrigHook<P = undefined, B = undefined, T = any> = DeleteHook<P> | GetHook<P, T> | PostHook<P, T, B> | PutHook<P, T, B> | PostHookOp<P, T, B> | PutHookOp<P, T, B> | GetHookOp<P, T> | DeleteHookOp<P>;

/**
 * Represents the dispatch state of a process.
 *
 * @template T The type of the state information.
 * @interface
 *
 * @property {string} state The current state of the dispatch process.
 */
export interface DispatchState<T> {
  state: string
}

/**
 * Represents a successful dispatch state.
 *
 * @template T - Type of the data associated with the dispatch.
 *
 * @extends DispatchState<T>
 *
 * @property {string} state - The state of the dispatch, always 'success'.
 */
export interface SuccessfulDispatch<T> extends DispatchState<T>{
  state: 'success'
}

/**
 * Indicates a successful dispatch state.
 *
 * @return {DispatchState<T>} An object representing a successful state.
 */
export function successfulDispatch<T>(): DispatchState<T> {
  return {
    state: 'success'
  }
}

/**
 * Determines if the provided dispatch state represents a successful dispatch.
 *
 * @param {DispatchState<T>} value - The dispatch state to check.
 * @return {value is SuccessfulDispatch<T>} - True if the dispatch state indicates success, false otherwise.
 */
export function isSuccessfulDispatch<T>(value: DispatchState<T>): value is SuccessfulDispatch<T> {
  return value.state === 'success'
}

/**
 * ValidationError interface represents a specific type of dispatch state
 * where a validation error has occurred.
 *
 * @typeparam T - The type of the data associated with this dispatch state.
 */
export interface ValidationError<T> extends DispatchState<T>{
  state: 'validation-error'
  error: any
}

/**
 * Generates a ValidationError object.
 *
 * @param error The error details that caused the validation to fail.
 * @return The ValidationError object containing the error state and details.
 */
export function validationError<T>(error: any): ValidationError<T> {
  return {
    state: 'validation-error',
    error
  }
}

/**
 * Determines if a provided DispatchState object is a ValidationError.
 *
 * @param {DispatchState<T>} value - The DispatchState object to evaluate.
 * @return {boolean} - Returns true if the provided DispatchState object is a ValidationError, otherwise returns false.
 */
export function isValidationError<T>(value: DispatchState<T>): value is ValidationError<T> {
  return value.state === 'validation-error'
}
