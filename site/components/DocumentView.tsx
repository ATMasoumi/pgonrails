"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Check } from 'lucide-react'
import { DocumentSidePanel } from '@/components/DocumentSidePanel'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { markAsRead } from '@/app/documents/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/CodeBlock'

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
  document: Document
  rootId?: string
}

export function DocumentView({ document, rootId }: DocumentViewProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const router = useRouter()
  const [isMarking, setIsMarking] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [selectionPos, setSelectionPos] = useState<{ top: number, left: number } | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateSelectionPosition = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setSelectionPos(null)
        setSelectedText('')
        return
      }

      // Check if selection is within content
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

      // Use the last rect (end of selection)
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
    // Clear selection
    window.getSelection()?.removeAllRanges()
    setSelectionPos(null)
  }

  const handleMarkAsRead = async () => {
    setIsMarking(true)
    try {
      await markAsRead(document.id)
      toast.success('Marked as read')
      router.refresh()
    } catch {
      toast.error('Failed to mark as read')
    } finally {
      setIsMarking(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white relative">
      <nav className="bg-[#020202]/80 border-b border-white/10 px-4 py-3 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={rootId ? `/dashboard/${rootId}` : "/dashboard"}>
            <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {rootId ? 'Topic' : 'Dashboard'}
            </Button>
          </Link>
          
          <div className="flex gap-2 items-center">
            <Button 
              onClick={handleMarkAsRead} 
              disabled={isMarking || document.is_read} 
              variant={document.is_read ? "secondary" : "outline"}
              className={document.is_read ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"}
            >
              <Check className="w-4 h-4 mr-2" />
              {document.is_read ? "Read" : "Mark as Read"}
            </Button>
            <Button onClick={() => setIsChatOpen(true)} variant="outline" className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with AI
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="bg-[#0A0A0A] rounded-xl border border-white/10 shadow-2xl p-8 max-w-4xl mx-auto backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-6 border-b border-white/10 pb-4 text-white">{document.query}</h1>
          <div ref={contentRef} className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-blue-300 prose-code:bg-blue-900/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({children}) => <>{children}</>,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                code({inline, className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline ? (
                    <CodeBlock
                      language={match ? match[1] : 'text'}
                      value={String(children).replace(/\n$/, '')}
                    />
                  ) : (
                    <code {...props} className={cn("bg-blue-900/20 text-blue-300 rounded px-1 py-0.5 text-sm font-mono", className)}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {document.content || '*No content generated yet.*'}
            </ReactMarkdown>
          </div>
        </div>
      </main>

      {selectionPos && (
        <div 
          className="absolute z-50"
          style={{
            top: `${selectionPos.top - 40}px`,
            left: `${selectionPos.left}px`,
            transform: 'translateX(-50%)'
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Button 
            size="sm" 
            onClick={handleExplain}
            className="rounded-full bg-zinc-950 border border-white/10 text-white shadow-2xl hover:bg-zinc-800 hover:border-white/20 hover:opacity-100 transition-all"
          >
            <MessageSquare className="w-3 h-3 mr-2" />
            Explain
          </Button>
        </div>
      )}

      <DocumentSidePanel 
        topicId={document.id} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        pendingMessage={pendingMessage}
        onMessageSent={() => setPendingMessage(null)}
      />
    </div>
  )
}
