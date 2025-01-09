---
title: Key Terminology
---

## Terminology

Understanding the key terms used in Intrig is essential for making the most of the framework. Here is a glossary of important concepts and components:

### **1. Intrig Config (********`intrig.config.json`********):**

The central configuration file for Intrig projects. It defines settings such as API sources, output directories, and generators. This file is the backbone of Intrig's customization and integration process.

### **2. Swagger/OpenAPI Specification:**

A standard format for describing RESTful APIs. Intrig relies on Swagger or OpenAPI specifications to generate type-safe utilities, hooks, and documentation.

### **3. Generated Hooks:**

Custom React hooks created by Intrig based on the API specifications. These hooks encapsulate API interactions and manage network state efficiently. For example:

```typescript
import { useGetAllPets } from '@intrig/next/dataflow/pet-controller/getAllPets/client';
let [response, fetchResponse, clearResponse] = useGetAllPets();
```

### **4. Sync Workflow:**

The process of fetching, normalizing, and saving API specifications locally. This ensures the latest updates are used for generating code.

### **5. Generate Workflow:**

The process of generating type-safe hooks, schemas, and utilities from the locally stored API specifications. It uses the configuration defined in `intrig.config.json`.

### **6. Intrig Insight:**

The web-based interface for Intrig that allows developers to explore endpoints, view documentation, and access code fragments. It simplifies API discovery and integration testing.

### **7. State Management Utilities:**

Helper functions like `isPending` and `isSuccess` provided by Intrig to simplify handling and monitoring of network states in React components.

### **8. Predefined Locations:**

Intrig follows a convention-over-configuration approach. All code generation and impacted areas are predefined and actively hidden from version control systems like Git. When using Intrig, the project must be built to regenerate and compile the necessary code, thereby preventing accidental updates or inconsistencies in the generated output.

### **9. API Discovery:**

A feature of Intrig Insight that helps developers quickly identify and understand API endpoints, their documentation, and example usage.

### **10. Type Safety:**

Intrig leverages TypeScript to ensure that all generated code and utilities are type-safe, reducing runtime errors and improving developer productivity.

### **11. Next.js Server-Side Utilities:**

For Next.js projects, Intrig generates server-side counterparts, including async functions and route endpoints, enabling seamless API integrations.

### **12. OpenAPI Normalization:**

The process Intrig uses to standardize and adapt API specifications, ensuring compatibility with its generation tools.

By understanding these terms, developers can better navigate the features and workflows of Intrig.

