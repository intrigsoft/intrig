import { CompiledOutput, IntrigSourceConfig, jsonLiteral, SourceInfo } from '@intrig/cli-common';
import * as path from 'node:path';

export function registryTemplate(
  api: IntrigSourceConfig,
  _path: string,
  spec: SourceInfo
) : CompiledOutput {
  const json = jsonLiteral(path.resolve(_path, 'src', api.id, 'registry.json'))

  return json`
  {}
  `
}