import { camelCase, CompiledOutput, generatePostfix, getDataTransformer, typescript } from '@intrig/cli-common';
import * as path from 'path'
import {decodeDispatchParams, decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

export function putRequestHookTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath, requestBody, contentType, responseMediaType}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}${generatePostfix(contentType, responseMediaType)}.ts`))

  const modifiedRequestUrl = `/api/__GENERATED__/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  let {dispatchParamExpansion, dispatchParams} = decodeDispatchParams(operationId, requestBody, isParamMandatory);

  let finalRequestBodyBlock = getDataTransformer(contentType)

  return ts`
    import {useNetworkState} from "@intrig/client-next/src/intrig-provider"
    import {NetworkState, PutHook${isParamMandatory ? '' : 'Op'}} from "@intrig/client-next/network-state";
    ${requestBody ? `import { ${requestBody} as RequestBody } from "@intrig/client-next/src/${source}/components/schemas/${requestBody}"` : ''}
    import { ${responseType} as Response, ${responseType}Schema as schema } from "@intrig/client-next/src/${source}/components/schemas/${responseType}"
    ${contentType === "application/x-www-form-urlencoded" ? `import * as qs from "qs"` : ''}
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'

    const operation = "PUT ${requestUrl}| ${contentType} -> ${responseMediaType}"
    const source = "${source}"

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<Response>, (${dispatchParams}) => void, () => void] {
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
        },
        clear
      ]
    }

    use${pascalCase(operationId)}Hook.key = \`${"${source}: ${operation}"}\`

    export const use${pascalCase(operationId)}: PutHook${isParamMandatory ? '' : 'Op'}<Params, RequestBody, Response> = use${pascalCase(operationId)}Hook;


  `
}
