<p align="center">
<img src="./docs/intrig-logo.svg" alt="Intrig Logo" width="200">
</p>

# Intrig ![npm](https://img.shields.io/npm/v/intrig) ![License](https://img.shields.io/github/license/intrigsoft/intrig)

Intrig is a powerful API integration and documentation tool designed for frontend developers working with OpenAPI 3. It streamlines API consumption by generating boilerplate code, offering a rich documentation interface, and providing an intuitive way to explore and interact with API endpoints.

## Features

### 🔹 API Documentation & Exploration

- Generates structured documentation from OpenAPI 3 specifications.
- Provides an interactive UI to explore API endpoints, including request and response types.
- Enables developers to view version history of API definitions.

### 🔹 Code Generation

- Generates strongly typed hooks for API calls, integrating seamlessly with React applications.

- Provides hooks that follow React’s standard state management conventions, resembling `useState` syntax for simplicity and performance.

### 🔹 CLI Tooling

- Allows automation of API integration workflows.
- Supports syncing remote OpenAPI specifications.
- Provides an easy way to manage API configurations.



## Installation

Intrig CLI is published to npx. When you run `npx intrig init`, it adds necessary dependencies to the project, such as `@intrig/next` for Next.js projects or `@intrig/react` for React projects. It also adds `intrig` as a dev dependency to the project.

```sh
npx intrig init
```

## Usage

### CLI Usage

Intrig provides a command-line interface for managing API integrations efficiently. Below are the available commands:

#### `init`

Initializes a new Intrig configuration and installs necessary dependencies.

```sh
npx intrig init
```

#### `add`

Adds a new API source to the Intrig configuration.

```sh
intrig add [-s <value>] [-i <value>]
```

- `-i, --id=<value>`: Unique ID for the API.
- `-s, --source=<value>`: OpenAPI specification URL.

#### `ls`

Lists API sources from the Intrig configuration.

```sh
intrig ls [-d] [-f <value>]
```

- `-d, --detailed`: Show detailed information.
- `-f, --filter=<value>`: Filter sources by name or ID.

#### `baseline`

Creates a baseline version for API specifications.

```sh
intrig baseline -i <value> -v <value> [-f]
```

- `-i, --id=<value>`: API ID to baseline.
- `-v, --version=<value>`: Version for the baseline.
- `-f, --force`: Force baseline if version exists.

#### `sync`

Synchronizes API specifications.

```sh
intrig sync [-a | -i <value>...]
```

- `-a, --all`: Sync all APIs.
- `-i, --ids=<value>...`: Comma-separated list of API IDs to sync.

#### `generate`

Regenerates code for API integration.

```sh
intrig generate [-a | -i <value>...]
```

- `-a, --all`: Sync all APIs.
- `-i, --ids=<value>...`: Comma-separated list of API IDs to sync.

#### `rm`

Removes an API source from the Intrig configuration.

```sh
intrig rm [SOURCE]
```

- `SOURCE`: ID of the source to remove.

#### `insight`

Starts the web view for Intrig insight.

```sh
intrig insight [-p <value>] [-d]
```

- `-p, --port=<value>`: Port for Next.js server (default: 7007).
- `-d, --debug`: Enable debug mode for server-side logs.

## Configuration

Intrig supports project-level configurations via `intrig.config.json`:

```json
{
  "sources": [
    {
      "id": "example-api",
      "name": "Example API Definition",
      "specUrl": "https://example.com/api/openapi.json"
    },
    {
      "id": "analytics",
      "name": "Analytics API",
      "specUrl": "https://api.analytics.com/v3/openapi.json"
    }
  ],
  "generator": "next"
}
```

- **`sources`**: Defines the API sources available for integration.
  - `id`: A unique identifier for the API.
  - `name`: A human-readable name for the API.
  - `specUrl`: The URL of the OpenAPI 3 specification.
- **`generator`**: Specifies the type of code generation, such as `next` for Next.js projects.

## Roadmap

- ✅ OpenAPI-based documentation and code generation
- ✅ CLI tool for API exploration and integration
- ⏳ Standalone server deployment with authentication
- ⏳ GitHub integration for API version tracking

## Contributing

We welcome contributions! Please check our issues board and submit pull requests.

## License

Apache License 2.0. See `LICENSE` file for details.

