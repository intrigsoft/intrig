import {camelCase, pascalCase, CompiledOutput, decodeVariables, RequestProperties, typescript} from "@intrig/cli-common";
import * as path from 'path'

export function deleteRequestMethodTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${camelCase(operationId)}.ts`))

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  return ts`
    import {getAxiosInstance} from "@intrig/client-next/src/intrig-middleware";
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'

    export const ${camelCase(operationId)}: (p: Params) => Promise<${responseType ?? 'unknown'}> = async ({${variableExplodeExpression}} ${isParamMandatory ? '' : ' = {}'}) => {
          let result = await getAxiosInstance('${source}').request({
            method: 'delete',
            url: \`${modifiedRequestUrl}\`,
            params
          })

          return result.data;
    }
  `
}
