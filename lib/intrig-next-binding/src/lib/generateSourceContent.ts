import {generateHooks} from "./generateHooks";
import {IntrigSourceConfig, SourceInfo} from "@intrig/cli-common";
import {generateTypes} from "./generateTypes";

export function generateSourceContent(api: IntrigSourceConfig, _path: string, spec: SourceInfo) {
  generateHooks(api, _path, spec.paths)
  generateTypes(api, _path, spec.schemas)
}
