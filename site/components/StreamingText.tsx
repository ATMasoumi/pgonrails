"use client"

import { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/CodeBlock'
import { ArrowDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

// ============================================================================
// LINE ANIMATION COMPONENT
// ============================================================================

interface AnimatedLineProps {
  children: React.ReactNode
  index: number
  isNew: boolean
}

function AnimatedLine({ children, index, isNew }: AnimatedLineProps) {
  return (
    <motion.div
      initial={isNew ? { 
        opacity: 0, 
        y: -25, 
        filter: 'blur(12px)',
        scale: 0.95
      } : false}
      animate={{ 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        scale: 1
      }}
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 20,
        mass: 0.8,
        delay: isNew ? index * 0.06 : 0,
        opacity: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
        filter: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
      }}
    >
      {children}
    </motion.div>
  )
}

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
// Medium-style article typography with streaming support and line animations
// Lines are buffered and released at an even pace ONLY when streaming
// When content is already complete, it renders immediately without animation
// ============================================================================

const LINE_RELEASE_INTERVAL = 50 // ms between each line appearing

export function StreamingText({ content, isStreaming, className }: StreamingTextProps) {
  const [isFollowing, setIsFollowing] = useState(true) // Start in follow mode
  const [showFollowButton, setShowFollowButton] = useState(false)
  
  // Track if we started with streaming (to know if we should animate)
  const [wasStreaming, setWasStreaming] = useState(false)
  
  // All completed lines from the stream
  const [allCompletedLines, setAllCompletedLines] = useState<string[]>([])
  // Lines that are visible (released from buffer)
  const [visibleLineCount, setVisibleLineCount] = useState(0)
  const prevContentRef = useRef('')
  const releaseTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Track when streaming starts
  useEffect(() => {
    if (isStreaming) {
      setWasStreaming(true)
    }
  }, [isStreaming])
  
  // Parse content into completed lines
  useEffect(() => {
    if (content === prevContentRef.current) return
    prevContentRef.current = content
    
    // Split by single newline - every line drops in separately
    const parts = content.split('\n')
    const complete = parts.filter(p => p.trim())
    
    if (isStreaming || wasStreaming) {
      // Streaming mode - buffer lines for animated release
      if (isStreaming) {
        // Only complete lines (before the last partial one)
        const completeLines = parts.slice(0, -1).filter(p => p.trim())
        setAllCompletedLines(completeLines)
      } else {
        // Streaming just ended - show all remaining lines immediately
        setAllCompletedLines(complete)
        setVisibleLineCount(complete.length) // Show all at once when done
      }
    } else {
      // Never was streaming - show everything immediately (no animation)
      setAllCompletedLines(complete)
      setVisibleLineCount(complete.length)
    }
  }, [content, isStreaming, wasStreaming])

  // Release lines one at a time at even intervals (only while actively streaming)
  useEffect(() => {
    // Only animate while actively streaming
    if (!isStreaming) return
    
    // If there are buffered lines waiting to be shown, keep releasing them
    if (allCompletedLines.length > visibleLineCount) {
      releaseTimerRef.current = setTimeout(() => {
        setVisibleLineCount(prev => prev + 1)
      }, LINE_RELEASE_INTERVAL)
    }
    
    return () => {
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current)
      }
    }
  }, [allCompletedLines.length, visibleLineCount, isStreaming])

  // Reset when streaming starts fresh
  useEffect(() => {
    if (isStreaming && content === '') {
      setAllCompletedLines([])
      setVisibleLineCount(0)
      setWasStreaming(true)
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current)
      }
    }
  }, [isStreaming, content])

  // Get the lines that should be visible
  // When streaming is active, show buffered lines; otherwise show all
  const visibleLines = isStreaming 
    ? allCompletedLines.slice(0, visibleLineCount)
    : allCompletedLines // Show all when streaming ends or never started
  const hasBufferedLines = isStreaming && allCompletedLines.length > visibleLineCount

  // Medium-style typography components with enhanced code rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownComponents: any = useMemo(() => ({
    // Code blocks - let CodeBlock handle detection
    pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    code({ inline, className, children, node, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode; node?: { position?: { start?: { line?: number } } } }) {
      const match = /language-(\w+)/.exec(className || '')
      const codeContent = String(children).replace(/\n$/, '')
      
      // Determine if this is truly block code:
      // - Has a language class (from code fence)
      // - Contains newlines (multi-line)
      // - Explicitly marked as not inline
      const hasLanguage = Boolean(match?.[1])
      const isMultiLine = codeContent.includes('\n')
      const isBlockCode = hasLanguage || isMultiLine || (inline === false)
      
      // Block code (multi-line or explicit code fence)
      if (isBlockCode) {
        return (
          <CodeBlock
            language={match?.[1] || ''}
            value={codeContent}
          />
        )
      }
      
      // Inline code with syntax-aware styling
      const isCommand = /^(npm|yarn|pnpm|brew|apt|sudo|cd|ls|mkdir|git|curl|wget)\s/.test(codeContent)
      const isPath = /^[\/~.].*[\/]/.test(codeContent) || /\.(js|ts|tsx|jsx|py|rb|go|rs|java|json|yml|yaml|md|css|scss|html)$/.test(codeContent)
      const isVariable = /^[A-Z_][A-Z0-9_]*$/.test(codeContent) || /^\$[A-Za-z_]/.test(codeContent)
      
      return (
        <code 
          {...props} 
          className={cn(
            'rounded px-1.5 py-0.5 text-[0.9em] font-mono',
            isCommand && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
            isPath && 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
            isVariable && 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
            !isCommand && !isPath && !isVariable && 'bg-[#1a1a1a] text-[#e06c75] border border-white/10',
            className
          )}
        >
          {children}
        </code>
      )
    },
    
    // Headings with better spacing and styling
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-[32px] font-bold mt-12 mb-5 text-white leading-[1.2] tracking-[-0.02em] first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-[24px] font-bold mt-10 mb-4 text-white leading-[1.25] tracking-[-0.01em] border-b border-white/[0.06] pb-3">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-[20px] font-semibold mt-8 mb-3 text-white leading-[1.3]">
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-[18px] font-semibold mt-6 mb-2 text-white/90 leading-[1.4]">
        {children}
      </h4>
    ),
    
    // Body text
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-[18px] leading-[1.8] mb-6 text-[#e6e6e6] font-normal">
        {children}
      </p>
    ),
    
    // Lists with better styling
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="text-[18px] leading-[1.75] mb-6 ml-1 text-[#e6e6e6] list-none space-y-3">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="text-[18px] leading-[1.75] mb-6 ml-1 text-[#e6e6e6] list-none space-y-3 counter-reset-[item]">
        {children}
      </ol>
    ),
    li: ({ children, ordered }: { children?: React.ReactNode; ordered?: boolean }) => (
      <li className="pl-6 relative before:absolute before:left-0 before:text-[#505050] before:content-['•']">
        {children}
      </li>
    ),
    
    // Blockquote
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-[3px] border-blue-500/50 pl-6 my-8 py-1 bg-blue-500/5 rounded-r-lg pr-4">
        <div className="text-[18px] leading-[1.7] text-[#b0b0b0] italic">
          {children}
        </div>
      </blockquote>
    ),
    
    // Emphasis
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-[#d0d0d0]">{children}</em>
    ),
    
    // Links
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a 
        href={href} 
        className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/40 underline-offset-2 hover:decoration-blue-300/80 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // Tables
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-white/[0.08]">
        <table className="w-full text-[15px] border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-white/[0.04] border-b border-white/[0.08]">
        {children}
      </thead>
    ),
    tbody: ({ children }: { children?: React.ReactNode }) => (
      <tbody className="divide-y divide-white/[0.06]">
        {children}
      </tbody>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr className="hover:bg-white/[0.02] transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-4 py-3 text-left font-semibold text-white/90 text-[14px] uppercase tracking-wide">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-4 py-3 text-[#d0d0d0]">
        {children}
      </td>
    ),
    
    // Horizontal rule
    hr: () => (
      <hr className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    ),
    
    // Images
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <figure className="my-8">
        <img 
          src={src} 
          alt={alt} 
          className="w-full rounded-xl border border-white/[0.08] shadow-lg"
        />
        {alt && (
          <figcaption className="mt-3 text-center text-[14px] text-[#606060] italic">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    
    // Definition list (if used)
    dl: ({ children }: { children?: React.ReactNode }) => (
      <dl className="my-6 space-y-4">{children}</dl>
    ),
    dt: ({ children }: { children?: React.ReactNode }) => (
      <dt className="font-semibold text-white">{children}</dt>
    ),
    dd: ({ children }: { children?: React.ReactNode }) => (
      <dd className="pl-4 text-[#b0b0b0] border-l-2 border-white/10 ml-2">{children}</dd>
    ),
  }), [])

  // ============================================
  // AUTO-SCROLL LOGIC (SIMPLE & RELIABLE)
  // ============================================
  // Any user scroll input immediately stops auto-scroll
  // Scrolling to bottom re-enables it after a brief pause
  // Uses instant scroll to avoid animation conflicts
  // ============================================

  const isFollowingRef = useRef(isFollowing)
  isFollowingRef.current = isFollowing
  
  // Track when auto-scroll was stopped to debounce re-enable
  const autoScrollStoppedAtRef = useRef(0)

  // Handle user scroll detection - ANY user input stops auto-scroll
  useLayoutEffect(() => {
    if (!isStreaming) return

    const stopAutoScroll = () => {
      // Only update timestamp and stop if currently following
      if (isFollowingRef.current) {
        autoScrollStoppedAtRef.current = Date.now()
        setIsFollowing(false)
        setShowFollowButton(true)
      }
    }

    // ANY wheel event stops auto-scroll immediately - no exceptions
    document.addEventListener('wheel', stopAutoScroll, { capture: true, passive: true })
    document.addEventListener('touchstart', stopAutoScroll, { capture: true, passive: true })
    document.addEventListener('touchmove', stopAutoScroll, { capture: true, passive: true })
    
    // Scroll keys stop auto-scroll
    const handleKey = (e: KeyboardEvent) => {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
      if (scrollKeys.includes(e.key)) {
        stopAutoScroll()
      }
    }
    document.addEventListener('keydown', handleKey, { capture: true })
    
    return () => {
      document.removeEventListener('wheel', stopAutoScroll, { capture: true } as EventListenerOptions)
      document.removeEventListener('touchstart', stopAutoScroll, { capture: true } as EventListenerOptions)
      document.removeEventListener('touchmove', stopAutoScroll, { capture: true } as EventListenerOptions)
      document.removeEventListener('keydown', handleKey, { capture: true })
    }
  }, [isStreaming])

  // Re-enable auto-scroll when user scrolls to bottom
  // Polls periodically to check if user is at bottom
  useEffect(() => {
    if (!isStreaming) return

    const checkIfAtBottom = () => {
      // Don't re-enable if already following
      if (isFollowingRef.current) return
      
      // Wait at least 500ms after auto-scroll was stopped to re-enable
      const timeSinceStopped = Date.now() - autoScrollStoppedAtRef.current
      if (timeSinceStopped < 500) return
      
      // Check if at bottom of page
      const scrollTop = window.scrollY || window.pageYOffset
      const windowHeight = window.innerHeight
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      )
      const distanceToBottom = documentHeight - scrollTop - windowHeight
      
      // Re-enable when close to bottom (use larger threshold)
      if (distanceToBottom < 200) {
        setIsFollowing(true)
        setShowFollowButton(false)
      }
    }

    // Poll every 250ms to check position
    const pollInterval = setInterval(checkIfAtBottom, 250)
    
    return () => {
      clearInterval(pollInterval)
    }
  }, [isStreaming])

  // Perform auto-scroll when visible lines change
  // Using 'instant' behavior to avoid fighting with user scroll
  useEffect(() => {
    if (!isStreaming || !isFollowing) return

    // Use instant scroll - no animation means no fighting with user input
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  }, [visibleLineCount, isStreaming, isFollowing])

  // When streaming starts, enable auto-scroll
  useEffect(() => {
    if (isStreaming) {
      setIsFollowing(true)
      setShowFollowButton(false)
    }
  }, [isStreaming])

  // Empty state
  if (!content && !isStreaming) {
    return (
      <div className={cn('text-[#757575] italic text-[18px]', className)}>
        No content generated yet.
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Content - with animation only while actively streaming */}
      <div className="space-y-0">
        {isStreaming ? (
          // Streaming mode: animate lines one by one
          visibleLines.map((line, index) => {
            const isNew = index === visibleLineCount - 1
            return (
              <AnimatedLine key={`line-${index}`} index={0} isNew={isNew}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  components={markdownComponents}
                >
                  {line}
                </ReactMarkdown>
              </AnimatedLine>
            )
          })
        ) : (
          // Static mode: render all content immediately without animation
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
      
      {/* Loading indicator while buffering/releasing lines */}
      {(isStreaming || hasBufferedLines) && (
        <div className="flex items-center gap-3 mt-6 py-3">
          <motion.div
            className="flex gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-t from-blue-500 to-indigo-400"
                animate={{ 
                  y: [0, -6, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Follow button - appears when user scrolls up during streaming */}
      <AnimatePresence>
        {showFollowButton && isStreaming && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={() => {
              setIsFollowing(true)
              setShowFollowButton(false)
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            }}
            className={cn(
              "fixed bottom-6 right-6 px-4 py-3",
              "bg-white text-black text-sm font-medium rounded-full",
              "shadow-lg shadow-black/30",
              "transition-colors flex items-center gap-2",
              "hover:bg-gray-100 active:scale-95",
              "z-50"
            )}
          >
            <ArrowDown className="w-4 h-4" />
            <span>Follow</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
