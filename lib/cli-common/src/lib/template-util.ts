import {Variable} from "./util";
import {pascalCase} from "./change-case";

export function getVariableName(ref: string) {
  return ref.split('/').pop()
}

export function getVariableImports(variables: Variable[], source: string, prefix: string) {
  return variables
    .map(a => getVariableName(a.ref))
    .map((ref) => `import { ${ref} } from "${prefix}/${source}/components/schemas/${ref}"`)
    .join("\n");
}

export function getVariableTypes(variables: Variable[]) {
  return variables.map((p) => `${p.name}${p.in === "path" ? "": "?"}: ${getVariableName(p.ref)}`)
    .join("\n")
}

export function isParamMandatory(variables: Variable[]) {
  return variables.some(a => a.in === 'path');
}

export function getParamExplodeExpression(variables: Variable[]) {
  return [
    ...variables.filter(a => a.in === "path").map(a => a.name),
    "...params"
  ].join(",");
}

export function decodeVariables(_variables: Variable[], source: string, prefix: string = "@root") {
  let variables = _variables.filter(a => ["path", "query"].includes(a.in))
  return {
    variableImports: getVariableImports(variables, source, prefix),
    variableTypes: getVariableTypes(variables),
    isParamMandatory: isParamMandatory(variables),
    variableExplodeExpression: getParamExplodeExpression(variables)
  }
}

export function getDispatchParams(operationId: string, requestBody?: string, isParamMandatory: boolean = false) {
  return [
    requestBody ? `data: RequestBody` : undefined,
    `params: Params${isParamMandatory ? '' : ' | undefined'}`
  ]
    .filter(Boolean)
    .join(', ')
}

export function getDispatchParamExpansion(requestBody?: string, isParamMandatory?: boolean) {
  return [
    requestBody && 'data',
    `p${isParamMandatory ? '' : ' = {}'}`
  ].filter(Boolean).join(', ');
}

export function decodeDispatchParams(operationId: string, requestBody?: string, isParamMandatory?: boolean) {
  return {
    dispatchParams: getDispatchParams(operationId, requestBody, isParamMandatory),
    dispatchParamExpansion: getDispatchParamExpansion(requestBody, isParamMandatory)
  }
}

export function getDataTransformer(contentType?: string) {
  let finalRequestBodyBlock = 'data'
  switch (contentType) {
    case "application/json":
    case "application/octet-stream":
    case "text/plain":
      finalRequestBodyBlock = `data`
      break;
    case "multipart/form-data":
      finalRequestBodyBlock = `data: (function(){
        let formData = new FormData()
        Object.keys(data).forEach(key => formData.append(key, data[key]))
        return formData;
      })()`
      break;
    case "application/x-www-form-urlencoded":
      finalRequestBodyBlock = `data: qs.stringify(data)`
      break;
  }
  return finalRequestBodyBlock;
}

const contentTypePostfixMap: Record<string, string | undefined> = {
  'application/json': undefined,
  'multipart/form-data': 'form',
  'application/octet-stream': 'binary',
  'application/x-www-form-urlencoded': 'form',
  'application/xml': 'xml',
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/javascript': 'js',
}

export function generatePostfix(contentType: string, responseType: string) {
  return [
    contentType && contentTypePostfixMap[contentType] ? `$${contentTypePostfixMap[contentType]}` : undefined,
    responseType && contentTypePostfixMap[responseType] ? `_${contentTypePostfixMap[responseType]}` : undefined,
  ].filter(Boolean)
    .join('')
}
