import {
  camelCase,
  generatePostfix,
  pascalCase,
  RequestProperties,
  typescript, Variable
} from '@intrig/cli-common';
import path from 'path';

function extractHookShapeAndOptionsShape(response: string, requestBody: string, imports: Set<string>) {
  if (response) {
    if (requestBody) {
      imports.add(`import { BinaryFunctionHook, BinaryHookOptions } from "@intrig/next"`);
      return {
        hookShape: `BinaryFunctionHook<Params, RequestBody, Response, _ErrorType>`,
        optionsShape: `BinaryHookOptions<Params, RequestBody>`
      };
    } else {
      imports.add(`import { UnaryFunctionHook, UnaryHookOptions } from "@intrig/next"`);
      return {
        hookShape: `UnaryFunctionHook<Params, Response, _ErrorType>`,
        optionsShape: `UnaryHookOptions<Params>`
      };
    }
  } else {
    if (requestBody) {
      imports.add(`import { BinaryProduceHook, BinaryHookOptions } from "@intrig/next"`);
      return {
        hookShape: `BinaryProduceHook<Params, RequestBody, _ErrorType>`,
        optionsShape: `BinaryHookOptions<Params, RequestBody>`
      };
    } else {
      imports.add(`import { UnaryProduceHook, UnaryHookOptions } from "@intrig/next"`);
      return {
        hookShape: `UnaryProduceHook<Params, _ErrorType>`,
        optionsShape: `UnaryHookOptions<Params>`
      };
    }
  }
}


function extractParamDeconstruction(variables: Variable[], requestBody: string) {
  const isParamMandatory = variables?.some(a => a.in === 'path') || false;

  if (requestBody) {
    if (isParamMandatory) {
      return {
        paramExpression: 'data, p',
        paramType: 'data: RequestBody, params: Params'
      }
    } else {
      return {
        paramExpression: 'data, p = {}',
        paramType: 'data: RequestBody, params?: Params'
      }
    }
  } else {
    if (isParamMandatory) {
      return {
        paramExpression: 'p',
        paramType: 'params: Params'
      }
    } else {
      return {
        paramExpression: 'p = {}',
        paramType: 'params?: Params'
      }
    }
  }
}

function extractErrorParams(errorTypes: string[]) {
  switch (errorTypes.length) {
    case 0:
      return `
      export type _ErrorType = any
      const errorSchema = z.any()`
    case 1:
      return `
      export type _ErrorType = ${errorTypes[0]}
      const errorSchema = ${errorTypes[0]}Schema`
    default:
      return `
      export type _ErrorType = ${errorTypes.join(' | ')}
      const errorSchema = z.union([${errorTypes.map(a => `${a}Schema`).join(', ')}])`
  }
}


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

  const paramExplode = [
    ...variables.filter((a) => a.in === 'path').map((a) => a.name),
    '...params',
  ].join(',');

  clientExports.push(`export { ${pascalCase(operationId)}Link } from './${pascalCase(operationId)}Link'`);
  serverExports.push(`export { ${pascalCase(operationId)}Link } from './${pascalCase(operationId)}Link'`);

  return ts`
    ${[...imports].join('\n')}

    export interface ${pascalCase(operationId)}LinkProps extends Omit<LinkProps, 'href'> {
      params?: Params
      children?: React.ReactNode
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
