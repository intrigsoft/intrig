import {OpenAPIV3_1} from "openapi-types";
import {typeTemplate} from "./templates/source/type/typeTemplate";
import {dump, IntrigSourceConfig} from "@intrig/cli-common";

export function generateTypes(api: IntrigSourceConfig, _path: string, schemas: Record<string, OpenAPIV3_1.SchemaObject>) {
  for (let [name, schema] of Object.entries(schemas)) {
    let output = typeTemplate({
      typeName: name,
      schema,
      paths: [api.id, "components", "schemas"],
      sourcePath: _path
    });
    dump(output);
  }
}
