import * as path from 'path'
import {
  CompiledOutput,
  typescript,
  decodeVariables,
  pascalCase,
  RequestProperties,
  camelCase, isParamMandatory, decodeErrorSections, extractParams
} from '@intrig/cli-common';

export function deleteRequestHookTemplate(properties: RequestProperties): CompiledOutput {
  let {source, paths, operationId, requestUrl, variables, sourcePath, errorResponses} = properties;

  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace(/\{/g, "${")}`

  let {variableExplodeExpression, isParamMandatory} = decodeVariables(variables, source);

  let {dispatchParamExpansion, dispatchParams, shape, shapeImport} = extractParams(properties);

  let { def, imports, schemaValidation } = decodeErrorSections(errorResponses, source, "@intrig/next");

  return ts`
    import { z } from 'zod'
    import {useNetworkState} from "@intrig/next/intrig-provider"
    import {NetworkState, ${shapeImport}, DispatchState, successfulDispatch} from "@intrig/next/network-state";
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'
    ${imports}

    const operation = "DELETE ${requestUrl}"
    const source = "${source}"

    export type _ErrorType = ${def}
    const errorSchema = ${schemaValidation}

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<unknown, _ErrorType>, (${dispatchParams}) => DispatchState<any>, () => void] {
      let [state, dispatch, clear] = useNetworkState<unknown, _ErrorType>({
        key,
        operation,
        source,
        errorSchema
      });

      return [
        state,
        (${dispatchParamExpansion}) => {
          let { ${variableExplodeExpression}} = p
          dispatch({
            method: 'delete',
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
