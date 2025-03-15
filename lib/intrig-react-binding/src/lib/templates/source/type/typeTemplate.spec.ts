import {OpenAPIV3_1} from "openapi-types";
import {typeTemplate} from "./typeTemplate";

describe('generateZodTypes', () => {
  it('should generate the types', async () => {
    const apiResponseSchema: OpenAPIV3_1.SchemaObject = {
      allOf: [
        {
          $ref: '#/components/schemas/ApiResponse',
        },
        {
          type: "object",
          properties: {
            data: {
              properties: {
                name: { type: 'string', minLength: 2, maxLength: 50 },
                age: { type: 'integer', minimum: 0 },
                birthDate: { type: 'string', format: 'date', pattern: '^\\d{4}-\\d{2}-\\d{2}$'}
              },
              required: ['name'],
            },
          },
        },
      ],
    };
    const content = await typeTemplate({
      paths: [],
      typeName: "Customer",
      sourcePath: "",
      schema: apiResponseSchema,
    });//"", "Customer", apiResponseSchema
    console.log(content.content);
  });
})
