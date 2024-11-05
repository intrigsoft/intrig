import { camelCase, CompiledOutput, generatePostfix, typescript } from '@intrig/cli-common';
import * as path from 'path'
import {decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

export function getRequestHookTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath, responseMediaType}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}${generatePostfix(undefined, responseMediaType)}.ts`))

  const modifiedRequestUrl = `/api/__GENERATED__/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, isParamMandatory} = decodeVariables(variables, source);

  return ts`
    import {useNetworkState} from "@intrig/client-next/src/intrig-provider"
    import {NetworkState, GetHook${isParamMandatory ? '' : 'Op'}} from "@intrig/client-next/src/network-state";
    import { ${responseType} as Response, ${responseType}Schema as schema } from "@intrig/client-next/src/${source}/components/schemas/${responseType}"
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'

    const operation = "GET ${requestUrl}| -> ${responseMediaType}"
    const source = "${source}"

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<Response>, (params: Params${isParamMandatory ? '' : ' | undefined'}) => void, () => void] {
      let [state, dispatch, clear] = useNetworkState<Response>({
        key,
        operation,
        source,
        schema
      });

      return [
        state,
        (p${isParamMandatory ? '' : ' = {}'}) => {
          let { ${variableExplodeExpression}} = p
          dispatch({
            method: 'get',
            url: \`${modifiedRequestUrl}\`,
            params,
            key: \`${"${source}: ${operation}"}\`
          })
        },
        clear
      ]
    }

    use${pascalCase(operationId)}Hook.key = \`${"${source}: ${operation}"}\`

    export const use${pascalCase(operationId)}: GetHook${isParamMandatory ? '' : 'Op'}<Params, Response> = use${pascalCase(operationId)}Hook;
  `
}
