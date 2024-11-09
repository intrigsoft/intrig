import { OpenAPIV3_1 } from 'openapi-types';

export function extractSourceInfo(spec: OpenAPIV3_1.Document): OpenAPIV3_1.InfoObject | undefined {
  return spec.info;
}
