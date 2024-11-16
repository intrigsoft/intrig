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
import { ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { useFileContent } from '@/services/fileContent.client';
import { isSuccess } from '@/services/network-state';

interface DataTypeContextProps {
  embeddedCodes: { [key: string]: string };
}

const context = createContext<DataTypeContextProps>({
  embeddedCodes: {},
})

export function DataTypeContextProvider({ source, children }: PropsWithChildren<{source: string}>) {
  const [embeddedCodes, setEmbeddedCodes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    axios.get(`/api/embeddedCodes/${source}`)
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
      return response.data.content;
    } else return '';
  }, [response]);

  useEffect(() => {
    console.log(content);
  }, [content]);

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

  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  if (!embeddedCodes[type]) {
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
        code={embeddedCodes[type].trim()}
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
        code={`type ${type} = ${embeddedCodes[type].trim()}`}
        language={'typescript'}
      />
    </div>
  );
}

export function CodeDialog({
                             isOpen,
                             onClose,
                             code,
                             language,

                           }: {
  isOpen: boolean
  onClose: () => void
  code: string
  language: string
}) {

  const [content, setContent] = useState<string[]>([]);

  const {embeddedCodes} = useContext(context);

  const embeddedCodeKeys = useMemo(() => {
    return Object.keys(embeddedCodes)
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
          <DialogPanel onClick={stopPropagation} className={'grid grid-cols-4'}>
            <div
              className="mx-4 transform-gpu overflow-auto rounded-xl bg-white shadow-xl dark:bg-slate-800 dark:ring-1 dark:ring-slate-700 mb-4 col-span-3">
              <div className="mt-4">
                <Highlight
                  code={code}
                  language={language}
                  theme={{ plain: {}, styles: [] }}
                >
                  {({ className, style, tokens, getTokenProps }) => (
                    <pre
                      className={`${className} p-4 bg-gray-800 text-white rounded-md`}
                      style={style}
                    >
                        <code>
                          {tokens.map((line, lineIndex) => (
                            <Fragment key={lineIndex}>
                              {line
                                .filter((token) => !token.empty)
                                .map((token, tokenIndex) => {
                                  if (
                                    embeddedCodeKeys.includes(token.content.trim())
                                  ) {
                                    return (
                                      <button
                                        key={tokenIndex}
                                        {...getTokenProps({ token })}
                                        onClick={(e) => {
                                          stopPropagation(e);
                                          let t = token.content.trim();
                                          toggleContent(`type ${t} = ${embeddedCodes[t].trim()}`);
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
              {[...content]
              .map((content) => {
                return (
                  <div
                    className="mx-auto transform-gpu overflow-auto rounded-xl bg-white shadow-xl dark:bg-slate-800 dark:ring-1 dark:ring-slate-700 mb-4">
                    <button
                      onClick={() => setContent(types => types.filter(t => t !== content))}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-500 rounded-full"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                    <div className="mt-4">
                      <Highlight
                        code={content}
                        language={language}
                        theme={{ plain: {}, styles: [] }}
                      >
                        {({ className, style, tokens, getTokenProps }) => (
                          <pre
                            className={`${className} p-4 bg-gray-800 text-white rounded-md`}
                            style={style}
                          >
                        <code>
                          {tokens.map((line, lineIndex) => (
                            <Fragment key={lineIndex}>
                              {line
                                .filter((token) => !token.empty)
                                .map((token, tokenIndex) => {
                                  if (
                                    embeddedCodeKeys.includes(token.content.trim())
                                  ) {
                                    return (
                                      <button
                                        key={tokenIndex}
                                        {...getTokenProps({ token })}
                                        onClick={(e) => {
                                          stopPropagation(e);
                                          let t = token.content.trim();
                                          toggleContent(`type ${t} = ${embeddedCodes[t].trim()}`);
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
              })}</div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
}
