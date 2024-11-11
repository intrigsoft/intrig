import { OpenAPIV3_1 } from 'openapi-types';

export function extractSourceInfo(spec: OpenAPIV3_1.Document) {
  return {
    info: spec.info,
    servers: spec.servers,
    externalDocs: spec.externalDocs
  };
}
