import {generateHooks} from "./generateHooks";
import {IntrigSourceConfig, SourceInfo} from "@intrig/cli-common";
import {generateTypes} from "./generateTypes";
import { generateSourceTemplates } from './generateSourceTemplates';

export function generateSourceContent(api: IntrigSourceConfig, _path: string, spec: SourceInfo) {
  generateSourceTemplates(api, _path, spec)
  generateHooks(api, _path, spec.paths)
  generateTypes(api, _path, spec.schemas)
}
