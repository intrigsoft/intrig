import {CompiledOutput, typescript} from "@intrig/cli-common";
import * as path from 'path'

export function indexTemplate(_path: string): CompiledOutput {

  const ts = typescript(path.resolve(_path, "src", "index.ts"))

  return ts`
  export * from './intrig-provider';
  export * from './axios.server';
  export * from './network-state';
  `
}
