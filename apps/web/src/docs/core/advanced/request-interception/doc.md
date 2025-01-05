# Request Interception

Intrig provides mechanisms for intercepting requests, allowing developers to customize API interactions for authentication, logging, or any other pre-processing needs. This feature ensures flexibility while adhering to Intrig’s conventions.

## **Overview of Request Interception**

Intrig provides framework-specific mechanisms for request interception, tailored to React and Next.js environments:

1. **React**: Configure the provider using Axios interceptors.
2. **Next.js**: Set up the `next.config.js` file to link a custom configuration for request handling.

## **React Request Interception**

In React projects, the `IntrigProvider` accepts a `CreateAxiosDefaults` object, which includes the ability to define request interceptors.

### Example:

```typescript
import { IntrigProvider } from '@intrig/react';
import axios from 'axios';

const axiosDefaults = {
  baseURL: process.env.PETSTORE_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
  interceptors: {
    request: [(config) => {
      console.log('Request intercepted:', config);
      return config;
    }],
  },
};

const App = () => (
  <IntrigProvider axiosDefaults={axiosDefaults}>
    <MainApp />
  </IntrigProvider>
);
```

In this example:

- The `baseURL` is set dynamically based on environment variables.
- A request interceptor is added to log and modify requests before they are sent.

## **Next.js Request Interception**

In Next.js projects, configure request interception by linking the `intrig-hook` module to a custom configuration file.

### Steps to Set Up:

1. **Update ********`next.config.js`********:**

   ```javascript
   const path = require('path');

   module.exports = {
     webpack: (config) => {
       config.resolve.alias['intrig-hook'] = path.resolve('./src/intrig-config.ts');
       return config;
     },intr
   };
   ```
//TODO update example
2. **Create ********`src/intrig-config.ts`********:**

   ```javascript
   module.exports = {
     requestInterceptor: (config) => {
       config.headers.Authorization = `Bearer ${process.env.TOKEN}`;
       console.log('Intercepted request:', config);
       return config;
     },
   };
   ```

### Key Points:

- The `requestInterceptor` function modifies the Axios request configuration.
- Environment variables, such as `TOKEN`, can be dynamically injected for authentication.

## **Use Cases for Request Interception**

- **Authentication**: Add tokens or credentials to every request.
- **Logging**: Track outgoing requests for debugging or monitoring.
- **Dynamic Headers**: Modify headers based on runtime conditions.
- **Rate Limiting**: Implement custom logic to manage request rates.

## **Best Practices**

- Keep interceptors lightweight to avoid performance bottlenecks.
- Centralize configuration for consistency across the application.
- Use environment variables for sensitive data like tokens.

By leveraging Intrig’s request interception capabilities, developers can create highly customizable and efficient workflows tailored to their application's needs.

