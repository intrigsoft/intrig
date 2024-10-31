import {IntrigSourceConfig} from "@intrig/cli-common";
import {OpenAPIV3_1} from "openapi-types";
import {generateTypes} from "./generateTypes";
import {generateHooks} from "./generateHooks";
import {normalize} from "./normalize";

export async function generateCode(api: IntrigSourceConfig, _path: string, newSpec: OpenAPIV3_1.Document) {
  let normalized = normalize(newSpec);
  try {
    await generateTypes(api, _path, normalized);
    await generateHooks(api, _path, normalized)
  } catch (e) {
    console.error(e)
  }
}
