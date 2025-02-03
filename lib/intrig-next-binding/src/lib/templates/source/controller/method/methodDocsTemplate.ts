import {
  camelCase,
  CompiledOutput,
  IntrigSourceConfig,
  pascalCase,
  RequestProperties,
  Variable
} from '@intrig/cli-common';
import * as path from 'path';
import yaml from 'yaml';

function resolveRequestPropertiesList(pathVariables: Variable[], source: string, queryParams: Variable[], contentType: string, requestBody: string) {
  let requestProperties: Record<string, string> = {};
  if (pathVariables?.length > 0) {
    requestProperties['Path Variables'] = `
  {% table %}
  ${pathVariables.map(v => `
  * ${v.name}
  * [${v.ref.split('/').pop()}](/sources/${source}/schema/${encodeURIComponent(v.ref.split('/').pop())})
  `).join('\n  ---\n')}
  {% /table %}
  `;
  }
  if (queryParams?.length > 0) {
    requestProperties['Query Params'] = `
    {% table %}
    ${queryParams.map(v => `
    * ${v.name}
    * [${v.ref.split('/').pop()}](/sources/${source}/schema/${encodeURIComponent(v.ref.split('/').pop())})
    `).join('\n  ---\n')}
    {% /table %}`;
  }
  if (contentType) requestProperties['Content-Type'] = contentType;
  if (requestBody) requestProperties['Request Body'] = `[${requestBody}](/sources/${source}/schema/${encodeURIComponent(requestBody)})`;

  return Object.entries(requestProperties);
}

function resolveResponsePropertiesList(response: string, source: string, responseType: string) {
  let responseProperties: Record<string, string> = {};
  if (response) responseProperties['Response'] = `[${response}](/sources/${source}/schema/${encodeURIComponent(response)})`;
  if (responseType) responseProperties['Response Type'] = responseType;

  return Object.entries(responseProperties);
}

export function methodDocsTemplate(
  api: IntrigSourceConfig,
  _path: string,
  endpoints: RequestProperties[]
): CompiledOutput[] {
  if (endpoints.length < 1) return null;
  let {
    paths,
    operationId,
    description,
    summary,
    method,
    requestUrl,
    contentType,
    variables,
    requestBody,
    response,
    responseType,
    source
  } = endpoints[0];

  let pathVariables = variables?.filter((v) => v.in === 'path');
  let queryParams = variables?.filter((v) => v.in === 'query');

  let methodName = camelCase(operationId);
  let hookName = `use${pascalCase(operationId)}`;

  let params = `{ ${variables.map(a => {
    return `${a.name}: '<fill-value-here>'`
  }).join(', ')} }`

  let configPath = path.resolve(_path, 'src', api.id, ...paths, operationId, 'metainfo.json')

  let requestProperties: Record<string, string> = {}
  if (pathVariables?.length > 0) {
    requestProperties['Path Variables'] = `
  {% table %}
  ${pathVariables.map(v => `
  * ${v.name}
  * [${v.ref.split('/').pop()}](/sources/${source}/schema/${encodeURIComponent(v.ref.split('/').pop())})
  `).join('\n  ---\n')}
  {% /table %}
  `
  }
  if (queryParams?.length > 0) {
    requestProperties['Query Params'] = `
    {% table %}
    ${queryParams.map(v => `
    * ${v.name}
    * [${v.ref.split('/').pop()}](/sources/${source}/schema/${encodeURIComponent(v.ref.split('/').pop())})
    `).join('\n  ---\n')}
    {% /table %}`
  }
  if (contentType) requestProperties['Content-Type'] = contentType
  if (requestBody) requestProperties['Request Body'] = `[${requestBody}](/sources/${source}/schema/${encodeURIComponent(requestBody)})`

  let requestPropertiesList = Object.entries(requestProperties)

  let responseProperties: Record<string, string> = {}
  if (response) responseProperties['Response'] = `[${response}](/sources/${source}/schema/${encodeURIComponent(response)})`
  if (responseType) responseProperties['Response Type'] = responseType

  let responsePropertiesList = Object.entries(responseProperties)

  let serverContent = `
## Server side integration.

### Imports

\`\`\`tsx
import { ${methodName} } from '@intrig/next/${api.id}/${paths.join('/')}/${methodName}/server';
\`\`\`

### Usage

Use \`${methodName}\` as an async function in your component to make a request and handle the response. The following example demonstrates how to use it:

\`\`\`tsx
export async function MyComponent() {
  try {
    // Call the async function to fetch data
    let ${methodName}Response = await ${methodName}(${params});

    // Handle the response and display data
    return <>{${methodName}Response.name}</>;
  } catch (error) {
    // Handle errors if the request fails
    console.error('An error occurred:', error);
    return <>An error occurred while fetching data.</>;
  }
}
\`\`\`
  `

  let clientContent = `
## Client side integration

{% callout %}
Use our {% code-builder path="${configPath}" %} Code Builder {% /code-builder %} to explore the patterns and capabilities of \`${hookName}\` hook.
{% /callout %}

### Imports

##### Hook

\`\`\`tsx
import { ${hookName} } from '@intrig/next/${api.id}/${paths.join('/')}/${methodName}/client';
\`\`\`

##### Utility methods

\`\`\`tsx
import { isSuccess, isError, isPending } from '@intrig/next'
\`\`\`

### Usage

#### 1. Define hook variables.

Use the imported hook to define state variables for the API call.

\`\`\`tsx
let [${methodName}Resp, ${methodName}, clear${pascalCase(methodName)}] = ${hookName}();
\`\`\`

- \`${methodName}Resp\`: Holds the response state of the API.
- \`${methodName}\`: The function to trigger the API call.
- \`clear${methodName}\`: Clears the response state.

#### 2. Request on load.

Use \`useEffect\` to trigger the API request when the component is loaded.

\`\`\`tsx
import { useEffect } from 'react';

useEffect(() => {
  ${methodName}(${params})
}, []);
\`\`\`

#### 3. Handling the response

##### 3.1 Extract success state using \`useMemo\`.

Use \`useMemo\` to memoize the response data for efficient re-rendering when the response is successful.

\`\`\`tsx
import { useMemo } from 'react';
...

let petById = useMemo(() => {
  if (isSuccess(${methodName}Resp)) {
    return ${methodName}Resp.data
  }
}, [${methodName}Resp])
\`\`\`

##### 3.2 Perform actions when the response is successful using \`useEffect\`.

Use \`useEffect\` to perform actions whenever the response becomes successful.

\`\`\`tsx
import { useEffect } from 'react';

...

useEffect(() => {
  if (isSuccess(${methodName}Resp)) {
    //DO something with ${methodName}Resp.data
  }
}, [${methodName}Resp])
\`\`\`

##### 3.3 Handle the pending state

Render a loading state while the request is pending.

\`\`\`tsx
if (isPending(${methodName}Resp)) {
  return <>loading...</>
}
\`\`\`

##### 3.4 Handle errors.

Render an error message if the request fails.

\`\`\`tsx
if (isError(${methodName}Resp)) {
  return <>An error occurred... {${methodName}Resp.error}</>
}
\`\`\`

##### 3.5 Use the response within JSX.

Render the response data or error message conditionally within your JSX.

\`\`\`tsx
return <>
  {isSuccess(${methodName}Resp) && <>{${methodName}Resp.data}</>}
  {isError(${methodName}Resp) && <span className={'error'}>{${methodName}Resp.error}</span>}
</>
\`\`\`
  `

  let content = `---
${yaml.stringify({
    tags: [api.id, methodName, ...paths, hookName, method, requestUrl, operationId, contentType, responseType],
    title: `${operationId}`,
    requestSignature: `${method.toUpperCase()} ${requestUrl}`,
  })}
---

${summary ?? ''}

${description ?? ''}

## API Signature

\`\`\`http request
${method.toUpperCase()} ${requestUrl}
\`\`\`

${requestPropertiesList.length > 0 ? `
### Request Properties

{% table %}
* Property
* Value
---
${requestPropertiesList.map(([k, v]) => ([`* ${k}`, `* ${v}`].join('\n'))).join('\n---\n')}
{% /table %}
` : ``}

${responsePropertiesList.length > 0 ? `
### Response Properties

{% table %}
* Property
* Value
---
${responsePropertiesList.map(([k, v]) => ([`* ${k}`, `* ${v}`].join('\n'))).join('\n---\n')}
{% /table %}
` : ``}

---
{% tabs %}
{% tab title="Server" %}
${serverContent}
{% /tab %}

{% tab title="Client" %}
${clientContent}
{% /tab %}
{% /tabs %}
  `;

  return [
    {
      content,
      path: path.resolve(_path, 'src', api.id, ...paths, operationId, 'doc.md')
    }
  ]
}
