import {Variable} from "./util";
import {pascalCase} from "./change-case";

export function getVariableName(ref: string) {
  return ref.split('/').pop()
}

export function getVariableImports(variables: Variable[], source: string) {
  return variables
    .map(a => getVariableName(a.ref))
    .map((ref) => `import { ${ref} } from "@root/${source}/components/schemas/${ref}"`)
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

export function decodeVariables(variables: Variable[], source: string) {
  return {
    variableImports: getVariableImports(variables, source),
    variableTypes: getVariableTypes(variables),
    isParamMandatory: isParamMandatory(variables),
    variableExplodeExpression: getParamExplodeExpression(variables)
  }
}

export function getDispatchParams(operationId: string, requestBody?: string) {
  return [
    requestBody ? `data: RequestBody` : undefined,
    `params: ${pascalCase(operationId)}Params`
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
    dispatchParams: getDispatchParams(operationId, requestBody),
    dispatchParamExpansion: getDispatchParamExpansion(requestBody, isParamMandatory)
  }
}
