"use client"

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { X, Send, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { getChatMessages } from '@/app/documents/actions'
import { toast } from 'sonner'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useRouter } from 'next/navigation'
import { useTokenLimit } from '@/lib/hooks/use-token-limit'

interface DocumentSidePanelProps {
  topicId: string | null
  isOpen: boolean
  onClose: () => void
  initialPrompt?: string
  pendingMessage?: string | null
  onMessageSent?: () => void
}

export function DocumentSidePanel({ topicId, isOpen, onClose, initialPrompt, pendingMessage, onMessageSent }: DocumentSidePanelProps) {
  const router = useRouter()
  const { handleTokenLimitError } = useTokenLimit()
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: '/api/chat',
    body: { topicId },
    streamProtocol: 'text',
    onError: (error) => {
      console.error('Chat error:', error)
      if (!handleTokenLimitError(error)) {
        toast.error("Failed to send message. Please try again.")
      }
    }
  })

  const hasStartedRef = useRef(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen && pendingMessage && historyLoaded) {
      append({ 
        role: 'user', 
        content: pendingMessage 
      })
      onMessageSent?.()
      // Scroll to bottom after a short delay to ensure the message is rendered
      setTimeout(scrollToBottom, 100)
    }
  }, [isOpen, pendingMessage, append, onMessageSent, historyLoaded])

  useEffect(() => {
    if (isOpen && topicId && messages.length === 0 && !hasStartedRef.current && initialPrompt && historyLoaded) {
      hasStartedRef.current = true
      append({ 
        role: 'user', 
        content: initialPrompt 
      })
    }
  }, [isOpen, topicId, messages.length, append, initialPrompt, historyLoaded])

  // Reset and load history when topic changes
  useEffect(() => {
    if (topicId) {
      setMessages([])
      hasStartedRef.current = false
      setHistoryLoaded(false)
      
      getChatMessages(topicId).then(history => {
        if (history && history.length > 0) {
          const uiMessages = history.map(msg => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            createdAt: new Date(msg.created_at)
          }))
          setMessages(uiMessages)
          hasStartedRef.current = true
        }
      }).finally(() => {
        setHistoryLoaded(true)
      })
    }
  }, [topicId, setMessages])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop - click to close */}
      <div 
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-[500px] bg-[#0A0A0A] shadow-2xl border-l border-white/10 z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <h2 className="font-semibold text-lg text-white">Document Generator</h2>
          <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              m.role === 'assistant' ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-gray-400"
            )}>
              {m.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            
            <div className={cn(
              "rounded-lg p-4 max-w-[85%] text-sm",
              m.role === 'assistant' ? "bg-white/5 border border-white/10 shadow-sm prose prose-invert prose-sm max-w-none text-gray-200" : "bg-blue-600 text-white"
            )}>
              {m.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code({inline, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm pl-12">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[#0A0A0A]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask to improve the document..."
            className="min-h-[50px] max-h-[150px] resize-none bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-[50px] w-[50px] bg-blue-600 hover:bg-blue-500 text-white border-0">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
    </>
  )
}
