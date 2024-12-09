import { camelCase, CompiledOutput, decodeErrorSections, generatePostfix, getDataTransformer, typescript } from '@intrig/cli-common';
import * as path from 'path'
import {decodeDispatchParams, decodeVariables, pascalCase, RequestProperties} from "@intrig/cli-common";

const mediaTypeExtMapping = {
  "application/json": "",
  "multipart/form-data": ".multipart",
  "application/octet-stream": ".bin",
  "application/x-www-form-urlencoded": ".form",
  "application/xml": ".xml"
}

export function postRequestHookTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, requestBody, contentType, responseType, errorResponses}: RequestProperties): CompiledOutput {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `use${pascalCase(operationId)}${generatePostfix(contentType, responseType)}.ts`))

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace("{", "${")}`

  let {variableExplodeExpression, variableImports, variableTypes, isParamMandatory} = decodeVariables(variables, source);

  let {dispatchParamExpansion, dispatchParams} = decodeDispatchParams(operationId, requestBody, isParamMandatory);

  let { def, imports, schemaValidation } = decodeErrorSections(errorResponses, source, "@intrig/react");

  let finalRequestBodyBlock = getDataTransformer(contentType)

  return ts`
    import { z } from 'zod'
    import {useNetworkState} from "@intrig/react/intrig-provider"
    import {NetworkState, PostHook${isParamMandatory ? '' : 'Op'}, DispatchState, error, successfulDispatch, validationError} from "@intrig/react";
    ${requestBody ? `import { ${requestBody} as RequestBody, ${requestBody}Schema as requestBodySchema } from "@intrig/react/${source}/components/schemas/${requestBody}"` : ''}
    ${response ? `import { ${response} as Response, ${response}Schema as schema } from "@intrig/react/${source}/components/schemas/${response}"` : ''}
    ${contentType === "application/x-www-form-urlencoded" ? `import * as qs from "qs"` : ''}
    import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'
    ${imports}

    ${!response ? `
    type Response = any;
    const schema = z.any();
    ` : ''}

    export type _ErrorType = ${def}
    const errorSchema = ${schemaValidation}

    const operation = "POST ${requestUrl}| ${contentType} -> ${responseType}"
    const source = "${source}"

    function use${pascalCase(operationId)}Hook(key: string = "default"): [NetworkState<Response, _ErrorType>, (${dispatchParams}) => DispatchState<any>, () => void] {
      let [state, dispatch, clear] = useNetworkState<Response, _ErrorType>({
        key,
        operation,
        source,
        schema,
        errorSchema
      });

      return [
        state,
        (${dispatchParamExpansion}) => {
          let { ${variableExplodeExpression}} = p

          ${requestBody ? `
          const validationResult = requestBodySchema.safeParse(data);
          if (!validationResult.success) {
            return validationError(validationResult.error.errors);
          }
          ` : ``}

          dispatch({
            method: 'post',
            url: \`${modifiedRequestUrl}\`,
            headers: {
              "Content-Type": "${contentType}",
            },
            params,
            ${finalRequestBodyBlock},
            key: \`${"${source}: ${operation}"}\`,
            source: '${source}'
          })
          return successfulDispatch();
        },
        clear
      ]
    }

    use${pascalCase(operationId)}Hook.key = \`${"${source}: ${operation}"}\`

    export const use${pascalCase(operationId)}: PostHook${isParamMandatory ? '' : 'Op'}<Params, RequestBody, Response> = use${pascalCase(operationId)}Hook;
  `
}
