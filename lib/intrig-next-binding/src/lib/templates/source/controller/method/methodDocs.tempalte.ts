import { DocInfo, IntrigSourceConfig, RequestProperties } from '@intrig/cli-common';
import {jsonLiteral} from '@intrig/cli-common';
import * as path from 'path'
import { OpenAPIV3_1 } from 'openapi-types';

export function methodDocsTempalte(api: IntrigSourceConfig, _path: string, endpoints: RequestProperties[]) {
  if (endpoints.length < 1) return null
  let {paths, operationId, description, summary, method, requestUrl } = endpoints[0]
  let json = jsonLiteral(path.resolve(_path, "src", api.id, ...paths, operationId, "doc.json"))

  return json`
   ${JSON.stringify({
    id: operationId,
    description,
    summary,
    method,
    requestUrl,
    endpoints
  })}
  `
}
