import {
  IntrigSourceConfig,
  markdownLiteral, pascalCase, camelCase, capitalCase,
  RequestProperties, CompiledOutput
} from '@intrig/cli-common';
import * as path from 'path';
import * as yaml from 'yaml';

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
  } = endpoints[0];
  let md = markdownLiteral(
    path.resolve(_path, 'src', api.id, ...paths, operationId, 'doc.md')
  );

  let pathVariables = variables?.filter((v) => v.in === 'path');
  let queryParams = variables?.filter((v) => v.in === 'query');

  let methodName = camelCase(operationId);
  let hookName = `use${pascalCase(operationId)}`;

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

### Additional Properties

{% table %}
* Property
* Value
---
${
  contentType
    ? `
* Content-Type
* ${contentType}
---
`: ``
}${
  pathVariables?.length > 0
    ? `
* Path Variables
*
  {% table %}
  ---
${pathVariables
      .map((v) => ([
        `  * ${v.name}`,
        `  * {% dataType type="${v.ref.split('/').pop()}" %}{% /dataType %}`
      ].join('\n')))
  .join('\n  ---\n')}
  {% /table %}
---
` : ``
}${
  queryParams?.length > 0
    ? `
* Query Params
*
  {% table %}
  ---
${queryParams
      .map((v) => ([
        `  * ${v.name}`,
        `  * {% dataType type="${v.ref.split('/').pop()}" %}{% /dataType %}`
      ].join('\n')))
      .join('\n  ---\n')}
  {% /table %}
---
`
    : ``
}${
  requestBody
    ? `
* Request Body
*
  {% dataType type="${requestBody}" %} {% /dataType %}
---
`
    : ``
}${
  responseType
    ? `
* Response Type
* ${responseType}
---
`
    : ``
}${
  response
    ? `
* Response
*
  {% dataType type="${response}" %} {% /dataType %}
---
`
    : ``
}
{% /table %}
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
