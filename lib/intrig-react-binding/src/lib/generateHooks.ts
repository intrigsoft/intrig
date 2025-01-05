import { dump, IntrigSourceConfig, RequestProperties } from '@intrig/cli-common';
import { paramsTemplate } from './templates/source/controller/method/params.template';
import { clientIndexTemplate } from './templates/source/controller/method/clientIndex.template';
import { requestHookTemplate } from './templates/source/controller/method/requestHook.template';
import { downloadHookTemplate } from './templates/source/controller/method/download.template';

export function generateHooks(api: IntrigSourceConfig, _path: string, paths: RequestProperties[]) {

  function handleIndexes(requestUrl: string, paths: RequestProperties[]) {
    dump(clientIndexTemplate(paths))
  }

  const groupedByPath: Record<string, RequestProperties[]> = {}

  for (let path of paths) {
    path = {
      ...path,
      sourcePath: _path,
    }
    dump(paramsTemplate(path))
    dump(requestHookTemplate(path))

    groupedByPath[path.requestUrl] = groupedByPath[path.requestUrl] ?? []
    groupedByPath[path.requestUrl].push(path)

    if (!(path.responseType === 'application/json' || path.responseType === '*/*')) {
      dump(downloadHookTemplate(path))
    }
  }

  for (let [requestUrl, matchingPaths] of Object.entries(groupedByPath)) {
    handleIndexes(requestUrl, matchingPaths);
  }
}
