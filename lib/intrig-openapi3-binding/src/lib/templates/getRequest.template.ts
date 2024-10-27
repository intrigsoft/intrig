import {CompiledOutput, typescript} from "@intrig/cli-common";
import * as path from 'path'
import {pascalCase} from '../change-case'
import {RequestProperties} from "../util";

export function getRequestTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', "lib", source, ...paths, `${operationId}.ts`))

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  let variableNames = variables.map(a => a.ref.split('/').pop())

  return ts`
    import {useNetworkState} from "@root/intrig-provider"
    import {NetworkState} from "@root/network-state";
    import { ${responseType} as Response } from "@root/${source}/components/schemas/${responseType}"
    ${variableNames.map((name) => `import { ${name} } from "@root/${source}/components/schemas/${name}"`).join("\n")}

    export interface ${pascalCase(operationId)}Params extends Record<string, any> {
      ${variables.map((p) => `${p.name}${p.in === "path" ? "": "?"}: ${p.ref.split('/').pop()}`).join("\n")}
    }

    export function use${pascalCase(operationId)}(key: string = "default"): [NetworkState<Response>, (params: ${pascalCase(operationId)}Params) => void, () => void] {
      let [state, dispatch, clear] = useNetworkState<NetworkState<Response>>(key, "GET ${requestUrl}", "${source}");

      return [
        state,
        (p${variables.some(a => a.in === 'path') ? '' : ' = {}'}) => {
          let { ${[
    ...variables.filter(a => a.in === "path").map(a => a.name),
    "...params"
  ].join(",")}} = p
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
