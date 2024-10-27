import {OpenAPIV3_1} from "openapi-types";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {generate} from "openapi-typescript-codegen";
import {cli} from "cli-ux";

export async function generateTypes(newSpec: OpenAPIV3_1.Document, _path: string) {

  let tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test'));

  try {
    await generate({
      input: newSpec,
      output: tempDir,
      useUnionTypes: true,
      exportServices: false,
      exportCore: false,
      exportModels: true,
      exportSchemas: false,
    });

    let schemasDir = path.join(_path, 'components', 'schemas');

    let paths = fs.readdirSync(path.join(tempDir, 'models'));

    if (paths.length) {
      fs.mkdirSync(schemasDir, {recursive: true});
    }

    for (let file of paths) {
      let source = path.join(tempDir, 'models', file);
      let destination = path.join(_path, 'components', 'schemas', file);
      fs.copyFileSync(source, destination);
    }

  } catch (error) {
    console.error('Error in generateTypes:', error);
    throw error;
  } finally {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
}
