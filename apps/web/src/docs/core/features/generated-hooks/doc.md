# Documentation for Intrig Generated Hooks

Intrig generates client-side hooks for each API based on the provided Swagger documentation. These hooks simplify API integration and adhere to a consistent naming convention.

## Hook Naming Convention

The generated hook names typically follow the pattern:

```tsx
use<operationId>
```

However, for scenarios involving different content types or response types that might lead to naming conflicts, the hook names may be adjusted automatically to ensure uniqueness.

## Directory Structure

The hooks are generated in the following directory structure:

```bash
@intrig/<generator>/<source>/<tag>/<operationId>/
```

- **`<generator>`**: Represents the specific generator used by Intrig.
- **`<source>`**: Indicates the Swagger source.
- **`<tag>`**: Corresponds to the controller or common service specified in the Swagger tags.
- **`<operationId>`**: Matches the operation ID defined in the Swagger documentation.

### Note

Users do not need to memorize or calculate the path manually. Intrig Insight provides tools to quickly locate the relevant hook, making it easy to find and use the generated hooks in your project.

## Hook Signature

The generated hooks follow a standard signature:

```tsx
const [networkState, action, clear] = useHook(<key: string>);
```

- **`networkState`**: An instance of `NetworkState` that manages the current state of the network request.

- **`action`**: A function to execute the desired action. It can have one of the following signatures:

  - `(p: Params) => DispatchState`
  - `(b: Body, p: Params) => DispatchState`

  When users need to execute an action, they call this function with the appropriate parameters.

- **`clear`**: A cleanup function that clears the current state of the hook.

### Key Parameter

The `key` parameter allows managing multiple states for the same hook in a controlled manner. By assigning a unique key, users can isolate and manage different instances of the hook state independently. This feature is particularly useful in scenarios where the same hook is utilized in different contexts or components simultaneously.

## Usage Patterns

### 1. Fetch on Load

In scenarios where you need to fetch data as soon as the component loads, you can use the following pattern:

```tsx
useEffect(() => {
  action();
}, []);
```

#### Full Component Example

```tsx
import React, { useEffect } from 'react';
import { useGetItems } from '@intrig/generated/hooks';

function ItemList() {
  const [, fetchItems] = useGetItems();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return <><Children /></>;
}
```

This ensures that the `action` function is executed once when the component is mounted, triggering the API call and updating the `networkState` accordingly.

### 2. Clear on Unload

In scenarios where you need to clear the hook state when a component is unmounted, you can use the following pattern:

```tsx
useEffect(() => {
  return clear;
}, []);
```

#### Full Component Example

```tsx
import React, { useEffect } from 'react';
import { useGetItems } from '@intrig/generated/hooks';

function ItemList() {
  const [, , clear] = useGetItems();

  useEffect(() => {
    return clear;
  }, [clear]);

  return <><Children /></>;
}
```

This ensures that the hook state is cleaned up properly when the component is unmounted, preventing potential memory leaks or stale data.

### Combining Fetch on Load and Clear on Unload

The `Fetch on Load` and `Clear on Unload` patterns are often used together to ensure proper initialization and cleanup of resources. Here is an example combining both patterns:

```tsx
import React, { useEffect } from 'react';
import { useGetItems } from '@intrig/generated/hooks';

function ItemList() {
  const [, fetchItems, clear] = useGetItems();

  useEffect(() => {
    fetchItems();
    return clear;
  }, [fetchItems, clear]);

  return <><Children /></>;
}
```

This approach ensures that the data is fetched when the component loads and the state is cleared when the component unmounts, maintaining clean and efficient state management.

### 3. Fetch on Callback

In scenarios where you need to fetch or update data based on user interactions, you can use the following pattern:

```tsx
const onClick = useCallback((data: T) => {
  action(data);
}, [action]);
```

#### Full Component Example

```tsx
import React, { useCallback } from 'react';
import { useUpdateItem } from '@intrig/generated/hooks';

function UpdateButton({ data }) {
  const [, updateItem] = useUpdateItem();

  const onClick = useCallback(() => {
    updateItem(data);
  }, [updateItem, data]);

  return <button onClick={onClick}>Update</button>;
}
```

This pattern allows the `action` function to be executed in response to a specific event, such as a button click, passing the necessary data dynamically.

### 4. Update on Change

In scenarios where the action needs to be called whenever a parameter changes, such as for search or pagination updates, you can use the following pattern:

```tsx
useEffect(() => {
  action(params);
}, [params]);
```

#### Full Component Example

```tsx
import React, { useEffect } from 'react';
import { useSearchItems } from '@intrig/generated/hooks';

function SearchResults({ params }) {
  const [, searchItems] = useSearchItems();

  useEffect(() => {
    searchItems(params);
  }, [searchItems, params]);

  return <><Children /></>;
}
```

This pattern is particularly useful in scenarios like search, where query parameters and pagination are updated in the URL, and the action is called whenever the URL changes.

### 5. Show Loader

In scenarios where you need to display a loading indicator while a request is pending, there are two common patterns:

#### Explicit Check

This approach ensures that no other components are rendered while the loader is visible:

```tsx
if (isPending(responseState)) {
  return <Loader />;
}

return <><Children /></>;
```

#### Inline Loading Indicator

This approach displays a loader alongside other components, if necessary:

```tsx
return <>
  {isPending(responseState) && <Loader />}
  <Children />
</>;
```

Use the explicit check when you want the loader to be the sole focus during loading, and use the inline loading indicator when you want the loader to complement existing content.

### 6. Show Error

In scenarios where you need to display an error message or component when a request fails, there are two common patterns:

#### Explicit Check

This approach ensures that no other components are rendered while the error message is displayed:

```tsx
if (isError(responseState)) {
  return <Error error={responseState.error} />;
}

return <><Children /></>;
```

#### Inline Error Indicator

This approach displays an error message alongside other components, if necessary:

```tsx
return <>
  {isError(responseState) && <Error error={responseState.error} />}
  <Children />
</>;
```

Use the explicit check when you want the error message to be the sole focus, and use the inline error indicator when you want the error message to complement existing content.

### 7. Extract Success as Memo

In scenarios where you need to extract and memoize the success data for use in your component, you can use the following pattern:

```tsx
const data = useMemo(() => {
  if (isSuccess(responseState)) return responseState.data;
}, [responseState]);
```

#### Full Component Example

```tsx
import React, { useMemo } from 'react';
import { useGetItems } from '@intrig/generated/hooks';

function ItemDetails() {
  const [responseState] = useGetItems();

  const data = useMemo(() => {
    if (isSuccess(responseState)) return responseState.data;
    return null;
  }, [responseState]);

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

This pattern ensures that the data is efficiently computed and available for rendering only when the response is successful.

### 8. Skip Pending State

In scenarios where you want to preserve and display the previous data until new data is fully loaded, you can use the following pattern:

```tsx
let [data, setData] = useState();

useEffect(() => {
  if (isSuccess(responseState)) setData(responseState.data);
}, [responseState]);
```

#### Full Component Example

```tsx
import React, { useEffect, useState } from 'react';
import { useGetItems } from '@intrig/generated/hooks';

function ItemDetails() {
  const [responseState] = useGetItems();
  const [data, setData] = useState();

  useEffect(() => {
    if (isSuccess(responseState)) setData(responseState.data);
  }, [responseState]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

This pattern is particularly useful in scenarios where you want to avoid showing a blank or loading state while new data is being fetched.

### 9. Act Upon Success/Failure Response

In scenarios where you need to act based on the success or failure of an operation, such as notifying the user or performing follow-up actions, you can use the following pattern:

```tsx
useEffect(() => {
  if (isSuccess(responseState)) {
    // Handle success
    console.log(responseState.data);
  } else if (isError(responseState)) {
    // Handle error
    console.error(responseState.error);
  }
}, [responseState]);
```

#### Full Component Example

```tsx
import React, { useEffect } from 'react';
import { useUpdateItem } from '@intrig/generated/hooks';

function UpdateNotification() {
  const [responseState, updateItem] = useUpdateItem();

  useEffect(() => {
    if (isSuccess(responseState)) {
      alert('Update successful!');
    } else if (isError(responseState)) {
      alert(`Update failed: ${responseState.error.message}`);
    }
  }, [responseState]);

  return (
    <button onClick={() => updateItem({ id: 1, name: 'New Name' })}>
      Update Item
    </button>
  );
}
```

This pattern is particularly useful for notifying users or triggering additional actions after an operation completes.

---

