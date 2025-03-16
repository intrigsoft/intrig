import { camelCase, generatePostfix, pascalCase, RequestProperties, typescript } from '@intrig/cli-common';
import * as path from "path";

export async function requestRouteTemplate(requestUrl: string, paths: RequestProperties[]) {
  const parts = requestUrl
    .replace(/\{/g, "[")
    .replace(/\}/g, "]")
    .split('/')

  const {source, sourcePath} = paths[0]

  const ts = typescript(path.resolve(sourcePath, 'src', "api", "(generated)", source, ...parts, `route.ts`))

  function getFunctionName(path: RequestProperties) {
    return `execute${pascalCase(path.operationId)}${generatePostfix(path.contentType, path.responseType)}`
  }

  function createImport(path: RequestProperties) {
    if (path.contentType === "application/json" && path.responseType === "application/json") {
      return `import { execute${pascalCase(path.operationId)} } from "@intrig/next/${source}/${path.paths.join('/')}/${camelCase(path.operationId)}/${camelCase(path.operationId)}"`
    }
    return `import { execute${pascalCase(path.operationId)} as execute${pascalCase(path.operationId)}${generatePostfix(path.contentType, path.responseType)} } from "@intrig/next/${source}/${path.paths.join('/')}/${camelCase(path.operationId)}/${camelCase(path.operationId)}${generatePostfix(path.contentType, path.responseType)}"`
  }

  const imports = new Set<string>()

  const getBlocks = new Set<string>()
  const postBlocks = new Set<string>()
  const putBlocks = new Set<string>()
  const deleteBlocks = new Set<string>()

  function getRequestBodyTransformerBlock(path: RequestProperties) {
    if (!path.requestBody || path.requestBody === "undefined") {
      return `
      let body = request
      `
    }
    imports.add(
      `import {${path.requestBody}, ${path.requestBody}Schema} from "@intrig/next/${source}/components/schemas/${path.requestBody}";`
    )
    imports.add(`import { transform } from "@intrig/next/media-type-utils"`)
    return `
      let body = await transform<${path.requestBody}>(request, "${path.contentType}", ${path.requestBody}Schema)
    `
  }

  function getNextResponse(path: RequestProperties) {
    if (path.responseType?.startsWith("application/vnd")) {
      return `new NextResponse(response, { status: 200, headers })`
    }
    if (path.responseType === "application/octet-stream") {
      return `new NextResponse(response, { status: 200, headers })`
    }
    return `NextResponse.json(response, { status: 200, headers})`
  }

  for (const path of paths) {
    switch (path.method.toLowerCase()) {
      case "get":
        imports.add(createImport(path))
        //TODO fix xml handling.
        getBlocks.add((await ts`
        let { data: response, headers } = await ${getFunctionName(path)}({
          ...(params ?? {}) as any,
          ...Object.fromEntries(request.nextUrl.searchParams.entries())
        } as any)
        return ${getNextResponse(path)}
        `).content)
        break;
      case "post":
        imports.add(createImport(path))
        postBlocks.add((await ts`
        if (!request.headers.get('Content-Type') || request.headers.get('Content-Type')?.split(';')?.[0] === "${path.contentType}") {
          ${getRequestBodyTransformerBlock(path)}
          let { data: response, headers } = await ${getFunctionName(path)}(${path.requestBody ? "body," : ""} {
          ...(params ?? {}) as any,
          ...Object.fromEntries(request.nextUrl.searchParams.entries())
        } as any)
          return ${getNextResponse(path)}
        }
        `).content)
        break;
      case "delete":
        imports.add(createImport(path))
        deleteBlocks.add((await ts`
        let { data: response, headers } = await ${getFunctionName(path)}({
          ...(params ?? {}) as any,
          ...Object.fromEntries(request.nextUrl.searchParams.entries())
        } as any)
        return ${getNextResponse(path)}
        `).content)
        break;
      case "put":
        imports.add(createImport(path))
        putBlocks.add((await ts`
        if (!request.headers.get('Content-Type') || request.headers.get('Content-Type')?.split(';')?.[0] === "${path.contentType}") {
          ${getRequestBodyTransformerBlock(path)}
          let { data: response, headers } = await ${getFunctionName(path)}(${path.requestBody ? "body," : ""} {
          ...(params ?? {}) as any,
          ...Object.fromEntries(request.nextUrl.searchParams.entries())
        } as any)
          return ${getNextResponse(path)}
        }
        `).content)
        break;
    }
  }

  async function createMethod(name: string, blocks: Set<string>) {
    if (!blocks.size) return ""
    return (await ts`
        export async function ${name}(request: NextRequest, paramOb: { params: Record<string, string> }): Promise<NextResponse> {
          logger.info("Request received to ${name}")
          try {
            let params = paramOb?.params;
            ${[...blocks].join('\n')}
            ${["POST", "PUT"].includes(name) ? `return new NextResponse(null, { status: 204 });` : ``}
          } catch (e: any) {
            if (isAxiosError(e)) {
              logger.error("Error in response", e as any)
              let status = e.response?.status ?? 500;
              let statusText = e.response?.statusText;
              let data = e.response?.data;

              return NextResponse.json(data, { status, statusText })
            } else if (e instanceof ZodError) {
              logger.error("Response validation error", e as any)
              const formattedErrors = e.errors.map((err) => ({
                path: err.path.join('.'),
                message: err.message,
              }));

              return NextResponse.json({ errors: formattedErrors }, { status: 400 });
            } else {
              logger.error("Unknown error occurred", e as any)
              return NextResponse.json(e, { status: 500 })
            }
          }
        }
        `).content;
  }

  return ts`
    import {NextRequest, NextResponse} from "next/server";
    import {isAxiosError} from "axios";
    import { ZodError } from 'zod'
    import logger from '@intrig/next/logger'

    ${[...imports].join("\n")}

    export const dynamic = "force-dynamic";

    ${await createMethod("GET", getBlocks)}
    ${await createMethod("POST", postBlocks)}
    ${await createMethod("PUT", putBlocks)}
    ${await createMethod("DELETE", deleteBlocks)}
  `
}
