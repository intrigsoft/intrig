---
title: "API Reference: isValidationError"
---

## Description

`isValidationError` is a utility function used to determine whether a given `DispatchState<T>` represents a validation error. This function is particularly useful when handling the result of an `intrig` execute function, which returns a `DispatchState<T>` that may either be a validation error (indicating request body validation failure) or a `SuccessfulDispatch<T>`.

## Function Signature

```tsx
function isValidationError<T>(value: DispatchState<T>): value is ValidationError<T>;
```

## Parameters

- `value: DispatchState<T>` - The dispatch state returned by the `intrig` execute function.

## Returns

- `boolean` - Returns `true` if the provided `value` represents a validation error, otherwise returns `false`.

## Usage Example

```typescript
const [, action] = useGeneratedHook();

useEffect(() => {
  let result = action();
  if (isValidationError(result)) {
    console.error("Validation error occurred", result.error);
  } else {
    console.log("Successful dispatch", result);
  }
}, [])

```

#### Related Entities

- `DispatchState<T>`: Represents the state returned by `intrig` execution, which can be either a validation error or `SuccessfulDispatch<T>`.
- `SuccessfulDispatch<T>`: Represents a successful execution state.
- `ValidationError<T>`: Represents an error state due to request body validation failure.

## ValidationError Type Definition

```typescript
export interface ValidationError<T> extends DispatchState<T> {
  state: 'validation-error';
  error: any;
}
```

## Notes

- Ensure to use `isValidationError` to distinguish between validation errors and successful dispatches when handling `DispatchState<T>` responses from `intrig` execution.

