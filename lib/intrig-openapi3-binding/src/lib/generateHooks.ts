import {IntrigSourceConfig} from "@intrig/cli-common";
import {OpenAPIV3_1} from "openapi-types";

import {deref, dump, isRef, RequestProperties} from "./util";
import {getRequestTemplate} from "./templates/getRequest.template";
import {postRequestTemplate} from "./templates/postRequest.template";
import {putRequestTemplate} from "./templates/putRequest.template";
import {deleteRequestTemplate} from "./templates/deleteRequest.template";
import {octetStreamPostRequestTemplate} from "./templates/octetStreamPostRequest.template";
import {multipartFormDataPostRequestTemplate} from "./templates/multipartFormdataPostRequest.template";
import {octetStreamPutRequestTemplate} from "./templates/octetStreamPutRequest.template";

export async function generateHooks(api: IntrigSourceConfig, _path: string, spec: OpenAPIV3_1.Document) {

  async function handleGet(params: RequestProperties) {
    if (params.responseMediaType !== "application/json") return;
    dump(getRequestTemplate(params))
  }

  async function handlePost(params: RequestProperties) {
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

  async function handlePut(params: RequestProperties) {
    if (params.responseMediaType !== "application/json") return;
    switch (params.contentType) {
      case "application/json":
        dump(putRequestTemplate(params))
        break;
      case "application/octet-stream":
        dump(octetStreamPutRequestTemplate(params))
        break;
      case "multipart/form-data":
        dump(multipartFormDataPostRequestTemplate(params));
        break;
    }
  }

  async function handleDelete(params: RequestProperties) {
    dump(deleteRequestTemplate(params))
  }

  let requests: RequestProperties[] = [];

  for (let [path, pathData] of Object.entries(spec.paths)) {
    for (let [method, methodData] of Object.entries(pathData)) {
      let operation = deref(spec)<any>(methodData);
      if (isOperationObject(operation)) {
        let variables = operation.parameters?.map((param: OpenAPIV3_1.ParameterObject) => {
          return {
            name: param.name,
            in: param.in,
            ref: isRef(param.schema) ? param.schema.$ref : "any"
          }
        }) ?? [];

        let params: RequestProperties = {
          source: api.id,
          paths: [operation.tags[0]].filter(Boolean),
          variables,
          requestUrl: path,
          operationId: operation.operationId,
          sourcePath: _path,
          method,
        }

        if (method.toLowerCase() === "delete") {
          requests.push(params)
        } else {
          let response = operation.responses?.['200'] as OpenAPIV3_1.ResponseObject;
          for (let [mediaType, content] of Object.entries(response?.content ?? {})) {
            let ref = content.schema as OpenAPIV3_1.ReferenceObject;

            params = {
              ...params,
              responseType: ref.$ref.split("/").pop(),
              responseMediaType: mediaType
            }

            if (method.toLowerCase() === "get") {
              requests.push(params)
            } else {
              let requestBody = operation.requestBody as OpenAPIV3_1.RequestBodyObject;
              Object.entries(requestBody?.content ?? {}).forEach(([contentType, content]) => {
                let schema = content?.schema as OpenAPIV3_1.ReferenceObject;
                requests.push({
                  ...params,
                  contentType,
                  requestBody: schema?.$ref?.split("/").pop(),
                })
              })
            }
          }
        }
      }
    }
  }

  /*
            switch (responseKey) {
              case "application/json":


                // switch (method) {
                //   case 'get':
                //     await handleGet(params);
                //     break;
                //   case "post":
                //     await handlePost(params);
                //     break;
                //   case "put":
                //     await handlePut(params);
                //     break;
                //   case "delete":
                //     await handleDelete(params);
                //     break;
                //   default:
                //     console.log(`Unhandled method: ${method}`);
                // }
                break;
            }

   */


  for (let params of requests) {
    switch (params.method) {
      case 'get':
        await handleGet(params);
        break;
      case "post":
        await handlePost(params);
        break;
      case "put":
        await handlePut(params);
        break;
      case "delete":
        await handleDelete(params);
        break;
      default:
        console.warn(`Unhandled method: ${params.method}`);
    }
  }

}

function isOperationObject(ob: any): ob is OpenAPIV3_1.OperationObject {
  return !!ob.responses
}
