import * as prettier from 'prettier'

export function markdownLiteral(path: string) {
  return async (strings: TemplateStringsArray, ...values: any[]) => {
    const rawCode = strings.reduce((acc, str, i) =>
      acc + str + (values[i] || ''), '');

    const content = await prettier.format(rawCode, {
      parser: 'markdown',
      singleQuote: true
    });

    return {
      path,
      content
    }
  }
}
