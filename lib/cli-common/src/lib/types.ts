import {RequestProperties} from "./util";
import {OpenAPIV3_1} from "openapi-types";

export interface IntrigSourceConfig {
  id: string;
  name: string;
  specUrl: string;
  regex?: string;
}

export interface IntrigConfig {
  addToGitOnUpdate?: boolean;
  rejectUnauthorized?: boolean;
  emptyBodyTypeOnPost?: "unknown" | "object" | "array" | "string" | "number" | "boolean" | "null" | "undefined";
  sources: IntrigSourceConfig[];
  generator: 'react' | 'next'
}

export interface ServerInfo {
  title: string
  serverUrls: string[]
}

export interface CompiledOutput {
  path: string,
  content: string
}

export interface DocInfo {
  info: OpenAPIV3_1.InfoObject,
  servers: OpenAPIV3_1.ServerObject[],
  externalDocs: OpenAPIV3_1.ExternalDocumentationObject
}

export interface SourceInfo {
  sourceInfo: DocInfo,
  controllers: OpenAPIV3_1.TagObject[],
  paths: RequestProperties[],
  schemas: Record<string, OpenAPIV3_1.SchemaObject>
}

export interface PostCompileProps {
  tempDir: string
  targetLibDir: string
}

export interface ContentGeneratorAdaptor {
  generateSourceContent(api: IntrigSourceConfig, _path: string, spec: SourceInfo): void
  generateGlobalContent(path: string, apisToSync: IntrigSourceConfig[]): void
  postBuild(): Promise<void>
  predev(): Promise<void>
  postCompile(props: PostCompileProps): Promise<void>
  postInit(): Promise<void>;
  preBuild(): Promise<void>;
}
