import {
  camelCase,
  pascalCase,
  CompiledOutput,
  decodeVariables,
  RequestProperties,
  typescript,
  decodeErrorSections
} from '@intrig/cli-common';
import * as path from 'path'

export function deleteRequestMethodTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, errorResponses}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${camelCase(operationId)}.ts`))

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  let { def, imports, schemaValidation } = decodeErrorSections(errorResponses, source, "@intrig/next");

  return ts`
    import {getAxiosInstance} from "@intrig/next/intrig-middleware";
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'
    ${imports}
    import { isAxiosError } from 'axios';
    import { networkError, responseValidationError } from '@intrig/next/network-state';
    import { ZodError } from 'zod';

    export type _ErrorType = ${def}
    const errorSchema = ${schemaValidation}

    export const execute${pascalCase(operationId)}: (p: Params) => Promise<${response ?? 'unknown'}> = async ({${variableExplodeExpression}} ${isParamMandatory ? '' : ' = {}'}) => {
          let result = await getAxiosInstance('${source}').request({
            method: 'delete',
            url: \`${modifiedRequestUrl}\`,
            params
          })

          return result.data;
    }

    export const ${camelCase(operationId)}: (p: Params) => Promise<unknown> = async ({${variableExplodeExpression}} ${isParamMandatory ? '' : ' = {}'}) => {
      try {
        return execute${pascalCase(operationId)}({${variableExplodeExpression}});
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
