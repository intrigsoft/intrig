import {
  camelCase,
  pascalCase,
  CompiledOutput,
  decodeVariables,
  RequestProperties,
  typescript,
  generatePostfix
} from '@intrig/cli-common';
import * as path from 'path'

export function getRequestMethodTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, responseType}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${camelCase(operationId)}${generatePostfix(undefined, responseType)}.ts`))

  let {variableExplodeExpression ,isParamMandatory} = decodeVariables(variables, source);

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  return ts`
  import { z } from 'zod'
  import {getAxiosInstance} from "@intrig/client-next/src/intrig-middleware";
    import {transformResponse} from "@intrig/client-next/src/media-type-utils"
    ${response ? `import { ${response} as Response, ${response}Schema as schema } from "@intrig/client-next/src/${source}/components/schemas/${response}"` : ''}

    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'

    ${!response ? `
    type Response = any;
    const schema = z.any();
    ` : ''}

    export const ${camelCase(operationId)}: (p: Params) => Promise<Response> = async ({${variableExplodeExpression}} ${isParamMandatory ? '' : ' = {}'}) => {
          let { data } = await getAxiosInstance('${source}').request({
            method: 'get',
            url: \`${modifiedRequestUrl}\`,
            params
          })

          return transformResponse(data, "${responseType}", schema);
    }
  `
}
