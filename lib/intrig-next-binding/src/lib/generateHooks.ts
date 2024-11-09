import {dump, IntrigSourceConfig, RequestProperties} from "@intrig/cli-common";
import {getRequestHookTemplate} from "./templates/source/controller/method/getRequestHook.template";
import {postRequestHookTemplate} from "./templates/source/controller/method/postRequestHook.template";
import {putRequestHookTemplate} from "./templates/source/controller/method/putRequestHook.template";
import {deleteRequestHookTemplate} from "./templates/source/controller/method/deleteRequestHook.template";
import {deleteRequestMethodTemplate} from "./templates/source/controller/method/deleteRequestMethod.template";
import {getRequestMethodTemplate} from "./templates/source/controller/method/getRequestMethod.template";
import {postRequestMethodTemplate} from "./templates/source/controller/method/postRequestMethod.template";
import {putRequestMethodTemplate} from "./templates/source/controller/method/putRequestMethod.template";
import {paramsTemplate} from "./templates/source/controller/method/params.template";
import {requestRouteTemplate} from "./templates/source/controller/method/requestRouteTemplate";

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
