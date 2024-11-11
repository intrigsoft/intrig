'use client'
import { Fragment, PropsWithChildren, useState } from 'react';
import { Fence } from '@/components/Fence';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { Highlight } from 'prism-react-renderer';

export function TabbedFence({children, language}: PropsWithChildren<{ language: string }>) {

  let tabs = [...children]

  const [activeTab, setActiveTab] = useState(tabs[0]);

  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeTab?.props?.children?.trimEnd())
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  return <div className="relative group">
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      {isCopied ? (
        <CheckIcon className="h-5 w-5 text-white" />
      ) : (
        <ClipboardIcon className="h-5 w-5 text-white" />
      )}
    </button>
    <Highlight
      code={activeTab.props.children.trimEnd()}
      language={language}
      theme={{ plain: {}, styles: [] }}
    >
      {({ className, style, tokens, getTokenProps }) => (
        <pre className={className} style={style}>
          <div className="flex space-x-2 mb-4">
            {tabs.map((tab, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-3 py-0 text-sm font-medium rounded-full cursor-pointer transition-colors duration-200 ${
                    activeTab === tab
                      ? 'bg-teal-700 text-gray-100'
                      : 'border border-teal-500 text-teal-500 hover:bg-teal-700 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.props.language}
              </span>
            ))}
          </div>
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
  </div>
}
