import * as path from 'path'
import {
  CompiledOutput,
  typescript,
  decodeVariables,
  pascalCase,
  RequestProperties,
  camelCase, isParamMandatory
} from '@intrig/cli-common';

export function deleteRequestHookTemplate({source, paths, operationId, requestUrl, variables, sourcePath}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, isParamMandatory} = decodeVariables(variables, source);

  return ts`
    import {useNetworkState} from "@intrig/next/src/intrig-provider"
    import {NetworkState, DeleteHook${isParamMandatory ? '' : 'Op'}, DispatchState, successfulDispatch} from "@intrig/next/network-state";
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'

    const operation = "DELETE ${requestUrl}"
    const source = "${source}"

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<unknown>, (params: Params${isParamMandatory ? '' : ' | undefined'}) => DispatchState<any>, () => void] {
      let [state, dispatch, clear] = useNetworkState<unknown>({
        key,
        operation,
        source,
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
