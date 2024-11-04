export function extractPathVariables(template: string, path: string) {
  return new RegExp(
    template.replace(/[{]/g, '(?<').replace(/[}]/g, '>[^/]+)')
  ).exec(path)?.groups;
}
