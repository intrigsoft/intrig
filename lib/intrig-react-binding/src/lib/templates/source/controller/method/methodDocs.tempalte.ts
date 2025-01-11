import {
  IntrigSourceConfig,
  markdownLiteral, pascalCase, camelCase, capitalCase,
  RequestProperties, CompiledOutput, Variable
} from '@intrig/cli-common';
import * as path from 'path';
import * as yaml from 'yaml';

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

export function methodDocsTempalte(
  api: IntrigSourceConfig,
  _path: string,
  endpoints: RequestProperties[]
): CompiledOutput {
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
  let md = markdownLiteral(
    path.resolve(_path, 'src', api.id, ...paths, operationId, 'doc.md')
  );

  let pathVariables = variables?.filter((v) => v.in === 'path');
  let queryParams = variables?.filter((v) => v.in === 'query');

  let methodName = camelCase(operationId);
  let hookName = `use${pascalCase(operationId)}`;

  let requestPropertiesList = resolveRequestPropertiesList(pathVariables, source, queryParams, contentType, requestBody);

  let responsePropertiesList = resolveResponsePropertiesList(response, source, responseType);

  let params = `{ ${variables.map(a => {
    return `${a.name}: '<fill-value-here>'`
  }).join(', ')} }`

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
## Client side integration

#### 1. Import hook.

To use the generated hook, import {% code path="${api.id}/${paths.join('/')}/${methodName}/${hookName}" %}\`${hookName}\`{% /code %} into your component as follows:

\`\`\`tsx
import { ${hookName} } from '@intrig/react/${api.id}/${paths.join('/')}/${methodName}/client';
\`\`\`

#### 2. Import utility methods

These utility methods help in identifying the state of your network request, such as whether it is successful, pending, or has an error.

\`\`\`tsx
import { isSuccess, isError, isPending } from '@intrig/react'
\`\`\`

#### 3. Define hook variables.

Use the imported hook to define state variables for the API call.

\`\`\`tsx
let [${methodName}Resp, ${methodName}, clear${pascalCase(methodName)}] = ${hookName}();
\`\`\`

- \`${methodName}Resp\`: Holds the response state of the API.
- \`${methodName}\`: The function to trigger the API call.
- \`clear${methodName}\`: Clears the response state.

#### 4 Request on load.

Use \`useEffect\` to trigger the API request when the component is loaded.

\`\`\`tsx
import { useEffect } from 'react';

useEffect(() => {
  ${methodName}(${params})
}, []);
\`\`\`

#### 5. Handling the response

##### 5.1 Extract success state using \`useMemo\`.

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

#### 5.2 Perform actions when the response is successful using \`useEffect\`.

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

#### 5.3 Handle the pending state

Render a loading state while the request is pending.

\`\`\`tsx
if (isPending(${methodName}Resp)) {
  return <>loading...</>
}
\`\`\`

#### 5.4 Handle errors.

Render an error message if the request fails.

\`\`\`tsx
if (isError(${methodName}Resp)) {
  return <>An error occurred... {${methodName}Resp.error}</>
}
\`\`\`

#### 5.5 Use the response within JSX.

Render the response data or error message conditionally within your JSX.

\`\`\`tsx
return <>
  {isSuccess(${methodName}Resp) && <>{${methodName}Resp.data}</>}
  {isError(${methodName}Resp) && <span className={'error'}>{${methodName}Resp.error}</span>}
</>
\`\`\`

  `;

  return {
    content,
    path: path.resolve(_path, 'src', api.id, ...paths, operationId, 'doc.md')
  }
}
