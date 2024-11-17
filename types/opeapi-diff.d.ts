declare module 'openapi-diff' {
  interface OpenApiSpec {
    content: string;
    location: string;
    format: 'openapi3';
  }

  interface DiffResult {
    breakingDifferencesFound: boolean;
  }

  export function diffSpecs(options: { sourceSpec: OpenApiSpec; destinationSpec: OpenApiSpec }): Promise<DiffResult>;
}
