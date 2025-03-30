import {
  camelCase,
  IntrigSourceConfig,
  pascalCase,
  RequestProperties,
} from '@intrig/cli-common';
import * as path from 'path';
import yaml from 'yaml';
export function methodDocsTemplate(
  api: IntrigSourceConfig,
  _path: string,
  endpoints: RequestProperties[]
) {
  if (endpoints.length < 1) return null;
  const {
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

  const pathVariables = variables?.filter((v) => v.in === 'path');
  const queryParams = variables?.filter((v) => v.in === 'query');

  const methodName = camelCase(operationId);
  const hookName = `use${pascalCase(operationId)}`;
  const linkName = `${pascalCase(operationId)}Link`

  const params = `{ ${variables.map(a => {
    return `${a.name}: '<fill-value-here>'`
  }).join(', ')} }`

  const configPath = path.resolve(_path, 'src', api.id, ...paths, operationId, 'metainfo.json')

  const requestProperties: Record<string, string> = {}
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

  const requestPropertiesList = Object.entries(requestProperties)

  const responseProperties: Record<string, string> = {}
  if (response) responseProperties['Response'] = `[${response}](/sources/${source}/schema/${encodeURIComponent(response)})`
  if (responseType) responseProperties['Response Type'] = responseType

  const responsePropertiesList = Object.entries(responseProperties)

  const serverContent = `
## Server side integration.

### Imports

${"```tsx"}
import { ${methodName} } from '@intrig/next/${api.id}/${paths.join('/')}/${methodName}/server';
${"```"}

### Usage

Use \`${methodName}\` as an async function in your component to make a request and handle the response. The following example demonstrates how to use it:

${"```tsx"}
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
${"```"}
  `

  const clientContent = `
## Client side integration

{% callout %}
Use our {% code-builder path="${configPath}" %} Code Builder {% /code-builder %} to explore the patterns and capabilities of \`${hookName}\` hook.
{% /callout %}

### Imports

##### Hook

${"```tsx"}
import { ${hookName} } from '@intrig/next/${api.id}/${paths.join('/')}/${methodName}/client';
${"```"}

##### Utility methods

${"```tsx"}
import { isSuccess, isError, isPending } from '@intrig/next'
${"```"}

### Usage

#### 1. Define hook variables.

Use the imported hook to define state variables for the API call.

${"```tsx"}
let [${methodName}Resp, ${methodName}, clear${pascalCase(methodName)}] = ${hookName}();
${"```"}

- \`${methodName}Resp\`: Holds the response state of the API.
- \`${methodName}\`: The function to trigger the API call.
- \`clear${methodName}\`: Clears the response state.

#### 2. Request on load.

Use \`useEffect\` to trigger the API request when the component is loaded.

${"```tsx"}
import { useEffect } from 'react';

useEffect(() => {
  ${methodName}(${params})
}, []);
${"```"}

#### 3. Clear on unmount.

Use \`useEffect\` to clear the response state when the component is unmounted.

${"```tsx"}
import { useEffect } from 'react';

useEffect(() => {
  return clear${pascalCase(methodName)}
}, [])
${"```"}

__Note__: Alternatively, you can configure the hook to clear the response state on unmount using the \`clearOnUnmount\` option.

${"```tsx"}
let [${methodName}Resp, ${methodName}] = ${hookName}({ clearOnUnmount: true });
${"```"}

#### 4. Managing response instances.

Use \`key\` option to manage multiple response instances of the hook.

${"```tsx"}
let [${methodName}RespLeft, ${methodName}Left] = ${hookName}({ key: 'Left' });
let [${methodName}RespRight, ${methodName}Right] = ${hookName}({ key: 'Right' });
${"```"}

#### 5. Handling the response

##### 5.1 Extract success state using \`useMemo\`.

Use \`useMemo\` to memoize the response data for efficient re-rendering when the response is successful.

${"```tsx"}
import { useMemo } from 'react';
...

let petById = useMemo(() => {
  if (isSuccess(${methodName}Resp)) {
    return ${methodName}Resp.data
  }
}, [${methodName}Resp])
${"```"}

##### 5.2 Perform actions when the response is successful using \`useEffect\`.

Use \`useEffect\` to perform actions whenever the response becomes successful.

${"```tsx"}
import { useEffect } from 'react';

...

useEffect(() => {
  if (isSuccess(${methodName}Resp)) {
    //DO something with ${methodName}Resp.data
  }
}, [${methodName}Resp])
${"```"}

##### 5.3 Handle the pending state

Render a loading state while the request is pending.

${"```tsx"}
if (isPending(${methodName}Resp)) {
  return <>loading...</>
}
${"```"}

##### 5.4 Handle errors.

Render an error message if the request fails.

${"```tsx"}
if (isError(${methodName}Resp)) {
  return <>An error occurred... {${methodName}Resp.error}</>
}
${"```"}

##### 5.5 Use the response within JSX.

Render the response data or error message conditionally within your JSX.

${"```tsx"}
return <>
  {isSuccess(${methodName}Resp) && <>{${methodName}Resp.data}</>}
  {isError(${methodName}Resp) && <span className={'error'}>{${methodName}Resp.error}</span>}
</>
${"```"}
  `

  const downloadAvailable = method.toUpperCase() === 'GET' && !(responseType === 'application/json' || responseType === '*/*');

  const downloadContent = `
## Download link integration.

### Imports

- For server side usage import from server imports
${"```tsx"}
import { ${linkName} } from '@intrig/next/${api.id}/${paths.join('/')}/${methodName}/server';
${"```"}

- For client side usage import from client imports

${"```tsx"}
import { ${linkName} } from '@intrig/next/${api.id}/${paths.join('/')}/${methodName}/server';
${"```"}

### Usage

Use ${linkName} within jsx content instead of regular Link in next/link

${"```tsx"}
return <${linkName} ${pathVariables?.length ? `params={${params}}` : ''}>
  Download ${methodName} content
</${linkName}>
${"```"}

  `

  const content = `---
${yaml.stringify({
    tags: [api.id, methodName, ...paths, hookName, method, requestUrl, operationId, contentType, responseType],
    title: `${operationId}`,
    requestSignature: `${method.toUpperCase()} ${requestUrl}`,
  })}
---

${summary ?? ''}

${description ?? ''}

## API Signature

${"```"}http request
${method.toUpperCase()} ${requestUrl}
${"```"}

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
${downloadAvailable ? `
{% tab title="Download Link" %}
${downloadContent}
{% /tab %}
` : ``}
{% /tabs %}
  `;

  return [
    Promise.resolve({
      content,
      path: path.resolve(_path, 'src', api.id, ...paths, operationId, 'doc.md')
    })
  ]
}
