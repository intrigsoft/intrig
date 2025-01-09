---
title: "API Reference: useAsNetworkState"
---

## Description
`useAsNetworkState` is a custom hook that manages and returns the network state of a promise-based function, providing a way to execute the function and clear its state.

## Signature
```typescript
function useAsNetworkState<T, F extends ((...args: any) => Promise<T>)>(
  fn: F,
  key?: string
): [NetworkState<T>, (...params: Parameters<F>) => void, () => void];
```

## Parameters
- `fn`: **F** – A promise-based function whose network state is to be managed.
- `key` (optional): **string** – An optional identifier for the network state. Defaults to `'default'`.

## Returns
A tuple containing:
1. **NetworkState<T>** – The current network state.
2. **Execute function** – A function that triggers the promise-based function and updates the state.
3. **Clear function** – A function to reset the state to its initial value.

## Usage Example
```tsx
const [userState, fetchUser, clearUser] = useAsNetworkState(fetchUserById);

function loadUser(userId: string) {
  fetchUser(userId);
}
```

## Behavior
- When `fetchUser` is called, it triggers the promise-based function and sets the state to `pending`.
- If the function resolves successfully, the state updates to `success` with the returned data.
- If the function fails, the state updates to `error` with the encountered error.
- The `clearUser` function resets the state to its initial value.

## Use Cases
- **Network Requests**: Useful for managing asynchronous API calls while keeping track of loading, success, and error states.
- **Background Tasks**: Can be used to track the status of background operations like file uploads or data processing.
- **Stateful Actions**: Helps in managing state transitions for user interactions that depend on async operations.

## Notes
- Ensure the provided function is truly asynchronous and returns a promise.
- Helps bridge the gap between imperative promise-based functions and React’s declarative state management.

