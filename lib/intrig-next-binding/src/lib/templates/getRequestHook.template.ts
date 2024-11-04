import { camelCase, CompiledOutput, generatePostfix, typescript } from '@intrig/cli-common';
import * as path from 'path'
import {decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

export function getRequestHookTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath, responseMediaType}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}${generatePostfix(undefined, responseMediaType)}.ts`))

  const modifiedRequestUrl = `/api/__GENERATED__/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, isParamMandatory} = decodeVariables(variables, source);

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
