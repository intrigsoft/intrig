import { dump, IntrigSourceConfig, RequestProperties, SourceInfo } from '@intrig/cli-common';
import { sourceDocsTemplate } from './templates/source/sourceDocsTemplate';
import { controllerDocsTempalte } from './templates/source/controller/controllerDocs.tempalte';
import { methodDocsTemplate } from './templates/source/controller/method/methodDocsTemplate';
import { registryTemplate } from './templates/source/registry.template';
import { metaInfoTemplate } from './templates/source/controller/method/metaInfoTemplate';
import { aiModelTemplate } from './templates/source/ai-model.template';

export async function generateSourceTemplates(api: IntrigSourceConfig, _path: string, spec: SourceInfo) {
  await dump(registryTemplate(api, _path, spec))
  await dump(sourceDocsTemplate(api, _path, spec.sourceInfo))
  await dump(aiModelTemplate(api, _path, spec))
  for (const tag of spec.controllers) {
    await dump(controllerDocsTempalte(api, _path, tag))
  }

  const categorizedPaths: Record<string, RequestProperties[]> = {}
  spec.paths.forEach(path => {
    categorizedPaths[path.operationId] = categorizedPaths[path.operationId] ?? []
    categorizedPaths[path.operationId].push(path)
  })

  for (const pathList of Object.values(categorizedPaths)) {
    for (const methodDocsTemplateElement of methodDocsTemplate(api, _path, pathList)) {
      await dump(methodDocsTemplateElement)
    }
    await dump(metaInfoTemplate(api, _path, pathList))
  }
}
