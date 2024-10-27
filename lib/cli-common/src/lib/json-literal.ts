import {CompiledOutput} from "./types";
import prettier from 'prettier'

export function jsonLiteral(path: string) {
  return (strings: TemplateStringsArray, ...values: any[]): CompiledOutput => {
    const rawCode = strings.reduce((acc, str, i) =>
      acc + str + (values[i] || ''), '');

    let content = prettier.format(rawCode, {
      parser: 'json',
      singleQuote: true
    });

    return {
      path,
      content
    }
  }
}
