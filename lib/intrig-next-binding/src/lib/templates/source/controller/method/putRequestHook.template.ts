import { camelCase, CompiledOutput, generatePostfix, getDataTransformer, typescript } from '@intrig/cli-common';
import * as path from 'path'
import {decodeDispatchParams, decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

export function putRequestHookTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, requestBody, contentType, responseType}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}${generatePostfix(contentType, responseType)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  let {dispatchParamExpansion, dispatchParams} = decodeDispatchParams(operationId, requestBody, isParamMandatory);

  let finalRequestBodyBlock = getDataTransformer(contentType)

  return ts`
  import { z } from 'zod'
    import {useNetworkState} from "@intrig/next/src/intrig-provider"
    import {NetworkState, PutHook${isParamMandatory ? '' : 'Op'}, error, DispatchState, successfulDispatch, validationError} from "@intrig/next";
    ${requestBody ? `import { ${requestBody} as RequestBody, ${requestBody}Schema as requestBodySchema } from "@intrig/next/src/${source}/components/schemas/${requestBody}"` : ''}
    ${response ? `import { ${response} as Response, ${response}Schema as schema } from "@intrig/next/src/${source}/components/schemas/${response}"` : ''}
    ${contentType === "application/x-www-form-urlencoded" ? `import * as qs from "qs"` : ''}
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'

    ${!response ? `
    type Response = any;
    const schema = z.any();
    ` : ''}

    const operation = "PUT ${requestUrl}| ${contentType} -> ${responseType}"
    const source = "${source}"

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<Response>, (${dispatchParams}) => DispatchState<any>, () => void] {
      let [state, dispatch, clear] = useNetworkState<Response>({
        key,
        operation,
        source,
        schema
      });

      return [
        state,
        (${dispatchParamExpansion}) => {
          let { ${variableExplodeExpression}} = p

          ${requestBody ? `
          const validationResult = requestBodySchema.safeParse(data);
          if (!validationResult.success) {
            return validationError(validationResult.error.errors);
          }
          ` : ``}

          dispatch({
            method: 'put',
            url: \`${modifiedRequestUrl}\`,
            headers: {
              "Content-Type": "${contentType}",
            },
            params,
            ${finalRequestBodyBlock},
            key: \`${"${source}: ${operation}"}\`
          })
          return successfulDispatch();
        },
        clear
      ]
    }

    use${pascalCase(operationId)}Hook.key = \`${"${source}: ${operation}"}\`

    export const use${pascalCase(operationId)}: PutHook${isParamMandatory ? '' : 'Op'}<Params, RequestBody, Response> = use${pascalCase(operationId)}Hook;


  `
}
