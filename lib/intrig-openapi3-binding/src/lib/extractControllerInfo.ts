import { OpenAPIV3_1 } from 'openapi-types';

export function extractControllerInfo(spec: OpenAPIV3_1.Document): OpenAPIV3_1.TagObject[] {
  return spec.tags ?? []
}
