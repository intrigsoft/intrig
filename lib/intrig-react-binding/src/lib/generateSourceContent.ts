import {generateHooks} from "./generateHooks";
import {IntrigSourceConfig, SourceInfo} from "@intrig/cli-common";
import {generateTypes} from "./generateTypes";
import { generateSourceTemplates } from './generateSourceTemplates';

export async function generateSourceContent(api: IntrigSourceConfig, _path: string, spec: SourceInfo) {
  await generateSourceTemplates(api, _path, spec)
  await generateHooks(api, _path, spec.paths)
  await generateTypes(api, _path, spec.schemas)
}
