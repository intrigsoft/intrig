import {
  camelCase,
  generatePostfix,
  pascalCase,
  RequestProperties,
  typescript
} from '@intrig/cli-common';
import * as path from 'path'

export function clientIndexTemplate(
  requestProperties: RequestProperties[],
  clientExports: string[] = [],
) {
  const { source, paths, operationId, sourcePath, responseType, contentType } =
    requestProperties[0];

  const ts = typescript(
    path.resolve(
      sourcePath,
      'src',
      source,
      ...paths,
      camelCase(operationId),
      `client.ts`,
    ),
  );

  // if (requestProperties.length === 1)
  //   return ts`
  //   export { use${pascalCase(operationId)} } from './use${pascalCase(operationId)}${generatePostfix(contentType, responseType)}'
  // `;
  //
  // const exports = requestProperties
  //   .map(({ contentType, responseType }) => {
  //     return `export { use${pascalCase(operationId)} as use${pascalCase(operationId)}${generatePostfix(contentType, responseType)} } from './use${pascalCase(operationId)}${generatePostfix(contentType, responseType)}'`;
  //   })
  //   .join('\n');

  return ts`
    ${clientExports.join('\n')}
  `;
}
