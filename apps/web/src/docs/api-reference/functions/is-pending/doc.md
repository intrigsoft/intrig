# isPending Function - API Reference

## Overview
The `isPending` function is a utility method that checks if a given `NetworkState` instance is in the `pending` state. It is primarily used to determine whether a network request is currently in progress and may include progress information.

## Syntax
```typescript
function isPending<T, E>(state: NetworkState<T, E>): boolean;
```

## Parameters
- **`state`** (`NetworkState<T, E>`) - The network state instance to check.

## Returns
- **`boolean`** - Returns `true` if the given state is `'pending'`, otherwise `false`.

## Usage
### Example 1: Checking if a NetworkState is in the Pending State
```tsx
const [state] = useGeneratedHook();

if (isPending(state)) {
    return <Loader/>
}
```

### Example 2: Using isPending within jsx
```tsx
const [state] = useGeneratedHook();

return <>
  {isPending(state) && <Loader/>}
</>
```

## Related Functions
- `isInit(state: NetworkState<T, E>): boolean` - Checks if the state is `'init'`.
- `isSuccess(state: NetworkState<T, E>): boolean` - Checks if the state is `'success'`.
- `isError(state: NetworkState<T, E>): boolean` - Checks if the state is `'error'`.

## Notes
- The `pending` state may include a `progress` field indicating the completion percentage.
- This function is useful for tracking the progress of network requests.
- Helps in controlling UI behaviors like showing loading indicators with progress information.

## Changelog
- **v1.0.0** - Initial implementation of `isPending`.

