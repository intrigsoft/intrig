import { camelCase, CompiledOutput, generatePostfix, getDataTransformer, typescript } from '@intrig/cli-common';
import * as path from 'path'
import {decodeDispatchParams, decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

export function putRequestHookTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath, requestBody, contentType, responseMediaType}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}${generatePostfix(contentType, responseMediaType)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  let {dispatchParamExpansion, dispatchParams} = decodeDispatchParams(operationId, requestBody, isParamMandatory);

  let finalRequestBodyBlock = getDataTransformer(contentType)

  return ts`
    import {useNetworkState} from "@intrig/client-next/intrig-provider"
    import {NetworkState} from "@intrig/client-next/network-state";
    ${requestBody ? `import { ${requestBody} as RequestBody } from "@intrig/client-next/${source}/components/schemas/${requestBody}"` : ''}
    import { ${responseType} as Response, ${responseType}Schema as schema } from "@intrig/client-next/${source}/components/schemas/${responseType}"
    ${contentType === "application/x-www-form-urlencoded" ? `import * as qs from "qs"` : ''}

    import {${pascalCase(operationId)}Params} from './${pascalCase(operationId)}.params'

    export function use${pascalCase(operationId)}(key: string = "default"): [NetworkState<Response>, (${dispatchParams}) => void, () => void] {
      let [state, dispatch, clear] = useNetworkState<Response>({
        key,
        operation: "POST ${requestUrl}",
        source: "${source}",
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
            ${finalRequestBodyBlock}
          })
        },
        clear
      ]
    }
  `
}
