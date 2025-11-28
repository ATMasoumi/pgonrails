"use client"

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/RichTextEditor'
import { updateNote } from '@/app/documents/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface NoteSidePanelProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  initialNote?: string | null
  title: string
}

export function NoteSidePanel({ isOpen, onClose, documentId, initialNote, title }: NoteSidePanelProps) {
  const [note, setNote] = useState(initialNote || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setNote(initialNote || '')
  }, [initialNote, documentId])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateNote(documentId, note)
      onClose()
    } catch (error) {
      toast.error('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[600px] bg-[#0A0A0A] border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white truncate pr-4">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <RichTextEditor 
            key={documentId}
            content={note} 
            onChange={setNote} 
          />
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Note
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
