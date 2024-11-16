import * as path from 'path'
import * as fs from 'fs'
import { walkDirectory } from '@/services/walkDirectory';
import { GENERATED_LOCATION } from '@/const/locations';

export interface EmbeddedCodes {
  [key: string]: string;
}

declare global {
  var __embeddedCodes: Record<string, EmbeddedCodes>;
}

let embeddedCodes: Record<string, EmbeddedCodes> = {};

function addDocumentsToIndex() {

  let typeMappings: Record<string, Record<string, string>> = {};

  fs.readdirSync(path.resolve(GENERATED_LOCATION, 'generated', 'src'))
    .filter((file) => file !== 'api')
    .forEach((apiId) => {

      const apiPath = path.resolve(GENERATED_LOCATION, 'generated', 'src', apiId);

      if (!fs.statSync(apiPath).isDirectory()) {
        return
      }

      let appBasedMapping: Record<string, string> = {}

      const extractTypeDefinitions = (code: string, location: string): void => {
        let sections: Record<string, string> = {}
        code.split("//---").map((section) => {
          let [name, code] = section.split("---//")
          sections[name.trim()] = code?.trim()
        })
        let [def, impl] = sections['Typescript Type'].split('=');

        appBasedMapping[location] = impl
      };

      let directoryPath = path.resolve(GENERATED_LOCATION, 'generated', 'src', apiId, 'components', 'schemas');
      walkDirectory(directoryPath, (filePath, stats) => {
        if (stats.isFile() && filePath.endsWith('.ts')) {
          let content = fs.readFileSync(filePath, 'utf-8');

          extractTypeDefinitions(content, path.basename(filePath).replace('.ts', ''));
        }
      })
      typeMappings[apiId] = appBasedMapping;
    })
  global.__embeddedCodes = typeMappings
}

if (!global.__embeddedCodes) {
  global.__embeddedCodes = {}
  addDocumentsToIndex();
}

embeddedCodes = global.__embeddedCodes

export { embeddedCodes }

