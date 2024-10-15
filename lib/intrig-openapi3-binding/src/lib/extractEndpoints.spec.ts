import { OpenAPIV3_1 } from 'openapi-types';
import {
  extractEndpointInfo, extractParameters, extractResponses
} from './extractEndpoints';  // Assume the previous code is in this file

describe('OpenAPI 3.1 Endpoint Information Extractor', () => {
  describe('extractEndpointInfo', () => {
    it('should extract basic endpoint info', () => {
      const document: OpenAPIV3_1.Document = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              summary: 'Get users',
              responses: {
                '200': {
                  description: 'Successful response',
                  content: {
                    'application/json': {
                      schema: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const result = extractEndpointInfo(document);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        path: '/users',
        method: 'get',
        summary: 'Get users',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      });
    });

    it('should handle endpoints with request bodies', () => {
      const document: OpenAPIV3_1.Document = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            post: {
              summary: 'Create user',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { type: 'object', properties: { name: { type: 'string' } } }
                  }
                }
              },
              responses: {
                '201': { description: 'Created' }
              }
            }
          }
        }
      };

      const result = extractEndpointInfo(document);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        path: '/users',
        method: 'post',
        summary: 'Create user',
        requestBody: {
          contentType: 'application/json',
          required: true,
          schema: { type: 'object', properties: { name: { type: 'string' } } }
        },
        responses: {
          '201': { description: 'Created' }
        }
      });
    });

    it('should handle multiple methods for the same path', () => {
      const document: OpenAPIV3_1.Document = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: { summary: 'Get users', responses: { '200': { description: 'OK' } } },
            post: { summary: 'Create user', responses: { '201': { description: 'Created' } } }
          }
        }
      };

      const result = extractEndpointInfo(document);

      expect(result).toHaveLength(2);
      expect(result[0].method).toBe('get');
      expect(result[1].method).toBe('post');
    });

    it('should handle parameters at path and operation level', () => {
      const document: OpenAPIV3_1.Document = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users/{userId}': {
            parameters: [
              { name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }
            ],
            get: {
              summary: 'Get user',
              parameters: [
                { name: 'fields', in: 'query', schema: { type: 'string' } }
              ],
              responses: { '200': { description: 'OK' } }
            }
          }
        }
      };

      const result = extractEndpointInfo(document);

      expect(result).toHaveLength(1);
      expect(result[0].parameters).toHaveLength(2);
      expect(result[0].parameters[0]).toMatchObject({ name: 'userId', in: 'path', required: true });
      expect(result[0].parameters[1]).toMatchObject({ name: 'fields', in: 'query' });
    });
  });

  describe('extractParameters', () => {
    it('should combine path and operation parameters', () => {
      const pathParams: OpenAPIV3_1.ParameterObject[] = [
        { name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }
      ];
      const operationParams: OpenAPIV3_1.ParameterObject[] = [
        { name: 'fields', in: 'query', schema: { type: 'string' } }
      ];

      const result = extractParameters(operationParams, pathParams);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ name: 'userId', in: 'path', required: true });
      expect(result[1]).toMatchObject({ name: 'fields', in: 'query', required: false });
    });

    it('should handle empty parameter arrays', () => {
      const result = extractParameters([], []);
      expect(result).toHaveLength(0);
    });
  });

  describe('extractResponses', () => {
    it('should extract response objects correctly', () => {
      const responses: OpenAPIV3_1.ResponsesObject = {
        '200': {
          description: 'OK',
          content: {
            'application/json': {
              schema: { type: 'object', properties: { id: { type: 'integer' } } }
            }
          }
        },
        '404': { description: 'Not Found' }
      };

      const result = extractResponses(responses);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['200']).toMatchObject({
        description: 'OK',
        content: {
          'application/json': {
            schema: { type: 'object', properties: { id: { type: 'integer' } } }
          }
        }
      });
      expect(result['404']).toMatchObject({ description: 'Not Found' });
    });

    it('should handle responses without content', () => {
      const responses: OpenAPIV3_1.ResponsesObject = {
        '204': { description: 'No Content' }
      };

      const result = extractResponses(responses);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result['204']).toMatchObject({ description: 'No Content' });
      expect(result['204'].content).toBeUndefined();
    });
  });
});
