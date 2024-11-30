## Simple and Expressive Code

Intrig aims to make code simple, expressive, and maintainable, which reduces the likelihood of defects and creates a pleasant development experience. By minimizing boilerplate and following consistent patterns that align with React best practices, Intrig helps developers maintain a clean codebase.

For example, Intrig simplifies state management through the Context API, eliminates manual network setup with generated Axios-based hooks, and ensures type-safe validation using Zod. These features combine to make the React development process more streamlined and natural.

React has its own conventions, and Intrig embraces these to create a development experience that feels familiar and intuitive.

### Consistent Hook Usage

Intrig generates hooks that follow a consistent syntax similar to the useState hook, making it easy for developers to integrate them into React components without a steep learning curve.

For example, a typical useState hook looks like this:

```typescript
const [count, setCount] = useState(0);
```

An Intrig-generated hook follows a similar pattern:

```typescript
const [state, fetchOrUpdate, clear] = useGeneratedMethod(/* entityKey */);
```

This similarity allows developers to quickly adapt to Intrig's generated hooks, maintaining consistency and ease of use throughout the development process.

### State-Based Approach over Promises

Using promises in React components can sometimes introduce unnecessary complexity and potential bugs. Intrig addresses this by converting promises into predictable states (referred to as NetworkState).

NetworkState provides a predefined lifecycle that allows components to respond to different states seamlessly. When the NetworkState changes, the component re-renders accordingly, ensuring that the correct state is reflected in the UI.

For more information on managing states with NetworkState, refer to the State Management page.

