'use client';

import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { ErrorResponse, Variable } from '../../../../lib/cli-common/src';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage, Field, Label } from '@/catalyst/fieldset';
import { Input } from '@/catalyst/input';
import { Select } from '@/catalyst/select';
import { Checkbox, CheckboxField, CheckboxGroup } from '@/catalyst/checkbox';
import { Switch } from '@/catalyst/switch';
import { Highlight, themes } from 'prism-react-renderer'
// @ts-ignore
import prettier from 'prettier/standalone';
// @ts-ignore
import parserTypescript from 'prettier/parser-typescript';
import { pascalCase, camelCase } from '@/lib/change-case';
import { CheckIcon, ClipboardIcon, InformationCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Fieldset, Legend, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export interface RequestProperties {
  method: string
  source: string
  paths: string[]
  operationId: string
  requestBody?: string
  contentType?: string
  response?: string
  responseType?: string,
  requestUrl: string,
  variables: Variable[],
  sourcePath: string
  description?: string
  summary?: string
  responseExamples?: Record<string, string>
  errorResponses?: Record<string, ErrorResponse>
}


interface Spec {
  componentType: 'named-function' | 'const-expression';
  componentName: string;
  fetchOnMount: boolean;
  fetchOnCallback: boolean;
  cleanupOnUnmount: boolean;
  pendingBlock: 'explicit' | 'inline' | 'none';
  errorBlock: 'explicit' | 'inline' | 'none';
  responseName: string;
  successMemo?: boolean;
  errorMemo?: boolean;
  successEffect?: boolean;
  successCached?: boolean;
  errorEffect?: boolean;
}

export interface ReactClientComponentEditorProps {
  config: RequestProperties;
}

export function ReactClientComponentEditor({ config }: ReactClientComponentEditorProps) {

  let pathname = usePathname();

  let {
    handleSubmit,
    register,
    setValue,
    control,
    watch,
    formState: { errors }
  } = useForm<Spec>({
    mode: 'onBlur',
    defaultValues: {
      componentType: 'named-function',
      componentName: 'MyComponent',
      fetchOnMount: false,
      fetchOnCallback: false,
      cleanupOnUnmount: false,
      pendingBlock: 'none',
      errorBlock: 'none',
      responseName: 'response',
      successMemo: false,
      successEffect: false,
      errorMemo: false,
      errorEffect: false
    }
  });

  const data = watch();

  const content = useMemo(() => {

    let copyBlocks: Record<string, string> = {}

    function registerBlock(block: string, tag: string) {
      copyBlocks[tag] = block;
      return `${block} //c_${tag}`
    }

    let isErrorPresent = false
    let isPendingPresent = false
    let useEffectHookPresent = false
    let useMemoHookPresent = false
    let useCallbackHookPresent = false
    let useStateHookPresent = false

    let methodName = camelCase(config.operationId);
    let hookName = `use${pascalCase(config.operationId)}`;

    let hookImportBlock = registerBlock(`import {${hookName}} from '@intrig/next/${config.source}/${config.paths.join('/')}/${methodName}/client'`, 'hookImport')

    let executionPostfix = config.method === 'get' ? 'fetch' : 'execute';

    let mandatoryParams = config.variables.filter(a => a.in === 'path').map(a => a.name)
    let componentPropsInterface = `export interface ${data.componentName}Props {
      ${mandatoryParams.length ? `params: ${data.componentName}Params` : ''}
      ${config.requestBody ? `requestBody: ${config.requestBody}` : ''}
    }`

    let paramList = [mandatoryParams.length ? 'params' : undefined, config.requestBody ? 'requestBody' : undefined].filter(Boolean).join(', ');
    let paramDeconstruction = mandatoryParams.length || config.requestBody ?
      `{${paramList}} : ${data.componentName}Params` :
      '';

    let isFetchPresent = false
    let isClearPresent = false

    if (data.fetchOnMount) {
      useEffectHookPresent = true
      isFetchPresent = true
    }
    if (data.cleanupOnUnmount) {
      useEffectHookPresent = true
      isClearPresent = true
    }

    let defaultFetchHook = registerBlock(`useEffect(() => {
      ${data.fetchOnMount ? `${executionPostfix}${pascalCase(data.responseName)}(${paramList})` : ''}
    }, [${paramList}])`, 'defaultFetchHook')

    let defaultCleanupHook = registerBlock(`useEffect(() => {
      ${data.cleanupOnUnmount ? `return clear${pascalCase(data.responseName)}` : ''}
    }, [])`, 'defaultCleanupHook')

    let hookParams = [data.responseName]
    if (isFetchPresent) hookParams.push(`${executionPostfix}${pascalCase(data.responseName)}`)
    else if (isClearPresent) hookParams.push(``)
    if (isClearPresent) {
      hookParams.push(`clear${pascalCase(data.responseName)}`)
    }

    let callback = data.fetchOnCallback ? registerBlock(`let on${pascalCase(data.responseName)}Fetch = useCallback(() => {
      ${executionPostfix}${pascalCase(data.responseName)}()
    }, [${executionPostfix}${pascalCase(data.responseName)}])`, 'callback') : '';

    if (data.fetchOnCallback) useCallbackHookPresent = true

    let inlineSuccessPresent = !(data.successMemo || data.successEffect);

    let successMemoBlock = data.successMemo ?
      registerBlock(`let data = useMemo(() => isSuccess(${data.responseName}) ? ${data.responseName}.data : undefined, [${data.responseName}])`, 'successMemo')
      : '';
    let errorMemoBlock = data.errorMemo ?
      registerBlock(`let error = useMemo(() => isError(${data.responseName}) ? ${data.responseName}.error : undefined, [${data.responseName}])`, 'errorMemo')
      : '';
    if (data.errorMemo) isErrorPresent = true
    if (data.successMemo || data.errorMemo) useMemoHookPresent = true

    let effectBlock = registerBlock(`useEffect(() => {
      ${data.successEffect ? `if (isSuccess(${data.responseName})) {
        //Do something with ${data.responseName}.data
        console.log(${data.responseName}.data)
      }` : ''}
      ${data.errorEffect ? `if (isError(${data.responseName})) {
        //Do something with ${data.responseName}.error
        console.error(${data.responseName}.error)
      }` : ''}
    }, [${data.responseName}])`, 'effectBlock')
    if (data.errorEffect) isErrorPresent = true
    if (data.errorEffect || data.successEffect) useEffectHookPresent = true

    let successEffectBlock = ''
    let successStateBlock = ''
    if (data.successCached) {
      successEffectBlock = registerBlock(`
      useEffect(() => {
        if (isSuccess(${data.responseName})) {
          setSuccessData(${data.responseName}.data)
        } else if (isError(${data.responseName})) {
          setSuccessData(undefined)
        }
      }, [${data.responseName}])`, 'successEffectBlock')

      successStateBlock = registerBlock(`let [successData, setSuccessData] = useState()`, 'successStateBlock')

      useStateHookPresent = true
      useEffectHookPresent = true
      inlineSuccessPresent = false
    }

    let errorBlock = data.errorBlock === 'explicit' ? registerBlock(`if (isError(${data.responseName})) {
      return <div>{${data.responseName}}</div>
    }`, 'errorBlock') : ''

    if (data.errorBlock !== 'none') isErrorPresent = true

    let pendingBlock = data.pendingBlock === 'explicit' ? registerBlock(`if (isPending(${data.responseName})) {
      return <div>loading...</div>
    }`, 'pendingBlock'): ''
    if (data.pendingBlock !== 'none') isPendingPresent = true

    let inlineErrorBlock = data.errorBlock === 'inline' ?
      (data.errorMemo ? `{error && <div>{error}</div>}` : `{isError(${data.responseName}) && <div>{${data.responseName}.error}</div>}`) :
      (data.errorMemo ? `{error && <div>{error}</div>}` : '')

    let reactImports = [
      useEffectHookPresent ? 'useEffect' : undefined,
      useMemoHookPresent ? 'useMemo' : undefined,
      useCallbackHookPresent ? 'useCallback' : undefined,
      useStateHookPresent ? 'useState' : undefined,
    ].filter(Boolean).join(', ');

    let hookDefinition = registerBlock(`let [${hookParams.join(',')}] = ${hookName}()`, 'hookDef')
    let requestBodyImport = config.requestBody && isFetchPresent ? registerBlock(`import { ${config.requestBody} } from '@intrig/next/${config.source}/components/schemas/${config.requestBody}'`, 'requestBodyImport') : '';
    let intrigImport = registerBlock(`import { isSuccess${isErrorPresent ? ', isError' : ''}${isPendingPresent ? ', isPending' : ''} } from '@intrig/next' `, 'intrigImport')
    let reactImport = registerBlock(`import { ${reactImports} } from 'react'`, 'reactImport')

    let declaration = data.componentType === 'named-function' ?
      `export function ${data.componentName}(${isFetchPresent ? paramDeconstruction : ''})` :
      `export const ${data.componentName} = (${isFetchPresent ? paramDeconstruction : ''}) =>`;

    let formatted = prettier.format(`
      ${hookImportBlock}
      ${requestBodyImport}
      ${intrigImport}
      ${reactImports.length > 0 ? reactImport : ''}

      ${isFetchPresent ? componentPropsInterface : ''}

      ${declaration} {
        ${hookDefinition}

        ${successStateBlock}
        ${isFetchPresent ? defaultFetchHook : ''}
        ${isClearPresent ? defaultCleanupHook : ''}

        ${successEffectBlock}
        ${successMemoBlock}
        ${errorMemoBlock}
        ${data.successEffect || data.errorEffect ? effectBlock : ''}

        ${callback}

        ${errorBlock}
        ${pendingBlock}

        return <>
          ${data.pendingBlock === 'inline' ? `{isPending(${data.responseName}) && <div>loading...</div>}` : ''}
          ${inlineSuccessPresent ? `{isSuccess(${data.responseName}) && <div>{JSON.stringify(${data.responseName}.data)}</div>}` : ''}
          ${data.successMemo ? `{data && <div>JSON.stringify({data})</div>}` : ''}
          ${data.successCached ? `{successData && <div>{JSON.stringify(successData)}</div>}` : ''}
          ${inlineErrorBlock}
        </>
      }
    `, {
      parser: 'typescript',
      plugins: [parserTypescript],
      singleQuote: true
    });
    return { formatted, copyBlocks };
  }, [data, config]);

  return <>
    <div className="min-w-0 max-w-2xl flex-auto px-4 py-16 lg:max-w-none lg:pl-8 lg:pr-0 xl:px-16 prose">
      <div className="relative group">
        <div className={'flex items-center justify-start align-top dark:text-gray-200'}>
          <Link href={pathname.substring(0, pathname.lastIndexOf("/"))} className={'pr-2'}>
            <ArrowLeftIcon className={'h-5 w-5 text-white'}/>
          </Link>
          <h6 className={'flex dark:text-gray-200'}>`use{pascalCase(config.operationId)}` Usage</h6>
        </div>
        <Highlight language={'tsx'} code={content.formatted} theme={{plain: {}, styles: []}}>
          {({ className, style, tokens, getTokenProps }) => <pre className={className} style={style}>
          <code>
            {tokens.map((line, lineIndex) => <Fragment key={lineIndex}>
              {line
                .filter((token) => !token.empty)
                .map((token, tokenIndex) => {
                  if (token.types.includes('comment') && token.content.startsWith('//c_')) {
                    let s = token.content.replace('//c_', '');
                    let copyBlock = content.copyBlocks[s];
                    return <CopyButton content={copyBlock}/>
                  }
                  return (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  );
                })}
              {'\n'}
            </Fragment>)}
          </code>
      </pre>}
        </Highlight>
      </div>
    </div>
    <div
      className="hidden xl:sticky xl:top-[4.75rem] xl:-mr-6 xl:block xl:h-[calc(100vh-4.75rem)] xl:flex-none xl:overflow-y-visible xl:py-16 xl:pr-6">
      <Fieldset>
        <form onSubmit={handleSubmit(console.log)} className="space-y-4">
          <Field>
            <Label className={'flex'}>Component Name
              <InfoIconButton>
                Name of the component. Must be a valid JavaScript function name.
              </InfoIconButton>
            </Label>
            <Input aria-invalid={!!errors.componentName} {...register('componentName', {
              pattern: { value: /^[A-Z][a-zA-Z0-9]*$/, message: 'Invalid component name' },
              onBlur: (e) => setValue('componentName', e.target.value.trim())
            })} />
            {errors.componentName ? <ErrorMessage>{errors.componentName.message}</ErrorMessage> : <></>}
          </Field>
          <Field>
            <Label className={'flex'}>Component Type
              <InfoIconButton>
                Component can be either a named function or a const expression.
              </InfoIconButton>
            </Label>
            <Select {
                      ...register('componentType')
                    }>
              <option value="named-function">Named Function</option>
              <option value="const-expression">Const Expression</option>
            </Select>
          </Field>
          <Field>
            <Label className={'flex'}>Response Name
              <InfoIconButton>
                Name of the response variable. Must be a valid JavaScript variable name.
              </InfoIconButton>
            </Label>
            <Input aria-invalid={!!errors.responseName} {...register('responseName', {
              pattern: { value: /^[A-Za-z][a-zA-Z0-9]*$/, message: 'Invalid response name' },
              onBlur: (e) => setValue('responseName', e.target.value.trim())
            })} />
            {errors.responseName ? <ErrorMessage>{errors.responseName.message}</ErrorMessage> : <></>}
          </Field>
          <CheckboxGroup>
            <Controller control={control} name={'fetchOnMount'} render={({ field }) => {
              return <CheckboxField className={'ml-4'}>
                <Switch checked={field.value} onChange={(checked) => field.onChange(checked)} />
                <Label className={'flex'}>Execute on mount
                <InfoIconButton location={'2/3'}>
                  Executes the action on mount. Useful for fetching data on page load.
                </InfoIconButton>
                </Label>
              </CheckboxField>;
            }} />
            <Controller control={control} name={'fetchOnCallback'} render={({ field }) => {
              return <CheckboxField className={'ml-4'}>
                <Switch checked={field.value} onChange={(checked) => field.onChange(checked)} />
                <Label className={'flex'}>Execute on callback
                  <InfoIconButton location={'2/3'}>
                    Executes the action on callback. Useful for fetching data on user interaction such as form submission or search.
                  </InfoIconButton>
                </Label>
              </CheckboxField>;
            }} />
            <Controller control={control} name={'cleanupOnUnmount'} render={({ field }) => {
              return <CheckboxField className={'ml-4'}>
                <Switch checked={field.value} onChange={(checked) => field.onChange(checked)}></Switch>
                <Label className={'flex'}>Clean-up on unmount
                  <InfoIconButton location={'2/3'}>
                    Cleans up the action on unmount. Cleaning up the obsolete data is a good practice to avoid memory leaks.
                  </InfoIconButton>
                </Label>
              </CheckboxField>;
            }} />
          </CheckboxGroup>
          <Field>
            <Label className={'flex'}>Pending Block
              <InfoIconButton>
                Block to be displayed while the request is pending. Useful for displaying a loading indicator.
                <br />
                <br />
                <strong>None</strong> - No block is displayed.
                <br />
                <strong>Explicit</strong> - Block is displayed explicitly.
                <br />
                <strong>Inline</strong> - Block is displayed inline.
              </InfoIconButton>
            </Label>
            <Select {...register('pendingBlock')}>
              <option value="none">None</option>
              <option value="explicit">Explicit</option>
              <option value="inline">Inline</option>
            </Select>
          </Field>
          <Field>
            <Label className={'flex'}>Error Block
              <InfoIconButton>
                Block to be displayed if the request fails. Useful for displaying an error message.
                <br />
                <br />
                <strong>None</strong> - No block is displayed.
                <br />
                <strong>Explicit</strong> - Block is displayed explicitly.
                <br />
                <strong>Inline</strong> - Block is displayed inline.
              </InfoIconButton>
            </Label>
            <Select {...register('errorBlock')}>
              <option value="none">None</option>
              <option value="explicit">Explicit</option>
              <option value="inline">Inline</option>
            </Select>
          </Field>
          <CheckboxGroup>
            <Controller control={control} name={'successMemo'} render={({ field }) => {
              return <CheckboxField className={'ml-4'}>
                <Switch checked={field.value} onChange={(checked) => field.onChange(checked)} />
                <Label className={'flex'}>Extract success response as memo
                  <InfoIconButton location={'0'}>
                    Extracts the success response as a memo. Useful for if you need to use the response in multiple places.
                  </InfoIconButton>
                </Label>
              </CheckboxField>;
            }} />
            <Controller control={control} name={'successEffect'} render={({ field }) => {
              return <CheckboxField className={'ml-4'}>
                <Switch checked={field.value} onChange={(checked) => field.onChange(checked)}></Switch>
                <Label className={'flex'}>Act upon success response
                  <InfoIconButton location={'0'}>
                    Acts upon the success response. Useful for if you need to perform some action on success such as displaying a success message.
                  </InfoIconButton>
                </Label>
              </CheckboxField>;
            }} />
            <Controller control={control} name={'successCached'} render={({ field }) => {
              return <CheckboxField className={'ml-4'}>
                <Switch checked={field.value} onChange={(checked) => field.onChange(checked)}></Switch>
                <Label className={'flex'}>Cache success response
                  <InfoIconButton location={'0'}>
                    Caches the success response. This effectively skips pending state and keeps the previous response in memory. Useful for seamless transitions between data fetching.
                  </InfoIconButton>
                </Label>
              </CheckboxField>;
            }} />
            <Controller control={control} name={'errorMemo'} render={({ field }) => {
              return <CheckboxField className={'ml-4'}>
                <Switch checked={field.value} onChange={(checked) => field.onChange(checked)} />
                <Label className={'flex'}>Extract error response as memo
                  <InfoIconButton location={'0'}>
                    Extracts the error response as a memo. Useful for if you need to use the error response in multiple places.
                  </InfoIconButton>
                </Label>
              </CheckboxField>;
            }} />
            <Controller control={control} name={'errorEffect'} render={({ field }) => {
              return <CheckboxField className={'ml-4'}>
                <Switch checked={field.value} onChange={(checked) => field.onChange(checked)}></Switch>
                <Label className={'flex'}>Act upon error response
                  <InfoIconButton location={'0'}>
                    Acts upon the error response. Useful for if you need to perform some action on error such as displaying an error message.
                  </InfoIconButton>
                </Label>
              </CheckboxField>;
            }} />
          </CheckboxGroup>
        </form>
      </Fieldset>
    </div>
  </>;
}

function CopyButton({ content }: { content: string }) {

  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content.trimEnd())
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }, []);

  return <button
    onClick={handleCopy}
    className="text-gray-400 hover:text-blue-500 rounded-full opacity-10 group-hover:opacity-100 transition-opacity duration-200"
  >
    {isCopied ? (
      <CheckIcon className="h-5 w-5 text-white" />
    ) : (
      <ClipboardIcon className="h-5 w-5 text-white" />
    )}
  </button>
}

interface InfoIconProps {
  children: React.ReactNode;
  location?: '1/2' | '2/3' | '3/4' | '0'
}

function InfoIconButton({children, location = '1/2'}: InfoIconProps) {
  return <Popover className="relative">
    <PopoverButton className="text-gray-400 hover:text-blue-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-200 ml-2">
      <InformationCircleIcon className="h-5 w-5 dark:text-white" />
    </PopoverButton>
    <PopoverPanel className={`absolute z-[150] -ml-4 mt-3 transform w-[350px] max-w-md lg:ml-0 lg:right-${location} lg:-translate-x-${location} bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700`}>
      {children}
    </PopoverPanel>
  </Popover>
}
