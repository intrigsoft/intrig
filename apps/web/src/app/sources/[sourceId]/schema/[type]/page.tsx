import * as fs from 'fs'
import * as path from 'path'
import { Documentation } from '@/components/Documentation';
import { NextRequest } from 'next/server';
import { INTRIG_LOCATION } from '@/const/locations';
import docContent from './doc.md'
import { camelCase } from '@/lib/change-case';

type ExtractedSections = Record<string, string>;

export const dynamic = 'force-dynamic';

export default async function Index({ params: {sourceId, type}}: {params: {sourceId: string, type: string}}) {

  const typeName = decodeURIComponent(type);

  const filePath = path.resolve(INTRIG_LOCATION, 'generated', 'src', sourceId, 'components', 'schemas', `${typeName}.ts`);

  const content = fs.readFileSync(filePath, 'utf8');

  const regex = /\/\/--- (.+?) ---\/\/\n([\s\S]*?)(?=\/\/---|$)/g;

  const sections: ExtractedSections = {};

  let match;
  while ((match = regex.exec(content)) !== null) {
    const [, name, sectionContent] = match;
    sections[camelCase(name.trim())] = sectionContent.trim();
  }

  const jsonSchema = sections?.simpleType?.replace("/*[", "").replace("]*/", "").trim();

  const schemaFields = parseSchema(jsonSchema ? JSON.parse(jsonSchema) : {});

  const _content = `---
title: ${typeName}
---

## Schema Definition

{% table %}
---
* Field
* Type
* Description
* Validations
* Example
---
${schemaFields.map(field => `
* ${field.field ?? ''}
* ${field.type ? (field.type.startsWith('#') ? `[${field.type.split('/').pop()}](/sources/${sourceId}/schema/${field.type.split('/').pop()}) {% colspan=4 %}` : field.type) : ''}
* ${field.description ?? ''}
* ${field.validations?.length ? `
  {% table %}
  ---
  * property
  * value
  ---
  ${field.validations.map(validation => `
  * ${validation.key}
  * ${validation.value}
  ---
`)}
  {% /table %}
` : ''}
* ${field.example ?? ''}
---
`)}
{% /table %}

## Schema Representation

{% tabs %}
{% tab title="Type" %}

\`\`\`typescript
{% $typescriptType %}
\`\`\`
{% /tab %}
{% tab title="JSON Schema" %}

\`\`\`typescript
{% $jsonSchema %}
\`\`\`
{% /tab %}
{% tab title="Zod Schema" %}

\`\`\`typescript
{% $zodSchemas %}
\`\`\`
{% /tab %}
{% /tabs %}
`

  return (
    <>
      <Documentation content={_content} variables={{
        name: type,
        ...sections,
      }}/>
    </>
  );
}

interface Validation {
  key: string;
  value: string;
}

interface SchemaField {
  field: string;
  depth: number;
  jsonPath: string;
  type: string;
  validations: Validation[];
  description?: string;
  example?: string;
}

const potentialValidations = [
  'minLength',
  'maxLength',
  'pattern',
  'enum',
  'format',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'minItems',
  'maxItems',
  'uniqueItems',
  'minProperties',
  'maxProperties',
  'required',
  'additionalProperties'
]

function parseSchema(schema: any, prefix = "", depth = 0, jsonPath = "$"): SchemaField[] {
  let result: SchemaField[] = [];

  if (schema.type === "object" && schema.properties) {
    for (const key in schema.properties) {
      const value = schema.properties[key];
      const fieldName = `${' '.repeat(depth * 2)}${key}`; // Indentation
      const fieldJsonPath = `${jsonPath}.${key}`;
      const fieldType = value.type || value["$ref"] || "unknown";

      const validations = Object.entries(value)
        .filter(([key]) => potentialValidations.includes(key))
        .map(([key, value]) => ({
          key,
          value: Array.isArray(value) ? value.join(', ') : value + '',
        }))

      result.push({
        field: fieldName,
        depth,
        jsonPath: fieldJsonPath,
        type: fieldType,
        validations,
        description: value.description,
        example: value.example,
      });

      if (value.type === "object") {
        result = result.concat(parseSchema(value, `${fieldName}.`, depth + 1, fieldJsonPath));
      }
    }
  }
  return result;
}
