"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Check } from 'lucide-react'
import { DocumentSidePanel } from '@/components/DocumentSidePanel'
import Link from 'next/link'
import { markAsRead } from '@/app/documents/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCompletion } from '@ai-sdk/react'
import { StreamingText } from '@/components/StreamingText'
import { motion } from 'framer-motion'

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
// COMPONENT: DocumentView
// A beautifully styled document viewer with line-by-line streaming animation
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
  // Use a ref to track if we've already triggered generation
  const hasTriggeredGeneration = useRef(false)
  
  useEffect(() => {
    if (autoGenerate && !doc.content && !isGenerating && !completion && !hasTriggeredGeneration.current) {
      hasTriggeredGeneration.current = true
      complete('')
    }
  }, [autoGenerate, doc.content, isGenerating, completion, complete])

  // Derived values for streaming - no useMemo needed for primitives
  const displayContent = completion || doc.content || ''
  const isCurrentlyStreaming = isGenerating

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
      const rects = range.getClientRects()
      
      if (rects.length === 0) {
        setSelectionPos(null)
        return
      }

      const rect = rects[rects.length - 1]
      setSelectionPos({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX
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
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      {/* Subtle gradient background for depth */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/10 via-transparent to-purple-950/10 pointer-events-none" />
      
      {/* Navigation bar with glassmorphism */}
      <nav className="bg-[#0a0a0a]/80 border-b border-white/5 px-4 py-3 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between max-w-5xl">
          <Link href={rootId ? `/dashboard/${rootId}` : "/dashboard"}>
            <Button 
              variant="ghost" 
              className="pl-0 hover:pl-0 hover:bg-transparent text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to {rootId ? 'Topic' : 'Dashboard'}
            </Button>
          </Link>
          
          <div className="flex gap-2 items-center">
            <Button 
              onClick={handleMarkAsRead} 
              disabled={isMarking || doc.is_read} 
              variant={doc.is_read ? "secondary" : "outline"}
              className={doc.is_read 
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15" 
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
              }
            >
              <Check className="w-4 h-4 mr-2" />
              {doc.is_read ? "Read" : "Mark as Read"}
            </Button>
            <Button 
              onClick={() => setIsChatOpen(true)} 
              variant="outline" 
              className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with AI
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <main className="container mx-auto py-8 px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-[720px] mx-auto"
        >
          {/* Document container with elegant styling */}
          <div className="bg-[#111111] rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header section */}
            <div className="px-8 pt-8 pb-6 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-3xl font-bold text-white tracking-tight leading-tight"
              >
                {doc.query}
              </motion.h1>
              
              {/* Streaming status indicator */}
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-sm text-blue-400/80">Streaming response...</span>
                </motion.div>
              )}
            </div>
            
            {/* Content area with streaming text */}
            <div 
              ref={contentRef}
              className="px-8 py-6"
            >
              <StreamingText 
                content={displayContent} 
                isStreaming={isCurrentlyStreaming} 
                className="prose-lg max-w-none"
              />
            </div>
          </div>
        </motion.div>
      </main>

      {/* Selection tooltip for "Explain" feature */}
      {selectionPos && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute z-50"
          style={{
            top: `${selectionPos.top - 44}px`,
            left: `${selectionPos.left}px`,
            transform: 'translateX(-50%)'
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Button 
            size="sm" 
            onClick={handleExplain}
            className="rounded-full bg-zinc-900 border border-white/10 text-white shadow-2xl shadow-black/50 hover:bg-zinc-800 hover:border-white/20 transition-all"
          >
            <MessageSquare className="w-3 h-3 mr-2" />
            Explain
          </Button>
        </motion.div>
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
