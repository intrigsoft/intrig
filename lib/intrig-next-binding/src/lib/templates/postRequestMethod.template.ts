import {
  camelCase,
  pascalCase,
  CompiledOutput,
  decodeVariables,
  RequestProperties,
  typescript,
  decodeDispatchParams, getDataTransformer, generatePostfix
} from '@intrig/cli-common';
import * as path from 'path'

const mediaTypeExtMapping = {
  "application/json": "",
  "multipart/form-data": ".multipart",
  "application/octet-stream": ".bin",
  "application/x-www-form-urlencoded": ".form",
  "application/xml": ".xml"
}

export function postRequestMethodTemplate({source, paths, operationId, responseType, requestUrl, variables, sourcePath, requestBody, contentType, responseMediaType}: RequestProperties): CompiledOutput {

  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${camelCase(operationId)}${generatePostfix(contentType, responseMediaType)}.ts`))

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  let {dispatchParamExpansion, dispatchParams} = decodeDispatchParams(operationId, requestBody, isParamMandatory);

  const modifiedRequestUrl = requestUrl.replace("{", "${")

  let finalRequestBodyBlock = getDataTransformer(contentType)

  return ts`
    import {getAxiosInstance} from "@intrig/client-next/axios.server"
    import {transformResponse} from "@intrig/client-next/media-type-utils";
    ${requestBody ? `import { ${requestBody} as RequestBody } from "@intrig/client-next/${source}/components/schemas/${requestBody}"` : ''}
    import { ${responseType} as Response, ${responseType}Schema as schema } from "@intrig/client-next/${source}/components/schemas/${responseType}"
    ${contentType === "application/x-www-form-urlencoded" ? `import * as qs from "qs"` : ''}

    import {${pascalCase(operationId)}Params} from './${pascalCase(operationId)}.params'

    export const ${camelCase(operationId)}: (${dispatchParams}) => Promise<Response> = async (${dispatchParamExpansion}) => {
          let {${variableExplodeExpression}} = p
          let { data: responseData } = await getAxiosInstance('${source}').request({
            method: 'post',
            url: \`${modifiedRequestUrl}\`,
            headers: {
              "Content-Type": "${contentType}",
            },
            params,
            ${finalRequestBodyBlock}
          })

          return transformResponse(responseData, "${responseMediaType}", schema);
    }
  `
}
