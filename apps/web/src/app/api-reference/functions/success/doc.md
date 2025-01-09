---
title: success Function - API Reference
---

## Overview

The `success` function is used to set the network state to `success`, indicating that a network request has been successfully completed and contains a valid response. It is particularly useful in Storybook to provide default values for stubbed hooks, ensuring a predictable success state for testing and UI development.

## Syntax

```typescript
function success<T, E>(data: T): NetworkState<T, E>;
```

## Parameters

- **`data`** (`T`) - The response data associated with the successful network request.

## Returns

- **`NetworkState<T, E>`** - Returns a network state object with the state set to `'success'` and includes the response data.

## Usage

### Example 1: Using success in Storybook

```typescript
export const SuccessfulFetch: Story = {
  args: {
    stubs: (stub) => {
      stub(useGetAllSources, async (params, body, dispatch) => {
        dispatch(success(["Item1", "Item2"]));
      });
    },
  },
};
```

## Related Functions

- `init(): NetworkState<T, E>` - Sets the network state to `'init'`.
- `pending(progress?: number): NetworkState<T, E>` - Sets the network state to `'pending'`.
- `isSuccess(state: NetworkState<T, E>): boolean` - Checks if the state is `'success'`.
- `isError(state: NetworkState<T, E>): boolean` - Checks if the state is `'error'`.

## Notes

- The `success` function is useful for handling successful network requests and populating UI components.
- Helps manage network state transitions predictably, especially in Storybook setups.
- The returned object includes the `data` field to hold the successful response.

## Changelog

- **v1.0.0** - Initial implementation of `success`.

