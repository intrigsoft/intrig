import {camelCase, decodeVariables, pascalCase, RequestProperties, typescript} from "@intrig/cli-common";
import * as path from "path";

export function paramsTemplate({source, paths, operationId, requestUrl, variables, sourcePath}: RequestProperties) {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${pascalCase(operationId)}.params.ts`))

  let {variableImports, variableTypes} = decodeVariables(variables, source, "@intrig/react/src");

  return ts`
     ${variableImports}

     export interface ${pascalCase(operationId)}Params extends Record<string, any> {
      ${variableTypes}
    }
  `
}
