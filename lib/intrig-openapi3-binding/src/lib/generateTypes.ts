import {OpenAPIV3_1} from "openapi-types";
import {IntrigSourceConfig} from "@intrig/cli-common";
import {typeTemplate} from "./templates/typeTemplate";
import {dump} from "./util";

export async function generateTypes(api: IntrigSourceConfig, _path: string, spec: OpenAPIV3_1.Document) {

  for (let [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
    let output = typeTemplate({
      typeName: name,
      schema,
      paths: [api.id, "components", "schemas"],
      sourcePath: _path
    });
    dump(output)
  }
}
