import {CompiledOutput, typescript} from "@intrig/cli-common";
import * as path from 'path'
import {decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

export function getRequestTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', "lib", source, ...paths, `${operationId}.ts`))

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  let variableNames = variables.map(a => a.ref.split('/').pop())

  return ts`
    import {useNetworkState} from "@root/intrig-provider"
    import {NetworkState} from "@root/network-state";
    import { ${response} as Response, ${response}Schema as schema } from "@root/${source}/components/schemas/${response}"
    ${variableImports}

    export interface ${pascalCase(operationId)}Params extends Record<string, any> {
      ${variableTypes}
    }

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
