import {OpenAPIV3_1} from "openapi-types";
import ReferenceObject = OpenAPIV3_1.ReferenceObject;
import {CompiledOutput} from "@intrig/cli-common";
import * as fs from 'fs'
import * as path from 'path'

export function isRef(ob: any): ob is ReferenceObject {
  return ob?.$ref !== undefined;
}

export function deref(spec: OpenAPIV3_1.Document): <T> (ob: ReferenceObject | T) => T | undefined {
  return <T> (ob: ReferenceObject | T) => {
    if (isRef(ob)) {
      return ob.$ref.split('/').slice(1).reduce((acc: any, curr) => {
        return acc?.[curr];
      }, spec);
    }
    return ob;
  }
}

export function dump(output: CompiledOutput) {
  let dir = path.parse(output.path).dir;
  fs.mkdirSync(dir, {recursive: true})
  fs.writeFileSync(output.path, output.content)
}

export interface Variable {
  name: string
  in: string
  ref: string
}

export interface RequestProperties {
  method: string
  source: string
  paths: string[]
  operationId: string
  requestBody?: string
  contentType?: string
  responseType?: string
  responseMediaType?: string,
  requestUrl: string,
  variables: Variable[],
  sourcePath: string
  description?: string
  summary?: string
  responseExamples?: Record<string, string>
}
