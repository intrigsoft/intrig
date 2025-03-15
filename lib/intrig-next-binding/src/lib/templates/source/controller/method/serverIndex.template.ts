import {
  camelCase,
  generatePostfix,
  RequestProperties,
  typescript
} from '@intrig/cli-common';
import * as path from 'path'

export function serverIndexTemplate(requestProperties: RequestProperties[]) {

  const {source, paths, operationId, sourcePath, responseType, contentType} = requestProperties[0]

  const ts = typescript(path.resolve(sourcePath, 'src', source, ...paths, camelCase(operationId), `server.ts`))

  if (requestProperties.length === 1) return ts`
    export { ${camelCase(operationId)} } from './${camelCase(operationId)}${generatePostfix(contentType, responseType)}'
  `

  const exports = requestProperties
    .map(({contentType, responseType}) => {
      return `export { ${camelCase(operationId)} as ${camelCase(operationId)}${generatePostfix(contentType, responseType)} } from './${camelCase(operationId)}${generatePostfix(contentType, responseType)}'`
    })
    .join('\n');

  return ts`
    ${exports}
  `
}
