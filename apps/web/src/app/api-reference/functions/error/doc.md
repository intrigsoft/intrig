---
title: error Function - API Reference 
---

## Overview

The `error` function is used to set the network state to `error`, indicating that a network request has encountered an issue and contains error details. It is particularly useful in Storybook to provide default values for stubbed hooks, ensuring a predictable error state for testing and UI development.

## Syntax

```typescript
function error<T, E>(error: E): NetworkState<T, E>;
```

## Parameters

- **`error`** (`E`) - The error details associated with the failed network request.

## Returns

- **`NetworkState<T, E>`** - Returns a network state object with the state set to `'error'` and includes the error details.

## Usage

### Example 1: Using error in Storybook

```typescript
export const FailedRequest: Story = {
  args: {
    stubs: (stub) => {
      stub(useGetAllSources, async (params, body, dispatch) => {
        dispatch(error("Network request failed"));
      });
    },
  },
};
```

## Related Functions

- `init(): NetworkState<T, E>` - Sets the network state to `'init'`.
- `pending(progress?: number): NetworkState<T, E>` - Sets the network state to `'pending'`.
- `success(data: T): NetworkState<T, E>` - Sets the network state to `'success'`.
- `isError(state: NetworkState<T, E>): boolean` - Checks if the state is `'error'`.

## Notes

- The `error` function is useful for handling failed network requests and displaying appropriate error messages.
- Helps manage network state transitions predictably, especially in Storybook setups.
- The returned object includes the `error` field to hold error details.

## Changelog

- **v1.0.0** - Initial implementation of `error`.

