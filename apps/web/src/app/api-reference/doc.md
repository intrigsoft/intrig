---
title: Intrig API Reference Overview
---

## Introduction
Intrig provides a streamlined and efficient way to manage network states, caching, and data handling in React applications. Designed to simplify API interactions and state transitions, Intrig helps developers build robust and scalable applications with minimal effort. This reference guide provides an overview of the core components, functions, and hooks available in the Intrig library.

## Components
#### `<IntrigProvider>`
IntrigProvider is the primary context provider that manages network states and ensures consistent state handling across the application. It must wrap components that need access to Intrig’s state management features.

#### `<IntrigProviderStub>`
A lightweight version of IntrigProvider, useful for testing or scenarios where the full provider is not required.

## Functions
Intrig includes several utility functions for checking and handling different network states:

#### **State Checkers**
- `isInit(state)`: Checks if a network state is in its initial state.
- `isPending(state)`: Determines if a request is in progress.
- `isSuccess(state)`: Returns `true` if the request completed successfully.
- `isError(state)`: Indicates whether an error has occurred.

#### **Helpers**
- `init()`: Initializes a network state.
- `pending()`: Sets the state to pending.
- `success(data)`: Marks the state as successful and stores the provided data.
- `error(error)`: Sets an error state with the provided error message.

#### **Validation and Dispatch Handling**
- `isValidationError(state)`: Checks if the state represents a validation error.
- `isSuccessfulDispatch(state)`: Determines if a dispatched action was successful.
- `validationError(errors)`: Creates a validation error state.
- `successfulDispatch(data)`: Marks a dispatched action as successfully processed.

## Hooks
Intrig provides custom React hooks to manage network states efficiently:

- **`useAsNetworkState(hook)`**: Transforms an API hook into an Intrig-compatible network state.
- **`useAsPromise(hook)`**: Converts an Intrig state into a promise for easy async handling.
- **`useResolvedValue(state)`**: Extracts the resolved value from an Intrig network state.
- **`useCachedValue(key, fetcher)`**: Retrieves and caches values using a unique key and fetch function.
