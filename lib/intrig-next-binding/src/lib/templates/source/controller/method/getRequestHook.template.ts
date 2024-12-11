import {
  camelCase,
  CompiledOutput,
  decodeErrorSections,
  extractParams,
  generatePostfix,
  typescript
} from '@intrig/cli-common';
import * as path from 'path'
import {decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

export function getRequestHookTemplate(properties: RequestProperties): CompiledOutput {
  let {source, paths, operationId, response, requestUrl, variables, sourcePath, responseType, errorResponses} = properties;
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}${generatePostfix(undefined, responseType)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace(/\{/g, "${")}`

  let {variableExplodeExpression, isParamMandatory} = decodeVariables(variables, source);

  let {dispatchParamExpansion, dispatchParams, shape, shapeImport} = extractParams(properties);

  let { def, imports, schemaValidation } = decodeErrorSections(errorResponses, source, "@intrig/next");

  return ts`
    import { z } from 'zod'
    import {useNetworkState} from "@intrig/next/intrig-provider"
    import {NetworkState, ${shapeImport}, DispatchState, successfulDispatch} from "@intrig/next";
    ${response ? `import { ${response} as Response, ${response}Schema as schema } from "@intrig/next/${source}/components/schemas/${response}"` : ''}
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'
    ${imports}
    ${!response ? `
    type Response = any;
    const schema = z.any();
    ` : ''}
    export type _ErrorType = ${def}
    const errorSchema = ${schemaValidation}

    const operation = "GET ${requestUrl}| -> ${responseType}"
    const source = "${source}"

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<Response, _ErrorType>, (${dispatchParams}) => DispatchState<any>, () => void] {
      let [state, dispatch, clear] = useNetworkState<Response, _ErrorType>({
        key,
        operation,
        source,
        schema,
        errorSchema
      });

      return [
        state,
        (${dispatchParamExpansion}) => {
          let { ${variableExplodeExpression}} = p
          dispatch({
            method: 'get',
            url: \`${modifiedRequestUrl}\`,
            params,
            key: \`${"${source}: ${operation}"}\`
          })
          return successfulDispatch();
        },
        clear
      ]
    }

    use${pascalCase(operationId)}Hook.key = \`${"${source}: ${operation}"}\`

    export const use${pascalCase(operationId)}: ${shape} = use${pascalCase(operationId)}Hook;
  `
}
