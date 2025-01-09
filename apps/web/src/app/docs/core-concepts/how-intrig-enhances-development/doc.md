---
title: How Intrig Enhances Development
---

## How Intrig Enhances Development

Intrig is designed to streamline development processes by adhering to conventions, reducing manual effort, and fostering collaboration between frontend and backend teams. Here’s how it enhances the development lifecycle:

### **1. Convention over Configuration**

Intrig relies on predefined conventions to simplify workflows. Key characteristics include:

- **Predefined Locations**: All generated code is placed in specific directories hidden from version control.
- **Build-Time Generation**: Code is generated dynamically during the build process, preventing accidental updates or inconsistencies.
- **Minimized Configuration**: Developers only need to define essential settings, such as API sources, in the `intrig.config.json` file.

### **2. Efficient API Integration**

- **Generated Hooks**: Intrig provides type-safe React hooks for API interactions, eliminating boilerplate code.
- **Server-Side Utilities**: For Next.js projects, server-side functions and routes are generated, ensuring seamless backend integration.
- **State Management Utilities**: Helper functions like `isPending` and `isSuccess` simplify handling network state.

### **3. Enhanced Collaboration**

- **Backend Alignment**: Intrig enforces the use of Swagger/OpenAPI specifications, ensuring backend teams provide well-documented APIs.
- **Frontend Empowerment**: With tools like Intrig Insight, frontend developers can explore APIs, view example code fragments, and integrate endpoints with minimal guidance.

### **4. Reduced Developer Overhead**

- **Automation**: Intrig automates repetitive tasks like code generation and API integration.
- **Type Safety**: Leveraging TypeScript ensures that generated utilities reduce runtime errors.
- **Normalization**: Intrig standardizes API specifications to ensure compatibility with its tools.

### **5. Intrig Insight: A Developer’s Companion**

- **API Discovery**: Intrig Insight acts as a visual interface for exploring API endpoints and understanding their usage.
- **Documentation at Arm’s Length:** Intrig Insight offers integrated documentation, enabling developers to easily access relevant API details. This fosters better understanding, reduces misunderstandings, and minimizes potential misuse of APIs. 

### **6. Scalability and Performance**

- **Framework-Specific Generation**: Intrig optimizes generated code for frameworks like Next.js, balancing performance and maintainability.
- **Consistency Across Teams**: By enforcing conventions, Intrig ensures uniformity across projects, making it easier to scale teams and maintain large codebases.

### **7. Focused on Best Practices**

- Intrig actively promotes the adoption of best practices, such as maintaining up-to-date API documentation, hiding generated code from version control, and separating responsibilities between frontend and backend teams.

By incorporating these enhancements, Intrig helps developers save time, reduce errors, and deliver high-quality software more efficiently.

