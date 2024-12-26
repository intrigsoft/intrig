'use client'

import { Fragment, useMemo, useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer'
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'

export function Fence({
                        children,
                        language,
                      }: {
  children: string
  language: string
}) {

  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children.trimEnd())
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  const content = useMemo(() => {
    if (Array.isArray(children)) {
      return children.join(' ')
    }
    return children
  }, [children]);

  return (
    <div className="relative group">
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
        code={content.trimEnd()}
        language={language}
        theme={{plain: {}, styles: []}}
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
    </div>
  )
}

