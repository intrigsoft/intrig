---
title: API Reference - useAsPromise
---

## Description
`useAsPromise` is a custom hook that converts an `IntrigHook` into a promise-based function, enabling seamless integration of asynchronous operations within React components.

## Signature
```typescript
function useAsPromise<P, B, T>(
  hook: IntrigHook<P, B, T>, 
  key?: string
): [(...params: Parameters<ReturnType<IntrigHook<P, B, T>>[1]>) => Promise<T>, () => void];
```

## Parameters
- `hook`: **IntrigHook<P, B, T>** – The hook function to be converted.
- `key` (optional): **string** – A unique key to identify the hook instance. Defaults to `'default'`.

## Returns
A tuple containing:
1. **Promise-based function** – A function that invokes the hook and returns a promise resolving with the fetched data or rejecting with an error.
2. **Clear function** – A function to reset the state of the hook.

## Usage Example
```tsx
const [fetchUser, clearUser] = useAsPromise(useGetUser);

async function loadUser(userId: string) {
  try {
    const user = await fetchUser({ id: userId });
    console.log('User Data:', user);
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}
```

## Behavior
- When `fetchUser` is called, it triggers the underlying hook.
- If the state transitions to `success`, the promise resolves with the fetched data.
- If the state transitions to `error`, the promise rejects with the encountered error.
- The `clearUser` function resets the state to its initial value.

## Use Cases
- **Async Validations**: Some validation libraries support asynchronous validations that require a promise, making `useAsPromise` useful for integrating network-based validation logic.
- **Form Submission Handling**: Can be used in form submissions where the validation step involves fetching data before proceeding.
- **Async Workflows**: When working with hooks that return a `NetworkState`, `useAsPromise` allows them to be converted into a promise-based function, making them easier to integrate into existing async workflows.

## Notes
- Ensure the provided `IntrigHook` follows the expected structure and handles network states properly.
- Can be useful when integrating with functions that expect promises instead of hooks.

