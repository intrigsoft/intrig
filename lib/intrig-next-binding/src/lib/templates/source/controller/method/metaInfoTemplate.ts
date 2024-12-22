import { IntrigSourceConfig, jsonLiteral, RequestProperties } from '@intrig/cli-common';
import * as path from 'path';

export function metaInfoTemplate(
  api: IntrigSourceConfig,
  _path: string,
  endpoints: RequestProperties[]
) {
  if (endpoints.length < 1) return null;
  let {
    paths,
    operationId
  } = endpoints[0];

  let json = jsonLiteral(path.resolve(_path, 'src', api.id, ...paths, operationId, 'metainfo.json'));
  return json`
    ${JSON.stringify({
    ...endpoints[0],
    source: api.id,
  }, null, 2)}
  `
}
