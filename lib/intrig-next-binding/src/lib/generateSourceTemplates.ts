import { dump, IntrigSourceConfig, RequestProperties, SourceInfo } from '@intrig/cli-common';
import { sourceDocsTemplate } from './templates/source/sourceDocsTemplate';
import { controllerDocsTempalte } from './templates/source/controller/controllerDocs.tempalte';
import { methodDocsTempalte } from './templates/source/controller/method/methodDocs.tempalte';

export function generateSourceTemplates(api: IntrigSourceConfig, _path: string, spec: SourceInfo) {
  dump(sourceDocsTemplate(api, _path, spec.sourceInfo))
  spec.controllers.forEach(tag => {
    dump(controllerDocsTempalte(api, _path, tag))
  })

  let categorizedPaths: Record<string, RequestProperties[]> = {}
  spec.paths.forEach(path => {
    categorizedPaths[path.operationId] = categorizedPaths[path.operationId] ?? []
    categorizedPaths[path.operationId].push(path)
  })

  Object.values(categorizedPaths).forEach(pathList => {
    dump(methodDocsTempalte(api, _path, pathList))
  })
}
