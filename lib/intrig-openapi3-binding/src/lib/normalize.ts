import {OpenAPIV3_1} from "openapi-types";
import {deref, isRef} from "@intrig/cli-common";
import {produce} from 'immer'

import {pascalCase, camelCase} from '@intrig/cli-common'

function generateTypeName(operationOb: OpenAPIV3_1.OperationObject, postFix: string) {
  return [operationOb.tags?.[0], operationOb.operationId, postFix].filter(Boolean)
    .map(s => pascalCase(s))
    .join("$");
}

export function normalize(spec: OpenAPIV3_1.Document) {

  let doDeref = deref(spec)

  return produce(spec, draft => {
    let paths = draft.paths as OpenAPIV3_1.PathsObject;
    for (let [path, pathItem] of Object.entries(paths)) {
      let pathItemObject = pathItem as OpenAPIV3_1.PathItemObject;
      if (pathItemObject.parameters) {
        pathItemObject.parameters = pathItemObject.parameters.map(doDeref)
      }
      for (let [method, operation] of Object.entries(pathItemObject)) {
        if (["get", "post", "put", "delete"].includes(method.toLowerCase())) {
          let operationOb = operation as OpenAPIV3_1.OperationObject;
          operationOb.tags?.forEach(tag => {
            draft.tags = draft.tags ?? []
            if (!draft.tags.some(t => t.name === tag)) {
              draft.tags.push({
                name: tag
              })
            }
          })
          if (!operationOb.operationId) {
            operationOb.operationId = camelCase(`${method.toLowerCase()}_${path.replace("/", "_")}`)
          }
          if (operationOb.parameters) {
            operationOb.parameters = operationOb.parameters.map(doDeref)
            operationOb.parameters.forEach((param: OpenAPIV3_1.ParameterObject) => {
              if (!isRef(param.schema)) {
                let paramName = generateTypeName(operationOb, param.name)
                draft.components["schemas"][paramName] = param.schema as OpenAPIV3_1.SchemaObject;
                param.schema = {
                  $ref: `#/components/schemas/${paramName}`
                } satisfies OpenAPIV3_1.ReferenceObject
              }
            })
          }
          if (operationOb.requestBody) {
            operationOb.requestBody = doDeref(operationOb.requestBody)
            Object.values(operationOb.requestBody.content)
              .forEach(mto => {
                if (mto.examples) {
                  mto.examples = Object.fromEntries(Object.entries(mto.examples).map(([k, v]) => ([k, doDeref(v)])))
                }
                if (!isRef(mto.schema)) {
                  let paramName = generateTypeName(operationOb,'RequestBody')
                  draft.components["schemas"][paramName] = mto.schema as OpenAPIV3_1.SchemaObject;
                  mto.schema = {
                    $ref: `#/components/schemas/${paramName}`
                  } satisfies OpenAPIV3_1.ReferenceObject
                }
              })

          }
          if (operationOb.callbacks) {
            operationOb.callbacks = Object.fromEntries(Object.entries(operationOb.callbacks)
              .map(([k, v]) => ([k, doDeref(v)])))
          }

          if (operationOb.responses) {
            operationOb.responses = Object.fromEntries(Object.entries(operationOb.responses).map(([k, v]) => ([k, doDeref(v)])))
            Object.values(operationOb.responses)
              .filter(Boolean)
              .map((response: OpenAPIV3_1.ResponseObject) => {
              if (response.headers) {
                response.headers = doDeref(response.headers)
              }
              if (response.links) {
                response.links = doDeref(response.links)
              }
              if (response.content) {
                Object.values(response.content).map((mto: OpenAPIV3_1.MediaTypeObject) => {
                  if (mto.examples) {
                    mto.examples = Object.fromEntries(Object.entries(mto.examples).map(([k, v]) => ([k, doDeref(v)])))
                  }

                  if (!isRef(mto.schema)) {
                    let paramName = generateTypeName(operationOb,'ResponseBody')
                    draft.components["schemas"][paramName] = mto.schema as OpenAPIV3_1.SchemaObject;
                    mto.schema = {
                      $ref: `#/components/schemas/${paramName}`
                    } satisfies OpenAPIV3_1.ReferenceObject
                  }
                })
              }
            })
          }
        }
      }
    }
    //TODO implement fix schema types.
  })
}
