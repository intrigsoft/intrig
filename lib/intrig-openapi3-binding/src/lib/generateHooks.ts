import {IntrigSourceConfig} from "@intrig/cli-common";
import {OpenAPIV3_1} from "openapi-types";

import {deref, dump, isRef, RequestProperties} from "./util";
import {getRequestTemplate} from "./templates/getRequest.template";
import {postRequestTemplate} from "./templates/postRequest.template";
import {putRequestTemplate} from "./templates/putRequest.template";
import {deleteRequestTemplate} from "./templates/deleteRequest.template";

export async function generateHooks(api: IntrigSourceConfig, _path: string, spec: OpenAPIV3_1.Document) {

  async function handleGet(params: RequestProperties) {
    dump(getRequestTemplate(params))
  }

  async function handlePost(params: RequestProperties) {
    dump(postRequestTemplate(params))
  }

  async function handlePut(params: RequestProperties) {
    dump(putRequestTemplate(params))
  }

  async function handleDelete(params: RequestProperties) {
    dump(deleteRequestTemplate(params))
  }

  console.log('Starting to process paths');
  for (let [path, pathData] of Object.entries(spec.paths)) {
    for (let [method, methodData] of Object.entries(pathData)) {
      let operation = deref(spec)<any>(methodData);
      if (isOperationObject(operation)) {
        for (let status in operation.responses) {
          let response = operation.responses[status] as OpenAPIV3_1.ResponseObject;
          for (let [responseKey, content] of Object.entries(response?.content ?? {})) {
            switch (responseKey) {
              case "application/json":
                let ref = content.schema as OpenAPIV3_1.ReferenceObject;

                let variables = operation.parameters?.map((param: OpenAPIV3_1.ParameterObject) => {
                  return {
                    name: param.name,
                    in: param.in,
                    ref: isRef(param.schema) ? param.schema.$ref : "any"
                  }
                }) ?? [];

                let requestBody = operation.requestBody as OpenAPIV3_1.RequestBodyObject;
                let contentElement = requestBody?.content?.["application/json"] as OpenAPIV3_1.MediaTypeObject;
                let schema = contentElement?.schema as OpenAPIV3_1.ReferenceObject;


                let params = {
                  source: api.id,
                  paths: [operation.tags[0]].filter(Boolean),
                  variables,
                  requestBody: schema?.$ref?.split("/").pop(),
                  responseType: ref.$ref.split("/").pop(),
                  requestUrl: path,
                  operationId: operation.operationId,
                  sourcePath: _path
                } satisfies RequestProperties

                switch (method) {
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
                    console.log(`Unhandled method: ${method}`);
                }
                break;
            }
          }
        }
      }
    }
  }

}

function isOperationObject(ob: any): ob is OpenAPIV3_1.OperationObject {
  return !!ob.responses
}
