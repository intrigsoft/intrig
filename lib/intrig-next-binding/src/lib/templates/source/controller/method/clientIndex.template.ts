import {
  camelCase,
  CompiledOutput,
  generatePostfix,
  pascalCase,
  RequestProperties,
  typescript
} from '@intrig/cli-common';
import * as path from 'path'

export function clientIndexTemplate({source, paths, operationId, response, requestUrl, variables, sourcePath, responseType}: RequestProperties): CompiledOutput {

  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `client.ts`))

  return ts`
    export * from './use${pascalCase(operationId)}'
  `
}
