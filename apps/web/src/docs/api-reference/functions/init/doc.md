# init Function - API Reference

## Overview

The `init` function is used to set the initial state of a network request. It is particularly useful in Storybook to provide default values for stubbed hooks, ensuring a predictable initial state for testing and UI development.

## Syntax

```typescript
function init<T, E>(): NetworkState<T, E>;
```

## Returns

- **`NetworkState<T, E>`** - Returns an initial network state object with the state set to `'init'`.

## Usage

### Example 1: Using init in Storybook

```typescript
export const Default: Story = {
  args: {
    stubs: (stub) => {
      stub(useGetAllSources, async (params, body, dispatch) => {
        dispatch(init());
      });
    },
  },
};
```

## Related Functions

- `isInit(state: NetworkState<T, E>): boolean` - Checks if the state is `'init'`.
- `isPending(state: NetworkState<T, E>): boolean` - Checks if the state is `'pending'`.
- `isSuccess(state: NetworkState<T, E>): boolean` - Checks if the state is `'success'`.
- `isError(state: NetworkState<T, E>): boolean` - Checks if the state is `'error'`.

## Notes

- The `init` function ensures that the network request is in its initial state before execution.
- It is particularly useful for Storybook to provide default stub values for API hooks.
- Helps in managing network state transitions in a predictable manner.

## Changelog

- **v1.0.0** - Initial implementation of `init`.

