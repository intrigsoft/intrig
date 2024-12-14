## Intrig Compatibility Utilities Documentation

The following documentation covers two key utilities provided for compatibility in the `intrig` library. These utilities allow you to convert network state hooks into promise-based functions and manage the network state of promise-based functions seamlessly.

### `useAsPromise`

**Description:** Converts a given hook into a promise-based function, allowing you to use the hook's state in an asynchronous flow.

**Import Path:**
```typescript
import { useAsPromise } from '@intrig/next';
```

**Parameters:**
- `hook: IntrigHook<P, B, T>` - The hook function that is to be converted to a promise.
- `key: string` (optional) - A key to uniquely identify the hook instance. Defaults to `'default'`.

**Returns:**
- A tuple containing:
  1. `(...params: Parameters<ReturnType<IntrigHook<P, B, T>>[1]>) => Promise<T>` - A function that invokes the hook as a promise.
  2. `() => void` - A function to clear the state of the hook.

**Usage Example:**
```jsx
import React from 'react';
import { useAsPromise } from '@intrig/next';

const MyComponent = ({ someHook }) => {
  const [fetchDataAsPromise, clearState] = useAsPromise(someHook);

  const handleClick = async () => {
    try {
      const response = await fetchDataAsPromise({ param: 'value' });
      console.log('Response:', response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Fetch Data</button>
      <button onClick={clearState}>Clear State</button>
    </div>
  );
};

export default MyComponent;
```

**Explanation:**
The `useAsPromise` utility simplifies the use of hooks within promise-based workflows, ideal for integrating `intrig` hooks with asynchronous logic.

**Use Cases:**
- `useAsPromise` is particularly useful when you need to integrate the backend result as a promise with some third-party libraries, such as validation libraries, that require a promise-based approach.

### `useAsNetworkState`

**Description:** A custom hook that manages and returns the network state of a promise-based function. This utility provides a way to execute the function and handle network states like pending, success, or error.

**Import Path:**
```typescript
import { useAsNetworkState, isInit, isPending, isSuccess, isError } from '@intrig/next';
```

**Parameters:**
- `fn: F` - A promise-based function whose network state is to be managed. The function must return a promise.
- `key: string` (optional) - A unique identifier for the network state. Defaults to `'default'`.

**Returns:**
- A tuple containing:
  1. `NetworkState<T>` - The current network state.
  2. `(...params: Parameters<F>) => void` - A function to execute the promise-based function.
  3. `() => void` - A function to clear the state.

**Usage Example:**
```jsx
import React from 'react';
import { useAsNetworkState, isInit, isPending, isSuccess, isError } from '@intrig/next';

const MyComponent = ({ fetchDataFunction }) => {
  const [state, execute, clear] = useAsNetworkState(fetchDataFunction);

  const handleFetch = () => {
    execute({ param: 'value' });
  };

  return (
    <div>
      {isInit(state) && (
        <button onClick={handleFetch}>Start Request</button>
      )}

      {isPending(state) && <p>Loading...</p>}

      {isSuccess(state) && (
        <div>
          <p>Data: {JSON.stringify(state.data)}</p>
          <button onClick={clear}>Clear State</button>
        </div>
      )}

      {isError(state) && (
        <div>
          <p>Error: {state.error.message}</p>
          <button onClick={handleFetch}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default MyComponent;
```

**Explanation:**
`useAsNetworkState` offers a complete solution to manage the lifecycle of promise-based functions, ensuring that you can handle different states like pending, success, and error intuitively. By using utility functions (`isInit`, `isPending`, `isSuccess`, `isError`), you can safely interact with `NetworkState` and make your code more readable and type-safe. It integrates well with the `intrig` context, making it easier to manage network operations in a React environment.

**Use Cases:**
- `useAsNetworkState` is ideal when you have promise-based APIs such as local storage access, SQLite access, or any other asynchronous data access that needs to be tracked and managed effectively.

**Improved Example:**
Consider using `useAsNetworkState` to manage a local storage access operation that is asynchronous. For instance, if you need to fetch data from `localStorage` or `SQLite` and want to manage the state of this asynchronous operation (e.g., loading, success, error), `useAsNetworkState` provides a seamless solution.

```jsx
import React from 'react';
import { useAsNetworkState, isInit, isPending, isSuccess, isError } from '@intrig/next';

const LocalStorageComponent = () => {
  const [state, execute, clear] = useAsNetworkState(async (key) => {
    const value = await localStorage.getItem(key);
    if (!value) {
      throw new Error('Item not found');
    }
    return value;
  });

  const handleFetch = () => {
    execute('myKey');
  };

  return (
    <div>
      {isInit(state) && (
        <button onClick={handleFetch}>Fetch from Local Storage</button>
      )}

      {isPending(state) && <p>Loading data from localStorage...</p>}

      {isSuccess(state) && (
        <div>
          <p>Data: {state.data}</p>
          <button onClick={clear}>Clear State</button>
        </div>
      )}

      {isError(state) && (
        <div>
          <p>Error: {state.error.message}</p>
          <button onClick={handleFetch}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default LocalStorageComponent;
```

---

These utilities (`useAsPromise` and `useAsNetworkState`) provide essential tools for integrating and managing hooks and asynchronous functions within the `intrig` ecosystem. They enhance flexibility and improve compatibility, helping developers to manage stateful operations more effectively.

