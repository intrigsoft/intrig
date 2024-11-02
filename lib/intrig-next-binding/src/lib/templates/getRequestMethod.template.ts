import {camelCase, pascalCase, CompiledOutput, decodeVariables, RequestProperties, typescript} from "@intrig/cli-common";
import * as path from 'path'

export function getRequestMethodTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${camelCase(operationId)}.ts`))

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  return ts`
    import {getAxiosInstance} from "@intrig/client-next/axios.server"
    import { ${responseType} as Response, ${responseType}Schema as schema } from "@intrig/client-next/${source}/components/schemas/${responseType}"

    import {${pascalCase(operationId)}Params} from './${pascalCase(operationId)}.params'

    export async function ${camelCase(operationId)}({${variableExplodeExpression}}: ${pascalCase(operationId)}Params): Promise<Response> {
          let { data } = await getAxiosInstance('${source}').request({
            method: 'get',
            url: \`${modifiedRequestUrl}\`,
            params
          })

          return schema.parse(data);
    }
  `
}
