import {stripMargin} from "./strip-margin";
import {CompiledOutput} from "./types";
//@ts-ignore
import * as prettier from 'prettier'

export function typescript(path: string) {
  return (strings: TemplateStringsArray, ...values: any[]): CompiledOutput => {
    const rawCode = strings.reduce((acc, str, i) => {
      if (str.startsWith("*/")) str = str.slice(2);
      let [before] = str.split("/*!");
      return acc + before + (values?.[i] || '');
    }, '');

    let content = prettier.format(rawCode, {
      parser: 'typescript',
      singleQuote: true
    });

    return {
      path,
      content
    }
  }
}
