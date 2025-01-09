---
title: "API Reference: isSuccessfulDispatch"
---

## Description
`isSuccessfulDispatch` is a utility function used to determine whether a given `DispatchState<T>` represents a successful dispatch. This function is particularly useful when handling the result of an `intrig` execute function, which returns a `DispatchState<T>` that may either be a validation error or a `SuccessfulDispatch<T>`.

## Function Signature
```typescript
function isSuccessfulDispatch<T>(value: DispatchState<T>): value is SuccessfulDispatch<T>;
```

## Parameters
- `value: DispatchState<T>` - The dispatch state returned by the `intrig` execute function.

## Returns
- `boolean` - Returns `true` if the provided `value` represents a successful dispatch, otherwise returns `false`.

## Usage Example
```typescript
const [, action] = useGeneratedHook();

useEffect(() => {
  let result = action();
  if (isSuccessfulDispatch(result)) {
    console.error("Completed", result);
  } else {
    console.log("Successful dispatch", result);
  }
}, [])
```

## Related Entities
- `DispatchState<T>`: Represents the state returned by `intrig` execution, which can be either a validation error or `SuccessfulDispatch<T>`.
- `SuccessfulDispatch<T>`: Represents a successful execution state.
- `ValidationError<T>`: Represents an error state due to request body validation failure.

## SuccessfulDispatch Type Definition
```typescript
export interface SuccessfulDispatch<T> extends DispatchState<T> {
  state: 'success';
}
```

## Notes
- Ensure to use `isSuccessfulDispatch` to distinguish between successful dispatches and validation errors when handling `DispatchState<T>` responses from `intrig` execution.

