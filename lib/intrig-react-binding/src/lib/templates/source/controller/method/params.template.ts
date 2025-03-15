import {camelCase, decodeVariables, pascalCase, RequestProperties, typescript} from "@intrig/cli-common";
import * as path from "path";

export async function paramsTemplate({source, paths, operationId, variables, sourcePath}: RequestProperties) {
  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `${pascalCase(operationId)}.params.ts`))

  const {variableImports, variableTypes} = decodeVariables(variables, source, "@intrig/react");

  return ts`
     ${variableImports}

     export interface ${pascalCase(operationId)}Params extends Record<string, any> {
      ${variableTypes}
    }
  `
}
