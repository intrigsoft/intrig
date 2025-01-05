# API Reference: useResolvedValue

## Description
`useResolvedValue` is a custom hook that resolves the value from the provided `IntrigHook`'s state and updates it whenever the state changes.

## Signature
```tsx
function useResolvedValue<P, B, T>(
  hook: IntrigHook<P, B, T>,
  key?: string
): T | undefined;
```

## Parameters
- `hook`: **IntrigHook<P, B, T>** – The hook that provides the state to observe and resolve data from.
- `key` (optional): **string** – An optional key to be passed to the hook for specific state resolution. Defaults to `'default'`.

## Returns
- **T | undefined** – The resolved value from the hook's state if successful, otherwise `undefined`.

## Usage Example
```tsx
const user = useResolvedValue(useGetUser);

if (user) {
  console.log("Resolved User:", user);
} else {
  console.log("User data is not available yet.");
}
```

## Behavior
- The hook subscribes to the provided `IntrigHook` and listens for state updates.
- If the state is in a `success` state, the resolved value is updated.
- If the state is not successful, the returned value is `undefined`.

## Use Cases
- **Simplifying Component Logic**: Avoids manually checking the hook state in every render.
- **State Management**: Helps derive a stable value from a `NetworkState` without extra computations.
- **Dependency for Derived Computations**: Useful for memoized computations that depend on successful data retrieval.

## Notes
- The hook only updates the value when the state transitions to `success`.
- Ensures the resolved value does not flicker between `undefined` and a valid state unnecessarily.

