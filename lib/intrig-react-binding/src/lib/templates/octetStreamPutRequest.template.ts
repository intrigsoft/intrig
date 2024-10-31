import {CompiledOutput, typescript} from "@intrig/cli-common";
import * as path from 'path'
import {decodeDispatchParams, decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";
//TODO test with the media type.
export function octetStreamPutRequestTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath, requestBody}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', "lib", source, ...paths, `${operationId}.ts`))

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  let {dispatchParamExpansion, dispatchParams} = decodeDispatchParams(operationId, requestBody, isParamMandatory);

  return ts`
    import {useNetworkState} from "@root/intrig-provider"
    import {NetworkState} from "@root/network-state";
    ${requestBody ? `import { ${requestBody} as RequestBody } from "@root/${source}/components/schemas/${requestBody}"` : ''}
    import { ${responseType} as Response, ${responseType}Schema as schema } from "@root/${source}/components/schemas/${responseType}"
    ${variableImports}

    export interface ${pascalCase(operationId)}Params extends Record<string, any> {
      ${variableTypes}
    }

    export function use${pascalCase(operationId)}(key: string = "default"): [NetworkState<Response>, (${dispatchParams}) => void, () => void] {
      let [state, dispatch, clear] = useNetworkState<Response>({
        key,
        operation: "PUT ${requestUrl}",
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
            params,
            ${requestBody ? 'data' : ''}
          })
        },
        clear
      ]
    }
  `
}
