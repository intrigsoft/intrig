import {
  camelCase,
  pascalCase,
  CompiledOutput,
  decodeVariables,
  RequestProperties,
  typescript,
  decodeDispatchParams, getDataTransformer, generatePostfix, decodeErrorSections
} from '@intrig/cli-common';
import * as path from 'path'
export function putRequestMethodTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, requestBody, contentType, responseType, errorResponses}: RequestProperties): CompiledOutput {

  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${camelCase(operationId)}${generatePostfix(contentType, responseType)}.ts`))

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  let {dispatchParamExpansion, dispatchParams} = decodeDispatchParams(operationId, requestBody, isParamMandatory);

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  let finalRequestBodyBlock = getDataTransformer(contentType)

  let { def, imports, schemaValidation } = decodeErrorSections(errorResponses, source, "@intrig/next");

  return ts`
  import { z, ZodError } from 'zod'
import { isAxiosError } from 'axios';
import { networkError, responseValidationError } from '@intrig/next/network-state';
  import {getAxiosInstance} from "@intrig/next/intrig-middleware";
    import {transformResponse} from "@intrig/next/media-type-utils";
    ${requestBody ? `import { ${requestBody} as RequestBody, ${requestBody}Schema as requestBodySchema } from "@intrig/next/${source}/components/schemas/${requestBody}"` : ''}
    ${response ? `import { ${response} as Response, ${response}Schema as schema } from "@intrig/next/${source}/components/schemas/${response}"` : ''}
    ${contentType === "application/x-www-form-urlencoded" ? `import * as qs from "qs"` : ''}
    ${imports}
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'

    ${!response ? `
    type Response = any;
    const schema = z.any();
    ` : ''}

    export type _ErrorType = ${def}
    const errorSchema = ${schemaValidation}

    export const execute${pascalCase(operationId)}: (${dispatchParams}) => Promise<Response> = async (${dispatchParamExpansion}) => {
          requestBodySchema.parse(data);
          let {${variableExplodeExpression}} = p
          let { data: responseData } = await getAxiosInstance('${source}').request({
            method: 'put',
            url: \`${modifiedRequestUrl}\`,
            headers: {
              "Content-Type": "${contentType}",
            },
            params,
            ${finalRequestBodyBlock}
          })

          return transformResponse(responseData, "${responseType}", schema);
    }

    export const ${camelCase(operationId)}: (${dispatchParams}) => Promise<Response> = async (${dispatchParamExpansion}) => {
      try {
        return execute${pascalCase(operationId)}(data, p);
      } catch (e) {
        if (isAxiosError(e) && e.response) {
          throw networkError(transformResponse(e.response.data, "application/json", errorSchema), e.response.status + "", e.response.request);
        } else if (e instanceof ZodError) {
          throw responseValidationError(e)
        }
        throw e;
      }
    }
  `
}
