---
title: "API Reference: useCachedValue"
---

## Description
`useCachedValue` is a custom hook that caches the value from a successful state provided by an `IntrigHook`. The cached value is updated only when the state transitions to a successful state.

## Signature
```typescript
function useCachedValue<P, B, T>(
  hook: IntrigHook<P, B, T>,
  key?: string
): T | undefined;
```

## Parameters
- `hook`: **IntrigHook<P, B, T>** – The hook that provides the state to observe and cache data from.
- `key` (optional): **string** – An optional key to be passed to the hook for specific state resolution. Defaults to `'default'`.

## Returns
- **T | undefined** – The cached value from the hook's state or `undefined` if the state is not successful.

## Usage Example
```tsx
const cachedUser = useCachedValue(useGetUser);

if (cachedUser) {
  console.log("Cached User:", cachedUser);
} else {
  console.log("User data is not available yet.");
}
```

## Behavior
- The hook subscribes to the provided `IntrigHook` and listens for state updates.
- If the state is in a `success` state, the cached value is updated.
- If the state is not successful, the cached value remains unchanged.

## Use Cases
- **Preserving Data Between Renders**: Ensures that once valid data is fetched, it remains available even if subsequent requests fail.
- **Minimizing Flickers in UI**: Prevents resetting to `undefined` when the state is in an error or pending state.
- **Optimizing Data Usage**: Reduces unnecessary recomputations by caching the last successful value.

## Difference Between `useResolvedValue` and `useCachedValue`
- `useResolvedValue`: Updates the value only when the state transitions to `success`. If the state changes to `pending` or `error`, the value resets to `undefined`.
- `useCachedValue`: Retains the last successful value even when the state transitions to `pending` or `error`, ensuring continuity of data.

## Notes
- The cached value does not clear unless a new successful state is received.
- Helps in maintaining stability in UI by avoiding unnecessary re-renders.

