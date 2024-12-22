import {
  camelCase,
  CompiledOutput,
  generatePostfix,
  pascalCase,
  RequestProperties,
  typescript,
  Variable
} from '@intrig/cli-common';
import path from 'path';

function extractHookShape(response: string, requestBody: string, imports: Set<string>) {
  if (!!response) {
    if (requestBody) {
      imports.add(`import { BinaryFunctionHook } from "@intrig/next"`);
      return `BinaryFunctionHook<Params, RequestBody, Response, _ErrorType>`;
    } else {
      imports.add(`import { UnaryFunctionHook } from "@intrig/next"`);
      return `UnaryFunctionHook<Params, Response, _ErrorType>`;
    }
  } else {
    if (requestBody) {
      imports.add(`import { BinaryProduceHook } from "@intrig/next"`);
      return `BinaryProduceHook<Params, RequestBody, _ErrorType>`;
    } else {
      imports.add(`import { UnaryProduceHook } from "@intrig/next"`);
      return `UnaryProduceHook<Params, _ErrorType>`;
    }
  }
}

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

export function requestHookTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, requestBody, contentType, responseType, errorResponses, method}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}${generatePostfix(contentType, responseType)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace(/\{/g, "${")}`

  let imports = new Set<string>();
  imports.add(`import { z } from 'zod'`)
  imports.add(`import { useCallback } from 'react'`)
  imports.add(`import {useNetworkState, NetworkState, DispatchState, error, successfulDispatch, validationError, encode} from "@intrig/next"`)

  let hookShape = extractHookShape(response, requestBody, imports);

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

  let finalRequestBodyBlock = requestBody ? `body: encode(data, "${contentType}", requestBodySchema)` : ''

  return ts`
    ${[...imports].join('\n')}

    ${!response ? `
    type Response = any;
    const schema = z.any();
    ` : ''}

    ${extractErrorParams(errorTypes)}

    const operation = "${method.toUpperCase()} ${requestUrl}| ${contentType} -> ${responseType}"
    const source = "${source}"

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<Response, _ErrorType>, (${paramType}) => DispatchState<any>, () => void] {
      let [state, dispatch, clear] = useNetworkState<Response, _ErrorType>({
        key,
        operation,
        source,
        schema,
        errorSchema
      });

      let doExecute = useCallback<(${paramType}) => DispatchState<any>>((${paramExpression}) => {
        let { ${paramExplode}} = p

          ${requestBody ? `
          const validationResult = requestBodySchema.safeParse(data);
          if (!validationResult.success) {
            return validationError(validationResult.error.errors);
          }
          ` : ``}

          dispatch({
            method: '${method}',
            url: \`${modifiedRequestUrl}\`,
            headers: {
              ${contentType ? `"Content-Type": "${contentType}",` : ''}
            },
            params,
            key: \`${"${source}: ${operation}"}\`,
            ${requestBody ? finalRequestBodyBlock : ''}
          })
          return successfulDispatch();
      }, [dispatch])

      return [
        state,
        doExecute,
        clear
      ]
    }

    use${pascalCase(operationId)}Hook.key = \`${"${source}: ${operation}"}\`

    export const use${pascalCase(operationId)}: ${hookShape} = use${pascalCase(operationId)}Hook;
  `
}
