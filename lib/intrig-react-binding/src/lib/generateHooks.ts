import {dump, IntrigSourceConfig, RequestProperties} from "@intrig/cli-common";
import {getRequestTemplate} from "./templates/getRequest.template";
import {postRequestTemplate} from "./templates/postRequest.template";
import {octetStreamPostRequestTemplate} from "./templates/octetStreamPostRequest.template";
import {multipartFormDataPostRequestTemplate} from "./templates/multipartFormdataPostRequest.template";
import {putRequestTemplate} from "./templates/putRequest.template";
import {octetStreamPutRequestTemplate} from "./templates/octetStreamPutRequest.template";
import {multipartFormDataPutRequestTemplate} from "./templates/multipartFormdataPutRequest.template";
import {deleteRequestTemplate} from "./templates/deleteRequest.template";

export function generateHooks(api: IntrigSourceConfig, _path: string, paths: RequestProperties[]) {

  function handleGet(params: RequestProperties) {
    if (params.responseMediaType !== "application/json") return;
    dump(getRequestTemplate(params))
  }

  function handlePost(params: RequestProperties) {
    if (params.responseMediaType !== "application/json") return;
    switch (params.contentType) {
      case "application/json":
        dump(postRequestTemplate(params))
        break;
      case "application/octet-stream":
        dump(octetStreamPostRequestTemplate(params))
        break;
      case "multipart/form-data":
        dump(multipartFormDataPostRequestTemplate(params));
        break;
    }
  }

  function handlePut(params: RequestProperties) {
    if (params.responseMediaType !== "application/json") return;
    switch (params.contentType) {
      case "application/json":
        dump(putRequestTemplate(params))
        break;
      case "application/octet-stream":
        dump(octetStreamPutRequestTemplate(params))
        break;
      case "multipart/form-data":
        dump(multipartFormDataPutRequestTemplate(params));
        break;
    }
  }

  function handleDelete(params: RequestProperties) {
    dump(deleteRequestTemplate(params))
  }

  for (let path of paths) {
    path = {
      ...path,
      sourcePath: _path
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
  }
}
