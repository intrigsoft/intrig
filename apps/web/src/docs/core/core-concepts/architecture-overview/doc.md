# Architecture Overview

Intrig is designed with a modular and extensible architecture to streamline API integration, network state management, and documentation workflows. Here, we provide a high-level overview of how the framework works under the hood.

## Core Components

### 1. **Configuration Management**

- **`intrig.config.json`**: The central configuration file allows developers to specify API sources, generators, and other customization options.
- **Dynamic Adaptation**: Intrig normalizes and adapts configurations to support project-specific requirements, ensuring compatibility with diverse workflows.

### 2. **Source Management**

- **Swagger/OpenAPI Sync**: Intrig retrieves and normalizes API specifications from remote sources via the `sync` command.
- **Local Storage**: Normalized API specifications are stored locally to ensure consistent and versioned processing.

### 3. **Code Generation**

- **Generators**: Intrig generates type-safe hooks, utilities, and schemas tailored for the target framework (e.g., Next.js).
- **Predefined Output**: Intrig generates code into a predefined location, compiles it, and exposes it as a third-party library, ensuring consistency across projects.

### 4. **Runtime Utilities**

- **Generated Hooks**: These hooks handle API requests and responses while encapsulating network state management.
- **Helper Functions**: Utilities like `isPending` and `isSuccess` simplify state checks in React components.

### 5. **Intrig Insight (Web UI)**

- **Documentation:** Intrig Insight offers comprehensive, easy-to-navigate documentation, enabling new developers to quickly learn and contribute effectively.
- **API Discovery**: Provides a visual interface for developers to explore endpoints, view documentation, and access example code fragments.

## Key Processes

### 1. **Sync Workflow**

- Fetches API specifications from configured remote sources.
- Normalizes and saves the specifications locally, ensuring compliance with OpenAPI standards.
- Handles updates gracefully, maintaining version histories for each API source.

### 2. **Generate Workflow**

- Reads the latest saved API specifications.
- Generates client-side utilities, including hooks and type-safe interfaces. For Next.js, it also generates server-side counterparts, including async functions and route endpoints.
- Supports modular generation for different frameworks like React and Next.js.

### 3. **Runtime Usage**

- The generated hooks integrate seamlessly into React components.
- State management utilities provide real-time feedback on network states, ensuring smooth user experiences.

## Technology Stack

- **Languages**: TypeScript for type safety and developer experience.
- **Frameworks**: React and Next.js for frontend integration.
- **Tools**: OpenAPI for API specification, Tailwind CSS for styling, and Nx for monorepo management.

## High-Level Workflow Diagram

1. **Developer Setup**:

  - Initialize with `intrig init`.
  - Configure `intrig.config.json`.

2. **Sync Process**:

  - Fetch API specs using `npx intrig sync`.
  - Normalize and store specs locally.

3. **Generate Process**:

  - Generate utilities with `npx intrig generate`.
  - Use hooks and utilities in React components.

4. **Documentation and Testing**:

  - Launch Intrig Insight with `npx intrig insight`.
  - Explore endpoints and test integrations.

Intrig’s architecture ensures that developers can efficiently integrate and document APIs while maintaining flexibility and scalability for future growth.

