import {dump, IntrigSourceConfig, RequestProperties} from "@intrig/cli-common";
import {paramsTemplate} from "./templates/source/controller/method/params.template";
import {requestRouteTemplate} from "./templates/source/controller/method/requestRouteTemplate";
import { clientIndexTemplate } from './templates/source/controller/method/clientIndex.template';
import { serverIndexTemplate } from './templates/source/controller/method/serverIndex.template';
import { requestHookTemplate } from './templates/source/controller/method/requestHook.template';
import { requestMethodTemplate } from './templates/source/controller/method/requestMethod.template';
import { downloadHookTemplate } from './templates/source/controller/method/download.template';

export async function generateHooks(api: IntrigSourceConfig, _path: string, paths: RequestProperties[]) {


  const groupedByPath: Record<string, RequestProperties[]> = {}

  for (let path of paths) {
    path = {
      ...path,
      sourcePath: _path,
    }
    const clientExports: string[] = [];
    const serverExports: string[] = []
    await dump(paramsTemplate(path, clientExports, serverExports))
    await dump(requestHookTemplate(path, clientExports, serverExports))
    await dump(requestMethodTemplate(path, clientExports, serverExports))
    if (path.method.toUpperCase() === 'GET' && !(path.responseType === 'application/json' || path.responseType === '*/*')) {
      await dump(downloadHookTemplate(path, clientExports, serverExports))
    }
    await dump(clientIndexTemplate([path], clientExports))
    await dump(serverIndexTemplate([path], serverExports))

    groupedByPath[path.requestUrl] = groupedByPath[path.requestUrl] ?? []

    groupedByPath[path.requestUrl].push(path)
  }

  for (const [requestUrl, matchingPaths] of Object.entries(groupedByPath)) {
    // await handleIndexes(requestUrl, matchingPaths);
    await dump(requestRouteTemplate(requestUrl, matchingPaths))
  }
}
