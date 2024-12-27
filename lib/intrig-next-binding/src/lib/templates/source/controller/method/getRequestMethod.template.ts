import {
  camelCase,
  pascalCase,
  CompiledOutput,
  decodeVariables,
  RequestProperties,
  typescript,
  generatePostfix, decodeErrorSections
} from '@intrig/cli-common';
import * as path from 'path'

export function getRequestMethodTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, responseType, errorResponses}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${camelCase(operationId)}${generatePostfix(undefined, responseType)}.ts`))

  let {variableExplodeExpression ,isParamMandatory} = decodeVariables(variables, source);

  const modifiedRequestUrl = requestUrl.replace(/\{/g, "${")

  let { def, imports, schemaValidation } = decodeErrorSections(errorResponses, source, "@intrig/next");

  let responseTypeBlock = responseType.startsWith("application/vnd") || responseType === "application/octet-stream"
    ? `responseType: 'arraybuffer'`
    : ``

  return ts`
  import { z, ZodError } from 'zod'
  import {getAxiosInstance} from "@intrig/next/intrig-middleware";
  import { isAxiosError } from 'axios';
  import { networkError, responseValidationError } from '@intrig/next/network-state';
    import {transformResponse} from "@intrig/next/media-type-utils"
    ${response ? `import { ${response} as Response, ${response}Schema as schema } from "@intrig/next/${source}/components/schemas/${response}"` : ''}
    ${imports}
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'

    ${!response ? `
    type Response = any;
    const schema = z.any();
    ` : ''}

    export type _ErrorType = ${def}
    const errorSchema = ${schemaValidation}

    export const execute${pascalCase(operationId)}: (p: Params) => Promise<{data: Response, headers: any}> = async ({${variableExplodeExpression}} ${isParamMandatory ? '' : ' = {}'}) => {
          let axiosInstance = await getAxiosInstance('${source}')
          let { data, headers } = await axiosInstance.request({
            method: 'get',
            url: \`${modifiedRequestUrl}\`,
            params,
            ${responseTypeBlock}
          })

          return {
            data,
            headers
          };
    }

    export const ${camelCase(operationId)}: (p: Params) => Promise<Response> = async ({${variableExplodeExpression}} ${isParamMandatory ? '' : ' = {}'}) => {
      try {
        let { data: responseData } = await execute${pascalCase(operationId)}({${variableExplodeExpression}});
        return transformResponse(responseData, "${responseType}", schema)
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
