"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/CodeBlock'
import { ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================================
// TYPES
// ============================================================================

interface StreamingTextProps {
  content: string
  isStreaming: boolean
  className?: string
}

// ============================================================================
// COMPONENT: StreamingText
// Renders streaming markdown text with smooth auto-scroll behavior
// ============================================================================

export function StreamingText({ content, isStreaming, className }: StreamingTextProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false)

  // Markdown components configuration with elegant styling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownComponents: any = useMemo(() => ({
    pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline ? (
        <CodeBlock
          language={match?.[1] || 'text'}
          value={String(children).replace(/\n$/, '')}
        />
      ) : (
        <code {...props} className={cn('bg-blue-900/30 text-blue-300 rounded px-1.5 py-0.5 text-sm font-mono', className)}>
          {children}
        </code>
      )
    },
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-4xl font-bold mt-8 mb-6 text-white tracking-tight">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-3xl font-bold mt-6 mb-4 text-white tracking-tight">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-2xl font-semibold mt-5 mb-3 text-white">{children}</h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 text-gray-300 leading-relaxed text-[1.05rem]">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="ml-2 leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-blue-500/50 pl-4 py-2 my-4 italic text-gray-400 bg-blue-500/5 rounded-r-lg">
        {children}
      </blockquote>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-blue-200">{children}</em>
    ),
  }), [])

  // Smart scroll handler - detects user intent
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    
    // Within 100px of bottom = following the stream
    if (distanceToBottom < 100) {
      setUserHasScrolledUp(false)
    } else {
      setUserHasScrolledUp(true)
    }
  }, [])

  // Auto-scroll effect - scroll to bottom when new content arrives
  useEffect(() => {
    if (isStreaming && !userHasScrolledUp && scrollRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      })
    }
  }, [content, isStreaming, userHasScrolledUp])

  // Empty state
  if (!content && !isStreaming) {
    return (
      <div className={cn('text-gray-500 italic', className)}>
        No content generated yet.
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Main scrollable container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn(
          "h-[75vh] overflow-y-auto pr-4",
          // Custom scrollbar styling
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-white/10",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:hover:bg-white/20",
          className
        )}
      >
        <div className="min-h-full pb-12">
          {/* Render full markdown content */}
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
          
          {/* Streaming indicator with elegant pulsing cursor */}
          {isStreaming && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className="text-sm text-blue-400/80 font-medium">Generating...</span>
            </div>
          )}
        </div>
      </div>

      {/* Scroll-to-bottom button (appears when user scrolls up during streaming) */}
      <AnimatePresence>
        {userHasScrolledUp && isStreaming && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => {
              setUserHasScrolledUp(false)
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
              }
            }}
            className={cn(
              "absolute bottom-4 right-4 p-3",
              "bg-blue-600 hover:bg-blue-500",
              "text-white rounded-full shadow-lg",
              "transition-colors z-10 flex items-center gap-2"
            )}
          >
            <ArrowDown className="w-5 h-5" />
            <span className="text-sm font-medium pr-1">Resume</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
