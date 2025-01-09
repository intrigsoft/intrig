import {
  camelCase,
  CompiledOutput,
  generatePostfix,
  pascalCase,
  RequestProperties,
  typescript, Variable
} from '@intrig/cli-common';
import path from 'path';

function extractParamDeconstruction(variables: Variable[], requestBody: string) {
  let isParamMandatory = variables?.some(a => a.in === 'path') || false;

  if (requestBody) {
    if (isParamMandatory) {
      return {
        paramExpression: 'data, p',
        paramType: 'data: RequestBody, params: Params'
      }
    } else {
      return {
        paramExpression: 'data, p = {}',
        paramType: 'data: RequestBody, params?: Params'
      }
    }
  } else {
    if (isParamMandatory) {
      return {
        paramExpression: 'p',
        paramType: 'params: Params'
      }
    } else {
      return {
        paramExpression: 'p = {}',
        paramType: 'params?: Params'
      }
    }
  }
}


function extractErrorParams(errorTypes: string[]) {
  switch (errorTypes.length) {
    case 0:
      return `
      export type _ErrorType = any
      const errorSchema = z.any()`
    case 1:
      return `
      export type _ErrorType = ${errorTypes[0]}
      const errorSchema = ${errorTypes[0]}Schema`
    default:
      return `
      export type _ErrorType = ${errorTypes.join(' | ')}
      const errorSchema = z.union([${errorTypes.map(a => `${a}Schema`).join(', ')}])`
  }
}

export function requestMethodTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, requestBody, contentType, responseType, errorResponses, method}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${camelCase(operationId)}${generatePostfix(contentType, responseType)}.ts`))

  const modifiedRequestUrl = `${requestUrl.replace(/\{/g, "${")}`

  let imports = new Set<string>();
  imports.add(`import { z, ZodError } from 'zod'`);
  imports.add(`import { isAxiosError } from 'axios';`);
  imports.add(`import {getAxiosInstance} from '@intrig/next/intrig-middleware'`);
  imports.add(`import {transformResponse, encode} from '@intrig/next/media-type-utils'`)
  imports.add(`import { networkError, responseValidationError } from '@intrig/next';`);
  imports.add(`import logger from "@intrig/next/logger"`)

  let { paramExpression, paramType } = extractParamDeconstruction(variables, requestBody);

  if (requestBody) {
    imports.add(`import { ${requestBody} as RequestBody, ${requestBody}Schema as requestBodySchema } from "@intrig/next/${source}/components/schemas/${requestBody}"`)
  }

  if (response) {
    imports.add(`import { ${response} as Response, ${response}Schema as schema } from "@intrig/next/${source}/components/schemas/${response}"`)
  }

  imports.add(`import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'`)

  let errorTypes = [...new Set(Object.values(errorResponses ?? {}).map(a => a.response))]
  errorTypes.forEach(ref => imports.add(`import {${ref}, ${ref}Schema } from "@intrig/next/${source}/components/schemas/${ref}"`))

  let paramExplode = [
    ...variables.filter(a => a.in === "path").map(a => a.name),
    "...params"
  ].join(",")

  let finalRequestBodyBlock = requestBody ? `data: encode(data, "${contentType}", requestBodySchema)` : ''

  let responseTypeBlock = responseType && (responseType.startsWith("application/vnd") || responseType === "application/octet-stream")
    ? `responseType: 'arraybuffer'`
    : undefined

  return ts`
    ${[...imports].join('\n')}

    ${!response ? `
    type Response = any;
    const schema = z.any();
    ` : ''}

    ${extractErrorParams(errorTypes)}

    export const execute${pascalCase(operationId)}: (${paramType}) => Promise<{data: Response, headers: any}> = async (${paramExpression}) => {
          ${requestBody ? `requestBodySchema.parse(data);` : ''}
          let {${paramExplode}} = p

          logger.info(${"`Executing request ${source}: ${operation} ${modifiedRequestUrl}`"});
          logger.debug("=>", p, ${requestBody ? "data" : ""})

          let axiosInstance = await getAxiosInstance('${source}')
          let { data: responseData, headers } = await axiosInstance.request({
            method: '${method}',
            url: \`${modifiedRequestUrl}\`,
            headers: {
              ${contentType ? `"Content-Type": "${contentType}",` : ''}
            },
            params,
            ${[
    requestBody && finalRequestBodyBlock,
    responseTypeBlock,
  ].filter(Boolean).join(',\n')}
          })

          logger.info(${"`Executed request completed ${source}: ${operation} ${modifiedRequestUrl}`"});
          logger.debug("<=", responseData, headers)

          return {
            data: responseData,
            headers
          }
    }

    export const ${camelCase(operationId)}: (${paramType}) => Promise<Response> = async (${paramExpression}) => {
      try {
        let { data: responseData, headers } = await execute${pascalCase(operationId)}(${requestBody ? 'data,' : ''} p);
        return transformResponse(responseData, "${responseType}", schema);
      } catch (e) {
        if (isAxiosError(e) && e.response) {
          logger.error("Error executing request", e.response.data)
          throw networkError(transformResponse(e.response.data, "application/json", errorSchema), e.response.status + "", e.response.request);
        } else if (e instanceof ZodError) {
          logger.error("Response validation error", e)
          throw responseValidationError(e)
        }
        logger.error("Unknown error", e)
        throw e;
      }
    }
  `
}
