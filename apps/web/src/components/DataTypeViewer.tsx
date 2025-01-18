'use client';
import React, {
  createContext,
  Fragment,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Highlight } from 'prism-react-renderer';
import axios from 'axios';
import { Fence } from '@/components/Fence';
import {
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { useFileContent } from '@/services/fileContent.client';
import { isSuccess } from '@/services/network-state';
import { EmbeddedCodeSection } from '@/services/codeIndex';
import clsx from 'clsx';

interface DataTypeContextProps {
  embeddedCodes: EmbeddedCodeSection;
}

const context = createContext<DataTypeContextProps>({
  embeddedCodes: {
    tsType: {},
    jsonSchema: {},
    zodSchema: {}
  },
})

export function DataTypeContextProvider({ source, children }: PropsWithChildren<{source: string}>) {
  const [embeddedCodes, setEmbeddedCodes] = useState<EmbeddedCodeSection>({
    tsType: {},
    jsonSchema: {},
    zodSchema: {}
  });

  useEffect(() => {
    axios.get(`/api/typeinfo/${source}`)
      .then(res => {
        setEmbeddedCodes(res.data);
      })
      .catch(err => {
        console.error(err);
      })
  }, [source]);

  return <context.Provider value={{embeddedCodes}}>{children}</context.Provider>
}

interface CodeViewerProps {
  path: string,
  children: string
}

export function CodeViewer({ path, children }: CodeViewerProps) {
  let [response, fetch] = useFileContent();

  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    fetch(path);
  }, [path]);

  const content = useMemo(() => {
    if (isSuccess(response)) {
      return response.data;
    } else return '';
  }, [response]);

  return (
    <span className="relative group">
      {children}
      <button
        onClick={openDialog}
        className="relative pl-2 p-1 text-gray-400 hover:text-blue-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-200"
      >
        <ArrowTopRightOnSquareIcon className="h-5 w-5 text-white" />
      </button>
      <CodeDialog
        isOpen={isOpen}
        onClose={closeDialog}
        code={content ?? ''}
        language={'typescript'}
      />
    </span>
  );
}

interface DataTypeRendererProps {
  type: string;
}

export function DataTypeViewer({ type }: DataTypeRendererProps) {
  const { embeddedCodes } = useContext(context);
  const [activeTab, setActiveTab] = useState('TS Type');

  const codeContent = useMemo(() => {
    switch (activeTab) {
      case 'Zod Schema':
        return `const ${type}Schema: z.ZodSchema<${type}> = ${embeddedCodes.zodSchema[`${type}Schema`]?.trim()}`;
      case 'JSON Schema':
        return `const ${type}_jsonschema: JSONSchema7 = ${embeddedCodes.jsonSchema[`${type}_jsonschema`]?.trim()}`;
      case 'TS Type':
        return `type ${type} = ${embeddedCodes.tsType[type]?.trim()}`;
      default:
        return '';
    }
  }, [activeTab]);

  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  if (!embeddedCodes.tsType[type]) {
    let error = `No embedded code for ${type}`;
    return <Fence language={'markdown'}>{error}</Fence>;
  }
  return (
    <div className="relative group">
      <button
        onClick={openDialog}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <ArrowTopRightOnSquareIcon className="h-5 w-5 text-white" />
      </button>
      <Highlight
        code={embeddedCodes.tsType[type].trim()}
        language={'typescript'}
        theme={{ plain: {}, styles: [] }}
      >
        {({ className, style, tokens, getTokenProps }) => (
          <pre className={className} style={style}>
            <code>
              {tokens.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {line
                    .filter((token) => !token.empty)
                    .map((token, tokenIndex) => (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ))}
                  {'\n'}
                </Fragment>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
      <CodeDialog
        isOpen={isOpen}
        onClose={closeDialog}
        code={codeContent}
        language={'typescript'}
        tabOptions={{
          tabs: ['TS Type', 'Zod Schema', 'JSON Schema'],
          activeTab,
          onTabChange: (tab) => {
            setActiveTab(tab);
          }
        }}
      />
    </div>
  );
}

interface TabOptions {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function CodeDialog({
                             isOpen,
                             onClose,
                             code,
                             language,
                             tabOptions
                           }: {
  isOpen: boolean
  onClose: () => void
  code: string
  language: string
  tabOptions?: TabOptions
}) {

  const [content, setContent] = useState<string[]>([]);

  const {embeddedCodes} = useContext(context);

  const embeddedCodeKeys = useMemo(() => {
    return [
      ...Object.keys(embeddedCodes.tsType),
      ...Object.keys(embeddedCodes.zodSchema),
      ...Object.keys(embeddedCodes.jsonSchema)
    ]
  }, [embeddedCodes]);

  const toggleContent = useCallback((token: string) => {
    setContent((types) => {
      if (types.includes(token)) {
        return types.filter((t) => t !== token);
      } else {
        return [...types, token];
      }
    })
  }, []);

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur" />

        <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 lg:px-8 lg:py-[15vh]">
          <DialogPanel onClick={stopPropagation}>
            <div className="mt-4 flex space-x-2 text-xs mb-4 justify-center">
              {tabOptions &&
                tabOptions.tabs.length > 1 &&
                tabOptions.tabs.map((tab) => (
                  <div
                    key={tab}
                    className={clsx(
                      'flex h-6 rounded-full',
                      tab === tabOptions?.activeTab
                        ? 'bg-gradient-to-r from-primary-400/30 via-primary-400 to-primary-400/30 p-px font-medium text-primary-300'
                        : 'text-slate-500'
                    )}
                  >
                    <div
                      className={clsx(
                        'flex items-center rounded-full px-2.5',
                        tab === tabOptions?.activeTab && 'bg-slate-800'
                      )}
                      onClick={() => {
                        setContent([])
                        return tabOptions?.onTabChange(tab);
                      }}
                    >
                      {tab}
                    </div>
                  </div>
                ))}
            </div>
            <div className={'grid grid-cols-3'}>
              <div className="mx-4 transform-gpu overflow-auto rounded-xl bg-white shadow-xl dark:bg-slate-800 dark:ring-1 dark:ring-slate-700 mb-4 col-span-2">
                <div className="mt-4 flex items-start">
                  <div
                    aria-hidden="true"
                    className="select-none border-r border-slate-300/5 pr-4 pl-4 font-mono text-slate-600"
                  >
                    {Array.from({
                      length: code.split('\n').length,
                    }).map((_, index) => (
                      <Fragment key={index}>
                        {(index + 1).toString().padStart(2, '0')}
                        <br />
                      </Fragment>
                    ))}
                  </div>
                  <Highlight
                    code={code}
                    language={language}
                    theme={{ plain: {}, styles: [] }}
                  >
                    {({ className, style, tokens, getTokenProps }) => (
                      <pre
                        className={`${className} px-4 bg-gray-800 text-white rounded-md`}
                        style={style}
                      >
                        <code>
                          {tokens.map((line, lineIndex) => (
                            <Fragment key={lineIndex}>
                              {line
                                .filter((token) => !token.empty)
                                .map((token, tokenIndex) => {
                                  if (
                                    embeddedCodeKeys.includes(
                                      token.content.trim()
                                    )
                                  ) {
                                    return (
                                      <button
                                        key={tokenIndex}
                                        {...getTokenProps({ token })}
                                        onClick={(e) => {
                                          stopPropagation(e);
                                          let t = token.content.trim();
                                          embeddedCodes.tsType[t] &&
                                          toggleContent(
                                            `type ${t} = ${embeddedCodes.tsType[
                                              t
                                              ].trim()}`
                                          );
                                          embeddedCodes.zodSchema[t] &&
                                          toggleContent(
                                            `const ${t}: z.ZodSchema<${t}> = ${embeddedCodes.zodSchema[
                                              t
                                              ].trim()}`
                                          );
                                          embeddedCodes.jsonSchema[t] &&
                                          toggleContent(
                                            `const ${t}: JSONSchema7 = ${embeddedCodes.jsonSchema[
                                              t
                                              ].trim()}`
                                          );
                                        }}
                                      />
                                    );
                                  }
                                  return (
                                    <span
                                      key={tokenIndex}
                                      {...getTokenProps({ token })}
                                    />
                                  );
                                })}
                              {'\n'}
                            </Fragment>
                          ))}
                        </code>
                      </pre>
                    )}
                  </Highlight>
                </div>
              </div>
              <div>
                {[...content].map((content) => {
                  return (
                    <div className="mx-auto transform-gpu overflow-auto rounded-xl bg-white shadow-xl dark:bg-slate-800 dark:ring-1 dark:ring-slate-700 mb-4">
                      <button
                        onClick={() =>
                          setContent((types) =>
                            types.filter((t) => t !== content)
                          )
                        }
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-500 rounded-full"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                      <div className="mt-4 flex items-start">
                        <div
                          aria-hidden="true"
                          className="select-none border-r border-slate-300/5 pr-4 pl-4 font-mono text-slate-600"
                        >
                          {Array.from({
                            length: content.split('\n').length,
                          }).map((_, index) => (
                            <Fragment key={index}>
                              {(index + 1).toString().padStart(2, '0')}
                              <br />
                            </Fragment>
                          ))}
                        </div>
                        <Highlight
                          code={content}
                          language={language}
                          theme={{ plain: {}, styles: [] }}
                        >
                          {({ className, style, tokens, getTokenProps }) => (
                            <pre
                              className={`${className} px-4 bg-gray-800 text-white rounded-md`}
                              style={style}
                            >
                              <code>
                                {tokens.map((line, lineIndex) => (
                                  <Fragment key={lineIndex}>
                                    {line
                                      .filter((token) => !token.empty)
                                      .map((token, tokenIndex) => {
                                        if (
                                          embeddedCodeKeys.includes(
                                            token.content.trim()
                                          )
                                        ) {
                                          return (
                                            <button
                                              key={tokenIndex}
                                              {...getTokenProps({ token })}
                                              onClick={(e) => {
                                                stopPropagation(e);
                                                let t = token.content.trim();
                                                embeddedCodes.tsType[t] &&
                                                toggleContent(
                                                  `type ${t} = ${embeddedCodes.tsType[
                                                    t
                                                    ].trim()}`
                                                );
                                                embeddedCodes.zodSchema[t] &&
                                                toggleContent(
                                                  `const ${t}: z.ZodSchema<${t}> = ${embeddedCodes.zodSchema[
                                                    t
                                                    ].trim()}`
                                                );
                                                embeddedCodes.jsonSchema[t] &&
                                                toggleContent(
                                                  `const ${t}: JSONSchema7 = ${embeddedCodes.jsonSchema[
                                                    t
                                                    ].trim()}`
                                                );
                                              }}
                                            />
                                          );
                                        }
                                        return (
                                          <span
                                            key={tokenIndex}
                                            {...getTokenProps({ token })}
                                          />
                                        );
                                      })}
                                    {'\n'}
                                  </Fragment>
                                ))}
                              </code>
                            </pre>
                          )}
                        </Highlight>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
}
