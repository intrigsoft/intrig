import { dump, IntrigSourceConfig, RequestProperties, SourceInfo } from '@intrig/cli-common';
import { sourceDocsTemplate } from './templates/source/sourceDocsTemplate';
import { controllerDocsTempalte } from './templates/source/controller/controllerDocs.tempalte';
import { methodDocsTemplate } from './templates/source/controller/method/methodDocsTemplate';
import { registryTemplate } from './templates/source/registry.template';

export async function generateSourceTemplates(api: IntrigSourceConfig, _path: string, spec: SourceInfo) {
  await dump(registryTemplate(api, _path))
  await dump(sourceDocsTemplate(api, _path, spec.sourceInfo))
  for (const tag of spec.controllers) {
    await dump(controllerDocsTempalte(api, _path, tag))
  }

  const categorizedPaths: Record<string, RequestProperties[]> = {}
  spec.paths.forEach(path => {
    categorizedPaths[path.operationId] = categorizedPaths[path.operationId] ?? []
    categorizedPaths[path.operationId].push(path)
  })

  for (const pathList of Object.values(categorizedPaths)) {
    await dump(methodDocsTemplate(api, _path, pathList))
  }

}
