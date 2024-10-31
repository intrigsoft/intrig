import {OpenAPIV3_1} from "openapi-types";

export function extractSchemas(spec: OpenAPIV3_1.Document): Record<string, OpenAPIV3_1.SchemaObject> {
  return spec.components?.schemas ?? {};
}
