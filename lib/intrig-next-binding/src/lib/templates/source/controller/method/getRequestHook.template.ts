import { camelCase, CompiledOutput, generatePostfix, typescript } from '@intrig/cli-common';
import * as path from 'path'
import {decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

export function getRequestHookTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, responseType}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}${generatePostfix(undefined, responseType)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, isParamMandatory} = decodeVariables(variables, source);

  return ts`
    import { z } from 'zod'
    import {useNetworkState} from "@intrig/client-next/src/intrig-provider"
    import {NetworkState, GetHook${isParamMandatory ? '' : 'Op'}, DispatchState, successfulDispatch} from "@intrig/client-next";
    ${response ? `import { ${response} as Response, ${response}Schema as schema } from "@intrig/client-next/src/${source}/components/schemas/${response}"` : ''}
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'
    ${!response ? `
    type Response = any;
    const schema = z.any();
    ` : ''}

    const operation = "GET ${requestUrl}| -> ${responseType}"
    const source = "${source}"

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<Response>, (params: Params${isParamMandatory ? '' : ' | undefined'}) => DispatchState<any>, () => void] {
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
          return successfulDispatch();
        },
        clear
      ]
    }

    use${pascalCase(operationId)}Hook.key = \`${"${source}: ${operation}"}\`

    export const use${pascalCase(operationId)}: GetHook${isParamMandatory ? '' : 'Op'}<Params, Response> = use${pascalCase(operationId)}Hook;
  `
}
