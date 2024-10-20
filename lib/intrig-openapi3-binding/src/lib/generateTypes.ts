import {OpenAPIV3_1} from "openapi-types";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {generate} from "openapi-typescript-codegen";

export async function generateTypes(newSpec: OpenAPIV3_1.Document, _path: string) {
  console.log('Starting generateTypes function');

  let tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test'));
  console.log(`Created temporary directory: ${tempDir}`);

  try {
    console.log('Generating OpenAPI types...');
    await generate({
      input: newSpec,
      output: tempDir,
      useUnionTypes: true,
      exportServices: false,
      exportCore: false,
      exportModels: true,
      exportSchemas: false,
    });
    console.log('OpenAPI types generated successfully');

    let paths = fs.readdirSync(path.join(tempDir, 'models'));
    console.log(`Found ${paths.length} model files`);

    if (paths.length) {
      let schemasDir = path.join(_path, 'components', 'schemas');
      fs.mkdirSync(schemasDir, {recursive: true});
      console.log(`Created schemas directory: ${schemasDir}`);
    }

    for (let file of paths) {
      let source = path.join(tempDir, 'models', file);
      let destination = path.join(_path, 'components', 'schemas', file);
      fs.copyFileSync(source, destination);
      console.log(`Copied file: ${file} to ${destination}`);
    }

    console.log('All files processed successfully');
  } catch (error) {
    console.error('Error in generateTypes:', error);
    throw error;
  } finally {
    console.log(`Cleaning up temporary directory: ${tempDir}`);
    fs.rmSync(tempDir, {recursive: true, force: true});
  }

  console.log('generateTypes function completed');
}
