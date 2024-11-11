# Intrig Ideology

## Generates the Boilerplate

There are various tools and tactics used in developing the network layer of React applications. Those solutions provide either a library to use and conventions to follow, or code generation. Intrig prefers code generation as it leverages the network integration burden. This vastly reduces the knowledge cost of the library.

For example, Intrig replaces the need for manual Redux setup, custom Axios integration, and boilerplate API handling logic. Instead of manually configuring these elements, Intrig generates consistent and ready-to-use code, allowing developers to focus more on the core features of their application.

## Uses Stable Stack

Intrig uses the Context API for state management, Zod for validation, and Axios for network communication due to its simplicity. We plan to support the Fetch API in the future.

While using these technologies, Intrig ensures that their capabilities are fully leveraged without imposing limitations. Developers can continue to use these libraries in their usual way, maintaining a familiar and seamless development experience.

## Single Source of Truth for State Management

Intrig follows a single source of truth for state management. This is achieved by saving each update of the API call in a single store, resulting in simple and predictable behavior across the entire application.

## Simple and Expressive

Simple code provides fewer defects and a pleasant development experience. Intrig achieves this by reducing boilerplate code, following consistent patterns, and generating code that adheres to React best practices. For instance, it simplifies state management with the Context API, reduces manual network setup through generated Axios-based hooks, and uses Zod for type-safe validation, which all contribute to a more natural and streamlined React development process.

React provides its own convention of doing things. Intrig makes use of these conventions to provide a more simple and natural React development experience.

## Uses Hooks

Every generated hook follows a consistent syntax much similar to the `useState` hook. This allows a seamless integration with the React components and provides a pleasant development experience.

For example, a typical `useState` hook looks like this:

```javascript
const [count, setCount] = useState(0);
```

An Intrig-generated hook follows a similar pattern, making it easy to understand and use:

```javascript
const [state, fetchOrUpdate, clear] = useGeneratedMethod(/* entityKey */);
```

This similarity allows developers to quickly adapt to Intrig's generated hooks without a steep learning curve, maintaining consistency and ease of use.

## Favors States to Promises

In JavaScript, a promise represents a possibility and the time aspect. Using promises in React components can be confusing and often leads to bugs. In API response handling, Intrig follows a more natural approach than promises.

Intrig converts promises to states (a.k.a. `NetworkState`). These generated states follow a predefined and predictable lifecycle. You can write your components to respond to each state, and upon `NetworkState` change, the component re-renders with the correct state.

For more details on managing states with `NetworkState`, please refer to the [State Management](#state-management) page.

## Type Safe

Intrig is written with strong type safety in mind. It supports TypeScript and makes use of features like type guards to provide better type safety. This helps in catching type-related errors early and ensures that the data used in your components is correctly validated.

## Encourages Standardized API Integration

Documenting an API is a best practice in API development. Creating API documentation for any project that has an API greatly improves the project's quality. Intrig makes API documentation a mandatory feature for the backend, encouraging teams to invest the necessary effort. While this may require more work from the backend team, it ensures that the project maintains high-quality, consistent documentation that benefits both developers and users.

Only OpenAPI v3 is supported at the moment. OpenAPI v2 and file-based specification support may be added in the future, based on community requirements.

## Well Documented

Most code generators produce good code, but they often lack:

1. A well-localized documentation for the generated code.
2. A good discovery mechanism for the integration methods based on the use case.

This lack of documentation reduces the usage of the tool, leading to a knowledge gap between frontend developers and the API, making the use of generated code harder than manually writing the code based on the API docs. 

Intrig provides Insight to reduce this gap. Insight offers well-localized documentation for the API and a strong search function to discover integrations. This helps frontend developers understand and use the generated code effectively without needing to spend excessive time learning the API.

## Performant

Intrig generates ESM modules for each endpoint, so when used within the code, it only ships the required code. This ensures effective code splitting and reduces unnecessary bundle size.

In the end, we believe in productivity and performance in both runtime and development/maintenance. Therefore, Intrig tries to reduce and furthermore dissipate the complexity of network integration altogether.
