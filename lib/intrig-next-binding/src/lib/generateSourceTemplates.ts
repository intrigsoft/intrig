import { IntrigSourceConfig, SourceInfo } from '@intrig/cli-common';
import { docsTemplate } from './templates/source/docs.template';

export function generateSourceTemplates(api: IntrigSourceConfig, _path: string, spec: SourceInfo) {
  docsTemplate(api, _path, spec.sourceInfo)
}
