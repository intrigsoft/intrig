import {deref, IntrigSourceConfig, isRef, RequestProperties} from "@intrig/cli-common";
import {OpenAPIV3_1} from "openapi-types";

export function extractRequestsFromSpec(spec: OpenAPIV3_1.Document, api: IntrigSourceConfig) {
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
          sourcePath: "",
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
  return requests;
}

function isOperationObject(ob: any): ob is OpenAPIV3_1.OperationObject {
  return !!ob.responses
}
