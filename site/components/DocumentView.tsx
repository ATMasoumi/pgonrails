"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Check, BookOpen, Clock } from 'lucide-react'
import { DocumentSidePanel } from '@/components/DocumentSidePanel'
import { markAsRead } from '@/app/documents/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCompletion } from '@ai-sdk/react'
import { StreamingText } from '@/components/StreamingText'

// ============================================================================
// TYPES
// ============================================================================

interface Document {
  id: string
  query: string
  content: string | null
  created_at: string
  parent_id: string | null
  user_id: string
  is_read?: boolean
}

interface DocumentViewProps {
  doc: Document
  rootId?: string
  autoGenerate?: boolean
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

// ============================================================================
// COMPONENT: DocumentView
// A Medium-style article reader with elegant typography and streaming support
// ============================================================================

export function DocumentView({ doc, rootId, autoGenerate }: DocumentViewProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const router = useRouter()
  const [isMarking, setIsMarking] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [selectionPos, setSelectionPos] = useState<{ top: number, left: number } | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  const { complete, completion, isLoading: isGenerating } = useCompletion({
    api: '/api/generate-document',
    body: { documentId: doc.id },
    streamProtocol: 'text',
    onFinish: () => {
      toast.success('Document generated successfully')
      router.refresh()
    },
    onError: (error) => {
      console.error('Generation error:', error)
      toast.error('Failed to generate document')
    }
  })

  // Auto-generate document if requested and no content exists
  const hasTriggeredGeneration = useRef(false)
  
  useEffect(() => {
    if (autoGenerate && !doc.content && !isGenerating && !completion && !hasTriggeredGeneration.current) {
      hasTriggeredGeneration.current = true
      complete('')
    }
  }, [autoGenerate, doc.content, isGenerating, completion, complete])

  // Derived values for streaming
  const displayContent = completion || doc.content || ''
  const isCurrentlyStreaming = isGenerating
  const readTime = estimateReadTime(displayContent)

  // Selection handling for "Explain" feature
  useEffect(() => {
    const updateSelectionPosition = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setSelectionPos(null)
        setSelectedText('')
        return
      }

      if (contentRef.current && !contentRef.current.contains(selection.anchorNode)) {
        setSelectionPos(null)
        setSelectedText('')
        return
      }

      const text = selection.toString().trim()
      if (!text) {
        setSelectionPos(null)
        setSelectedText('')
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      if (rect.width === 0) {
        setSelectionPos(null)
        return
      }
      
      // Use document-relative positions (with scroll offset) for absolute positioning
      // This way the button scrolls naturally with content without needing scroll event updates
      setSelectionPos({
        top: rect.top + window.scrollY - 44,
        left: rect.left + window.scrollX + (rect.width / 2)
      })
      setSelectedText(text)
    }

    window.document.addEventListener('selectionchange', updateSelectionPosition)
    window.addEventListener('resize', updateSelectionPosition)

    return () => {
      window.document.removeEventListener('selectionchange', updateSelectionPosition)
      window.removeEventListener('resize', updateSelectionPosition)
    }
  }, [])

  const handleExplain = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedText) return
    setPendingMessage(`Explain this: "${selectedText}"`)
    setIsChatOpen(true)
    window.getSelection()?.removeAllRanges()
    setSelectionPos(null)
  }

  const handleMarkAsRead = async () => {
    setIsMarking(true)
    try {
      await markAsRead(doc.id)
      toast.success('Marked as read')
      router.refresh()
    } catch {
      toast.error('Failed to mark as read')
    } finally {
      setIsMarking(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e6e6e6] relative">
      {/* Minimal top navigation - Medium style */}
      <nav className="border-b border-white/[0.06] sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="text-[#a0a0a0] hover:text-white hover:bg-transparent -ml-2 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          <div className="flex items-center gap-1">
            <Button 
              onClick={handleMarkAsRead} 
              disabled={isMarking || doc.is_read} 
              variant="ghost"
              size="sm"
              className={doc.is_read 
                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" 
                : "text-[#a0a0a0] hover:text-white hover:bg-white/5"
              }
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">{doc.is_read ? "Read" : "Mark read"}</span>
            </Button>
            <Button 
              onClick={() => setIsChatOpen(true)} 
              variant="ghost"
              size="sm"
              className="text-[#a0a0a0] hover:text-white hover:bg-white/5"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Discuss</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Article content - Medium style layout */}
      <article className="relative">
        {/* Hero header section */}
        <header className="pt-12 pb-8 px-6">
          <div className="max-w-[680px] mx-auto">
            {/* Title */}
            <h1 className="text-[32px] sm:text-[42px] font-bold text-white leading-[1.15] tracking-[-0.02em] mb-6">
              {doc.query}
            </h1>
            
            {/* Meta info row */}
            <div className="flex items-center gap-4 text-[14px] text-[#757575]">
              <div className="flex items-center gap-4">
                {/* Date */}
                <span>{formatDate(doc.created_at)}</span>
                
                <span className="text-[#757575]">·</span>
                
                {/* Read time */}
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isCurrentlyStreaming ? 'Writing...' : `${readTime} min read`}</span>
                </div>
              </div>
            </div>

            {/* Streaming indicator */}
            {isCurrentlyStreaming && (
              <div className="mt-6 flex items-center gap-3 py-3 px-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-blue-400">Generating content...</span>
              </div>
            )}
          </div>
        </header>

        {/* Divider */}
        <div className="max-w-[680px] mx-auto px-6">
          <div className="h-px bg-white/[0.06]" />
        </div>

        {/* Main content area */}
        <div 
          ref={contentRef}
          className="py-10 px-6"
        >
          <div className="max-w-[680px] mx-auto">
            <StreamingText 
              content={displayContent} 
              isStreaming={isCurrentlyStreaming} 
            />
          </div>
        </div>

        {/* Bottom actions */}
        {!isCurrentlyStreaming && displayContent && (
          <footer className="border-t border-white/[0.06] py-8 px-6">
            <div className="max-w-[680px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#757575] text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{readTime} min read</span>
              </div>
              
              <Button 
                onClick={() => setIsChatOpen(true)} 
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 text-[#e6e6e6] hover:bg-white/10 hover:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask a question
              </Button>
            </div>
          </footer>
        )}
      </article>

      {/* Selection tooltip for "Explain" feature */}
      {selectionPos && (
        <div 
          className="absolute z-50"
          style={{
            top: `${selectionPos.top}px`,
            left: `${selectionPos.left}px`,
            transform: 'translateX(-50%)'
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Button 
            size="sm" 
            onClick={handleExplain}
            className="rounded-full bg-[#1a1a1a] border border-white/10 text-white shadow-2xl hover:bg-[#252525]"
          >
            <MessageSquare className="w-3 h-3 mr-1.5" />
            Explain
          </Button>
        </div>
      )}

      {/* Chat side panel */}
      <DocumentSidePanel 
        topicId={doc.id} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        pendingMessage={pendingMessage}
        onMessageSent={() => setPendingMessage(null)}
      />
    </div>
  )
}
