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
