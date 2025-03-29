import {
  camelCase,
  IntrigSourceConfig,
  jsonLiteral,
  pascalCase,
  RequestProperties,
  SourceInfo
} from '@intrig/cli-common';
import * as path from 'node:path';
import { networkStateTemplate } from '../network-state.template';

export async function aiModelTemplate(
  api: IntrigSourceConfig,
  _path: string,
  spec: SourceInfo
) {
  const json = jsonLiteral(path.resolve(_path, 'src', api.id, 'ai-model.json'))

  const arr = []

  arr.push({
    "type": "client_side_hook_usage",
    "context": {
      "stateManagement": {
        "description": "The network state relationship is the base of state handling in the Frontend. The source is provided here",
        "source": (await networkStateTemplate("")).content,
      }
    },
    "instructions": {
      "sourceFile": {
        "description": "The source file should be annotated with 'use client' as the hooks are available only in client side",
      },
      "hookImport": {
        "description": "The hook is imported from '@intrig/next/...' the import statement is provided alongside the hook data",
      },
      "hookSignature": {
        "description": "The intrig generated hook has a specific signature. This signature varies slightly based on the backing endpoint url",
        "signature": {
          "endpointWithoutBody": `For any endpoint without a request body, the hook signature is:
            ${"```tsx"}
            useHookName(options: IntrigHookOptions<Params>): [NetworkState<Response>, (params: Params) => DispatchState<any>, () => void]
            ${"```"}
          `,
          "endpointWithBody": `For any endpoint with a request body, the hook signature is:
            ${"```tsx"}
            useHookName(options: IntrigHookOptions<Params, Body>): [NetworkState<Response>, (body: Body, params: Params) => DispatchState<any>, () => void]
            ${"```"}
          `,
        }
      },
      "utilityFunction": {
        "description": "The utility functions (type guards) is a vital part in intrig client side codes. Make sure to import correct utility functions. Utility functions can be imported from '@intrig/next'",
        "example": {
          "isSuccess": "import { isSuccess } from '@intrig/next'",
          "isError": "import { isError } from '@intrig/next'",
          "isInit": "import { isInit } from '@intrig/next'",
          "isPending": "import { isPending } from '@intrig/next'",
        }
      }
    },
    "usage": {
      "hookImport": {
        "description": "The hook is imported from '@intrig/next/...' the import statement is provided alongside the hook data",
        "example": `import { useHookName } from '@intrig/next/hookPath/hookName/client'`,
      },
      "hookVariableDefinition": {
        "description": `The hook follows a similar signature to the state hook like hooks. The hook return type have 3 parts, for the response, the dispatch function and the clear function. an example of the hook is provided below
        ${"```tsx"}
        const [state, dispatch, clear] = useHookName(options)
        ${"```"}

        Here,
        - The state provides the current network state of the hook.
        - The dispatch function is used to execute the hook.
        - The clear function is used to reset current state to init.
        - options can be undefined for the base case.
        `,
      },
      "requestOnMount": {
        "description": `
        In some usecases, the hook is needed to be executed on mount. The hook can be executed by calling the dispatch function with a useEffect hook.

        ${"```tsx"}
        const [state, dispatch, clear] = useHookName(options)

        useEffect(() => {
          dispatch({})
        }, [])
        ${"```"}

        Make sure to pass the required parameters and request body to the dispatch function.

        #### Example with path variables

        ${"```tsx"}
        const [state, dispatch, clear] = useGetPet({})

        useEffect(() => {
        dispatch({
          petId: 1,
        })
        }, [])

        ${"```"}

        #### Example with request body

        ${"```tsx"}
        const [state, dispatch, clear] = useCreatePet({})

        useEffect(() => {
          dispatch(pet) //pet is the request body and is defined elsewhere
        }, [])

        ${"```"}

        ### Example with path variables and request body

        ${"```tsx"}
        const [state, dispatch, clear] = useUpdatePet({})

        useEffect(() => {
          dispatch(pet, { petId: 1 }) //pet is the request body and is defined elsewhere
        }, [])

        ${"```"}
        `
      },
      "clearOnUnmount": {
        "description": `
        While the hook is being used inside a component, the storage is maintained outside the component. This provides a huge advantage in managing
        global state across the application. The users might forget to clear the state which results in unexpected behavior.
        To avoid this, the clear function can be used to clear the state.

        ${"```tsx"}
        const [state, dispatch, clear] = useUpdatePet({})

        useEffect(() => {
          return clear
        }, [])

        ${"```"}

        Alternatively a shorthand is provided to clear the state alongside the options.

        ${"```tsx"}
        const [state, dispatch] = useUpdatePet({ clearOnUnmount: true })
        ${"```"}
        `
      },
      "extractSuccessState": {
        "description": `
        Upon successful execution of the hook, the state will be in a success state. The state can be extracted using the utility functions.

        #### useState/useEffect setup.

        ${"```tsx"}
        const [state, dispatch] = useUpdatePet({})

        const [data, setData] = useState<Pet>()
        useEffect(() => {
          if (isSuccess(state)) {
            setData(state.data)
          }
        }, [state])
        ${"```"}

        #### useMemo setup.

        ${"```tsx"}
        const [state, dispatch] = useUpdatePet({})
        const data = useMemo(() => {
          return isSuccess(state) ? state.data : undefined
        }, [state])
        ${"```"}

        Note: The data might be switched between undefined and the actual data depending on the state. Which might result in unnecessary re-renders.

        ### inlined success state. - useful for simple cases. Might lead to unnecessary re-renders.

        ${"```tsx"}
        const [state, dispatch] = useUpdatePet({})

        return <>
          {isSuccess(state) && <div>{state.data}</div>}
        </>
        ${"```"}
        `
      },
      "extractErrorState": {
        "description": `
        Upon failed execution of the hook, the state will be in an error state. The state can be extracted using the utility functions.

        #### Act upon error.

        ${"```tsx"}
        const [state, dispatch] = useUpdatePet({})

        useEffect(() => {
          if (isError(state)) {
            //handle error
            console.error(state.error)
          }
        }, [state])
        ${"```"}

        #### early return on error.
        ${"```tsx"}
        const [state, dispatch] = useUpdatePet({})

        if (isError(state)) {
          return <div>{state.error}</div>
        }
        ${"```"}

        #### inlined error state. - useful for simple cases.
        ${"```tsx"}
        const [state, dispatch] = useUpdatePet({})

        return <>
        {isError(state) && <div>{state.error}</div>}
        </>
        ${"```"}
        `
      },
      "extractPendingState": {
        "description": `
        Upon pending execution of the hook, the state will be in a pending state. The state can be extracted using the utility functions.

        #### Early return on pending.
        ${"```tsx"}
        const [state, dispatch] = useUpdatePet({})

        if (isPending(state)) {
          return <div>Loading...</div>
        }
        ${"```"}

        #### inlined pending state. - useful for simple cases.

        ${"```tsx"}
        const [state, dispatch] = useUpdatePet({})

        return <>
        {isPending(state) && <div>Loading...</div>}
        </>
        ${"```"}
        `
      },
      "multipleInstancesForSameEndpoint": {
        "description": `
        In intrig, each hook is uniquely mapped to a single backing endpoint and state. In some cases the same endpoint might be used multiple times,
        in different contexts. In such cases, multiple instances of the state should be maintained. This can be achieved by providing a unique key to the hook.

        #### Comparison like example.

        ${"```tsx"}
        const [leftState, leftDispatch, clearLeft] = useGetPet({ key: 'left' })
        const [rightState, rightDispatch, clearRight] = useGetPet({ key: 'right' })

        useEffect(() => {
          leftDispatch({petId: 'Dog'})
          rightDispatch({petId: 'Cat'})
        }, [])
        ${"```"}

        #### Same component is duplicated.

        In this example, if the key is not used, there might be multiple alerts will be shown.

        ${"```tsx"}

        function DeleteButton({petId}: {petId: string}) {

          const [state, dispatch] = useDeletePet({ key: petId })

          useEffect(() => {
            if (isSuccess(state)) {
              alert(petId + ' deleted')
            }
          }, [state])

          return <button onClick={() => leftDispatch({petId})}>Delete</button>
        }

        function Pets() {
          return <>
          <table>
          <tbody>
          <tr><td>Dog</td><td><DeleteButton petId="Dog"/></td></tr>
          <tr><td>Cat</td><td><DeleteButton petId="Cat"/></td></tr>
          </tbody>
          <table>
        }
        ${"```"}
        `
      }
    }
  })

  for (const requestProperties of spec.paths) {
    await generateClientHookDefinition(requestProperties, arr, api);
  }

  return json`
  ${JSON.stringify(arr)}
  `;
}

async function generateClientHookDefinition({
                                              operationId,
                                              method,
                                              requestUrl,
                                              requestBody,
                                              variables,
                                              source,
                                              response,
                                              description,
                                              summary,
                                              paths,
                                              contentType,
                                              responseType,
                                            }: RequestProperties, arr: any[], api: IntrigSourceConfig) {
  const methodName = camelCase(operationId);
  const hookName = `use${pascalCase(operationId)}`;

  const parameters = [];

  if (requestBody) {
    parameters.push({
      name: 'requestBody',
      type: requestBody,
      documentationPath: `/sources/${source}/schema/${encodeURIComponent(requestBody)}`,
      description: `The request body for the ${method.toUpperCase()} request`,
    });
  }
  if (variables?.length) {
    parameters.push({
      name: 'variables',
      type: 'object',
      description: `The variables for the ${method.toUpperCase()} request`,
      signature: {
        ...Object.fromEntries(
          variables.map((variable) => [
            variable.name,
            {
              type: variable.ref.split('/').pop(),
              documentationPath: `/sources/${source}/schema/${encodeURIComponent(variable.ref.split('/').pop())}`,
            },
          ]),
        ),
      }
    });
  }

  const returns = response
    ? {
      type: response,
      documentationPath: `/sources/${source}/schema/${encodeURIComponent(response)}`,
    }
    : undefined;

  arr.push({
    type: 'client_side_hook',
    hook: hookName,
    requestSignature: `${method.toUpperCase()} ${requestUrl}`,
    parameters: parameters,
    returns: returns,
    summary: summary,
    description: description,
    tags: [
      api.id,
      methodName,
      ...paths,
      hookName,
      method,
      requestUrl,
      operationId,
      contentType,
      responseType,
    ],
    "hookImport": {
      "statement": `import { ${hookName} } from '@intrig/next/${api.id}/${paths.join('/')}/${methodName}/client'`
    },
    "hookSignature": {
      "signature": `(options?: IntrigHookOptions<Params${requestBody ? `, ${requestBody}` : ''}>): [NetworkState<${responseType}>, (${requestBody ? `body: ${requestBody},` : ''} params: Params) => DispatchState<any>, () => void])`
    }
  });
}

