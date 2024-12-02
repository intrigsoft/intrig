import { dump, IntrigSourceConfig, RequestProperties } from '@intrig/cli-common';
import { getRequestHookTemplate } from './templates/source/controller/method/getRequestHook.template';
import { postRequestHookTemplate } from './templates/source/controller/method/postRequestHook.template';
import { putRequestHookTemplate } from './templates/source/controller/method/putRequestHook.template';
import { deleteRequestHookTemplate } from './templates/source/controller/method/deleteRequestHook.template';
import { paramsTemplate } from './templates/source/controller/method/params.template';
import { clientIndexTemplate } from './templates/source/controller/method/clientIndex.template';

export function generateHooks(api: IntrigSourceConfig, _path: string, paths: RequestProperties[]) {

  function handleGet(params: RequestProperties) {
    dump(paramsTemplate(params))
    dump(getRequestHookTemplate(params))
  }

  function handlePost(params: RequestProperties) {
    dump(paramsTemplate(params))
    dump(postRequestHookTemplate(params))
  }

  function handlePut(params: RequestProperties) {
    dump(paramsTemplate(params))
    dump(putRequestHookTemplate(params))
  }

  function handleDelete(params: RequestProperties) {
    dump(paramsTemplate(params))
    dump(deleteRequestHookTemplate(params))
  }

  function handleIndexes(params: RequestProperties) {
    dump(clientIndexTemplate(params))
  }

  const groupedByPath: Record<string, RequestProperties[]> = {}

  for (let path of paths) {
    path = {
      ...path,
      sourcePath: _path,
    }
    switch (path.method.toLowerCase()) {
      case "get":
        handleGet(path);
        break;
      case "post":
        handlePost(path);
        break;
      case "put":
        handlePut(path);
        break;
      case "delete":
        handleDelete(path);
        break;
    }
    if ((!path.responseType || path.responseType === 'application/json')
      && (!path.contentType || path.contentType === 'application/json')) {
      handleIndexes(path);
    }
    groupedByPath[path.requestUrl] = groupedByPath[path.requestUrl] ?? []
    groupedByPath[path.requestUrl].push(path)
  }
}
