# {% $id %} call information

{% $description %}

## API Signature

```http request
GET /pets/addPet
```

### Additional Properties  

{% table %}
* Property
* Value
---
* Content-Type
* application/json
---
* path variables
* 
  {% list %}
  - id: string
  - name: string
  {% /list %}
---
* Query Params
* 
  {% list %}
  - id: string
  - name: string
  {% /list %}
---
* Request Body
*
  {% tabbedFence language="typescript" %}
  ```jsonschema
    {}
  ```
  ```typescript
    {}
  ```
  ```zod
    {}
  ```
  {% /tabbedFence %}
---
* Response Type
* application/json
---
* Response 
* 
  {% tabbedFence language="typescript" %}
  ```jsonschema
    {}
  ```
  ```typescript
    {}
  ```
  ```zod
    {}
  ```
  {% /tabbedFence %}
{% /table %}
---
## Server side integration.

#### 1. Import async function.

Import `getPetById` to your component as follows.

```tsx
import { getPetById } from '@intrig/client-next/src/petstore/pet/getPetById/getPetById';
```

#### 2. Use addPet.

use `addPet` as an async function in your component

```tsx
exoprt async function MyComponent() {
  
  let pet = await getPetById({id: '123'})
  
  return <>{pet.name}</>
}
```
---
## Client side integration

#### 1. Import hook.

Import `useGetPetById` hook to your component.

```tsx
import { useGetPetById } from '@intrig/client-next/src/petstore/pet/getPetById/useGetPetById';
```

#### 2. Import utility methods

```tsx
import { isSuccess, isError, isPending } from '@intrig/client-next/src/network-state'
```

#### 3. Define hook variables.

```tsx
let [petByIdResp, getPetById, clearPetById] = useGetPetById();
```

#### 4 Request on load.

```tsx
import { useEffect } from 'react';
useEffect(() => {
  getPetById({id: '123'})
}, []);
```

#### 5.1 Extract success as memo

```tsx
import { useMemo } from 'react';
...

let petById = useMemo(() => {
  if (isSuccess(petByIdResp)) {
    return petByIdResp.data
  }
}, [petByIdResp])
```

#### 5.2 Use in useEffect.

```tsx
import { useEffect } from 'react';

...

useEffect(() => {
  if (isSuccess(petByIdResp)) {
    //DO something with petByIdResp.data
  }
}, [petByIdResp])
```

#### 5.3 Handle pending state

```tsx
if (isPending(petByIdResp)) {
  return <>loading...</>
}
```

#### 5.4 Handle errors

```tsx
if (isError(petByIdResp)) {
  return <>An error occurred... {petByIdResp.error}</>
}
```

#### 5.5 Use within jsx.

```tsx
return <>
  {isSuccess(petByIdResp) && <>{petByIdResp.data}</>}
  {isError(petByIdResp) && <span className={'error'}>{petByIdResp.error}</span>}
</>
```
