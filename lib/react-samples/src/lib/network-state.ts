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
export interface NetworkState<T> {
  state: "init" | "pending" | "success" | "error";
}


/**
 * Network call is not yet started
 */
export interface InitState<T> extends NetworkState<T> {
  state: "init";
}

/**
 * Checks whether the state is init state
 * @param state
 */
export function isInit<T>(state: NetworkState<T>): state is InitState<T> {
  return state.state === "init";
}

/**
 * Initializes a new state.
 *
 * @template T The type of the state.
 * @return {InitState<T>} An object representing the initial state.
 */
export function init<T>(): InitState<T> {
  return {
    state: 'init'
  }
}

/**
 * Network call is not yet completed
 */
export interface PendingState<T> extends NetworkState<T> {
  state: "pending";
}

/**
 * Checks whether the state is pending state
 * @param state
 */
export function isPending<T>(state: NetworkState<T>): state is PendingState<T> {
  return state.state === "pending";
}

/**
 * Generates a PendingState object with a state of "pending".
 *
 * @return {PendingState<T>} An object representing the pending state.
 */
export function pending<T>(): PendingState<T> {
  return {
    state: "pending"
  }
}

/**
 * Network call is completed with success state
 */
export interface SuccessState<T> extends NetworkState<T> {
  state: "success";
  data: T;
}

/**
 * Checks whether the state is success response
 * @param state
 */
export function isSuccess<T>(state: NetworkState<T>): state is SuccessState<T> {
  return state.state === "success";
}

/**
 * Creates a success state object with the provided data.
 *
 * @param {T} data - The data to be included in the success state.
 * @return {SuccessState<T>} An object representing a success state containing the provided data.
 */
export function success<T>(data: T): SuccessState<T> {
  return {
    state: "success",
    data
  }
}

/**
 * Network call is completed with error response
 */
export interface ErrorState<T> extends NetworkState<T> {
  state: "error";
  error: any;
  statusCode?: string
}

/**
 * Checks whether the state is error state
 * @param state
 */
export function isError<T>(state: NetworkState<T>): state is ErrorState<T> {
  return state.state === "error";
}

/**
 * Constructs an ErrorState object representing an error.
 *
 * @param {any} error - The error object or message.
 * @param {string} [statusCode] - An optional status code associated with the error.
 * @return {ErrorState<T>} An object representing the error state.
 */
export function error<T>(error: any, statusCode?: string): ErrorState<T> {
  return {
    state: "error",
    error,
    statusCode
  }
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
  state: NetworkState<any>
  key: string
}
