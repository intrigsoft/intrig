import {dump, IntrigSourceConfig, RequestProperties} from "@intrig/cli-common";
import {paramsTemplate} from "./templates/source/controller/method/params.template";
import {requestRouteTemplate} from "./templates/source/controller/method/requestRouteTemplate";
import { clientIndexTemplate } from './templates/source/controller/method/clientIndex.template';
import { serverIndexTemplate } from './templates/source/controller/method/serverIndex.template';
import { requestHookTemplate } from './templates/source/controller/method/requestHook.template';
import { requestMethodTemplate } from './templates/source/controller/method/requestMethod.template';

export function generateHooks(api: IntrigSourceConfig, _path: string, paths: RequestProperties[]) {

  function handleIndexes(requestUrl: string, paths: RequestProperties[]) {
    dump(clientIndexTemplate(paths))
    dump(serverIndexTemplate(paths))
  }

  const groupedByPath: Record<string, RequestProperties[]> = {}

  for (let path of paths) {
    path = {
      ...path,
      sourcePath: _path,
    }
    dump(paramsTemplate(path))
    dump(requestHookTemplate(path))
    dump(requestMethodTemplate(path))

    groupedByPath[path.requestUrl] = groupedByPath[path.requestUrl] ?? []
    groupedByPath[path.requestUrl].push(path)
  }

  for (let [requestUrl, matchingPaths] of Object.entries(groupedByPath)) {
    handleIndexes(requestUrl, matchingPaths);
    dump(requestRouteTemplate(requestUrl, matchingPaths))
  }
}
