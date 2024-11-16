import { DocInfo, IntrigSourceConfig } from '@intrig/cli-common';
import {markdownLiteral} from '@intrig/cli-common';
import * as path from 'path'
import { OpenAPIV3_1 } from 'openapi-types';
import yaml from 'yaml';

export function controllerDocsTempalte(api: IntrigSourceConfig, _path: string, sourceInfo: OpenAPIV3_1.TagObject) {
  let md = markdownLiteral(path.resolve(_path, "src", api.id, sourceInfo.name, "doc.md"))

  return md`---
${yaml.stringify({
    tags: [api.id, sourceInfo.name],
    title: `${sourceInfo.name} Controller`
  })}
---
${sourceInfo.description}

${sourceInfo.externalDocs ? `[${sourceInfo.externalDocs.description}](${sourceInfo.externalDocs.url})` : ''}

---

## Included Endpoints

{% hierarchy filter="/sources/${api.id}/${sourceInfo.name}" %} {% /hierarchy %}
  `
}
