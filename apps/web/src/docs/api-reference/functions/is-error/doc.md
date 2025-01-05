# isError Function - API Reference

## Overview

The `isError` function is a utility method that checks if a given `NetworkState` instance is in the `error` state. It is primarily used to determine whether a network request has encountered an error and contains error details.

## Syntax

```typescript
function isError<T, E>(state: NetworkState<T, E>): boolean;
```

## Parameters

- **`state`** (`NetworkState<T, E>`) - The network state instance to check.

## Returns

- **`boolean`** - Returns `true` if the given state is `'error'`, otherwise `false`.

## Usage

### Example 1: Checking if a NetworkState is in the Error State

```tsx
const [state] = useGeneratedHook();

if (isError(state)) {
    return <>
      Error: {JSON.stringify(state.error)}
    </>
}
```

### Example 2: Using isError in JSX

```tsx
const [state] = useGeneratedHook();

return <>
  {isError(state) && <>Error: {JSON.stringify(state.error)}</>}
</>
```

## Related Functions

- `isInit(state: NetworkState<T, E>): boolean` - Checks if the state is `'init'`.
- `isPending(state: NetworkState<T, E>): boolean` - Checks if the state is `'pending'`.
- `isSuccess(state: NetworkState<T, E>): boolean` - Checks if the state is `'success'`.

## Notes

- The `error` state contains error details, which can be accessed via `state.error`.
- This function is useful for handling network failures and displaying appropriate error messages.

## Changelog

- **v1.0.0** - Initial implementation of `isError`.

