import {OpenAPIV3_1} from "openapi-types";
import ReferenceObject = OpenAPIV3_1.ReferenceObject;
import * as fs from 'fs'
import * as path from 'path'
import { CompiledOutput } from './types';

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

export async function dump(outputPromise: Promise<CompiledOutput>) {
  const output = await outputPromise;
  const dir = path.parse(output.path).dir;
  fs.mkdirSync(dir, {recursive: true})
  fs.writeFileSync(output.path, output.content)
}

export interface Variable {
  name: string
  in: string
  ref: string
}

export interface ErrorResponse {
  response?: string,
  responseType?: string
}

export interface RequestProperties {
  method: string
  source: string
  paths: string[]
  operationId: string
  requestBody?: string
  contentType?: string
  response?: string
  responseType?: string,
  requestUrl: string,
  variables: Variable[],
  sourcePath: string
  description?: string
  summary?: string
  responseExamples?: Record<string, string>
  errorResponses?: Record<string, ErrorResponse>
}
