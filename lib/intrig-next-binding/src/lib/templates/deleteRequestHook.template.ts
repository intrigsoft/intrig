import * as path from 'path'
import {
  CompiledOutput,
  typescript,
  decodeVariables,
  pascalCase,
  RequestProperties,
  camelCase
} from "@intrig/cli-common";

export function deleteRequestHookTemplate({source, paths, operationId, requestUrl, variables, sourcePath}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, isParamMandatory} = decodeVariables(variables, source);

  return ts`
    import {useNetworkState} from "@intrig/client-next/intrig-provider"
    import {NetworkState} from "@intrig/client-next/network-state";
    import {${pascalCase(operationId)}Params} from './${pascalCase(operationId)}.params'

    export function use${pascalCase(operationId)}(key: string = "default"): [NetworkState<unknown>, (params: ${pascalCase(operationId)}Params) => void, () => void] {
      let [state, dispatch, clear] = useNetworkState<unknown>({
        key,
        operation: "DELETE ${requestUrl}",
        source: "${source}",
      });

      return [
        state,
        (p${isParamMandatory ? '' : ' = {}'}) => {
          let { ${variableExplodeExpression}} = p
          dispatch({
            method: 'delete',
            url: \`${modifiedRequestUrl}\`,
            params
          })
        },
        clear
      ]
    }
  `
}
