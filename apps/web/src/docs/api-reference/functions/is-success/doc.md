# isSuccess Function - API Reference

## Overview
The `isSuccess` function is a utility method that checks if a given `NetworkState` instance is in the `success` state. It is primarily used to determine whether a network request has been successfully completed and contains a valid response.

## Syntax
```typescript
function isSuccess<T, E>(state: NetworkState<T, E>): boolean;
```

## Parameters
- **`state`** (`NetworkState<T, E>`) - The network state instance to check.

## Returns
- **`boolean`** - Returns `true` if the given state is `'success'`, otherwise `false`.

## Usage
### Example 1: Checking if a NetworkState is in the Success State
```tsx
const [state] = useGeneratedHook();

if (isSuccess(state)) {
    return <>
      Received {JSON.stringify(state.data)}
    </>
}
```

### Example 2: Using isSuccess in jsx
```tsx
const [state] = useGeneratedHook();

return <>
  {isSuccess(state) && <>Received {JSON.stringify(state.data)}</>}
</>
```

## Related Functions
- `isInit(state: NetworkState<T, E>): boolean` - Checks if the state is `'init'`.
- `isPending(state: NetworkState<T, E>): boolean` - Checks if the state is `'pending'`.
- `isError(state: NetworkState<T, E>): boolean` - Checks if the state is `'error'`.

## Notes
- The `success` state contains the response data, which can be accessed via `state.data`.
- This function is useful for handling completed network requests and displaying results.

## Changelog
- **v1.0.0** - Initial implementation of `isSuccess`.

