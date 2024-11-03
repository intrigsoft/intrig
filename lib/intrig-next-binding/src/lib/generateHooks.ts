import {dump, IntrigSourceConfig, RequestProperties} from "@intrig/cli-common";
import {getRequestHookTemplate} from "./templates/getRequestHook.template";
import {postRequestHookTemplate} from "./templates/postRequestHook.template";
import {putRequestHookTemplate} from "./templates/putRequestHook.template";
import {deleteRequestHookTemplate} from "./templates/deleteRequestHook.template";
import {deleteRequestMethodTemplate} from "./templates/deleteRequestMethod.template";
import {getRequestMethodTemplate} from "./templates/getRequestMethod.template";
import {postRequestMethodTemplate} from "./templates/postRequestMethod.template";
import {putRequestMethodTemplate} from "./templates/putRequestMethod.template";
import {paramsTemplate} from "./templates/params.template";
import {requestRouteTemplate} from "./templates/requestRouteTemplate";

export function generateHooks(api: IntrigSourceConfig, _path: string, paths: RequestProperties[]) {

  function handleGet(params: RequestProperties) {
    dump(paramsTemplate(params))
    dump(getRequestHookTemplate(params))
    dump(getRequestMethodTemplate(params))
  }

  function handlePost(params: RequestProperties) {
    dump(paramsTemplate(params))
    dump(postRequestHookTemplate(params))
    dump(postRequestMethodTemplate(params))
  }

  function handlePut(params: RequestProperties) {
    dump(paramsTemplate(params))
    dump(putRequestHookTemplate(params))
    dump(putRequestMethodTemplate(params))
  }

  function handleDelete(params: RequestProperties) {
    dump(paramsTemplate(params))
    dump(deleteRequestHookTemplate(params))
    dump(deleteRequestMethodTemplate(params))
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
    groupedByPath[path.requestUrl] = groupedByPath[path.requestUrl] ?? []
    groupedByPath[path.requestUrl].push(path)
  }

  for (let [requestUrl, matchingPaths] of Object.entries(groupedByPath)) {
    dump(requestRouteTemplate(requestUrl, matchingPaths))
  }
}
