import {IntrigSourceConfig} from "@intrig/cli-common";
import {OpenAPIV3_1} from "openapi-types";
import {generateTypes} from "./generateTypes";
import {generateHooks} from "./generateHooks";
import {normalize} from "./normalize";
import * as path from 'path'

export async function generateCode(api: IntrigSourceConfig, _path: string, newSpec: OpenAPIV3_1.Document) {
  let normalized = normalize(newSpec);
  await generateTypes(normalized, path.join(_path, "src", "lib", api.id));
  try {
    await generateHooks(api, _path, normalized)
  } catch (e) {
    console.error(e)
  }
}
