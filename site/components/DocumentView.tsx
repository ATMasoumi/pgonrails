"use client"

import { useState } from 'react'
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={rootId ? `/dashboard/${rootId}` : "/dashboard"}>
            <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {rootId ? 'Topic' : 'Dashboard'}
            </Button>
          </Link>
          
          <div className="flex gap-2">
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
