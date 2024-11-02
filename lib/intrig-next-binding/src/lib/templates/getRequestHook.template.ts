import {camelCase, CompiledOutput, typescript} from "@intrig/cli-common";
import * as path from 'path'
import {decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

export function getRequestHookTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}.ts`))

  const modifiedRequestUrl = `/api/source${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  let variableNames = variables.map(a => a.ref.split('/').pop())

  return ts`
    import {useNetworkState} from "@intrig/client-next/intrig-provider"
    import {NetworkState} from "@intrig/client-next/network-state";
    import { ${responseType} as Response, ${responseType}Schema as schema } from "@intrig/client-next/${source}/components/schemas/${responseType}"

    import {${pascalCase(operationId)}Params} from './${pascalCase(operationId)}.params'

    export function use${pascalCase(operationId)}(key: string = "default"): [NetworkState<Response>, (params: ${pascalCase(operationId)}Params) => void, () => void] {
      let [state, dispatch, clear] = useNetworkState<Response>({
        key,
        operation: "GET ${requestUrl}",
        source: "${source}",
        schema
      });

      return [
        state,
        (p${isParamMandatory ? '' : ' = {}'}) => {
          let { ${variableExplodeExpression}} = p
          dispatch({
            method: 'get',
            url: \`${modifiedRequestUrl}\`,
            params
          })
        },
        clear
      ]
    }
  `
}
