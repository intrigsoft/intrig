# **NetworkState Documentation**

The `NetworkState` interface and its related utilities represent the lifecycle of an asynchronous operation, such as a network call, through various states: `init`, `pending`, `success`, and `error`. This structure provides a standardized way to track and manage the state of such operations in a type-safe and predictable manner.

---

## **Design Considerations**

### Prefer Explicit States Over Promises
Promises in React can be cumbersome and prone to creating complex code structures. Explicit states simplify the entire flow and let developers focus on handling each state individually without having to manage timeline-related complexities.

### Prefer Type Guards
Type guards are a valuable feature for recovering hidden data from objects. In the context of Intrig, type guards provide a clean and type-safe way to extract state-related data within the guarded code blocks, ensuring more reliable and maintainable code.

---

## **States**

### 1. **`InitState`**

#### Description
The operation has not started yet. This is the initial state before any action is performed.

#### Properties Extracted by `isInit`:
- `state: 'init'`

#### Type Guard:
```typescript
function isInit<T, E = unknown>(state: NetworkState<T, E>): state is InitState<T, E>
```
This function checks if the current state is `init`.

#### Factory Function:
```typescript
function init<T, E = unknown>(): InitState<T, E>
```
Creates and returns a new `InitState`.

---

### 2. **`PendingState`**

#### Description
The operation is in progress. This state can include optional progress information, such as upload or download details.

#### Properties Extracted by `isPending`:
- `state: 'pending'`
- `progress?`:
  - `type: 'upload' | 'download'`
  - `loaded: number`
  - `total?: number`

#### Type Guard:
```typescript
function isPending<T, E = unknown>(state: NetworkState<T, E>): state is PendingState<T, E>
```
This function checks if the current state is `pending`.

#### Factory Function:
```typescript
function pending<T, E = unknown>(progress?: Progress): PendingState<T, E>
```
Creates and returns a new `PendingState` with optional progress details.

---

### 3. **`SuccessState`**

#### Description
The operation completed successfully. This state contains the result of the operation.

#### Properties Extracted by `isSuccess`:
- `state: 'success'`
- `data: T` – The result of the successful operation.

#### Type Guard:
```typescript
function isSuccess<T, E = unknown>(state: NetworkState<T, E>): state is SuccessState<T, E>
```
This function checks if the current state is `success` and allows access to the `data` property.

#### Factory Function:
```typescript
function success<T, E = unknown>(data: T): SuccessState<T, E>
```
Creates and returns a new `SuccessState` with the given data.

---

### 4. **`ErrorState`**

#### Description
The operation encountered an error. This state contains details about the error, such as the error object and optional status code.

#### Properties Extracted by `isError`:
- `state: 'error'`
- `error: E` – Details about the error.
- `statusCode?`: Optional HTTP status code.
- `request?`: Optional information about the request.

#### Type Guard:
```typescript
function isError<T, E = unknown>(state: NetworkState<T, E>): state is ErrorState<T, E>
```
This function checks if the current state is `error` and allows access to error-related properties.

#### Factory Function:
```typescript
function error<T, E = unknown>(error: E, statusCode?: number, request?: any): ErrorState<T, E>
```
Creates and returns a new `ErrorState` with the provided error details.

---

## **State Management Utilities**

### `NetworkState<T, E>`
The base type for all states.

- **Properties:**
  - `state`: A string representing the current state, one of:
    - `'init'`
    - `'pending'`
    - `'success'`
    - `'error'`

### State Transition Functions:
1. **Resetting:**  
   Use `init()` to reset the state to `init`.

2. **Execution:**  
   Transition to `pending` using `pending()`.

3. **Completion:**
  - For successful completion, use `success(data)`.
  - For errors, use `error(error, statusCode, request)`.

4. **Validation:**  
   Use the `is<State>` functions to check the current state (`isInit`, `isPending`, `isSuccess`, `isError`).

---

## **Examples**

### Checking States
```typescript
if (isInit(state)) {
  console.log('The operation has not started yet.');
} else if (isPending(state)) {
  console.log('Operation is in progress:', state.progress);
} else if (isSuccess(state)) {
  console.log('Operation successful:', state.data);
} else if (isError(state)) {
  console.log('Operation failed with error:', state.error);
}
```

