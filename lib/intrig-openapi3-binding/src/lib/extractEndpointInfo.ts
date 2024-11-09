import {IntrigSourceConfig, SourceInfo} from "@intrig/cli-common";
import {OpenAPIV3_1} from "openapi-types";
import {normalize} from "./normalize";
import {extractRequestsFromSpec} from "./extractRequestsFromSpec";
import {extractSchemas} from "./extractSchemas";
import { extractSourceInfo } from './extractSourceInfo';
import { extractControllerInfo } from './extractControllerInfo';

export function extractEndpointInfo(api: IntrigSourceConfig, spec: OpenAPIV3_1.Document): SourceInfo {
  let normalized = normalize(spec);

  return {
    sourceInfo: extractSourceInfo(normalized),
    controllers: extractControllerInfo(normalized),
    paths: extractRequestsFromSpec(normalized, api),
    schemas: extractSchemas(normalized)
  }
}
