---
title: isInit Function - API Reference
---

## Overview
The `isInit` function is a utility method that checks if a given `NetworkState` instance is in the `init` state. It is primarily used to determine whether a network request has not yet started.

## Syntax
```typescript
function isInit<T, E>(state: NetworkState<T, E>): boolean;
```

## Parameters
- **`state`** (`NetworkState<T, E>`) - The network state instance to check.

## Returns
- **`boolean`** - Returns `true` if the given state is `'init'`, otherwise `false`.

## Usage
### Example 1: Checking if a NetworkState is in the Init State
```tsx
const [state] = useGeneratedHook() 

if (isInit(state)) {
  return <>"The network request has not started yet."</>
}
```

### Example 2: Using isInit within jsx

```tsx
import { isInit } from './network-state';

const [state] = useGeneratedHook()

return <>
  {isInit(state) && <>"The network request has not started yet."</> }
</>
```

## Related Functions
- `isPending(state: NetworkState<T, E>): boolean` - Checks if the state is `'pending'`.
- `isSuccess(state: NetworkState<T, E>): boolean` - Checks if the state is `'success'`.
- `isError(state: NetworkState<T, E>): boolean` - Checks if the state is `'error'`.

## Notes
- This function is useful for state management in network calls.
- Helps in controlling UI behaviors like showing initial loaders before a request starts.

## Changelog
- **v1.0.0** - Initial implementation of `isInit`.

