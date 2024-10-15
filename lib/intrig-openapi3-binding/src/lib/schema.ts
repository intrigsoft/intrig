import { JSONSchema7 } from "json-schema";

export interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required: boolean;
  description?: string;
  schema: JSONSchema7;
}

export interface ResponseContent {
  [contentType: string]: {
    schema: JSONSchema7;
  };
}

export interface Response {
  description: string;
  content?: ResponseContent;
}

export interface SecurityRequirement {
  [name: string]: string[];
}

export interface ExternalDocs {
  description?: string;
  url: string;
}

export interface BaseEndpointInfo {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  summary: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters: Parameter[];
  responses: {
    [statusCode: string]: Response;
  };
  security?: SecurityRequirement[];
  deprecated?: boolean;
  externalDocs?: ExternalDocs;
}

export interface RequestBody {
  contentType: string;
  required: boolean;
  schema: JSONSchema7;
}

export interface EndpointInfoWithRequestBody extends BaseEndpointInfo {
  requestBody: RequestBody;
}

export type EndpointInfo = BaseEndpointInfo | EndpointInfoWithRequestBody;

export function isEndpointInfoWithRequestBody(endpoint: EndpointInfo): endpoint is EndpointInfoWithRequestBody {
  return 'requestBody' in endpoint;
}
