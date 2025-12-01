"use client"

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  language: string
  value: string
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <span className="relative group rounded-lg overflow-hidden my-4 border border-white/10 bg-[#020202] block font-sans">
      <span className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-medium text-gray-400 uppercase">
          {language || 'text'}
        </span>
        <button
          onClick={copyToClipboard}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Copy code"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </span>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="span"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1rem',
          background: 'transparent', // Let the container background show through
          display: 'block',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'inherit',
          }
        }}
      >
        {value}
      </SyntaxHighlighter>
    </span>
  )
}
