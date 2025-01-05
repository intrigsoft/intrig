import { dump, IntrigSourceConfig, RequestProperties, SourceInfo } from '@intrig/cli-common';
import { sourceDocsTemplate } from './templates/source/sourceDocsTemplate';
import { controllerDocsTempalte } from './templates/source/controller/controllerDocs.tempalte';
import { methodDocsTemplate } from './templates/source/controller/method/methodDocsTemplate';
import { registryTemplate } from './templates/source/registry.template';
import { metaInfoTemplate } from './templates/source/controller/method/metaInfoTemplate';

export function generateSourceTemplates(api: IntrigSourceConfig, _path: string, spec: SourceInfo) {
  dump(registryTemplate(api, _path, spec))
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
    methodDocsTemplate(api, _path, pathList).forEach(dump)
    dump(metaInfoTemplate(api, _path, pathList))
  })

}
