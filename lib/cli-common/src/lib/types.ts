import {RequestProperties} from "./util";
import {OpenAPIV3_1} from "openapi-types";

export interface IntrigSourceConfig {
  id: string;
  name: string;
  specUrl: string;
  devUrl: string;
  prodUrl: string;
  regex?: string;
  sourceDir?: string;
}

export interface IntrigConfig {
  addToGitOnUpdate?: boolean;
  rejectUnauthorized?: boolean;
  emptyBodyTypeOnPost?: "unknown" | "object" | "array" | "string" | "number" | "boolean" | "null" | "undefined";
  sources: IntrigSourceConfig[];
}

export interface ServerInfo {
  title: string
  serverUrls: string[]
}

export interface CompiledOutput {
  path: string,
  content: string
}

export interface SourceInfo {
  paths: RequestProperties[],
  schemas: Record<string, OpenAPIV3_1.SchemaObject>
}

export interface ContentGeneratorAdaptor {
  generateSourceContent(api: IntrigSourceConfig, _path: string, spec: SourceInfo): void
  generateGlobalContent(path: string, apisToSync: IntrigSourceConfig[]): void
}
