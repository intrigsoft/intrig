---
title: Extended Hooks in Intrig
---

Intrig’s hook system is designed to provide developers with a seamless and efficient way to manage API integrations and state within their applications. Beyond the default hooks, Intrig supports an evolving set of extended functionalities that cater to more specialized requirements.

## Why Use Extended Hooks?
Extended hooks in Intrig aim to:

1. **Simplify Complex Workflows**: By abstracting common patterns and operations, extended hooks reduce boilerplate code and improve maintainability.
2. **Enhance State Management**: Provide developers with tools to better manage component-level and application-wide state in a consistent manner.
3. **Streamline API Interactions**: Enable more powerful and intuitive ways to interact with APIs, ensuring type safety and ease of use.
4. **Promote Reusability**: Reduce redundancy by encapsulating logic in reusable hooks.

## Key Benefits:
- **Type Safety**: All extended hooks are fully typed to ensure reliable development experiences.
- **Integration**: Extended hooks work seamlessly with Intrig’s existing hook ecosystem and tools.
- **Performance**: Designed with performance in mind, these hooks optimize data fetching and state transitions.
- **Scalability**: Cater to use cases ranging from simple data fetching to complex state management across large applications.

## Available Hooks:

### 1. `useAsPromise`

Converts a given hook into a promise-based function, suitable for cases like validations where a promise-based output is needed.

#### Import:
```javascript
import { useAsPromise } from '@intrig/next';
```

#### Usage:
```javascript
const [fetchDataAsPromise, clearState] = useAsPromise(useData);
```

#### Example:
Given the original signature of `useData`:
```javascript
useData(): [NetworkState<T>, (args: ...Args) => DispatchState, () => void]
```
`useAsPromise` converts it to:
```javascript
[(args: ...Args) => Promise<T>, () => void]
```
The `DispatchState` merges with the promise to provide validation errors.

---

### 2. `useAsNetworkState`

Converts any asynchronous function to a network state, acting as a reverse for the `useAsPromise` hook.

#### Import:
```javascript
import { useAsNetworkState } from '@intrig/next';
```

#### Usage:
```javascript
const [state, execute, clear] = useAsNetworkState(fetchDataFunction);
```

#### Example:
Given an async function `fetchDataFunction`, this hook returns:
- `state`: The network state of the async operation.
- `execute`: A function to initiate the async operation.
- `clear`: A function to reset the state.

---

### 3. `useResolvedValue`

Resolves the value from the provided hook's state and updates it whenever the state changes.

#### Import:
```javascript
import { useResolvedValue } from '@intrig/next';
```

#### Usage:
```javascript
const value = useResolvedValue(useData);
```

#### Example:
When `useData` returns a successful state, `useResolvedValue` resolves and caches the corresponding data:
```javascript
const product = useResolvedValue(useGetProduct);
```

---

### 4. `useResolvedCachedValue`

Caches the value from a successful state provided by a given hook. The state updates only when successful, retaining previous values otherwise.

#### Import:
```javascript
import { useResolvedCachedValue } from '@intrig/next';
```

#### Usage:
```javascript
const cachedValue = useResolvedCachedValue(useData);
```

#### Example:
```javascript
const cachedProduct = useResolvedCachedValue(useGetProduct);
```
Even if the state becomes unsuccessful, the cached value remains.

---

## Use Cases for Extended Hooks:
- **Validation and Error Handling**: Simplify promise-based workflows for validations and handle errors effectively.
- **State Conversion**: Easily switch between network states and promise-based outputs depending on your use case.
- **Optimized Data Access**: Cache and resolve data efficiently for improved performance.
- **Reusable Logic**: Encapsulate logic in hooks to reduce redundancy and improve maintainability.

---

Stay tuned for detailed documentation on additional extended hooks and how they can transform your development workflow with Intrig.

