"use client"

import { useState, useMemo } from 'react'
import { Check, Copy, Terminal, FileCode, Hash, Braces } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  language: string
  value: string
}

// Language display names and icons
const LANGUAGE_CONFIG: Record<string, { name: string; icon?: 'terminal' | 'code' | 'hash' | 'braces' }> = {
  javascript: { name: 'JavaScript', icon: 'braces' },
  js: { name: 'JavaScript', icon: 'braces' },
  typescript: { name: 'TypeScript', icon: 'braces' },
  ts: { name: 'TypeScript', icon: 'braces' },
  tsx: { name: 'TypeScript React', icon: 'braces' },
  jsx: { name: 'JavaScript React', icon: 'braces' },
  python: { name: 'Python', icon: 'hash' },
  py: { name: 'Python', icon: 'hash' },
  bash: { name: 'Bash', icon: 'terminal' },
  sh: { name: 'Shell', icon: 'terminal' },
  shell: { name: 'Shell', icon: 'terminal' },
  zsh: { name: 'Zsh', icon: 'terminal' },
  json: { name: 'JSON', icon: 'braces' },
  html: { name: 'HTML', icon: 'code' },
  css: { name: 'CSS', icon: 'code' },
  scss: { name: 'SCSS', icon: 'code' },
  sql: { name: 'SQL', icon: 'code' },
  yaml: { name: 'YAML', icon: 'code' },
  yml: { name: 'YAML', icon: 'code' },
  markdown: { name: 'Markdown', icon: 'code' },
  md: { name: 'Markdown', icon: 'code' },
  java: { name: 'Java', icon: 'braces' },
  c: { name: 'C', icon: 'braces' },
  cpp: { name: 'C++', icon: 'braces' },
  csharp: { name: 'C#', icon: 'braces' },
  cs: { name: 'C#', icon: 'braces' },
  go: { name: 'Go', icon: 'braces' },
  rust: { name: 'Rust', icon: 'braces' },
  ruby: { name: 'Ruby', icon: 'hash' },
  rb: { name: 'Ruby', icon: 'hash' },
  php: { name: 'PHP', icon: 'braces' },
  swift: { name: 'Swift', icon: 'braces' },
  kotlin: { name: 'Kotlin', icon: 'braces' },
  text: { name: 'Plain Text', icon: 'code' },
}

// Auto-detect language from code content
function detectLanguage(code: string): string {
  const trimmed = code.trim()
  
  // Shell/Bash patterns
  if (/^(\$|#!.*sh|npm |yarn |pnpm |brew |apt |sudo |cd |ls |mkdir |rm |cp |mv |cat |echo |export |chmod )/.test(trimmed)) {
    return 'bash'
  }
  
  // JSON
  if (/^[\[{]/.test(trimmed) && /[\]}]$/.test(trimmed)) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {}
  }
  
  // HTML
  if (/^<(!DOCTYPE|html|head|body|div|span|p|a|script|style)/i.test(trimmed)) {
    return 'html'
  }
  
  // CSS
  if (/^[.#@]?[a-zA-Z][\w-]*\s*\{/.test(trimmed) || /^@(media|import|keyframes)/.test(trimmed)) {
    return 'css'
  }
  
  // SQL
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE)\s/i.test(trimmed)) {
    return 'sql'
  }
  
  // Python
  if (/^(def |class |import |from |if __name__|print\(|#.*python)/.test(trimmed)) {
    return 'python'
  }
  
  // TypeScript/JavaScript with React
  if (/^(import|export|const|let|var|function|class|interface|type )/.test(trimmed)) {
    if (/<[A-Z][a-zA-Z]*|<\/|className=/.test(trimmed)) {
      return 'tsx'
    }
    if (/: (string|number|boolean|any|void|Promise|React)/.test(trimmed) || /interface |type /.test(trimmed)) {
      return 'typescript'
    }
    return 'javascript'
  }
  
  // YAML
  if (/^[a-zA-Z_][\w]*:( |$)/m.test(trimmed) && !trimmed.includes('{')) {
    return 'yaml'
  }
  
  return 'text'
}

function LanguageIcon({ type }: { type?: 'terminal' | 'code' | 'hash' | 'braces' }) {
  const className = "h-3.5 w-3.5 text-gray-500"
  switch (type) {
    case 'terminal': return <Terminal className={className} />
    case 'hash': return <Hash className={className} />
    case 'braces': return <Braces className={className} />
    default: return <FileCode className={className} />
  }
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false)
  
  // Detect language if not provided or is generic
  const detectedLang = useMemo(() => {
    if (!language || language === 'text' || language === 'plaintext') {
      return detectLanguage(value)
    }
    return language.toLowerCase()
  }, [language, value])
  
  const langConfig = LANGUAGE_CONFIG[detectedLang] || { name: detectedLang || 'Code', icon: 'code' }

  const copyToClipboard = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-xl overflow-hidden my-6 border border-white/[0.08] bg-[#0a0a0a] shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <LanguageIcon type={langConfig.icon} />
          <span className="text-xs font-medium text-gray-400">
            {langConfig.name}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-md transition-colors"
          aria-label="Copy code"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={detectedLang}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: 0,
            padding: '1rem 1.25rem',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            }
          }}
          showLineNumbers={value.split('\n').length > 3}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: '#3a3a3a',
            userSelect: 'none',
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
