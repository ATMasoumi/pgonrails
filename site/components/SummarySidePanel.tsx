"use client"

import { X, FileText, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { deleteSummary } from '@/app/documents/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SummarySidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  summary: string | null
  documentId: string
}

export function SummarySidePanel({ isOpen, onClose, title, summary, documentId }: SummarySidePanelProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Clean up summary if it contains markdown code blocks (backward compatibility)
  const cleanSummary = summary 
    ? summary.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')
    : null

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this summary?')) return

    setIsDeleting(true)
    try {
      const result = await deleteSummary(documentId)
      if (result.success) {
        toast.success('Summary deleted')
        onClose()
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete summary')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete summary')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-teal-900/10 to-emerald-900/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-500/20 shrink-0">
              <FileText className="h-5 w-5 text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">Summary: {title}</h2>
              <p className="text-xs text-gray-400">
                AI Generated Overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"
              title="Delete Summary"
            >
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full absolute inset-0">
            <div className="p-6">
              <div 
                className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-base prose-headings:text-white prose-strong:text-white prose-a:text-blue-400"
                dangerouslySetInnerHTML={{ __html: cleanSummary || "<p>No summary available.</p>" }}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
