import * as path from 'path';
import * as fs from 'fs';
import { walkDirectory } from '@/services/walkDirectory';
import { INTRIG_LOCATION } from '@/const/locations';

export interface EmbeddedCodes {
  [key: string]: string;
}

export interface EmbeddedCodeSection {
  tsType: Record<string, string>
  zodSchema: Record<string, string>
  jsonSchema: Record<string, string>
}

declare global {
  var __embeddedCodes: Record<string, EmbeddedCodeSection>;
}

let embeddedCodes: Record<string, EmbeddedCodeSection> = {};

function addDocumentsToIndex() {

  const typeMappings: Record<string, EmbeddedCodeSection> = {};

  if (fs.existsSync(path.resolve(INTRIG_LOCATION, 'generated', 'src'))) {
    fs.readdirSync(path.resolve(INTRIG_LOCATION, 'generated', 'src'))
      .filter((file) => file !== 'api')
      .forEach((apiId) => {

        const apiPath = path.resolve(INTRIG_LOCATION, 'generated', 'src', apiId);

        if (!fs.statSync(apiPath).isDirectory()) {
          return
        }

        const appBasedMapping: EmbeddedCodeSection = {
          tsType: {},
          zodSchema: {},
          jsonSchema: {},
        }

        function extractDef(section: string) {
          const [def, ...content] = section.split(/=/);

          // @ts-expect-error This regex deliberately uses named capture groups, which are not always supported in all execution contexts.
          const { groups } = /export (\w+) (?<name>[\w$]+)/.exec(def)!;
          return {
            def: groups?.['name'] ?? '',
            content: content.join('=').trim()
          }
        }

        function extractTypeDefinitions(code: string, location: string): void {
          const sections: Record<string, string> = {};
          code.split('//---').map((section) => {
            const [name, code] = section.split('---//');
            sections[name.trim()] = code?.trim();
          });

          const tsType = extractDef(sections['Typescript Type']);
          appBasedMapping.tsType[tsType.def] = tsType.content;

          const schema = extractDef(sections['Zod Schemas']);
          appBasedMapping.zodSchema[schema.def] = schema.content;

          const jsonSchema = extractDef(sections['JSON Schema']);
          appBasedMapping.jsonSchema[jsonSchema.def] = jsonSchema.content;
        }

        const directoryPath = path.resolve(
          INTRIG_LOCATION,
          'generated',
          'src',
          apiId,
          'components',
          'schemas'
        );
        walkDirectory(directoryPath, (filePath, stats) => {
          if (stats.isFile() && filePath.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf-8');

            extractTypeDefinitions(content, path.basename(filePath).replace('.ts', ''));
          }
        })
        typeMappings[apiId] = appBasedMapping;
      })
  }

  global.__embeddedCodes = typeMappings
}

if (!global.__embeddedCodes) {
  global.__embeddedCodes = {}
  addDocumentsToIndex();
}

export function reindex() {
  global.__embeddedCodes = {}
  addDocumentsToIndex();
}

embeddedCodes = global.__embeddedCodes

export { embeddedCodes }

