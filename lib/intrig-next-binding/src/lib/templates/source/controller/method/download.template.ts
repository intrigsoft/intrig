import {
  camelCase,
  generatePostfix,
  pascalCase,
  RequestProperties,
  typescript, Variable
} from '@intrig/cli-common';
import path from 'path';

export function downloadHookTemplate(
  {
    source,
    paths,
    operationId,
    response,
    requestUrl,
    variables,
    sourcePath,
    requestBody,
    contentType,
    responseType,
    errorResponses,
    method,
  }: RequestProperties,
  clientExports: string[] = [],
  serverExports: string[] = [],
) {
  const ts = typescript(
    path.resolve(
      sourcePath,
      'src',
      source,
      ...paths,
      camelCase(operationId),
      `${pascalCase(operationId)}${generatePostfix(contentType, responseType)}Link.tsx`,
    ),
  );

  const modifiedRequestUrl = `/api/${source}${requestUrl.replace(/\{/g, '${')}`;

  const imports = new Set<string>();
  imports.add(`import Link, { LinkProps } from 'next/link'`);
  imports.add(`import React, { useMemo } from 'react'`);
  imports.add(`import qs from 'qs'`);

  imports.add(
    `import {${pascalCase(operationId)}Params as Params} from './${pascalCase(operationId)}.params'`,
  );

  const requiredParams = variables.filter((a) => a.in === 'path').map((a) => a.name);

  const paramExplode = [
    ...requiredParams,
    '...params',
  ].join(',');

  clientExports.push(`export { ${pascalCase(operationId)}Link } from './${pascalCase(operationId)}Link'`);
  serverExports.push(`export { ${pascalCase(operationId)}Link } from './${pascalCase(operationId)}Link'`);

  return ts`
    ${[...imports].join('\n')}

    export interface ${pascalCase(operationId)}LinkProps extends Omit<LinkProps, 'href'> {
      params${requiredParams?.length ? '' : '?'}: Params
      children: React.ReactNode
    }

    export function ${pascalCase(operationId)}Link({params: p, children, ...props}: ${pascalCase(operationId)}LinkProps) {
      const href = useMemo(() => {
        let { ${paramExplode}} = p ?? {}

        return ${'`'}${modifiedRequestUrl}?${'${qs.stringify(params)}'}${'`'}
      }, [p])

      return <Link href={href} {...props} download>{children}</Link>
    }
  `;
}
