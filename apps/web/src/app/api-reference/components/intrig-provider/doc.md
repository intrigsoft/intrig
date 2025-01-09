---
title: "API Reference: IntrigProvider"
---

## Overview

The `IntrigProvider` is a React context provider that offers network request management and global state management for applications built with the intrig framework. It leverages `Axios` for HTTP requests, Zod schemas for runtime validation, and React's context for state sharing.

---

## IntrigProvider

### Props

| Prop       | Type                     | Default | Description                                                                                                                                               |
|------------|--------------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `children` | `React.ReactNode`        | —       | The child components that will have access to the Intrig context.                                                                                        |
| `configs`  | `AxiosRequestConfig`     | `{}`    | Optional configuration for the internal Axios instance, such as base URL, headers, and timeout settings.                                                 |

---

### Usage

#### Wrapping an Application
```tsx
import { IntrigProvider } from './IntrigProvider';

function App() {
  return (
    <IntrigProvider configs={{ baseURL: 'https://api.example.com' }}>
      <YourApp />
    </IntrigProvider>
  );
}
```
