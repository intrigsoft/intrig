import { DocInfo, IntrigSourceConfig } from '@intrig/cli-common';
import {markdownLiteral} from '@intrig/cli-common';
import * as path from 'path'
import yaml from 'yaml'

export function sourceDocsTemplate(api: IntrigSourceConfig, _path: string, sourceInfo: DocInfo) {
  let md = markdownLiteral(path.resolve(_path, "src", api.id, "doc.md"))

  return md`
---
${yaml.stringify({
    tags: [api.id, sourceInfo.info.version]
  })}
---
# ${api.id} API {% badge %} ${sourceInfo.info.version} {% /badge %}

## API information for ${sourceInfo.info.title}

${sourceInfo.info.description}

${sourceInfo.externalDocs ? `[${sourceInfo.externalDocs.description}](${sourceInfo.externalDocs.url})` : ''}

${sourceInfo.info.termsOfService ? `[Terms of Service](${sourceInfo.info.termsOfService})` : ''}
  `
}
