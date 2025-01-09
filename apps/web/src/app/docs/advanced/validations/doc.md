---
title: Zod Validations in Intrig
---

Intrig extends its functionality beyond code generation by also generating **Zod schemas** based on your OpenAPI 3 documentation. These schemas play a crucial role in ensuring the correctness of data exchanged between the frontend and backend. The Zod schemas are used in two primary contexts:

#### 1. Request Body Validation
Before sending any request to the backend, Intrig validates the request body against the corresponding Zod schema. This ensures that the data being sent adheres to the expected format and structure.

- **What happens on failure?**  
  If the validation fails, the action automatically returns a `ValidationError` object, preventing the malformed request from reaching the backend.

#### 2. Response Validation
When a response is received from the backend, Intrig validates the data against the generated Zod schema for the response. This helps catch any deviations or unexpected changes in the backend response structure.

- **What happens on failure?**  
  If the validation fails, the network state transitions to an **error state**, and a validation error message is provided.

---

## Important Considerations

- **Coupled with OpenAPI 3 Documentation**  
  The Zod validations are tightly coupled with the OpenAPI 3 documentation. This means that if the types in the OpenAPI definition are incorrect or outdated, Intrig will reject the corresponding responses. Ensuring the correctness and consistency of your OpenAPI documentation is critical to avoid unnecessary errors.

- **Future Enhancements**  
  In upcoming versions, Intrig will introduce mechanisms to bypass validations when necessary, providing greater flexibility in handling edge cases or incomplete API documentation.

By leveraging Zod validations, Intrig ensures that your data flow remains robust and consistent, enhancing overall confidence in the integration between frontend and backend systems.

