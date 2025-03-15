import {OpenAPIV3_1} from "openapi-types";
import {typeTemplate} from "./templates/source/type/typeTemplate";
import {dump, IntrigSourceConfig} from "@intrig/cli-common";

export async function generateTypes(api: IntrigSourceConfig, _path: string, schemas: Record<string, OpenAPIV3_1.SchemaObject>) {
  for (const [name, schema] of Object.entries(schemas)) {
    const output = typeTemplate({
      typeName: name,
      schema,
      paths: [api.id, "components", "schemas"],
      sourcePath: _path
    });
    await dump(output);
  }
}
