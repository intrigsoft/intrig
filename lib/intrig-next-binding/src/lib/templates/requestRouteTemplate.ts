import { camelCase, generatePostfix, pascalCase, RequestProperties, typescript } from '@intrig/cli-common';
import * as path from "path";

export function requestRouteTemplate(requestUrl: string, paths: RequestProperties[]) {
  let parts = requestUrl
    .replace("{", "[")
    .replace("}", "]")
    .split('/')

  let {source, sourcePath} = paths[0]

  const ts = typescript(path.resolve(sourcePath, 'src', "api", "__GENERATED__", source, ...parts, `route.ts`))

  function getFunctionName(path: RequestProperties) {
    return `${camelCase(path.operationId)}${generatePostfix(path.contentType, path.responseMediaType)}`
  }

  function createImport(path: RequestProperties) {
    if (path.contentType === "application/json" && path.responseMediaType === "application/json") {
      return `import { ${camelCase(path.operationId)} } from "@intrig/client-next/src/${source}/${path.paths.join('/')}/${camelCase(path.operationId)}/${camelCase(path.operationId)}"`
    }
    return `import { ${camelCase(path.operationId)} as ${camelCase(path.operationId)}${generatePostfix(path.contentType, path.responseMediaType)} } from "@intrig/client-next/src/${source}/${path.paths.join('/')}/${camelCase(path.operationId)}/${camelCase(path.operationId)}${generatePostfix(path.contentType, path.responseMediaType)}"`
  }

  let imports = new Set<string>()

  let getBlocks = new Set<string>()
  let postBlocks = new Set<string>()
  let putBlocks = new Set<string>()
  let deleteBlocks = new Set<string>()

  function getRequestBodyTransformerBlock(path: RequestProperties) {
    imports.add(
      `import {${path.requestBody}, ${path.requestBody}Schema} from "@intrig/client-next/src/${source}/components/schemas/${path.requestBody}";`
    )
    imports.add(`import { transform } from "@intrig/client-next/src/media-type-utils"`)
    return `
      let body = await transform<${path.requestBody}>(request, "${path.contentType}", ${path.requestBody}Schema)
    `
  }

  for (let path of paths) {
    switch (path.method.toLowerCase()) {
      case "get":
        imports.add(createImport(path))
        getBlocks.add(ts`
        let response = await ${getFunctionName(path)}(params)
        return NextResponse.json(response, { status: 200})
        `.content)
        break;
      case "post":
        imports.add(createImport(path))
        postBlocks.add(ts`
        if (request.headers.get('Content-Type') === "${path.contentType}") {
          ${getRequestBodyTransformerBlock(path)}
          let response = await ${getFunctionName(path)}(body, params)
          return NextResponse.json(response, { status: 200})
        }
        `.content)
        break;
      case "delete":
        imports.add(createImport(path))
        deleteBlocks.add(ts`
        let response = await ${getFunctionName(path)}(params)
        return NextResponse.json(response, { status: 200})
        `.content)
        break;
      case "put":
        imports.add(createImport(path))
        putBlocks.add(ts`
        if (request.headers.get('Content-Type') === "${path.contentType}") {
          ${getRequestBodyTransformerBlock(path)}
          let response = await ${getFunctionName(path)}(body, params)
          return NextResponse.json(response, { status: 200})
        }
        `.content)
        break;
    }
  }

  function createMethod(name: string, blocks: Set<string>) {
    if (!blocks.size) return ""
    return ts`
        export async function ${name}(request: Request, { params }: { params: any }) {
          try {
            ${[...blocks].join('\n')}
            ${["POST", "PUT"].includes(name) ? `return new NextResponse(null, { status: 204 });` : ``}
          } catch (e) {
            if (isAxiosError(e)) {
              let status = e.response?.status ?? 500;
              let statusText = e.response?.statusText;
              let data = e.response?.data;

              return NextResponse.json(data, { status, statusText })
            } else if (e instanceof ZodError) {
              const formattedErrors = e.errors.map((err) => ({
                path: err.path.join('.'),
                message: err.message,
              }));

              return NextResponse.json({ errors: formattedErrors }, { status: 400 });
            } else {
              return NextResponse.json("An error occurred", { status: 500 })
            }
          }
        }
        `.content;
  }

  return ts`
    import {NextResponse} from "next/server";
    import {isAxiosError} from "axios";
    import { ZodError } from 'zod'

    ${[...imports].join("\n")}

    ${createMethod("GET", getBlocks)}
    ${createMethod("POST", postBlocks)}
    ${createMethod("PUT", putBlocks)}
    ${createMethod("DELETE", deleteBlocks)}
  `
}
