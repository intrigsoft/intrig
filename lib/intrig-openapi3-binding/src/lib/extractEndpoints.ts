import {BaseEndpointInfo, EndpointInfo, EndpointInfoWithRequestBody, Parameter, Response} from "./schema";
import {JSONSchema7} from "json-schema";
import {OpenAPIV3_1} from "openapi-types";

function isReferenceObject(obj: any): obj is OpenAPIV3_1.ReferenceObject {
  return obj && '$ref' in obj;
}

export function extractEndpointInfo(
  document: OpenAPIV3_1.Document
): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];

  for (const [path, pathItem] of Object.entries(document.paths)) {
    if (isReferenceObject(pathItem)) {
      console.warn(`Skipping reference object for path ${path}`);
      continue;
    }

    for (const method of ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const) {
      const operation = pathItem[method];
      if (operation) {
        const baseInfo: BaseEndpointInfo = {
          path,
          method,
          summary: operation.summary || '',
          description: operation.description,
          operationId: operation.operationId,
          tags: operation.tags,
          parameters: extractParameters(operation.parameters, pathItem.parameters),
          responses: extractResponses(operation.responses),
          security: operation.security,
          deprecated: operation.deprecated,
          externalDocs: operation.externalDocs,
        };

        if (operation.requestBody) {
          if (isReferenceObject(operation.requestBody)) {
            console.warn(`Skipping reference object for request body in ${method.toUpperCase()} ${path}`);
          } else {
            for (const [contentType, mediaType] of Object.entries(operation.requestBody.content)) {
              const endpointWithBody: EndpointInfoWithRequestBody = {
                ...baseInfo,
                requestBody: {
                  contentType,
                  required: operation.requestBody.required || false,
                  schema: mediaType.schema as JSONSchema7,
                },
              };
              endpoints.push(endpointWithBody);
            }
          }
        } else {
          endpoints.push(baseInfo);
        }
      }
    }
  }

  return endpoints;
}

export function extractParameters(
  operationParameters?: (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ParameterObject)[],
  pathParameters?: (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ParameterObject)[]
): Parameter[] {
  const parameters: Parameter[] = [];

  const allParameters = [...(pathParameters || []), ...(operationParameters || [])];

  for (const param of allParameters) {
    if (isReferenceObject(param)) {
      console.warn(`Skipping reference object for parameter`);
      continue;
    }

    parameters.push({
      name: param.name,
      in: param.in as 'query' | 'path' | 'header' | 'cookie',
      required: param.required || false,
      description: param.description,
      schema: param.schema as JSONSchema7,
    });
  }

  return parameters;
}

export function extractResponses(
  responses: OpenAPIV3_1.ResponsesObject
): { [statusCode: string]: Response } {
  const extractedResponses: { [statusCode: string]: Response } = {};

  for (const [statusCode, response] of Object.entries(responses)) {
    if (isReferenceObject(response)) {
      console.warn(`Skipping reference object for response ${statusCode}`);
      continue;
    }

    const extractedResponse: Response = {
      description: response.description,
    };

    if (response.content) {
      extractedResponse.content = {};
      for (const [contentType, mediaType] of Object.entries(response.content)) {
        extractedResponse.content[contentType] = {
          schema: mediaType.schema as JSONSchema7,
        };
      }
    }

    extractedResponses[statusCode] = extractedResponse;
  }

  return extractedResponses;
}
