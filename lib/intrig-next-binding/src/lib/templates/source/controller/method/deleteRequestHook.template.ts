import * as path from 'path'
import {
  CompiledOutput,
  typescript,
  decodeVariables,
  pascalCase,
  RequestProperties,
  camelCase, isParamMandatory, decodeErrorSections
} from '@intrig/cli-common';

export function deleteRequestHookTemplate({source, paths, operationId, requestUrl, variables, sourcePath, errorResponses}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, isParamMandatory} = decodeVariables(variables, source);

  let { def, imports, schemaValidation } = decodeErrorSections(errorResponses, source, "@intrig/next");

  return ts`
    import {useNetworkState} from "@intrig/next/intrig-provider"
    import {NetworkState, DeleteHook${isParamMandatory ? '' : 'Op'}, DispatchState, successfulDispatch} from "@intrig/next/network-state";
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'
    ${imports}

    const operation = "DELETE ${requestUrl}"
    const source = "${source}"

    export type _ErrorType = ${def}
    const errorSchema = ${schemaValidation}

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<unknown, _ErrorType>, (params: Params${isParamMandatory ? '' : ' | undefined'}) => DispatchState<any>, () => void] {
      let [state, dispatch, clear] = useNetworkState<unknown, _ErrorType>({
        key,
        operation,
        source,
        errorSchema
      });

      return [
        state,
        (p${isParamMandatory ? '' : ' = {}'}) => {
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

    export const use${pascalCase(operationId)}: DeleteHook${isParamMandatory ? '' : 'Op'}<Params> = use${pascalCase(operationId)}Hook;
  `
}
