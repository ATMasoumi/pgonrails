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
// Lines are buffered and released at an even pace with smooth timing
// ============================================================================

const LINE_RELEASE_INTERVAL = 200 // ms between each line appearing

export function StreamingText({ content, isStreaming, className }: StreamingTextProps) {
  const [isFollowing, setIsFollowing] = useState(true) // Start in follow mode
  const [showFollowButton, setShowFollowButton] = useState(false)
  
  // All completed lines from the stream
  const [allCompletedLines, setAllCompletedLines] = useState<string[]>([])
  // Lines that are visible (released from buffer)
  const [visibleLineCount, setVisibleLineCount] = useState(0)
  const prevContentRef = useRef('')
  const releaseTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Parse content into completed lines
  useEffect(() => {
    if (content === prevContentRef.current) return
    prevContentRef.current = content
    
    // Split by single newline - every line drops in separately
    const parts = content.split('\n')
    
    if (isStreaming) {
      // All parts except the last one are complete (ended with \n)
      const complete = parts.slice(0, -1).filter(p => p.trim())
      setAllCompletedLines(complete)
    } else {
      // Not streaming - all lines are complete, show all immediately
      const complete = parts.filter(p => p.trim())
      setAllCompletedLines(complete)
      setVisibleLineCount(complete.length)
    }
  }, [content, isStreaming])

  // Release lines one at a time at even intervals
  useEffect(() => {
    if (!isStreaming) return
    
    // If there are buffered lines waiting to be shown
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
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current)
      }
    }
  }, [isStreaming, content])

  // Get the lines that should be visible
  const visibleLines = allCompletedLines.slice(0, visibleLineCount)
  const hasBufferedLines = allCompletedLines.length > visibleLineCount

  // Medium-style typography components
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
        <code 
          {...props} 
          className={cn(
            'bg-[#1a1a1a] text-[#e06c75] rounded px-1.5 py-0.5',
            'text-[0.9em] font-mono',
            className
          )}
        >
          {children}
        </code>
      )
    },
    // Medium-style headings
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-[32px] font-bold mt-12 mb-4 text-white leading-[1.2] tracking-[-0.02em] first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-[24px] font-bold mt-10 mb-4 text-white leading-[1.25] tracking-[-0.01em]">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-[20px] font-semibold mt-8 mb-3 text-white leading-[1.3]">
        {children}
      </h3>
    ),
    // Medium uses a specific font size and line height for body text
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-[18px] leading-[1.75] mb-6 text-[#e6e6e6] font-normal">
        {children}
      </p>
    ),
    // Lists with proper spacing
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="text-[18px] leading-[1.75] mb-6 ml-6 text-[#e6e6e6] list-disc space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="text-[18px] leading-[1.75] mb-6 ml-6 text-[#e6e6e6] list-decimal space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="pl-2">{children}</li>
    ),
    // Medium-style blockquote with left border
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-[3px] border-white/30 pl-6 my-8 italic text-[20px] leading-[1.6] text-[#a0a0a0]">
        {children}
      </blockquote>
    ),
    // Emphasis styles
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    // Links
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a 
        href={href} 
        className="text-white underline decoration-white/40 underline-offset-2 hover:decoration-white/80 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    // Horizontal rule
    hr: () => (
      <hr className="my-10 border-0 h-px bg-white/10" />
    ),
    // Images (if any)
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <figure className="my-8">
        <img 
          src={src} 
          alt={alt} 
          className="w-full rounded-lg"
        />
        {alt && (
          <figcaption className="mt-3 text-center text-[14px] text-[#757575]">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
  }), [])

  // ============================================
  // AUTO-SCROLL LOGIC (MAXIMUM SENSITIVITY)
  // ============================================
  // Uses refs for instant response, no React state delays
  // ============================================

  const isFollowingRef = useRef(isFollowing)
  isFollowingRef.current = isFollowing

  // MAXIMUM sensitivity - use useLayoutEffect for synchronous execution
  useLayoutEffect(() => {
    if (!isStreaming) return

    const stopAutoScroll = () => {
      // Use ref to check current state instantly
      if (isFollowingRef.current) {
        setIsFollowing(false)
        setShowFollowButton(true)
      }
    }

    // ALL possible user scroll events at document level with capture
    const events = [
      'wheel',           // Mouse wheel
      'touchstart',      // Finger touches screen
      'touchmove',       // Finger moves
      'mousedown',       // Mouse button down (for drag scroll)
      'pointerdown',     // Pointer events
      'pointermove',     // Pointer move
    ]

    // Add all listeners at document level with capture phase
    events.forEach(event => {
      document.addEventListener(event, stopAutoScroll, { capture: true, passive: true })
    })

    // Keyboard separately to filter keys
    const handleKey = (e: KeyboardEvent) => {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End']
      if (scrollKeys.includes(e.key)) {
        stopAutoScroll()
      }
    }
    document.addEventListener('keydown', handleKey, { capture: true })
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, stopAutoScroll, { capture: true } as EventListenerOptions)
      })
      document.removeEventListener('keydown', handleKey, { capture: true })
    }
  }, [isStreaming])

  // Detect when user scrolls to bottom to re-enable auto-scroll
  useEffect(() => {
    if (!isStreaming || isFollowing) return

    const checkIfAtBottom = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const distanceToBottom = scrollHeight - scrollTop - clientHeight
      
      if (distanceToBottom < 50) {
        setIsFollowing(true)
        setShowFollowButton(false)
      }
    }

    window.addEventListener('scroll', checkIfAtBottom, { passive: true })
    return () => window.removeEventListener('scroll', checkIfAtBottom)
  }, [isStreaming, isFollowing])

  // Perform auto-scroll when visible lines change
  useEffect(() => {
    if (!isStreaming || !isFollowing) return

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
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
      {/* Visible lines - released at even pace with animation */}
      <div className="space-y-0">
        {visibleLines.map((line, index) => {
          // Last visible line animates in
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
        })}
      </div>
      
      {/* Loading indicator while buffering/releasing lines */}
      {(isStreaming || hasBufferedLines) && (
        <div className="flex items-center gap-2 mt-4 text-[#757575]">
          <motion.div
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              className="w-2 h-2 bg-white/40 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-2 h-2 bg-white/40 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="w-2 h-2 bg-white/40 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
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
