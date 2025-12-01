"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Check, Share2, Copy, Twitter, Linkedin, Facebook } from 'lucide-react'
import { DocumentSidePanel } from '@/components/DocumentSidePanel'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { markAsRead, togglePublic } from '@/app/documents/actions'
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
  is_public?: boolean
}

interface DocumentViewProps {
  document: Document
  rootId?: string
  readOnly?: boolean
}

export function DocumentView({ document, rootId, readOnly = false }: DocumentViewProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const router = useRouter()
  const [isMarking, setIsMarking] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
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

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await togglePublic(document.id, !document.is_public)
      toast.success(document.is_public ? 'Topic is now private' : 'Topic is now public')
      router.refresh()
    } catch {
      toast.error('Failed to update sharing settings')
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/share/${document.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${document.id}` : ''
  const shareText = `Check out this knowledge tree about ${document.query} on DocTree!`

  return (
    <div className="min-h-screen bg-[#020202] text-white relative">
      <nav className="bg-[#020202]/80 border-b border-white/10 px-4 py-3 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={rootId ? (readOnly ? `/share/${rootId}` : `/dashboard/${rootId}`) : (readOnly ? "/hall" : "/dashboard")}>
            <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {rootId ? 'Topic' : (readOnly ? 'Hall' : 'Dashboard')}
            </Button>
          </Link>
          
          <div className="flex gap-2 items-center">
            {document.is_public && (
              <div className="flex gap-1 mr-2 border-r border-white/10 pr-2">
                <Button variant="ghost" size="icon" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')} className="hover:bg-white/10 text-gray-400 hover:text-blue-400">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')} className="hover:bg-white/10 text-gray-400 hover:text-blue-600">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')} className="hover:bg-white/10 text-gray-400 hover:text-blue-500">
                  <Facebook className="w-4 h-4" />
                </Button>
              </div>
            )}

            {!readOnly && (
              <>
                <Button 
                  onClick={handleShare} 
                  disabled={isSharing} 
                  variant={document.is_public ? "secondary" : "outline"}
                  className={document.is_public ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {document.is_public ? "Public" : "Share"}
                </Button>
                {document.is_public && (
                  <Button onClick={copyShareLink} variant="outline" size="icon" title="Copy Link" className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
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
              </>
            )}
            {readOnly && (
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0">
                  Create Your Own
                </Button>
              </Link>
            )}
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
