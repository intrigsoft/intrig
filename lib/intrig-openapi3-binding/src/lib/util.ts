import {OpenAPIV3_1} from "openapi-types";
import ReferenceObject = OpenAPIV3_1.ReferenceObject;
import {CompiledOutput} from "@intrig/cli-common";
import * as fs from 'fs'
import * as path from 'path'
import prettier from 'prettier'

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
  let formatted = prettier.format(output.content, {
    parser: 'typescript',
    singleQuote: true
  });
  fs.writeFileSync(output.path, formatted)
}

export interface RequestProperties {
  source: string
  paths: string[]
  operationId: string
  requestBody?: string
  responseType: string
  requestUrl: string,
  variables: {
    name: string,
    in: string,
    ref: string
  }[],
  sourcePath: string
}
