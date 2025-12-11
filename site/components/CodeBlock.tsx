"use client"

import { useState, useMemo } from 'react'
import { Check, Copy, Terminal, FileCode, Hash, Braces } from 'lucide-react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import jsLang from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import tsLang from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import tsxLang from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import jsxLang from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import bashLang from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import jsonLang from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import htmlLang from 'react-syntax-highlighter/dist/esm/languages/prism/markup'
import cssLang from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import scssLang from 'react-syntax-highlighter/dist/esm/languages/prism/scss'
import sqlLang from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import yamlLang from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import pythonLang from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import goLang from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import rustLang from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
import rubyLang from 'react-syntax-highlighter/dist/esm/languages/prism/ruby'
import phpLang from 'react-syntax-highlighter/dist/esm/languages/prism/php'
import swiftLang from 'react-syntax-highlighter/dist/esm/languages/prism/swift'
import kotlinLang from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin'

// Register only the languages we need to avoid missing vendor chunks
SyntaxHighlighter.registerLanguage('javascript', jsLang)
SyntaxHighlighter.registerLanguage('js', jsLang)
SyntaxHighlighter.registerLanguage('typescript', tsLang)
SyntaxHighlighter.registerLanguage('ts', tsLang)
SyntaxHighlighter.registerLanguage('tsx', tsxLang)
SyntaxHighlighter.registerLanguage('jsx', jsxLang)
SyntaxHighlighter.registerLanguage('bash', bashLang)
SyntaxHighlighter.registerLanguage('sh', bashLang)
SyntaxHighlighter.registerLanguage('shell', bashLang)
SyntaxHighlighter.registerLanguage('zsh', bashLang)
SyntaxHighlighter.registerLanguage('json', jsonLang)
SyntaxHighlighter.registerLanguage('html', htmlLang)
SyntaxHighlighter.registerLanguage('css', cssLang)
SyntaxHighlighter.registerLanguage('scss', scssLang)
SyntaxHighlighter.registerLanguage('sql', sqlLang)
SyntaxHighlighter.registerLanguage('yaml', yamlLang)
SyntaxHighlighter.registerLanguage('yml', yamlLang)
SyntaxHighlighter.registerLanguage('python', pythonLang)
SyntaxHighlighter.registerLanguage('py', pythonLang)
SyntaxHighlighter.registerLanguage('go', goLang)
SyntaxHighlighter.registerLanguage('rust', rustLang)
SyntaxHighlighter.registerLanguage('ruby', rubyLang)
SyntaxHighlighter.registerLanguage('rb', rubyLang)
SyntaxHighlighter.registerLanguage('php', phpLang)
SyntaxHighlighter.registerLanguage('swift', swiftLang)
SyntaxHighlighter.registerLanguage('kotlin', kotlinLang)
SyntaxHighlighter.registerLanguage('text', htmlLang)

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
  
  const SUPPORTED_LANGS = useMemo(() => new Set([
    'javascript','js','typescript','ts','tsx','jsx','bash','sh','shell','zsh','json','html','css','scss','sql','yaml','yml','python','py','go','rust','ruby','rb','php','swift','kotlin','text'
  ]), [])
  
  // Detect language if not provided or is generic and clamp to supported set
  const detectedLang = useMemo(() => {
    const raw = (!language || language === 'text' || language === 'plaintext') ? detectLanguage(value) : language.toLowerCase()
    return SUPPORTED_LANGS.has(raw) ? raw : 'text'
  }, [language, value, SUPPORTED_LANGS])
  
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
