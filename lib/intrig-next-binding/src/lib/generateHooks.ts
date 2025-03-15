import {dump, IntrigSourceConfig, RequestProperties} from "@intrig/cli-common";
import {paramsTemplate} from "./templates/source/controller/method/params.template";
import {requestRouteTemplate} from "./templates/source/controller/method/requestRouteTemplate";
import { clientIndexTemplate } from './templates/source/controller/method/clientIndex.template';
import { serverIndexTemplate } from './templates/source/controller/method/serverIndex.template';
import { requestHookTemplate } from './templates/source/controller/method/requestHook.template';
import { requestMethodTemplate } from './templates/source/controller/method/requestMethod.template';
import { downloadHookTemplate } from './templates/source/controller/method/download.template';

export async function generateHooks(api: IntrigSourceConfig, _path: string, paths: RequestProperties[]) {

  async function handleIndexes(requestUrl: string, paths: RequestProperties[]) {
    await dump(clientIndexTemplate(paths))
    await dump(serverIndexTemplate(paths))
  }

  const groupedByPath: Record<string, RequestProperties[]> = {}

  for (let path of paths) {
    path = {
      ...path,
      sourcePath: _path,
    }
    await dump(paramsTemplate(path))
    await dump(requestHookTemplate(path))
    await dump(requestMethodTemplate(path))

    groupedByPath[path.requestUrl] = groupedByPath[path.requestUrl] ?? []
    groupedByPath[path.requestUrl].push(path)

    if (!(path.responseType === 'application/json' || path.responseType === '*/*')) {
      await dump(downloadHookTemplate(path))
    }
  }

  for (const [requestUrl, matchingPaths] of Object.entries(groupedByPath)) {
    await handleIndexes(requestUrl, matchingPaths);
    await dump(requestRouteTemplate(requestUrl, matchingPaths))
  }
}
