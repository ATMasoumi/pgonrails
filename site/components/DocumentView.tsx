"use client"

import { useState } from 'react'
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={rootId ? (readOnly ? `/share/${rootId}` : `/dashboard/${rootId}`) : (readOnly ? "/hall" : "/dashboard")}>
            <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {rootId ? 'Topic' : (readOnly ? 'Hall' : 'Dashboard')}
            </Button>
          </Link>
          
          <div className="flex gap-2 items-center">
            {document.is_public && (
              <div className="flex gap-1 mr-2 border-r pr-2">
                <Button variant="ghost" size="icon" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                  <Twitter className="w-4 h-4 text-blue-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                  <Linkedin className="w-4 h-4 text-blue-700" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}>
                  <Facebook className="w-4 h-4 text-blue-600" />
                </Button>
              </div>
            )}

            {!readOnly && (
              <>
                <Button 
                  onClick={handleShare} 
                  disabled={isSharing} 
                  variant={document.is_public ? "secondary" : "outline"}
                  className={document.is_public ? "text-blue-600 bg-blue-50" : ""}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {document.is_public ? "Public" : "Share"}
                </Button>
                {document.is_public && (
                  <Button onClick={copyShareLink} variant="outline" size="icon" title="Copy Link">
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  onClick={handleMarkAsRead} 
                  disabled={isMarking || document.is_read} 
                  variant={document.is_read ? "secondary" : "outline"}
                  className={document.is_read ? "text-green-600 bg-green-50" : ""}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {document.is_read ? "Read" : "Mark as Read"}
                </Button>
                <Button onClick={() => setIsChatOpen(true)} variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with AI
                </Button>
              </>
            )}
            {readOnly && (
              <Link href="/">
                <Button variant="default">
                  Create Your Own
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 border-b pb-4">{document.query}</h1>
          <div className="prose prose-slate max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none">
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
                    <code {...props} className={cn("bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-red-500", className)}>
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

      <DocumentSidePanel 
        topicId={document.id} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  )
}
