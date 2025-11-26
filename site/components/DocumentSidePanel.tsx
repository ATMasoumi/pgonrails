"use client"

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef } from 'react'
import { X, Send, Loader2, Save, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { updateTopicContent } from '@/app/documents/actions'
import { toast } from 'sonner'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface DocumentSidePanelProps {
  topicId: string | null
  isOpen: boolean
  onClose: () => void
  initialPrompt?: string
}

export function DocumentSidePanel({ topicId, isOpen, onClose, initialPrompt }: DocumentSidePanelProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: '/api/chat',
    body: { topicId },
    streamProtocol: 'text',
  })

  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (isOpen && topicId && messages.length === 0 && !hasStartedRef.current && initialPrompt) {
      hasStartedRef.current = true
      append({ 
        role: 'user', 
        content: initialPrompt 
      })
    }
  }, [isOpen, topicId, messages.length, append, initialPrompt])

  // Reset when topic changes
  useEffect(() => {
    if (topicId) {
      setMessages([])
      hasStartedRef.current = false
    }
  }, [topicId, setMessages])

  const handleSave = async () => {
    if (!topicId) return
    // Find the last assistant message
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
    if (!lastAssistantMessage) return

    try {
      await updateTopicContent(topicId, lastAssistantMessage.content)
      toast.success('Document saved')
      onClose()
    } catch {
      toast.error('Failed to save document')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <h2 className="font-semibold text-lg">Document Generator</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleSave} title="Save Document" disabled={isLoading || messages.length === 0}>
            <Save className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              m.role === 'assistant' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
            )}>
              {m.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            
            <div className={cn(
              "rounded-lg p-4 max-w-[85%] text-sm",
              m.role === 'assistant' ? "bg-white border shadow-sm prose prose-sm max-w-none" : "bg-blue-600 text-white"
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
      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask to improve the document..."
            className="min-h-[50px] max-h-[150px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-[50px] w-[50px]">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
