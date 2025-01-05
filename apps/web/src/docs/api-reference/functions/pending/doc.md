# pending Function - API Reference

## Overview

The `pending` function is used to set the network state to `pending`, indicating that a network request is currently in progress. It is particularly useful in Storybook to provide default values for stubbed hooks, ensuring a predictable loading state for testing and UI development.

## Syntax

```typescript
function pending<T, E>(progress?: number): NetworkState<T, E>;
```

## Parameters

- **`progress`** (`number`, optional) - Represents the progress of the network request as a percentage (0-100). Defaults to `undefined`.

## Returns

- **`NetworkState<T, E>`** - Returns a network state object with the state set to `'pending'` and optional progress.

## Usage

### Example 1: Using pending in Storybook

```typescript
export const Loading: Story = {
  args: {
    stubs: (stub) => {
      stub(useGetAllSources, async (params, body, dispatch) => {
        dispatch(pending(50));
      });
    },
  },
};
```

## Related Functions

- `init(): NetworkState<T, E>` - Sets the network state to `'init'`.
- `isPending(state: NetworkState<T, E>): boolean` - Checks if the state is `'pending'`.
- `isSuccess(state: NetworkState<T, E>): boolean` - Checks if the state is `'success'`.
- `isError(state: NetworkState<T, E>): boolean` - Checks if the state is `'error'`.

## Notes

- The `pending` function is useful for handling loading states in UI components.
- It can include a progress value to indicate how far the network request has progressed.
- Helps manage network state transitions predictably, especially in Storybook setups.

## Changelog

- **v1.0.0** - Initial implementation of `pending`.

