import {CompiledOutput, typescript} from "@intrig/cli-common";
import * as path from 'path'
import {pascalCase} from '../change-case'
import {RequestProperties} from "../util";
//TODO test with the media type.
export function octetStreamPutRequestTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath, requestBody}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', "lib", source, ...paths, `${operationId}.ts`))

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  return ts`
    import {useNetworkState} from "@root/intrig-provider"
    import {NetworkState} from "@root/network-state";
    ${requestBody ? `import { ${requestBody} as RequestBody } from "@root/${source}/components/schemas/${requestBody}"` : ''}
    import { ${responseType} as Response } from "@root/${source}/components/schemas/${responseType}"
    ${variables.map(({ref}) => `import { ${ref.split('/').pop()} } from "@root/${source}/components/schemas/${ref.split('/').pop()}"`).join("\n")}

    export interface ${pascalCase(operationId)}Params extends Record<string, any> {
      ${variables.map((p) => `${p.name}${p.in === "path" ? "": "?"}: ${p.ref.split('/').pop()}`).join("\n")}
    }

    export function use${pascalCase(operationId)}(key: string = "default"): [NetworkState<Response>, (${[
      requestBody ? `data: RequestBody` : undefined,
      `params: ${pascalCase(operationId)}Params`
  ].filter(Boolean).join(', ')}) => void, () => void] {
      let [state, dispatch, clear] = useNetworkState<NetworkState<Response>>(key, "GET ${requestUrl}", "${source}");

      return [
        state,
        (${requestBody ? 'data,': ''} p${variables.some(a => a.in === 'path') ? '' : ' = {}'}) => {
          let { ${[
    ...variables.filter(a => a.in === "path").map(a => a.name),
    "...params"
  ].join(",")}} = p
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
