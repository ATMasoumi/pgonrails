"use client"

import { useState, useEffect } from 'react'
import { X, Save, Loader2, FileText } from 'lucide-react'
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
  const [hasChanges, setHasChanges] = useState(false)
  const [currentDocId, setCurrentDocId] = useState(documentId)

  // Reset note when document changes - this is critical for switching between nodes
  useEffect(() => {
    if (documentId !== currentDocId || isOpen) {
      setNote(initialNote || '')
      setHasChanges(false)
      setCurrentDocId(documentId)
    }
  }, [documentId, initialNote, isOpen, currentDocId])

  const handleNoteChange = (newNote: string) => {
    setNote(newNote)
    setHasChanges(newNote !== (initialNote || ''))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateNote(documentId, note)
      toast.success('Note saved successfully')
      setHasChanges(false)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
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
        onClick={handleClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[700px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 shrink-0">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
              <p className="text-xs text-gray-400">
                {hasChanges ? 'Unsaved changes' : 'All changes saved'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <RichTextEditor 
            key={documentId}
            content={note} 
            onChange={handleNoteChange} 
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-[#050505]">
          <p className="text-sm text-gray-500">
            {hasChanges && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                You have unsaved changes
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleClose} 
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !hasChanges} 
              className={cn(
                "bg-blue-600 hover:bg-blue-700 text-white transition-all",
                hasChanges && "ring-2 ring-blue-500/50"
              )}
            >
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
      </div>
    </>
  )
}
