# Getting Started 

Welcome to Intrig! This guide will help you get up and running with Intrig in no time. Whether you're a frontend developer looking to simplify API integration or a backend developer enforcing best practices, this section will guide you through the setup process.

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js** (v20 or later) installed on your machine.
- A **package manager** like npm or yarn.
- Basic understanding of JavaScript, TypeScript, and React.

## Initialization

Set up Intrig in your project by running the following command:

```bash
npx intrig init
```

This will:

- Create an `intrig.config.json` file in your project root.
- Set up default directories for generated hooks and API documentation.
- Add the relevant entries to .gitignore
- Install relevant client library 

## Adding the Intrig Provider

To enable Intrig functionality in your project, you need to add the `IntrigProvider` to the root of your application. The Intrig functionality will be available downstream of the `IntrigProvider`.

{% tabs %}
{% tab title="Next.js" %}

For Next.js projects, add the `IntrigProvider` in the `root layout.tsx` file as follows:

```tsx
import {IntrigProvider} from "@intrig/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <IntrigProvider>
        {children}
      </IntrigProvider>
      </body>
    </html>
  );
}
```
{% /tab %}
{% tab title="React" %}

For React projects, wrap the root of your application with the `IntrigProvider` in `index.tsx` or `index.js`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {IntrigProvider} from "../.intrig/generated/src";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <IntrigProvider>
      <App />
    </IntrigProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```
{% /tab %}
{% /tabs %}
## Configuration

The `intrig.config.json` file is where you define project-specific settings. Here’s an example configuration:

```json
{
  "sources": [
    {
      "id": "petstore",
      "name": "Swagger Petstore - OpenAPI 3.0",
      "specUrl": "https://petstore3.swagger.io/api/v3/openapi.json"
    }
  ],
  "generator": "next"
}
```

- **sources**: A list of APIs to integrate with, defined by their id, name, and specUrl.
- **generator**: The target framework or library for generating client utilities (e.g., "next" for Next.js).

## Environment Configuration

Intrig uses environment variables to manage API base URLs for each source. This ensures flexibility in different environments (e.g., development, staging, production). The base URL for each API source must follow this format:

```bash
<UPPERCASE_SOURCE_ID>_API_URL 
```

**Example** For a source defined in your `intrig.config.json` as:

```json
{
  "sources": [
    {
      "id": "petstore",
      "name": "Swagger Petstore - OpenAPI 3.0",
      "specUrl": "https://petstore3.swagger.io/api/v3/openapi.json"
    }
  ]
}
```

Set the base url in your `.env` file like so:

```dotenv
PETSTORE_API_URL=https://api.example.com
```

Make sure to include the `.env` file in your project root and load it appropriately.

## Generating Code

Intrig separates fetching and generating into two distinct steps:

1. **Sync**: Fetch the specified Swagger/OpenAPI specifications, normalize them, and save them locally.

   ```bash
   npx intrig sync --all
   ```

   This command retrieves the latest API documents from the configured sources and stores them in the project directory.

2. **Generate**: Generate type-safe hooks and utilities from the locally saved API documents.

   ```bash
   npx intrig generate
   ```

   This command reads the latest saved API files and produces boilerplate code in the configured output directory.



## Using Intrig in Your Project

### Example: Fetching Data with a Generated Hook

Assume you have an endpoint `/pets` defined in your Swagger documentation. After running `npx intrig sync`, a hook like `useGetAllPets` is generated.

Here’s how you use it:

```tsx
import { useGetAllPets } from '@intrig/next/petstore/pet/getAllPets/client';

import { isSuccess, isPending } from '@intrig/next';
import { useEffect } from 'react';

export interface MyComponentProps {}

export function MyComponent() {
  let [response, fetchResponse, clearResponse] = useGetAllPets();

  useEffect(() => {
    fetchResponse();
  }, []);
  useEffect(() => {
    return clearResponse;
  }, []);

  if (isPending(response)) {
    return <div>loading...</div>;
  }

  return (
    <>{isSuccess(response) && <div>{JSON.stringify(response.data)}</div>}</>
  );
}
```

## Intrig Insight

Intrig Insight is a prominent feature of the framework, acting as a customized documentation tool for your integration. It allows developers to:

- Easily discover the correct endpoints and code fragments.
- Navigate through API documentation with ease.

To access the web UI, run:

```bash
npx intrig insight
```

This command starts the web UI, enabling a seamless exploration of your project's integration points.

## Next Steps

Now that you have Intrig set up:

- Explore your generated hooks and utilities.
- Read the [API Documentation](#) to understand how Intrig integrates with your APIs.
- Join the [community discussions](#) for support and best practices.

Happy coding with Intrig!

