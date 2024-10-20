import {stripMargin} from "./strip-margin";
import {CompiledOutput} from "./types";

export function typescript(path: string) {
  return (strings: TemplateStringsArray, ...values: any[]): CompiledOutput => {
    const rawCode = strings.reduce((acc, str, i) =>
      acc + str + (values[i] || ''), '');

    // Apply stripMargin to the combined code
    const content = stripMargin(rawCode);

    return {
      path,
      content
    }
  }
}
